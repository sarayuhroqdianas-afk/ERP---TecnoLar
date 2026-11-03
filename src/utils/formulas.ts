// Utilitários de Cálculo Industrial - TecnoLar Indústria de Eletrodomésticos
// Contém as fórmulas matemáticas oficiais do diagnóstico da TecnoLar

import { FormulaParameters } from '../types';

export const DEFAULT_FORMULA_PARAMS: FormulaParameters = {
  annualDemand: 300000, // D (unidades/ano)
  orderCost: 350.0, // S (R$/pedido)
  holdingCostPerUnitYear: 2.4, // H (R$/unid./ano)
  dailyDemand: 1200, // d (unidades/dia)
  serviceLevelZ: 1.28, // z (90% nível de serviço)
  leadTimeDays: 10, // LT (dias)
  leadTimeStdDev: 6, // σLT (dias)
  demandStdDev: 0, // σd (demanda determinística padrão linha)
  stoppageCostPerHour: 22000, // R$ 22.000 / hora

  // Cenário de melhoria simulado
  simulatedLeadTimeDays: 8,
  simulatedLeadTimeStdDev: 2,
  simulatedDemandStdDev: 80,
};

/**
 * Lote Econômico de Compra (LEC / EOQ)
 * LEC = √(2·D·S / H)
 */
export function calculateLEC(
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): number {
  if (holdingCost <= 0) return 0;
  const val = (2 * annualDemand * orderCost) / holdingCost;
  return Math.round(Math.sqrt(val));
}

/**
 * Estoque de Segurança (SS)
 * SS = z · √(LT·σd² + d²·σLT²)
 */
export function calculateSafetyStock(
  z: number,
  dailyDemand: number,
  leadTime: number,
  leadTimeStdDev: number,
  demandStdDev: number = 0
): number {
  const term1 = leadTime * Math.pow(demandStdDev, 2);
  const term2 = Math.pow(dailyDemand, 2) * Math.pow(leadTimeStdDev, 2);
  const combinedVariance = term1 + term2;
  const ss = z * Math.sqrt(combinedVariance);
  return Math.round(ss);
}

/**
 * Ponto de Pedido (ROP)
 * ROP = d · LT + SS
 */
export function calculateROP(
  dailyDemand: number,
  leadTime: number,
  safetyStock: number
): number {
  return Math.round(dailyDemand * leadTime + safetyStock);
}

/**
 * Custo de Parada de Linha
 * Custo = Horas × R$ 22.000/h
 */
export function calculateDowntimeCost(
  hours: number,
  costPerHour: number = 22000
): number {
  return hours * costPerHour;
}

/**
 * Acurácia de Estoque (Inventário Cíclico)
 * Acurácia (%) = 100 - (|Contagem Física - Contagem Virtual| / Contagem Virtual * 100)
 */
export function calculateInventoryAccuracy(
  physicalCount: number,
  virtualCount: number
): number {
  if (virtualCount <= 0) return 100;
  const diff = Math.abs(physicalCount - virtualCount);
  const accuracy = 100 - (diff / virtualCount) * 100;
  return Math.max(0, Math.min(100, parseFloat(accuracy.toFixed(2))));
}

/**
 * Cenário Comparativo: Real Atual vs Otimizado
 */
export function getComparativeScenario(params: FormulaParameters) {
  // Cenário Real Atual (TecnoLar atual)
  const currentLEC = calculateLEC(
    params.annualDemand,
    params.orderCost,
    params.holdingCostPerUnitYear
  );
  const currentSS = calculateSafetyStock(
    params.serviceLevelZ,
    params.dailyDemand,
    params.leadTimeDays,
    params.leadTimeStdDev,
    params.demandStdDev
  );
  const currentROP = calculateROP(
    params.dailyDemand,
    params.leadTimeDays,
    currentSS
  );

  // Cenário de Melhoria Otimizado
  // LT = 8 dias, σLT = 2, σd = 80
  const simSS = calculateSafetyStock(
    params.serviceLevelZ,
    params.dailyDemand,
    params.simulatedLeadTimeDays,
    params.simulatedLeadTimeStdDev,
    params.simulatedDemandStdDev
  );
  const simROP = calculateROP(
    params.dailyDemand,
    params.simulatedLeadTimeDays,
    simSS
  );

  const reductionSS = currentSS - simSS;
  const reductionROP = currentROP - simROP;
  const workingCapitalSaved = reductionSS * 14.5; // Estimativa média de custo do componente plástico R$ 14,50

  return {
    real: {
      lec: currentLEC, // ~9.354
      ss: currentSS, // ~9.216
      rop: currentROP, // ~21.216
      leadTime: params.leadTimeDays,
      leadTimeStdDev: params.leadTimeStdDev,
      label: 'Real Vigente (TecnoLar)',
      note: 'Política calibrada com desvios reais observados nos fornecedores',
    },
    simulated: {
      lec: currentLEC,
      ss: simSS, // ~3.072
      rop: simROP, // ~12.672
      leadTime: params.simulatedLeadTimeDays,
      leadTimeStdDev: params.simulatedLeadTimeStdDev,
      label: 'Cenário Otimizado',
      note: 'Redução de desvio do fornecedor via Milk Run estabilizado e SLA contratual',
    },
    delta: {
      ssDiff: reductionSS, // ~6.144
      ropDiff: reductionROP, // ~8.544
      percentSSReduction: ((reductionSS / currentSS) * 100).toFixed(1),
      estimatedWorkingCapitalRelease: workingCapitalSaved,
    },
  };
}

export function formatCurrencyBRL(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

export function formatCurrencyWithSettings(
  valInBRL: number,
  currency: 'BRL' | 'USD' | 'EUR' = 'BRL',
  language: string = 'pt-BR'
): string {
  let converted = valInBRL;
  let code = 'BRL';

  if (currency === 'USD') {
    converted = valInBRL / 5.4;
    code = 'USD';
  } else if (currency === 'EUR') {
    converted = valInBRL / 5.85;
    code = 'EUR';
  }

  const locale = language === 'en-US' ? 'en-US' : language === 'es-ES' ? 'es-ES' : 'pt-BR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

export function formatNumberBR(val: number): string {
  return new Intl.NumberFormat('pt-BR').format(val);
}


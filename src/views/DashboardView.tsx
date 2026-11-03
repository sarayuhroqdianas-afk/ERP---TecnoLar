import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Package,
  CheckCircle,
  Truck,
  Printer,
  Calendar,
  Filter,
  BarChart3,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  formatNumberBR,
  getComparativeScenario,
} from '../utils/formulas';

export type DashboardPeriod = 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';

interface PeriodData {
  label: string;
  totalLoss: number;
  downtimeHours: number;
  machineCost: number;
  shortShipmentPenalty: number;
  occurrences: number;
  targetProduction: number;
  actualProduction: number;
  productionPct: number;
  scaleFactor: number;
}

const PERIOD_METRICS: Record<DashboardPeriod, PeriodData> = {
  diario: {
    label: 'Diário',
    totalLoss: 9119.04,
    downtimeHours: 0.33,
    machineCost: 7333.33,
    shortShipmentPenalty: 1785.71,
    occurrences: 1,
    targetProduction: 1200,
    actualProduction: 1160,
    productionPct: 96.7,
    scaleFactor: 9119.04 / 766000,
  },
  semanal: {
    label: 'Semanal',
    totalLoss: 63833.33,
    downtimeHours: 2.33,
    machineCost: 51333.33,
    shortShipmentPenalty: 12500.0,
    occurrences: 2,
    targetProduction: 7200,
    actualProduction: 6960,
    productionPct: 96.7,
    scaleFactor: 63833.33 / 766000,
  },
  mensal: {
    label: 'Mensal',
    totalLoss: 255333.33,
    downtimeHours: 9.33,
    machineCost: 205333.33,
    shortShipmentPenalty: 50000.0,
    occurrences: 10,
    targetProduction: 30000,
    actualProduction: 28850,
    productionPct: 96.2,
    scaleFactor: 255333.33 / 766000,
  },
  trimestral: {
    label: 'Trimestral',
    totalLoss: 766000.0,
    downtimeHours: 28.0,
    machineCost: 616000.0,
    shortShipmentPenalty: 150000.0,
    occurrences: 29,
    targetProduction: 90000,
    actualProduction: 86500,
    productionPct: 96.1,
    scaleFactor: 1.0,
  },
  semestral: {
    label: 'Semestral',
    totalLoss: 1532000.0,
    downtimeHours: 56.0,
    machineCost: 1232000.0,
    shortShipmentPenalty: 300000.0,
    occurrences: 58,
    targetProduction: 180000,
    actualProduction: 173000,
    productionPct: 96.1,
    scaleFactor: 2.0,
  },
  anual: {
    label: 'Anual',
    totalLoss: 3064000.0,
    downtimeHours: 112.0,
    machineCost: 2464000.0,
    shortShipmentPenalty: 600000.0,
    occurrences: 116,
    targetProduction: 360000,
    actualProduction: 346000,
    productionPct: 96.1,
    scaleFactor: 4.0,
  },
};

export const DashboardView: React.FC = () => {
  const {
    downtimes,
    components,
    suppliers,
    formulaParams,
    openPrintModal,
    formatCurrency,
    t,
  } = useApp();

  const [periodFilter, setPeriodFilter] = useState<DashboardPeriod>('trimestral');
  const [selectedLine, setSelectedLine] = useState<'todas' | 'Linha 1 - Lavadoras' | 'Linha 2 - Refrigeradores'>('todas');
  const [selectedCause, setSelectedCause] = useState<string>('todas');

  const currentPeriodData = PERIOD_METRICS[periodFilter];

  // Cenário comparativo
  const comparison = getComparativeScenario(formulaParams);

  // Acurácia de estoque em tempo real
  const totalVirtual = components.reduce((acc, c) => acc + c.currentStock, 0);
  const totalPhysical = components.reduce((acc, c) => acc + c.physicalStock, 0);
  const stockAccuracyRate = ((1 - Math.abs(totalPhysical - totalVirtual) / totalVirtual) * 100).toFixed(1);

  // OTIF Médio dos Fornecedores
  const avgSupplierOtif = (
    suppliers.reduce((acc, s) => acc + s.otifRate, 0) / suppliers.length
  ).toFixed(1);

  // Detalhamento dinâmico das causas conforme o período selecionado
  const factor = currentPeriodData.scaleFactor;
  const causeBreakdown = [
    {
      cause: 'Atraso de Fornecedor (63% Plásticos)',
      hours: +(14.0 * factor).toFixed(2),
      occurrences: Math.max(1, Math.round(7 * factor)),
      cost: +(308000 * factor).toFixed(2),
      pct: 40.2,
      color: 'bg-rose-500',
    },
    {
      cause: 'Multas por Short-Shipment',
      hours: 0,
      occurrences: Math.max(1, Math.round(2 * factor)),
      cost: +(150000 * factor).toFixed(2),
      pct: 19.6,
      color: 'bg-amber-500',
    },
    {
      cause: 'Logística Interna (Trajeto 400m)',
      hours: +(6.0 * factor).toFixed(2),
      occurrences: Math.max(1, Math.round(12 * factor)),
      cost: +(132000 * factor).toFixed(2),
      pct: 17.2,
      color: 'bg-blue-500',
    },
    {
      cause: 'Divergência de Estoque (Baixa fim de turno)',
      hours: +(5.0 * factor).toFixed(2),
      occurrences: Math.max(1, Math.round(5 * factor)),
      cost: +(110000 * factor).toFixed(2),
      pct: 14.4,
      color: 'bg-purple-500',
    },
    {
      cause: 'Qualidade / Lotes Bloqueados',
      hours: +(3.0 * factor).toFixed(2),
      occurrences: Math.max(1, Math.round(3 * factor)),
      cost: +(66000 * factor).toFixed(2),
      pct: 8.6,
      color: 'bg-emerald-500',
    },
  ];

  const filteredCauses = selectedCause === 'todas'
    ? causeBreakdown
    : causeBreakdown.filter((c) => c.cause.toLowerCase().includes(selectedCause.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Business Intelligence &amp; Gestão Industrial
            </span>
            <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Painel Integrado de Produção
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            BI Executivo: Produção, Paradas &amp; Impacto Financeiro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Meta fabril de 1.200 unidades/dia (Lavadoras e Refrigeradores), acurácia de &gt;400 componentes e perdas por ruptura.
          </p>
        </div>

        {/* Controles de Filtro e Impressão */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Período Dinâmico (Diário, Semanal, Mensal, Trimestral, Semestral, Anual) */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs">
            {(['diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual'] as const).map((p) => {
              const labelMap: Record<DashboardPeriod, string> = {
                diario: t('periodDiario'),
                semanal: t('periodSemanal'),
                mensal: t('periodMensal'),
                trimestral: t('periodTrimestral'),
                semestral: t('periodSemestral'),
                anual: t('periodAnual'),
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodFilter(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    periodFilter === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {labelMap[p]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => openPrintModal('financeiro')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('print')} Relatório</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Interativos por Linha e Causa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Linha de Produção:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs"
            >
              <option value="todas">Todas as Linhas (Lavadoras + Refrigeradores)</option>
              <option value="Linha 1 - Lavadoras">Linha 1 - Lavadoras (Meta 700 un/dia)</option>
              <option value="Linha 2 - Refrigeradores">Linha 2 - Refrigeradores (Meta 500 un/dia)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Causa Raiz:</span>
            <select
              value={selectedCause}
              onChange={(e) => setSelectedCause(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs"
            >
              <option value="todas">Todas as Causas</option>
              <option value="Atraso de Fornecedor">Atraso de Fornecedor (63% plásticos)</option>
              <option value="Logística Interna">Logística Interna (Trajeto 400m)</option>
              <option value="Divergência de Estoque">Divergência de Estoque</option>
              <option value="Qualidade">Qualidade / Não Conformidade</option>
              <option value="Multas por Short-Shipment">Multas por Short-Shipment</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 dark:text-slate-400">
          Período Ativo: <strong className="text-blue-600 dark:text-blue-400 uppercase font-mono">{currentPeriodData.label}</strong>
        </span>
      </div>

      {/* Cartões Principais de Impacto Financeiro & Operacional Recalculados Rigorosamente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prejuízo Total das Rupturas */}
        <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
            <span>Perda Total ({currentPeriodData.label})</span>
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-300 font-mono">
            {formatCurrency(currentPeriodData.totalLoss)}
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Máquinas Paradas ({currentPeriodData.downtimeHours.toFixed(2)}h × R$ 22k):</span>
              <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(currentPeriodData.machineCost)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Multas Short-Shipment:</span>
              <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(currentPeriodData.shortShipmentPenalty)}</strong>
            </div>
          </div>
        </div>

        {/* Horas Paradas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span>Horas Paradas Acumuladas</span>
            <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {currentPeriodData.downtimeHours.toFixed(2)} horas
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-bold">{currentPeriodData.occurrences} Ocorrências</span> no período selecionado.
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Custo base contratual: {formatCurrency(22000)} / hora de parada.
            </div>
          </div>
        </div>

        {/* Acurácia de Estoque WMS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span>{t('stockAccuracy')} (WMS)</span>
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stockAccuracyRate}%
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Virtual: <strong>{formatNumberBR(totalVirtual)}</strong> | Físico: <strong>{formatNumberBR(totalPhysical)}</strong></span>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Baixa em tempo real ativa no WMS (elimina divergência de turno).
            </div>
          </div>
        </div>

        {/* Produção Acumulada */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span>Produção Real ({currentPeriodData.label})</span>
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {formatNumberBR(currentPeriodData.actualProduction)} un
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Meta: {formatNumberBR(currentPeriodData.targetProduction)} un</span>
              <strong className="text-blue-600 dark:text-blue-400">{currentPeriodData.productionPct}%</strong>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full" style={{ width: `${currentPeriodData.productionPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Visual de Causas Raiz & Distribuição dos Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Distribuição das Causas de Ruptura ({currentPeriodData.label})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total acumulado de {formatCurrency(currentPeriodData.totalLoss)} e {currentPeriodData.downtimeHours.toFixed(2)}h paradas
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-lg">
              Total: {formatCurrency(currentPeriodData.totalLoss)}
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {filteredCauses.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.cause}
                  </span>
                  <div className="flex items-center gap-3">
                    {item.hours > 0 && (
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {item.hours}h ({item.occurrences}x)
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.cost)}
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 w-12 text-right">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <strong className="text-blue-800 dark:text-blue-200 block font-bold">
              Diagnóstico Prioritário da TecnoLar (Curva ABC):
            </strong>
            <p>
              Os componentes plásticos injetados respondem por <strong>63%</strong> da variabilidade de ruptura (Lead Time médio de 10 dias com desvio padrão de 6 dias). A implantação do ROP Dinâmico e Milk Run estabilizado neutraliza R$ 518.000 em perdas diretas.
            </p>
          </div>
        </div>

        {/* Card de Simulação: Real vs Otimizado */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Otimização Matemática TecnoLar</span>
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Cenário Real Atual vs Otimizado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Impacto da redução da variabilidade do fornecedor e Milk Run estabilizado de 400m.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-semibold">Política Atual Vigente:</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-slate-800 dark:text-slate-200">Estoque de Segurança (SS):</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm">{formatNumberBR(comparison.real.ss)} un</strong>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-800 dark:text-slate-200">Ponto de Pedido (ROP):</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400 text-sm">{formatNumberBR(comparison.real.rop)} un</strong>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-800 dark:text-slate-200">Lote Econômico (LEC):</span>
                  <strong className="font-mono text-blue-600 dark:text-blue-400 text-sm">{formatNumberBR(comparison.real.lec)} un</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                <span className="text-emerald-700 dark:text-emerald-400 text-[11px] block font-semibold">Cenário Otimizado (Milk Run 400m + SLA):</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-slate-800 dark:text-slate-200">Novo Estoque Segurança:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-300 text-sm">{formatNumberBR(comparison.simulated.ss)} un</strong>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-800 dark:text-slate-200">Novo Ponto de Pedido (ROP):</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-300 text-sm">{formatNumberBR(comparison.simulated.rop)} un</strong>
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                  Redução de {comparison.delta.percentSSReduction}% no estoque de segurança.
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Capital de Giro Liberado Estimado:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
              {formatCurrency(comparison.delta.estimatedWorkingCapitalRelease)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

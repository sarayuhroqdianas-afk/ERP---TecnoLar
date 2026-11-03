import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  AlertTriangle,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  Building,
  Layers,
} from 'lucide-react';
import { formatCurrencyBRL, formatNumberBR } from '../utils/formulas';

export const CostFinanceView: React.FC = () => {
  const { products, downtimes, openPrintModal } = useApp();

  const [activeTab, setActiveTab] = useState<'dre' | 'produtos' | 'variancia'>('dre');
  const [periodFilter, setPeriodFilter] = useState<'mes' | 'trimestre' | 'ano'>('trimestre');

  // Multiplicador pelo período selecionado
  const multiplier = periodFilter === 'mes' ? 1 / 3 : periodFilter === 'ano' ? 4 : 1;

  // 1. Receita Operacional Bruta
  // Lavadoras: 700 un/dia × 65 dias úteis trim. = 45.500 un × R$ 2.450 = R$ 111.475.000
  // Refrigeradores: 500 un/dia × 65 dias úteis = 32.500 un × R$ 3.899 = R$ 126.717.500
  const grossRevenue = 238192500 * multiplier;
  const deductionsTax = grossRevenue * 0.18; // 18% ICMS/PIS/COFINS
  const netRevenue = grossRevenue - deductionsTax;

  // 2. Custo dos Produtos Vendidos (CPV Industrial)
  const directMaterials = 128500000 * multiplier; // Insumos e componentes plásticos/motores/placas
  const directLabor = 24600000 * multiplier; // Mão de obra direta nos 3 turnos
  const factoryOverhead = 18400000 * multiplier; // GGF - Energia, depreciação de prensas e injetoras
  const totalCPV = directMaterials + directLabor + factoryOverhead;

  // 3. Lucro Bruto Industrial
  const grossProfit = netRevenue - totalCPV;
  const grossMarginPercent = ((grossProfit / netRevenue) * 100).toFixed(1);

  // 4. Perdas Extraordinárias de Ruptura (Diagnosticadas)
  const downtimeLoss = 616000 * multiplier; // 28h * 22k
  const shortShipmentFines = 150000 * multiplier; // Multas contratuais Magazine Brasil & Casas do Sul
  const emergencyFreight = 84000 * multiplier; // Frete aéreo de emergência para Taiwan
  const totalRuptureLosses = downtimeLoss + shortShipmentFines + emergencyFreight;

  // 5. Despesas Operacionais (SG&A)
  const operatingExpenses = 14200000 * multiplier;

  // 6. EBITDA Industrial
  const ebitda = grossProfit - operatingExpenses - totalRuptureLosses;
  const ebitdaMarginPercent = ((ebitda / netRevenue) * 100).toFixed(1);

  // 7. Depreciação e Financeiro
  const depreciation = 3500000 * multiplier;
  const financialResult = -1200000 * multiplier;
  const ebt = ebitda - depreciation + financialResult;
  const incomeTax = ebt > 0 ? ebt * 0.25 : 0;
  const netProfit = ebt - incomeTax;
  const netMarginPercent = ((netProfit / netRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Controladoria &amp; Gestão Financeira Industrial
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
              DRE Gerencial Oficial
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Demonstrativo do Resultado Industrial (DRE) &amp; P&amp;L por Modelo
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Apuração contábil por absorção, rateio das paradas de máquinas (R$ 22.000/h) e impacto das multas por short-shipment.
          </p>
        </div>

        {/* Controles de Aba, Período e Exportação */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Período */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPeriodFilter('mes')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodFilter === 'mes' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mês Atual
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('trimestre')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodFilter === 'trimestre' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trimestre Diagnóstico
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('ano')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                periodFilter === 'ano' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Projeção Anual
            </button>
          </div>

          <button
            type="button"
            onClick={() => openPrintModal('financeiro')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir DRE</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('dre')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'dre' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>DRE Industrial Consolidado</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('produtos')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'produtos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Custos Unitários &amp; Margem por Modelo</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('variancia')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'variancia' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Impacto das Paradas no EBITDA (-R$ 766k)</span>
        </button>
      </div>

      {/* ABA 1: DRE Industrial Completo */}
      {activeTab === 'dre' && (
        <div className="space-y-6">
          {/* Cartões Executivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Receita Operacional Líquida</span>
              <div className="text-xl sm:text-2xl font-black text-white">{formatCurrencyBRL(netRevenue)}</div>
              <span className="text-[11px] text-emerald-400 font-medium">Após dedução de 18% impostos</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Lucro Bruto Fabril</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrencyBRL(grossProfit)}</div>
              <span className="text-[11px] text-slate-300 font-medium">Margem Bruta: <strong>{grossMarginPercent}%</strong></span>
            </div>

            <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-rose-400 font-semibold block mb-1">Perdas Totais de Ruptura</span>
              <div className="text-xl sm:text-2xl font-black text-rose-300">{formatCurrencyBRL(totalRuptureLosses)}</div>
              <span className="text-[11px] text-rose-400 font-medium">28h paradas + short-shipment</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">EBITDA Industrial</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-300">{formatCurrencyBRL(ebitda)}</div>
              <span className="text-[11px] text-cyan-400 font-medium">Margem EBITDA: <strong>{ebitdaMarginPercent}%</strong></span>
            </div>
          </div>

          {/* Tabela Estruturada de DRE Industrial */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
              <div>
                <h3 className="font-bold text-sm text-white">Demonstrativo de Resultado do Exercício Industrial</h3>
                <span className="text-[11px] text-slate-400">Moeda: Real (BRL) | Regime de Competência Fabril</span>
              </div>
              <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-lg font-bold uppercase">
                {periodFilter === 'mes' ? 'Mensal' : periodFilter === 'trimestre' ? 'Trimestral' : 'Anual'}
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {/* Linha 1: Receita Bruta */}
              <div className="px-6 py-3 flex justify-between items-center bg-slate-900/80 font-bold text-white">
                <span className="flex items-center gap-2">
                  <span className="text-blue-400 font-mono">1.</span>
                  RECEITA OPERACIONAL BRUTA
                </span>
                <span className="font-mono text-sm">{formatCurrencyBRL(grossRevenue)}</span>
              </div>
              <div className="px-10 py-2 flex justify-between items-center text-slate-400 text-[11px]">
                <span>(-) Deduções da Receita Bruta (ICMS, PIS, COFINS 18%)</span>
                <span className="text-rose-400 font-mono">({formatCurrencyBRL(deductionsTax)})</span>
              </div>

              {/* Linha 2: Receita Líquida */}
              <div className="px-6 py-3 flex justify-between items-center bg-slate-950/60 font-bold text-emerald-300">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">2.</span>
                  (=) RECEITA OPERACIONAL LÍQUIDA (ROL)
                </span>
                <span className="font-mono text-sm">{formatCurrencyBRL(netRevenue)}</span>
              </div>

              {/* Linha 3: CPV */}
              <div className="px-6 py-3 flex justify-between items-center bg-slate-900/80 font-bold text-slate-200">
                <span className="flex items-center gap-2">
                  <span className="text-blue-400 font-mono">3.</span>
                  (-) CUSTO DOS PRODUTOS VENDIDOS (CPV INDUSTRIAL)
                </span>
                <span className="font-mono text-rose-400">({formatCurrencyBRL(totalCPV)})</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-slate-400 text-[11px]">
                <span>• Matéria-Prima &amp; Componentes Diretos (Plásticos, Motores, Eletrônica)</span>
                <span className="font-mono">{formatCurrencyBRL(directMaterials)}</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-slate-400 text-[11px]">
                <span>• Mão de Obra Direta (MOD - 3 Turnos Fabris)</span>
                <span className="font-mono">{formatCurrencyBRL(directLabor)}</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-slate-400 text-[11px]">
                <span>• Gastos Gerais de Fabricação (GGF - Energia, Manutenção, Depreciação)</span>
                <span className="font-mono">{formatCurrencyBRL(factoryOverhead)}</span>
              </div>

              {/* Linha 4: Lucro Bruto */}
              <div className="px-6 py-3.5 flex justify-between items-center bg-blue-950/40 font-bold text-white border-y-2 border-blue-900/60">
                <span className="flex items-center gap-2">
                  <span className="text-blue-400 font-mono">4.</span>
                  (=) LUCRO BRUTO INDUSTRIAL
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-800">
                    Margem: {grossMarginPercent}%
                  </span>
                  <span className="font-mono text-base text-emerald-400 font-black">{formatCurrencyBRL(grossProfit)}</span>
                </div>
              </div>

              {/* Linha 5: Perdas por Ruptura */}
              <div className="px-6 py-3 flex justify-between items-center bg-rose-950/20 font-bold text-rose-300">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  (-) PERDAS EXTRAORDINÁRIAS POR RUPTURA DE INSUMOS
                </span>
                <span className="font-mono text-rose-400">({formatCurrencyBRL(totalRuptureLosses)})</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-rose-300/80 text-[11px]">
                <span>• Custo de Paradas de Linha (28 horas × R$ 22.000/h)</span>
                <span className="font-mono">{formatCurrencyBRL(downtimeLoss)}</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-rose-300/80 text-[11px]">
                <span>• Multas Contratuais por Short-Shipment (Magazine Brasil &amp; Casas do Sul)</span>
                <span className="font-mono">{formatCurrencyBRL(shortShipmentFines)}</span>
              </div>
              <div className="px-10 py-1.5 flex justify-between items-center text-rose-300/80 text-[11px]">
                <span>• Fretes Aéreos Emergenciais de Importados</span>
                <span className="font-mono">{formatCurrencyBRL(emergencyFreight)}</span>
              </div>

              {/* Linha 6: Despesas Operacionais */}
              <div className="px-6 py-3 flex justify-between items-center text-slate-300">
                <span>(-) Despesas Operacionais Administrativas e Comerciais (SG&amp;A)</span>
                <span className="font-mono text-rose-400">({formatCurrencyBRL(operatingExpenses)})</span>
              </div>

              {/* Linha 7: EBITDA */}
              <div className="px-6 py-3.5 flex justify-between items-center bg-slate-950/80 font-bold text-cyan-300 border-t border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">5.</span>
                  (=) EBITDA INDUSTRIAL (LAJIDA)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-800">
                    Margem: {ebitdaMarginPercent}%
                  </span>
                  <span className="font-mono text-base text-cyan-300 font-black">{formatCurrencyBRL(ebitda)}</span>
                </div>
              </div>

              {/* Linha 8: Lucro Líquido */}
              <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 font-black text-white border-t-2 border-emerald-700">
                <span className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  (=) LUCRO LÍQUIDO INDUSTRIAL DO EXERCÍCIO
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded font-bold border border-emerald-800">
                    Margem Líquida: {netMarginPercent}%
                  </span>
                  <span className="font-mono text-lg text-emerald-400 font-black">{formatCurrencyBRL(netProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Custos Unitários por Modelo */}
      {activeTab === 'produtos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => {
            const estimatedMargin = prod.unitPrice - prod.estimatedStandardCost;
            const estimatedMarginPct = ((estimatedMargin / prod.unitPrice) * 100).toFixed(1);

            const actualMargin = prod.unitPrice - prod.actualCostLastBatch;
            const actualMarginPct = ((actualMargin / prod.unitPrice) * 100).toFixed(1);
            const costDeviation = prod.actualCostLastBatch - prod.estimatedStandardCost;

            return (
              <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-blue-400 font-bold text-xs">{prod.sku}</span>
                    <h3 className="font-bold text-white text-lg">{prod.name}</h3>
                    <span className="text-xs text-slate-400">Preço de Venda Praticado: <strong className="text-white">{formatCurrencyBRL(prod.unitPrice)}</strong></span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {prod.category}
                  </span>
                </div>

                {/* Comparativo de Custos */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Custo Estimado Padrão:</span>
                    <strong className="text-lg text-white font-mono">{formatCurrencyBRL(prod.estimatedStandardCost)}</strong>
                    <span className="block text-[11px] text-emerald-400 mt-1 font-semibold">
                      Margem Projetada: {estimatedMarginPct}%
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Custo Real Último Lote:</span>
                    <strong className="text-lg text-rose-400 font-mono">{formatCurrencyBRL(prod.actualCostLastBatch)}</strong>
                    <span className="block text-[11px] text-amber-400 mt-1 font-semibold">
                      Margem Real: {actualMarginPct}%
                    </span>
                  </div>
                </div>

                {/* Detalhe da Variância */}
                <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>Desvio de Custo Unitário (Overcost):</span>
                    <span className="font-mono">+{formatCurrencyBRL(costDeviation)} / unidade</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A perda é originada pelo rateio das horas de parada de máquina (R$ 22.000/h) e horas ociosas dos operadores aguardando o abastecimento do Milk Run.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 3: Análise de Ruptura */}
      {activeTab === 'variancia' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Detalhamento dos R$ 766.000 de Ruptura Fabril
            </h3>
            <p className="text-xs text-slate-400">
              Causa raiz e alocação financeira no resultado da TecnoLar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Custo de Máquinas Paradas (R$ 616.000):</span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between">
                  <span>Atraso de Fornecedor (14h paradas):</span>
                  <strong className="text-rose-400 font-mono">R$ 308.000,00</strong>
                </li>
                <li className="flex justify-between">
                  <span>Logística Interna 400m (6h paradas):</span>
                  <strong className="text-rose-400 font-mono">R$ 132.000,00</strong>
                </li>
                <li className="flex justify-between">
                  <span>Divergência de Estoque (5h paradas):</span>
                  <strong className="text-rose-400 font-mono">R$ 110.000,00</strong>
                </li>
                <li className="flex justify-between">
                  <span>Problemas de Qualidade (3h paradas):</span>
                  <strong className="text-rose-400 font-mono">R$ 66.000,00</strong>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Multas por Short-Shipment (R$ 150.000):</span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between">
                  <span>Rede Magazine Brasil S.A. (Falta de 180 Lavadoras):</span>
                  <strong className="text-rose-400 font-mono">R$ 90.000,00</strong>
                </li>
                <li className="flex justify-between">
                  <span>Casas do Sul Eletro (Falta de 110 Refrigeradores):</span>
                  <strong className="text-rose-400 font-mono">R$ 60.000,00</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

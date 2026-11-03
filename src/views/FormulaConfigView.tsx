import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  AlertTriangle,
  Calculator,
  Lock,
} from 'lucide-react';
import {
  formatNumberBR,
  formatCurrencyBRL,
  getComparativeScenario,
} from '../utils/formulas';

export const FormulaConfigView: React.FC = () => {
  const { formulaParams, updateFormulaParams, resetFormulaParams, currentUser } = useApp();

  const [localParams, setLocalParams] = useState(formulaParams);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDirector =
    currentUser.role === 'CEO/CFO' ||
    currentUser.role === 'Diretor de TI/CIO' ||
    currentUser.role === 'Engenheiro de TI' ||
    currentUser.role === 'Supervisor/Gerente de Produção' ||
    currentUser.role === 'Analista de PCP';

  const comparison = getComparativeScenario(localParams);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFormulaParams(localParams);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    resetFormulaParams();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Modelagem Matemática &amp; Parâmetros Operacionais
            </span>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Calibração Dinâmica
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Parâmetros do Ponto de Pedido (ROP), Estoque de Segurança (SS) &amp; LEC
          </h2>
          <p className="text-xs text-slate-400">
            Fórmulas oficiais do diagnóstico TecnoLar com recalibração reativa em todo o sistema ERP &amp; WMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores Padrão</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Parâmetros salvos e aplicados com sucesso! O ponto de pedido de todos os itens do WMS foi recalculado.</span>
        </div>
      )}

      {/* Formulário de Parâmetros */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: LEC */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                Lote Econômico de Compra (LEC)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                LEC = √(2·D·S / H)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Demanda Anual D (unid./ano):
                </label>
                <input
                  type="number"
                  disabled={!isDirector}
                  value={localParams.annualDemand}
                  onChange={(e) =>
                    setLocalParams({ ...localParams, annualDemand: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custo por Pedido S (R$/pedido):
                </label>
                <input
                  type="number"
                  step="10"
                  disabled={!isDirector}
                  value={localParams.orderCost}
                  onChange={(e) =>
                    setLocalParams({ ...localParams, orderCost: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custo Unitário de Manutenção H (R$/unid./ano):
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isDirector}
                  value={localParams.holdingCostPerUnitYear}
                  onChange={(e) =>
                    setLocalParams({
                      ...localParams,
                      holdingCostPerUnitYear: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-400">LEC Calculado:</span>
                <strong className="text-lg font-black text-blue-400 font-mono">
                  ≈ {formatNumberBR(comparison.real.lec)} unidades
                </strong>
              </div>
            </div>
          </div>

          {/* Card 2: Estoque de Segurança (SS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Estoque de Segurança (SS)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                SS = z · √(LT·σd² + d²·σLT²)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Demanda Diária d (unid./dia):
                </label>
                <input
                  type="number"
                  disabled={!isDirector}
                  value={localParams.dailyDemand}
                  onChange={(e) =>
                    setLocalParams({ ...localParams, dailyDemand: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Fator do Nível de Serviço z (90% = 1,28):
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isDirector}
                  value={localParams.serviceLevelZ}
                  onChange={(e) =>
                    setLocalParams({ ...localParams, serviceLevelZ: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Lead Time LT (dias):
                  </label>
                  <input
                    type="number"
                    disabled={!isDirector}
                    value={localParams.leadTimeDays}
                    onChange={(e) =>
                      setLocalParams({ ...localParams, leadTimeDays: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Desvio σLT (dias):
                  </label>
                  <input
                    type="number"
                    disabled={!isDirector}
                    value={localParams.leadTimeStdDev}
                    onChange={(e) =>
                      setLocalParams({ ...localParams, leadTimeStdDev: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-400">SS Calculado:</span>
                <strong className="text-lg font-black text-emerald-400 font-mono">
                  ≈ {formatNumberBR(comparison.real.ss)} unidades
                </strong>
              </div>
            </div>
          </div>

          {/* Card 3: Ponto de Pedido (ROP) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Ponto de Pedido Dinâmico (ROP)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                ROP = d · LT + SS
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumo no Lead Time (d · LT):</span>
                  <strong className="text-white font-mono">{formatNumberBR(localParams.dailyDemand * localParams.leadTimeDays)} un</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estoque de Segurança (SS):</span>
                  <strong className="text-emerald-400 font-mono">{formatNumberBR(comparison.real.ss)} un</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold">ROP Resultante:</span>
                  <strong className="text-xl font-black text-amber-400 font-mono">
                    ≈ {formatNumberBR(comparison.real.rop)} un
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg text-slate-300">
                <p className="text-[11px]">
                  <strong>Regra de Negócio:</strong> Quando o saldo físico de componentes plásticos atingir <strong>21.216 unidades</strong>, o sistema aciona ordens de compra imediatas no lote LEC de <strong>9.354 unidades</strong>.
                </p>
              </div>

              {isDirector ? (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Aplicar Parâmetros em Todo o ERP</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-[11px] bg-slate-950 p-2 rounded">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apenas perfis de Diretoria podem alterar estes parâmetros.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

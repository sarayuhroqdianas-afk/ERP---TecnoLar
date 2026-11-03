import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  CheckCircle2,
  AlertOctagon,
  Scan,
  Plus,
  Minus,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const OperatorTerminal: React.FC = () => {
  const {
    currentUser,
    productionOrders,
    updateProductionOrder,
    recordDowntime,
    setIsBarcodeModalOpen,
    setIsAiAssistantOpen,
  } = useApp();

  const [selectedOpId, setSelectedOpId] = useState(productionOrders[0]?.id || '');
  const [downtimeModalOpen, setDowntimeModalOpen] = useState(false);
  const [downtimeDuration, setDowntimeDuration] = useState(0.5);
  const [downtimeCause, setDowntimeCause] = useState<
    'Atraso de Fornecedor' | 'Logística Interna' | 'Divergência de Estoque' | 'Qualidade'
  >('Logística Interna');
  const [downtimeDesc, setDowntimeDesc] = useState('Aguardando abastecimento do Milk Run no posto 04.');

  const activeOp = productionOrders.find((op) => op.id === selectedOpId) || productionOrders[0];

  if (!activeOp) {
    return (
      <div className="p-6 text-center text-slate-400">
        Nenhuma Ordem de Produção ativa no momento.
      </div>
    );
  }

  const handleStart = () => {
    updateProductionOrder(activeOp.id, {
      status: 'Em Produção',
      startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handlePause = () => {
    updateProductionOrder(activeOp.id, { status: 'Pausada' });
    setDowntimeModalOpen(true);
  };

  const handleFinish = () => {
    updateProductionOrder(activeOp.id, {
      status: 'Concluída',
      endTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleAddProduced = (amount: number = 1) => {
    updateProductionOrder(activeOp.id, {
      qtyProduced: activeOp.qtyProduced + amount,
    });
  };

  const handleAddScrap = (amount: number = 1) => {
    updateProductionOrder(activeOp.id, {
      qtyScrap: activeOp.qtyScrap + amount,
    });
  };

  const handleSaveDowntime = (e: React.FormEvent) => {
    e.preventDefault();
    recordDowntime({
      date: new Date().toISOString().substring(0, 10),
      durationHours: downtimeDuration,
      costPerHour: 22000,
      cause: downtimeCause,
      line: activeOp.lineId,
      description: downtimeDesc,
      registeredBy: currentUser.matricula,
    });
    setDowntimeModalOpen(false);
  };

  const progressPercent = Math.min(
    100,
    Math.round((activeOp.qtyProduced / activeOp.qtyPlanned) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Barra Superior do Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            OP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Terminal Industrial de Chão de Fábrica
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Posto: {activeOp.machineId}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {activeOp.code} - {activeOp.productName}
            </h2>
            <p className="text-xs text-slate-400">
              Operador: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.matricula}) | {activeOp.lineId}
            </p>
          </div>
        </div>

        {/* Seleção de OP */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Trocar OP:</span>
          <select
            value={selectedOpId}
            onChange={(e) => setSelectedOpId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
          >
            {productionOrders.map((op) => (
              <option key={op.id} value={op.id}>
                {op.code} ({op.productSku}) - {op.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartões Grandes de Apontamento Tátil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Painel Central de Status e Meta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Progresso da Ordem
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  activeOp.status === 'Em Produção'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                    : activeOp.status === 'Pausada'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                ● {activeOp.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold text-white">
                  {activeOp.qtyProduced.toLocaleString('pt-BR')}
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  Meta: {activeOp.qtyPlanned.toLocaleString('pt-BR')} un
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>Rendimento: <strong className="text-blue-400">{progressPercent}%</strong></span>
                <span>Capacidade Máquina: <strong>{activeOp.machineCapacityUnitsPerHour} un/h</strong></span>
              </div>
            </div>
          </div>

          {/* Botões de Controle de Turno / Ciclo */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <button
              type="button"
              onClick={handleStart}
              disabled={activeOp.status === 'Em Produção'}
              className="py-3 px-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex flex-col items-center justify-center gap-1 transition shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>INICIAR</span>
            </button>
            <button
              type="button"
              onClick={handlePause}
              disabled={activeOp.status !== 'Em Produção'}
              className="py-3 px-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex flex-col items-center justify-center gap-1 transition shadow-sm"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSAR / PARADA</span>
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="py-3 px-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-xs flex flex-col items-center justify-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONCLUIR</span>
            </button>
          </div>
        </div>

        {/* Apontamento Rápido de Peças Boas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Apontamento de Peças Boas Aprovadas
            </span>
            <p className="text-xs text-slate-400 mb-4">
              Cada clique adiciona ao lote liberado no posto de montagem.
            </p>

            <div className="text-center py-2">
              <span className="text-4xl font-black text-emerald-400 block">
                +{activeOp.qtyProduced}
              </span>
              <span className="text-xs text-slate-400">Unidades Validadas pelo Teste Elétrico</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleAddProduced(1)}
              className="py-4 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-lg rounded-xl flex items-center justify-center gap-2 transition shadow-lg border border-emerald-600"
            >
              <Plus className="w-6 h-6" />
              <span>+1 Peça</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddProduced(10)}
              className="py-4 bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-emerald-200 font-extrabold text-lg rounded-xl flex items-center justify-center gap-2 transition shadow-lg border border-emerald-700"
            >
              <Plus className="w-6 h-6" />
              <span>+10 Peças</span>
            </button>
          </div>
        </div>

        {/* Apontamento de Perdas e Scrap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Registro de Refugo / Scrap
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Peças reprovadas no teste de estanqueidade ou com trinca de plástico.
            </p>

            <div className="text-center py-2">
              <span className="text-4xl font-black text-rose-400 block">
                {activeOp.qtyScrap}
              </span>
              <span className="text-xs text-slate-400">Unidades Sucateadas</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleAddScrap(1)}
              className="py-4 bg-rose-900/80 hover:bg-rose-800 active:scale-95 text-rose-200 font-extrabold text-base rounded-xl flex items-center justify-center gap-2 transition shadow-lg border border-rose-700"
            >
              <Plus className="w-5 h-5" />
              <span>+1 Refugo</span>
            </button>
            <button
              type="button"
              onClick={() => setDowntimeModalOpen(true)}
              className="py-4 bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-amber-700 text-center"
            >
              <Clock className="w-5 h-5" />
              <span>Parada Linha</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ações Rápidas do Chão de Fábrica */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <Scan className="w-4 h-4" />
            <span>Ler Código de Barras de Peça</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedir Ajuda à IA</span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Terminal conectado via rede industrial local | IP 192.168.10.42 | Latência 2ms
        </div>
      </div>

      {/* Modal de Registro de Parada de Linha do Operador */}
      {downtimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-4 h-4" />
                Registrar Ocorrência de Parada de Linha
              </h3>
              <button
                type="button"
                onClick={() => setDowntimeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-xs text-rose-200">
              <strong>Custo de Parada Industrial:</strong> Cada 1 hora de linha parada equivale a <strong>R$ 22.000,00</strong> em perdas de absorção e capacidade.
            </div>

            <form onSubmit={handleSaveDowntime} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Duração Estimada da Parada (Horas):
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  required
                  value={downtimeDuration}
                  onChange={(e) => setDowntimeDuration(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
                <span className="text-[11px] text-amber-400 mt-1 block">
                  Custo gerado: R$ {(downtimeDuration * 22000).toLocaleString('pt-BR')}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Motivo / Causa Raiz:
                </label>
                <select
                  value={downtimeCause}
                  onChange={(e) => setDowntimeCause(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Logística Interna">Logística Interna (Atraso Milk Run 400m / Kitting)</option>
                  <option value="Atraso de Fornecedor">Atraso de Fornecedor (Falta de Resina / Peça)</option>
                  <option value="Divergência de Estoque">Divergência de Estoque (Peça constava no WMS mas sumiu)</option>
                  <option value="Qualidade">Qualidade (Lote Bloqueado por Trinca)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Descrição do Problema na Linha:
                </label>
                <textarea
                  rows={3}
                  required
                  value={downtimeDesc}
                  onChange={(e) => setDowntimeDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDowntimeModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded"
                >
                  Registrar Parada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

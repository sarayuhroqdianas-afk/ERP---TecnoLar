import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, PlusCircle, MinusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const QuickMovementModal: React.FC = () => {
  const {
    isQuickMoveModalOpen,
    setIsQuickMoveModalOpen,
    quickMoveType,
    components,
    deductComponentStockRealtime,
    addComponentStock,
  } = useApp();

  const [selectedSku, setSelectedSku] = useState(components[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [batchNumber, setBatchNumber] = useState('LOT-2026-MANUAL');
  const [reason, setReason] = useState('Abastecimento Linha 1 - Lavadoras');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isQuickMoveModalOpen) return null;

  const currentComp = components.find((c) => c.sku === selectedSku);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || quantity <= 0) return;

    if (quickMoveType === 'entrada') {
      addComponentStock(selectedSku, quantity, batchNumber);
      setFeedback(`Entrada de ${quantity} un de ${selectedSku} registrada no WMS!`);
    } else {
      deductComponentStockRealtime(selectedSku, quantity, reason);
      setFeedback(`Baixa imediata em tempo real de ${quantity} un de ${selectedSku} confirmada!`);
    }

    setTimeout(() => {
      setFeedback(null);
      setIsQuickMoveModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Cabeçalho */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between ${
            quickMoveType === 'entrada'
              ? 'bg-emerald-950/80 border-emerald-800'
              : 'bg-rose-950/80 border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {quickMoveType === 'entrada' ? (
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <MinusCircle className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="text-sm font-bold text-white">
              {quickMoveType === 'entrada'
                ? 'Entrada de Matéria-Prima no WMS'
                : 'Baixa em Tempo Real (Saída da Linha)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickMoveModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {quickMoveType === 'saida' && (
            <div className="p-2.5 bg-blue-950/60 border border-blue-800 rounded text-xs text-blue-200">
              <strong>Regra Operacional TecnoLar:</strong> A baixa é registrada instantaneamente a cada retirada para eliminar a antiga distorção de baixa acumulada só no fim do turno!
            </div>
          )}

          {feedback && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Componente / SKU:
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              {components.map((c) => (
                <option key={c.id} value={c.sku}>
                  {c.sku} - {c.name} (Atual: {c.currentStock.toLocaleString('pt-BR')} {c.unit})
                </option>
              ))}
            </select>
          </div>

          {currentComp && (
            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span>Localização: <strong className="text-slate-200">{currentComp.wmsLocation}</strong></span>
              <span>Lote Atual: <strong className="text-slate-200">{currentComp.batchNumber}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantidade ({currentComp?.unit || 'UN'}):
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lote de Rastreio:
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Motivo / Destino da Movimentação:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuickMoveModalOpen(false)}
              className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition ${
                quickMoveType === 'entrada'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Confirmar Movimentação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

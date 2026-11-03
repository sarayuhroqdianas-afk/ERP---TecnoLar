import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Scan,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { formatNumberBR } from '../utils/formulas';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    components,
    deductComponentStockRealtime,
    addComponentStock,
    toggleQualityLock,
  } = useApp();

  const [scannedCode, setScannedCode] = useState('CMP-PLAS-001');
  const [customQty, setCustomQty] = useState<number>(10);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isBarcodeModalOpen) return null;

  const foundItem = components.find(
    (c) =>
      c.sku.toLowerCase() === scannedCode.toLowerCase().trim() ||
      c.batchNumber.toLowerCase() === scannedCode.toLowerCase().trim()
  );

  const handleAddStock = () => {
    if (!foundItem || customQty <= 0) return;
    addComponentStock(foundItem.sku, customQty, foundItem.batchNumber);
    setActionSuccess(`Entrada de +${customQty} ${foundItem.unit} confirmada para ${foundItem.sku}!`);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleDeductStock = () => {
    if (!foundItem || customQty <= 0) return;
    deductComponentStockRealtime(foundItem.sku, customQty, 'Baixa via Leitor Coletor Laser');
    setActionSuccess(`Baixa imediata em tempo real de -${customQty} ${foundItem.unit} para ${foundItem.sku}!`);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto relative">
        {/* Cabeçalho com botão X de altíssima visibilidade */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Coletor Laser / Leitor WMS
              </h3>
              <p className="text-[11px] text-slate-400">Leitura Code128, Datamatrix &amp; EAN-13</p>
            </div>
          </div>

          {/* Botão de Fechar com Altíssimo Destaque Visual */}
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition shadow-lg border-2 border-white active:scale-95 shrink-0"
            aria-label="Fechar leitor de código de barras"
          >
            <X className="w-5 h-5 stroke-[3]" />
            <span>FECHAR (X)</span>
          </button>
        </div>

        {/* Viewfinder da Câmera / Laser */}
        <div className="p-4 bg-slate-950 flex flex-col items-center">
          <div className="w-full h-44 bg-slate-900 rounded-xl border-2 border-dashed border-blue-500 relative flex items-center justify-center overflow-hidden shadow-inner">
            <div className="absolute w-full h-1 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
            <div className="flex flex-col items-center text-center p-3">
              <Scan className="w-10 h-10 text-blue-400 mb-2 animate-bounce" />
              <span className="text-xs text-cyan-300 font-mono font-bold tracking-widest">
                [ CÂMERA &amp; LEITOR LASER ATIVOS ]
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Aponte para o palete, etiqueta de peça ou digite o SKU abaixo
              </span>
            </div>
          </div>

          {/* Seleção rápida de componentes para simulação rápida */}
          <div className="w-full mt-3 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-300">
              Código Escaneado / Seleção Rápida de Componente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Ex: CMP-PLAS-001 ou LOT-PLAS-2026-88"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-blue-500"
              />
              <select
                onChange={(e) => setScannedCode(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
              >
                <option value="CMP-PLAS-001">Gabinete Plástico (63% impacto)</option>
                <option value="CMP-PLAS-002">Cesto Tambor (Crítico)</option>
                <option value="CMP-ELET-101">Placa Inverter (Taiwan)</option>
                <option value="CMP-COMP-401">Compressor Hermético</option>
                <option value="CMP-PLAS-003">Gaveta Crisper</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações do Item Escaneado */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {actionSuccess && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
          )}

          {foundItem ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-blue-400 font-bold">{foundItem.sku}</span>
                  <h4 className="font-bold text-white text-base leading-tight">{foundItem.name}</h4>
                  <span className="text-[11px] text-slate-400">{foundItem.category} • Lote: {foundItem.batchNumber}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    foundItem.qualityStatus === 'Liberado'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  }`}
                >
                  {foundItem.qualityStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Saldo WMS Atual:</span>
                  <strong className="text-base text-white font-mono">{formatNumberBR(foundItem.currentStock)}</strong> {foundItem.unit}
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Ponto de Pedido (ROP):</span>
                  <strong className="text-base text-amber-300 font-mono">{formatNumberBR(foundItem.ropCalculated)}</strong> {foundItem.unit}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Endereço WMS: <strong className="text-white">{foundItem.wmsLocation}</strong></span>
              </div>

              {/* Controle de Quantidade TOTALMENTE EDITÁVEL */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-200">
                    Quantidade a Movimentar ({foundItem.unit}):
                  </label>
                  <div className="flex gap-1">
                    {[1, 5, 10, 50, 100].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setCustomQty(step)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold border border-slate-700"
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomQty(Math.max(1, customQty - 1))}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg py-2 text-center text-white font-mono text-base font-bold focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setCustomQty(customQty + 1)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Botões de Ação com Quantidade Customizada */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddStock}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    + Entrada de {customQty} {foundItem.unit}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeductStock}
                    className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    - Baixa de {customQty} {foundItem.unit}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
              Nenhum componente encontrado para o código '{scannedCode}'.
            </div>
          )}
        </div>

        {/* Rodapé com Botão Prominente de Concluir */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(false)}
            className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700"
          >
            Concluir Leituras e Fechar (X)
          </button>
        </div>
      </div>
    </div>
  );
};

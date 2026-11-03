import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  MapPin,
  Barcode,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Search,
  Eye,
  Map,
  ArrowRight,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingCart,
  Truck,
  Box,
  Compass,
  Building2,
  Factory,
  ShieldAlert,
} from 'lucide-react';
import { formatNumberBR, calculateInventoryAccuracy } from '../utils/formulas';
import { ComponentItem, PurchaseOrder } from '../types';

export const WMSView: React.FC = () => {
  const {
    components,
    deductComponentStockRealtime,
    addComponentStock,
    toggleQualityLock,
    updatePhysicalStockCount,
    requisitions,
    currentUser,
    setIsBarcodeModalOpen,
    searchQuery,
    setSearchQuery,
    emitPurchaseOrderFromROP,
    formatCurrency,
    t,
    setActiveView,
    purchaseOrders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'estoque' | 'mapa' | 'inventario' | 'requisicoes'>('estoque');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [selectedBin, setSelectedBin] = useState<string>('Rua A - Posição 01');

  // Modal de Movimentação Específica do Componente
  const [activeComponentForMove, setActiveComponentForMove] = useState<ComponentItem | null>(null);
  const [moveType, setMoveType] = useState<'entrada' | 'baixa'>('entrada');
  const [moveQty, setMoveQty] = useState<number>(100);
  const [moveBatch, setMoveBatch] = useState<string>('LOT-MANUAL-2026');
  const [moveReason, setMoveReason] = useState<string>('Abastecimento Linha 1');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [ropSuccessOrder, setRopSuccessOrder] = useState<PurchaseOrder | null>(null);

  // Filtragem flexível: por categoria e por busca (código SKU, nome ou categoria)
  const filteredComponents = components.filter((c) => {
    if (filterCategory !== 'todos' && c.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.sku.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.batchNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Identificação de componentes abaixo do ponto de pedido (ROP)
  const ropAlertItems = components.filter((c) => c.currentStock <= c.ropCalculated);

  // Estatísticas de Acurácia
  const totalVirtual = components.reduce((acc, c) => acc + c.currentStock, 0);
  const totalPhysical = components.reduce((acc, c) => acc + c.physicalStock, 0);
  const globalAccuracy = calculateInventoryAccuracy(totalPhysical, totalVirtual);

  const isQualityUser =
    currentUser.role === 'Analista de Qualidade' ||
    currentUser.role === 'Supervisor/Gerente de Produção' ||
    currentUser.role === 'Diretor de TI/CIO' ||
    currentUser.role === 'CEO' ||
    currentUser.role === 'CFO' ||
    currentUser.role === 'CEO/CFO';

  const handleOpenMovement = (comp: ComponentItem, type: 'entrada' | 'baixa') => {
    setActiveComponentForMove(comp);
    setMoveType(type);
    setMoveQty(type === 'entrada' ? 100 : 20);
    setMoveBatch(comp.batchNumber);
    setMoveReason(type === 'entrada' ? 'Recebimento de Fornecedor' : 'Baixa em tempo real para Linha 1');
  };

  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComponentForMove || moveQty <= 0) return;

    if (moveType === 'entrada') {
      addComponentStock(activeComponentForMove.sku, moveQty, moveBatch);
      setActionSuccess(`Entrada de +${moveQty} ${activeComponentForMove.unit} confirmada para ${activeComponentForMove.sku}!`);
    } else {
      deductComponentStockRealtime(activeComponentForMove.sku, moveQty, moveReason);
      setActionSuccess(`Baixa imediata em tempo real de -${moveQty} ${activeComponentForMove.unit} registrada para ${activeComponentForMove.sku}!`);
    }

    setActiveComponentForMove(null);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Emissão de Pedido de Compra LEC a partir do Alerta ROP
  const handleEmitPurchaseOrder = (sku: string) => {
    const po = emitPurchaseOrderFromROP(sku);
    if (po) {
      setRopSuccessOrder(po);
      setActionSuccess(`Pedido de Compra ${po.code} emitido com sucesso! ${po.qtyOrdered} un de ${po.componentSku} solicitadas ao fornecedor ${po.supplierName}.`);
      setTimeout(() => {
        setActionSuccess(null);
        setRopSuccessOrder(null);
      }, 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do WMS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              WMS Industrial Integrado
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Baixa em Tempo Real Ativada
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Gestão de Almoxarifado, Endereçamento &amp; Qualidade
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de inventário cíclico, bloqueio de lotes, kitting e distribuição para as linhas de lavadoras e refrigeradores (400m).
          </p>
        </div>

        {/* Abas e Botão do Leitor */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('estoque')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'estoque'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('wmsTabStock')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mapa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'mapa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('wmsTabMap')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventario')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'inventario'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('wmsTabInv')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requisicoes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'requisicoes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('wmsTabReq')} ({requisitions.filter((r) => r.status === 'Pendente').length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4" />
            <span>{t('scanner')}</span>
          </button>
        </div>
      </div>

      {/* Banner de Alerta e Feedback de Sucesso */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          {ropSuccessOrder && (
            <button
              type="button"
              onClick={() => setActiveView('compras')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 transition"
            >
              Ver em Compras &rarr;
            </button>
          )}
        </div>
      )}

      {/* SEÇÃO PRINCIPAL DE ALERTAS DE ROP COM BOTÃO FUNCIONAL DE EMISSÃO LEC */}
      {ropAlertItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('reorderAlert')} - {ropAlertItems.length} Componentes Críticos
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Estoque atual abaixo do Ponto de Pedido (ROP = d·LT + SS). Emita o Lote Econômico (LEC) para evitar parada fabril (R$ 22.000/h).
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              Ação de Reposição Imediata
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ropAlertItems.map((c) => {
              const pendingPO = purchaseOrders.find((po) => po.componentSku === c.sku && po.status === 'Pendente');
              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/60 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{c.sku}</span>
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">
                        Crítico (Classe {c.abcClass})
                      </span>
                    </div>
                    <strong className="text-slate-900 dark:text-white text-xs block mt-1 line-clamp-1">
                      {c.name}
                    </strong>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Estoque</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono text-xs">
                          {formatNumberBR(c.currentStock)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Ponto ROP</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs">
                          {formatNumberBR(c.ropCalculated)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Lote LEC</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          {formatNumberBR(c.lecCalculated)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {pendingPO ? (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs">
                      <span className="text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                        {pendingPO.code} ({formatNumberBR(pendingPO.qtyOrdered)} un)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
                        Emitido
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEmitPurchaseOrder(c.sku)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition shadow-xs active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t('buyLEC')} ({formatNumberBR(c.lecCalculated)} un)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA: SALDO & MOVIMENTAÇÃO */}
      {activeTab === 'estoque' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por código (SKU), nome ou categoria..."
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Categoria:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs"
                >
                  <option value="todos">Todas as Categorias ({components.length})</option>
                  <option value="Plásticos Injetados">Plásticos Injetados (63% impacto)</option>
                  <option value="Importados Críticos">Importados Críticos</option>
                  <option value="Compressores e Motores">Compressores e Motores</option>
                  <option value="Chapas e Gabinetes Metálicos">Chapas Metálicas</option>
                  <option value="Placas Eletrônicas e Chicotes">Placas Eletrônicas</option>
                </select>
              </div>
            </div>

            <div className="text-slate-500 dark:text-slate-400 text-xs">
              Exibindo <strong>{filteredComponents.length}</strong> de {components.length} SKUs
            </div>
          </div>

          {/* Tabela de Componentes do WMS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 font-bold">Código SKU / Nome</th>
                    <th className="py-3 px-4 font-bold">Categoria / Curva ABC</th>
                    <th className="py-3 px-4 font-bold">Endereço no WMS</th>
                    <th className="py-3 px-4 font-bold text-center">Lote</th>
                    <th className="py-3 px-4 font-bold text-center">Estoque Atual</th>
                    <th className="py-3 px-4 font-bold text-center">Ponto Pedido (ROP)</th>
                    <th className="py-3 px-4 font-bold text-center">Status Qualidade</th>
                    <th className="py-3 px-4 font-bold text-right">Movimentação em Tempo Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredComponents.length > 0 ? (
                    filteredComponents.map((c) => {
                      const isBelowRop = c.currentStock <= c.ropCalculated;
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs block">
                              {c.sku}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 dark:text-slate-300 block">{c.category}</span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              Classe {c.abcClass} ({c.impactPercentage}% impacto)
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              {c.wmsLocation}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {c.batchNumber}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                              {formatNumberBR(c.currentStock)}
                            </span>{' '}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold font-mono ${isBelowRop ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {formatNumberBR(c.ropCalculated)} {c.unit}
                            </span>
                            {isBelowRop && (
                              <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-extrabold uppercase mt-0.5">
                                Repor Lote
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.qualityStatus === 'Liberado'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                              }`}
                            >
                              {c.qualityStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botões com Quantidade Totalmente Editável */}
                              <button
                                type="button"
                                onClick={() => handleOpenMovement(c, 'baixa')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                                title="Registrar baixa com quantidade editável"
                              >
                                <Minus className="w-3 h-3" />
                                <span>Baixa</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenMovement(c, 'entrada')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                                title="Registrar entrada com quantidade editável"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Entrada</span>
                              </button>

                              {isQualityUser && (
                                <button
                                  type="button"
                                  onClick={() => toggleQualityLock(c.sku)}
                                  className={`p-1.5 rounded-lg text-[11px] border transition ${
                                    c.qualityStatus === 'Liberado'
                                      ? 'border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/60'
                                      : 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/60'
                                  }`}
                                  title="Bloquear ou Liberar Lote pela Qualidade"
                                >
                                  {c.qualityStatus === 'Liberado' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                        Nenhum componente encontrado para '{searchQuery}'. Verifique o código SKU ou categoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: PLANTA 2D INDUSTRIAL & CORREDOR MILK RUN (400M) */}
      {activeTab === 'mapa' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Layout 2D: Almoxarifado Central, Corredor 400m e Linhas de Montagem</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Endereçamento por Ruas A a D, docas de recebimento e circuito de abastecimento contínuo Milk Run.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Ocupação Normal
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Abaixo do ROP
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Bloqueado CQ
              </span>
            </div>
          </div>

          {/* DIAGRAMA INDUSTRIAL ESQUEMÁTICO 2D */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Prédio 1: Almoxarifado Central (Ruas A, B, C, D) */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Prédio A: Almoxarifado Central (Armazenagem &amp; Kitting)
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  96 Posições Palete / Rua
                </span>
              </div>

              {/* Docas de Recebimento */}
              <div className="grid grid-cols-4 gap-2 text-[11px]">
                {['Doca 01 (Injetados)', 'Doca 02 (Chapas)', 'Doca 03 (Motores)', 'Doca 04 (CQ / Quarentena)'].map((dock, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                  >
                    <Truck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <strong className="block text-slate-900 dark:text-white">{dock}</strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Operacional</span>
                  </div>
                ))}
              </div>

              {/* Estruturas Porta-Paletes (Ruas A, B, C, D) */}
              <div className="space-y-3">
                {[
                  { id: 'A', name: 'Rua A - Injetados Plásticos', sku: 'CMP-PLAS-001', occ: '85%', status: 'warning', desc: 'Gabinete & Cestos' },
                  { id: 'B', name: 'Rua B - Chapas & Gabinetes', sku: 'CMP-MET-002', occ: '92%', status: 'ok', desc: 'Aço Galvanizado' },
                  { id: 'C', name: 'Rua C - Compressores & Motores', sku: 'CMP-MOT-003', occ: '74%', status: 'ok', desc: 'Inverter 220V' },
                  { id: 'D', name: 'Rua D - Placas Eletrônicas', sku: 'CMP-ELE-004', occ: '68%', status: 'ok', desc: 'Módulos de Controle' },
                ].map((street) => (
                  <div
                    key={street.id}
                    onClick={() => setSelectedBin(street.name)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex items-center justify-between ${
                      selectedBin === street.name
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                        {street.id}
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-xs block">{street.name}</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {street.desc} &bull; SKU Principal: <code className="text-blue-600 dark:text-blue-400 font-mono">{street.sku}</code>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        Ocupação: {street.occ}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${
                        street.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Área de Kitting Milk Run */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-blue-400 dark:border-blue-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Área de Separação de Kits (Kitting)
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  Abastecimento contínuo a cada 45 min
                </span>
              </div>
            </div>

            {/* Corredor 400m e Linhas de Montagem */}
            <div className="lg:col-span-5 space-y-4">
              {/* Corredor de Transporte de 400 Metros */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-500" />
                    Corredor Milk Run (Trajeto de 400 metros)
                  </span>
                  <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-300 dark:border-sky-800">
                    Rebocador Elétrico
                  </span>
                </div>

                {/* Linha esquemática de 400 metros */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>0m (Almoxarifado)</span>
                    <span>200m (Intermediário)</span>
                    <span>400m (Fábrica)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    <div className="bg-sky-500 h-full w-2/3 rounded-full animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>Velocidade de Transporte: <strong>12 km/h</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">SLA: 6 min/viagem</span>
                  </div>
                </div>
              </div>

              {/* Fábrica: Linhas de Montagem 1 e 2 */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-indigo-500" />
                    Prédio B: Fábrica de Montagem
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Meta: 1.200 un/dia
                  </span>
                </div>

                {/* Linha 1: Lavadoras */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-slate-900 dark:text-white">Linha 1 - Lavadoras 15kg</strong>
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">700 un/dia</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buffer de linha: 4 horas de produção contínua abastecido pelo Milk Run.
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                {/* Linha 2: Refrigeradores */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-slate-900 dark:text-white">Linha 2 - Refrigeradores Frost Free</strong>
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">500 un/dia</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buffer de linha: 4 horas de produção contínua abastecido pelo Milk Run.
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: INVENTÁRIO CÍCLICO */}
      {activeTab === 'inventario' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inventário Cíclico &amp; Acurácia de Estoque</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparação em tempo real entre o saldo virtual do WMS e a contagem física.</p>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              Acurácia Global: {globalAccuracy}%
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {components.map((c) => {
              const diff = c.physicalStock - c.currentStock;
              return (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900 dark:text-white">{c.sku} - {c.name}</strong>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Local: {c.wmsLocation}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Saldo Virtual:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{formatNumberBR(c.currentStock)} {c.unit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Contagem Física:</span>
                      <strong className="text-blue-600 dark:text-cyan-300 font-mono">{formatNumberBR(c.physicalStock)} {c.unit}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Divergência:</span>
                      <span className={`font-mono font-bold ${diff === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {diff > 0 ? `+${diff}` : diff} {c.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA: REQUISIÇÕES */}
      {activeTab === 'requisicoes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Requisições das Linhas de Produção para o Almoxarifado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Peças a serem separadas para despacho imediato no Milk Run (400m).</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {requisitions.map((req) => (
              <div key={req.id} className="py-3 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 dark:text-white block">{req.code} - {req.componentName}</strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Destino: {req.line} | Requisitante: {req.requestedBy}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{req.qtyRequested} un</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE MOVIMENTAÇÃO COM QUANTIDADE TOTALMENTE EDITÁVEL */}
      {activeComponentForMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {moveType === 'entrada' ? 'Registrar Entrada de Material' : 'Baixa em Tempo Real (Saída)'}
                </h3>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                  {activeComponentForMove.sku} - {activeComponentForMove.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveComponentForMove(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmMovement} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                <span>Saldo WMS Atual: <strong className="text-slate-900 dark:text-white font-mono">{formatNumberBR(activeComponentForMove.currentStock)} {activeComponentForMove.unit}</strong></span>
                <span>Local: <strong className="text-blue-600 dark:text-blue-300">{activeComponentForMove.wmsLocation.split('-')[0]}</strong></span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-medium">Quantidade ({activeComponentForMove.unit}):</label>
                  <div className="flex gap-1">
                    {[10, 50, 100, 500, 1000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setMoveQty(quick)}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold border border-slate-300 dark:border-slate-700"
                      >
                        +{quick}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={moveQty}
                  onChange={(e) => setMoveQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono text-base font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Número do Lote de Rastreabilidade:</label>
                <input
                  type="text"
                  required
                  value={moveBatch}
                  onChange={(e) => setMoveBatch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Motivo / Posto de Destino:</label>
                <input
                  type="text"
                  required
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveComponentForMove(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-white rounded-lg transition shadow-md ${
                    moveType === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirmar {moveType === 'entrada' ? 'Entrada' : 'Baixa'} de {moveQty} un
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

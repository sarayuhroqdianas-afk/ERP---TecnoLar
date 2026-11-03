import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Factory,
  Layers,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Cpu,
  Settings2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrencyBRL, formatNumberBR } from '../utils/formulas';

export const ProductionView: React.FC = () => {
  const {
    products,
    productionOrders,
    downtimes,
    currentUser,
    updateProductionOrder,
    recordDowntime,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ops' | 'bom' | 'paradas' | 'capacidade'>('ops');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [isNewOpModalOpen, setIsNewOpModalOpen] = useState(false);
  const [newOpProductSku, setNewOpProductSku] = useState('LAV-TURBO-15KG');
  const [newOpQty, setNewOpQty] = useState(700);
  const [newOpShift, setNewOpShift] = useState<'Turno 1 (06:00 - 14:20)' | 'Turno 2 (14:20 - 22:40)' | 'Turno 3 (22:40 - 06:00)'>('Turno 1 (06:00 - 14:20)');

  const currentProduct = products.find((p) => p.id === selectedProduct) || products[0];

  const handleCreateOP = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = products.find((p) => p.sku === newOpProductSku);
    const newCode = `OP-2026-${Math.floor(1200 + Math.random() * 8000)}`;
    const lineId = newOpProductSku.includes('LAV') ? 'Linha 1 - Lavadoras' : 'Linha 2 - Refrigeradores';

    // Mock insertion (adiciona ao topo)
    productionOrders.unshift({
      id: `op-${Date.now()}`,
      code: newCode,
      productSku: newOpProductSku,
      productName: targetProd?.name || 'Novo Produto',
      qtyPlanned: newOpQty,
      qtyProduced: 0,
      qtyScrap: 0,
      status: 'Planejada',
      lineId,
      shift: newOpShift,
      machineId: lineId.includes('Lavadoras') ? 'INJ-CARROSSEL-L1' : 'ESPUMA-MONTAGEM-L2',
      machineCapacityUnitsPerHour: lineId.includes('Lavadoras') ? 95 : 65,
      downtimeHours: 0,
    });

    setIsNewOpModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Módulo de Produção &amp; PCP
            </span>
            <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Meta Fabril: 1.200 unid./dia
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Programação de Ordens, BOM &amp; Apontamento de Linha
          </h2>
          <p className="text-xs text-slate-400">
            Controle de capacidade de máquina, consumo de insumos, perdas por scrap e registro de horas paradas (R$ 22.000/h).
          </p>
        </div>

        {/* Abas e Botão Nova OP */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('ops')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'ops' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ordens de Produção (OP)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'bom' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              BOM &amp; Estrutura
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paradas')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'paradas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Horas Paradas (R$ 766k)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capacidade')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'capacidade' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Capacidade de Máquina
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewOpModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Nova OP</span>
          </button>
        </div>
      </div>

      {/* Aba: Ordens de Produção (OP) */}
      {activeTab === 'ops' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Ordens de Produção Ativas e Planejadas
              </span>
              <span className="text-slate-400">
                Total: <strong>{productionOrders.length} OPs</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Código / Linha</th>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4">Turno</th>
                    <th className="py-3 px-4 text-center">Meta Planejada</th>
                    <th className="py-3 px-4 text-center">Produzido</th>
                    <th className="py-3 px-4 text-center">Refugo (Scrap)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {productionOrders.map((op) => {
                    const pct = Math.min(100, Math.round((op.qtyProduced / op.qtyPlanned) * 100));
                    return (
                      <tr key={op.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-400 block">{op.code}</span>
                          <span className="text-[11px] text-slate-400">{op.lineId}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {op.productName}
                          <span className="block text-[10px] text-slate-400 font-mono">{op.productSku}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {op.shift}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {formatNumberBR(op.qtyPlanned)} un
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-extrabold text-emerald-400">{formatNumberBR(op.qtyProduced)}</span> un
                          <span className="block text-[10px] text-slate-400">({pct}%)</span>
                        </td>
                        <td className="py-3 px-4 text-center text-rose-400 font-bold">
                          {op.qtyScrap} un
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              op.status === 'Em Produção'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : op.status === 'Pausada'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : op.status === 'Concluída'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {op.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {op.status !== 'Em Produção' && (
                              <button
                                type="button"
                                onClick={() => updateProductionOrder(op.id, { status: 'Em Produção' })}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold"
                              >
                                Iniciar
                              </button>
                            )}
                            {op.status === 'Em Produção' && (
                              <button
                                type="button"
                                onClick={() => updateProductionOrder(op.id, { status: 'Pausada' })}
                                className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-[11px] font-semibold"
                              >
                                Pausar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => updateProductionOrder(op.id, { qtyProduced: op.qtyProduced + 10 })}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                            >
                              +10 un
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aba: BOM (Bill of Materials) */}
      {activeTab === 'bom' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Selecione o Eletrodoméstico:</span>
              <div className="flex gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedProduct === p.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Custo Padrão Estimado: <strong className="text-white">{formatCurrencyBRL(currentProduct.estimatedStandardCost)}</strong>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Estrutura de Componentes &amp; Roteiro de Montagem (BOM)
              </span>
              <span className="text-slate-400">
                Itens na Estrutura: <strong>{currentProduct.bom.length} componentes chave</strong>
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU do Insumo</th>
                  <th className="py-3 px-4">Descrição do Componente</th>
                  <th className="py-3 px-4 text-center">Etapa Fabril</th>
                  <th className="py-3 px-4 text-center">Qtd / Eletrodoméstico</th>
                  <th className="py-3 px-4 text-center">Criticidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {currentProduct.bom.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {item.componentSku}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.componentName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {item.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {item.quantityPerUnit} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isCritical ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          Crítico (Risco Ruptura)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800">
                          Padrão
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba: Histórico de Horas Paradas (R$ 766k) */}
      {activeTab === 'paradas' && (
        <div className="space-y-4">
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">
                  Lançamento de Ocorrências ao Custo de Parada (R$ 22.000 / hora)
                </h4>
                <p className="text-rose-200">
                  Total de 28 horas paradas no trimestre com R$ 616.000 em perda produtiva e R$ 150.000 em multas contratuais.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Prejuízo Total Consolidado:</span>
              <strong className="text-xl font-black text-rose-300">R$ 766.000,00</strong>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Registro de Ocorrências Oficiais
              </span>
              <span className="text-slate-400">
                {downtimes.length} Registros Auditados
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Data / Linha</th>
                    <th className="py-2.5 px-3">Causa Raiz</th>
                    <th className="py-2.5 px-3 text-center">Horas Paradas</th>
                    <th className="py-2.5 px-3 text-right">Custo da Ocorrência</th>
                    <th className="py-2.5 px-3">Descrição / Insumo Envolvido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {downtimes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white">{d.date}</span>
                        <span className="block text-[10px] text-slate-400">{d.line}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.cause === 'Atraso de Fornecedor'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : d.cause === 'Logística Interna'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : d.cause === 'Divergência de Estoque'
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                              : d.cause === 'Qualidade'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-rose-950 text-rose-400 font-extrabold'
                          }`}
                        >
                          {d.cause}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {d.durationHours > 0 ? `${d.durationHours.toFixed(1)} h` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-rose-400">
                        {formatCurrencyBRL(d.totalCost)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-sm">
                        {d.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aba: Capacidade de Máquina */}
      {activeTab === 'capacidade' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Linha 1 - Lavadoras (Meta 700 un/dia)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Injetora Carrossel Principal:</span>
                <strong className="text-white">95 unidades / hora</strong>
              </div>
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Bancada de Teste Elétrico Inverter:</span>
                <strong className="text-white">110 unidades / hora</strong>
              </div>
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Turno 1 + Turno 2 (16 horas produtivas):</span>
                <strong className="text-emerald-400">Capacidade Teórica: 1.520 un/dia</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Linha 2 - Refrigeradores (Meta 500 un/dia)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Injeção de Espuma Isolante PU:</span>
                <strong className="text-white">65 gabinetes / hora</strong>
              </div>
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Montagem do Compressor Hermético:</span>
                <strong className="text-white">75 unidades / hora</strong>
              </div>
              <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Turno 1 + Turno 2 (16 horas produtivas):</span>
                <strong className="text-emerald-400">Capacidade Teórica: 1.040 un/dia</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Nova OP */}
      {isNewOpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Geração de Ordem de Produção (PCP)</h3>
              <button
                type="button"
                onClick={() => setIsNewOpModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOP} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Eletrodoméstico a Fabricar:
                </label>
                <select
                  value={newOpProductSku}
                  onChange={(e) => setNewOpProductSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="LAV-TURBO-15KG">Lavadora Turbo 15kg EcoClean</option>
                  <option value="REF-DUPLEX-450L">Refrigerador Frost Free Duplex 450L</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Quantidade Planejada (Lote):
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={newOpQty}
                  onChange={(e) => setNewOpQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Turno de Montagem:
                </label>
                <select
                  value={newOpShift}
                  onChange={(e) => setNewOpShift(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Turno 1 (06:00 - 14:20)">Turno 1 (06:00 - 14:20)</option>
                  <option value="Turno 2 (14:20 - 22:40)">Turno 2 (14:20 - 22:40)</option>
                  <option value="Turno 3 (22:40 - 06:00)">Turno 3 (22:40 - 06:00)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOpModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                >
                  Programar OP no PCP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

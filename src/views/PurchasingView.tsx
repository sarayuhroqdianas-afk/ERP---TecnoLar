import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  Award,
  AlertTriangle,
  Globe,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  TrendingDown,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  DollarSign,
} from 'lucide-react';
import { formatNumberBR, formatCurrencyBRL } from '../utils/formulas';
import { PurchaseOrder } from '../types';

export const PurchasingView: React.FC = () => {
  const { suppliers, components, purchaseOrders, addPurchaseOrder, employees, requisitions, addInternalRequisition, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'scorecard' | 'fornecedores' | 'alertas' | 'requisicoes' | 'importados'>('pedidos');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State para Novo Pedido de Compra
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedSku, setSelectedSku] = useState(components[0]?.sku || '');
  const [orderQty, setOrderQty] = useState(9354); // LEC padrão
  const [requestedByEmployee, setRequestedByEmployee] = useState(
    employees[0] ? `${employees[0].name} (${employees[0].matricula} - ${employees[0].role})` : `${currentUser.name} (${currentUser.matricula})`
  );
  const [deliveryDays, setDeliveryDays] = useState(10);
  const [paymentTerms, setPaymentTerms] = useState('28 / 56 dias DDL');

  // Form State para Nova Requisição Interna
  const [reqLine, setReqLine] = useState('Linha 1 - Lavadoras');
  const [reqComponentSku, setReqComponentSku] = useState(components[0]?.sku || '');
  const [reqQty, setReqQty] = useState(100);
  const [reqPriority, setReqPriority] = useState<'Normal' | 'Urgente (Risco de Parada)'>('Normal');
  const [reqEmployee, setReqEmployee] = useState(
    employees[0] ? `${employees[0].name} (${employees[0].matricula})` : `${currentUser.name} (${currentUser.matricula})`
  );

  const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const currentComp = components.find((c) => c.sku === selectedSku) || components[0];

  // Componentes abaixo do ponto de pedido (ROP)
  const ropAlerts = components.filter((c) => c.currentStock <= c.ropCalculated);
  const criticalImported = components.filter((c) => c.isImported);

  const handleOpenOrderWithSku = (sku: string) => {
    const comp = components.find((c) => c.sku === sku);
    if (comp) {
      setSelectedSku(comp.sku);
      setOrderQty(comp.lecCalculated || 9354);
      const supp = suppliers.find((s) => s.id === comp.supplierId || s.name === comp.supplierName);
      if (supp) {
        setSelectedSupplierId(supp.id);
        setDeliveryDays(supp.avgLeadTimeDays || 10);
      }
    }
    setIsNewOrderModalOpen(true);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComp || !currentSupplier || orderQty <= 0) return;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + deliveryDays);

    const totalVal = orderQty * currentComp.unitCost;

    addPurchaseOrder({
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.name,
      componentSku: currentComp.sku,
      componentName: currentComp.name,
      qtyOrdered: orderQty,
      unitCost: currentComp.unitCost,
      totalValue: totalVal,
      expectedDeliveryDate: expDate.toISOString().substring(0, 10),
      isImported: currentComp.isImported,
      paymentTerms,
      requestedBy: requestedByEmployee,
    });

    setIsNewOrderModalOpen(false);
    setSuccessMsg(`Pedido de Compra de ${formatNumberBR(orderQty)} un de ${currentComp.sku} emitido com sucesso para ${currentSupplier.name}! Solicitante: ${requestedByEmployee}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateReq = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = components.find((c) => c.sku === reqComponentSku);
    if (!comp) return;

    addInternalRequisition({
      requestedBy: reqEmployee,
      line: reqLine,
      componentSku: comp.sku,
      componentName: comp.name,
      qtyRequested: reqQty,
      priority: reqPriority,
    });

    setIsNewReqModalOpen(false);
    setSuccessMsg(`Requisição interna de ${reqQty} un de ${comp.sku} registrada para ${reqLine}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Gestão de Suprimentos &amp; Compras
            </span>
            <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Reposição Dinâmica ROP &amp; LEC
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Emissão de Pedidos, Scorecard &amp; Fornecedores Homologados
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aquisições no Lote Econômico (LEC = 9.354 un), monitoramento OTIF e requisições internas de abastecimento da fábrica.
          </p>
        </div>

        {/* Botão de Emissão de Pedido de Compra */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewReqModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Fazer Requisição Interna</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Pedido de Compra (PO)</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Abas Superiores */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'pedidos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Pedidos de Compra ({purchaseOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scorecard')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'scorecard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Scorecard OTIF</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fornecedores')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'fornecedores' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dados dos Fornecedores ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alertas')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'alertas' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Alertas de ROP ({ropAlerts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requisicoes')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'requisicoes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Requisições da Linha ({requisitions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('importados')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'importados' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Importados Críticos ({criticalImported.length})</span>
        </button>
      </div>

      {/* ABA 1: Lista de Pedidos de Compra */}
      {activeTab === 'pedidos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap justify-between items-center text-xs gap-2">
            <div>
              <h3 className="font-bold text-sm text-white">Carteira de Pedidos de Compra Emitidos</h3>
              <p className="text-[11px] text-slate-400">Total de pedidos em andamento e entregues com funcionários vinculados.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs"
            >
              + Novo Pedido
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pedido / Data</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">Componente / SKU</th>
                  <th className="py-3 px-4 text-center">Quantidade</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4">Funcionário Solicitante</th>
                  <th className="py-3 px-4 text-center">Entrega Prevista</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono">
                      <strong className="text-blue-400 block">{po.code}</strong>
                      <span className="text-[10px] text-slate-400">{po.orderDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-white block">{po.supplierName}</strong>
                      <span className="text-[10px] text-slate-400">{po.isImported ? 'Importado Internacional' : 'Nacional'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-cyan-400 font-bold block">{po.componentSku}</span>
                      <span className="text-slate-300">{po.componentName}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {formatNumberBR(po.qtyOrdered)} un
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400 font-mono">
                      {formatCurrencyBRL(po.totalValue)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {po.requestedBy || 'Gustavo Meireles (CMP-5020)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {po.expectedDeliveryDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          po.status === 'Entregue'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : po.status === 'Em Trânsito'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : po.status === 'Atrasado'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: Scorecard de Fornecedores */}
      {activeTab === 'scorecard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Scorecard de Desempenho dos Fornecedores</span>
            <span className="text-slate-400">Total: {suppliers.length} Fornecedores Homologados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fornecedor / Origem</th>
                  <th className="py-3 px-4">Família de Fornecimento</th>
                  <th className="py-3 px-4 text-center">Índice OTIF</th>
                  <th className="py-3 px-4 text-center">Lead Time Médio</th>
                  <th className="py-3 px-4 text-center">Desvio Padrão (σLT)</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {s.country} ({s.code})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{s.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-black text-sm ${
                          s.otifRate >= 90
                            ? 'text-emerald-400'
                            : s.otifRate >= 80
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {s.otifRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{s.avgLeadTimeDays} dias</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${s.leadTimeStdDev >= 5 ? 'text-rose-400' : 'text-slate-300'}`}>
                        ±{s.leadTimeStdDev} dias
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.rating === 'A' ? 'bg-emerald-950 text-emerald-300' : s.rating === 'B' ? 'bg-blue-950 text-blue-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {s.rating}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSupplierId(s.id);
                          setIsNewOrderModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded font-bold text-[11px]"
                      >
                        Novo Pedido
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: Cadastro Completo de Dados dos Fornecedores */}
      {activeTab === 'fornecedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <span className="font-mono text-blue-400 text-xs font-bold">{s.code}</span>
                  <h3 className="font-bold text-white text-base leading-tight">{s.name}</h3>
                  <span className="text-[11px] text-slate-400 block">{s.corporateName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.rating === 'A' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                }`}>
                  Rating {s.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CNPJ / Registro:</span>
                  <strong className="text-slate-200 font-mono">{s.cnpj}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Condição de Pagamento:</span>
                  <strong className="text-slate-200">{s.paymentTerms}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Contato: <strong>{s.contactPerson}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>E-mail: <strong className="text-blue-300">{s.contactEmail}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Telefone: <strong>{s.phone}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400">{s.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">OTIF: <strong className="text-emerald-400">{s.otifRate}%</strong> | LT: <strong>{s.avgLeadTimeDays}d (±{s.leadTimeStdDev}d)</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplierId(s.id);
                    setIsNewOrderModalOpen(true);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs"
                >
                  Fazer Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 4: Alertas de ROP */}
      {activeTab === 'alertas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-amber-950/30 flex justify-between items-center text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Componentes em Ponto de Pedido Crítico (Abaixo do ROP)
            </span>
            <span className="text-slate-400">Gere pedidos de compra imediatos no Lote Econômico LEC</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU / Componente</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Ponto de Pedido (ROP)</th>
                  <th className="py-3 px-4 text-center">Lote Sugerido (LEC)</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-right">Ação Imediata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {ropAlerts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono text-blue-400 font-bold block">{c.sku}</span>
                      <strong className="text-white">{c.name}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-400 font-mono">
                      {formatNumberBR(c.currentStock)} {c.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-300 font-mono">
                      {formatNumberBR(c.ropCalculated)} {c.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-blue-300 font-mono">
                      {formatNumberBR(c.lecCalculated)} {c.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{c.supplierName}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenOrderWithSku(c.sku)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs transition"
                      >
                        Comprar LEC ({formatNumberBR(c.lecCalculated)})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: Requisições Internas */}
      {activeTab === 'requisicoes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
            <div>
              <h3 className="font-bold text-sm text-white">Requisições Internas para Compras &amp; Almoxarifado</h3>
              <p className="text-[11px] text-slate-400">Solicitações abertas pelos funcionários das Linhas de Produção e Manutenção.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewReqModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs"
            >
              + Nova Requisição
            </button>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {requisitions.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold">{req.code}</span>
                    <strong className="text-white text-sm">{req.componentName}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.priority.includes('Urgente') ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px] mt-1">
                    <span>Destino: <strong className="text-slate-200">{req.line}</strong></span>
                    <span>Qtd Solicitada: <strong className="text-white">{req.qtyRequested} un</strong></span>
                    <span>Requisitante: <strong className="text-slate-200">{req.requestedBy}</strong></span>
                    <span>Hora: {req.requestTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 6: Importados Críticos */}
      {activeTab === 'importados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalImported.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <span className="font-mono text-cyan-400 text-xs font-bold">{c.sku}</span>
                  <h3 className="font-bold text-white text-base">{c.name}</h3>
                  <span className="text-[11px] text-slate-400">Origem: <strong>{c.originCountry}</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Lead Time: {c.standardLeadTimeDays} dias
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Estoque WMS</span>
                  <strong className="text-white font-mono">{formatNumberBR(c.currentStock)} un</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Ponto Pedido</span>
                  <strong className="text-amber-300 font-mono">{formatNumberBR(c.ropCalculated)} un</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Lote LEC</span>
                  <strong className="text-blue-300 font-mono">{formatNumberBR(c.lecCalculated)} un</strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Fornecedor: <strong>{c.supplierName}</strong></span>
                <button
                  type="button"
                  onClick={() => handleOpenOrderWithSku(c.sku)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  Emitir Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Emissão de Pedido de Compra Oficial */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Emitir Novo Pedido de Compra Oficial (PO)</h3>
                <span className="text-[11px] text-slate-400">Geração de ordem com vínculo a funcionário solicitante e cálculo LEC</span>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Fornecedor Homologado:</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    const supp = suppliers.find((s) => s.id === e.target.value);
                    if (supp) {
                      setDeliveryDays(supp.avgLeadTimeDays);
                      setPaymentTerms(supp.paymentTerms);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country}) - OTIF {s.otifRate}% - LT Médio: {s.avgLeadTimeDays}d
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Componente / Insumo Requisitado:</label>
                <select
                  value={selectedSku}
                  onChange={(e) => {
                    setSelectedSku(e.target.value);
                    const comp = components.find((c) => c.sku === e.target.value);
                    if (comp) setOrderQty(comp.lecCalculated || 9354);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {components.map((c) => (
                    <option key={c.id} value={c.sku}>
                      {c.sku} - {c.name} (Saldo: {c.currentStock} | ROP: {c.ropCalculated})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium">Quantidade Solicitada:</label>
                    <button
                      type="button"
                      onClick={() => setOrderQty(currentComp.lecCalculated || 9354)}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Usar LEC ({formatNumberBR(currentComp.lecCalculated || 9354)})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQty}
                    onChange={(e) => setOrderQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prazo de Entrega (Dias):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Funcionário Requisitante Obrigatório */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Funcionário Requisitante / Responsável da TecnoLar:
                </label>
                <select
                  value={requestedByEmployee}
                  onChange={(e) => setRequestedByEmployee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.name} (${emp.matricula} - ${emp.role})`}>
                      {emp.name} - Matrícula: {emp.matricula} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumo Financeiro */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Custo Unitário Negociado:</span>
                  <strong className="text-white font-mono">{formatCurrencyBRL(currentComp.unitCost)}</strong>
                </div>
                <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800 pt-1">
                  <span>Valor Total do Pedido:</span>
                  <strong className="text-emerald-400 font-mono text-sm">
                    {formatCurrencyBRL(orderQty * currentComp.unitCost)}
                  </strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirmar Emissão de Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Nova Requisição Interna */}
      {isNewReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Criar Requisição Interna de Material</h3>
              <button onClick={() => setIsNewReqModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateReq} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Setor / Linha Solicitante:</label>
                <select
                  value={reqLine}
                  onChange={(e) => setReqLine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Linha 1 - Lavadoras">Linha 1 - Lavadoras</option>
                  <option value="Linha 2 - Refrigeradores">Linha 2 - Refrigeradores</option>
                  <option value="Almoxarifado Central (400m)">Almoxarifado Central (400m)</option>
                  <option value="Manutenção Mecânica & Elétrica">Manutenção Mecânica &amp; Elétrica</option>
                  <option value="Engenharia de Processos">Engenharia de Processos</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Componente Necessário:</label>
                <select
                  value={reqComponentSku}
                  onChange={(e) => setReqComponentSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {components.map((c) => (
                    <option key={c.id} value={c.sku}>
                      {c.sku} - {c.name} (Saldo WMS: {c.currentStock} {c.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reqQty}
                    onChange={(e) => setReqQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Urgência:</label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgente (Risco de Parada)">Urgente (Risco Parada)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Funcionário Solicitante:</label>
                <select
                  value={reqEmployee}
                  onChange={(e) => setReqEmployee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.name} (${emp.matricula})`}>
                      {emp.name} ({emp.matricula} - {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Registrar Requisição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

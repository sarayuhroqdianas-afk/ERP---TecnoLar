import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  PackageCheck,
  Building,
  ShieldAlert,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { formatCurrencyBRL, formatNumberBR } from '../utils/formulas';

export const SalesCRMView: React.FC = () => {
  const { salesOrders, customers } = useApp();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'clientes' | 'multas'>('pedidos');

  const totalPenalties = salesOrders.reduce((acc, o) => acc + o.penaltyFee, 0);
  const compliantCount = salesOrders.filter((o) => o.otifCompliant).length;
  const customerOtifRate = ((compliantCount / salesOrders.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Vendas, CRM &amp; Expedição
            </span>
            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Controle de Short-Shipment &amp; Clientes
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pedidos de Clientes, Contratos &amp; Risco de Multas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de entregas a grandes redes varejistas e prevenção de multas contratuais por corte de carga.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">Multas Contratuais Aplicadas:</span>
            <strong className="text-lg font-black text-rose-400">{formatCurrencyBRL(totalPenalties)}</strong>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[11px] text-slate-400 block">OTIF para Clientes:</span>
            <strong className="text-lg font-black text-amber-400">{customerOtifRate}%</strong>
          </div>
        </div>
      </div>

      {/* Cartão de Alerta das Multas de R$ 150.000 */}
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <strong className="text-white block text-sm">
              Diagnóstico: R$ 150.000 em multas contratuais no trimestre
            </strong>
            <span className="text-slate-300">
              Causadas pelo short-shipment de 350 lavadoras para a Rede Magazine Brasil (R$ 90.000) e 180 refrigeradores para Casas do Sul (R$ 60.000) em decorrência do desabastecimento das linhas.
            </span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'pedidos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Carteira de Pedidos ({salesOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clientes')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'clientes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Cadastro Completo de Clientes ({customers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('multas')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'multas' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Acordos de Short-Shipment</span>
        </button>
      </div>

      {/* ABA 1: Pedidos de Venda */}
      {activeTab === 'pedidos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              Carteira de Pedidos de Clientes &amp; Nível de Atendimento
            </span>
            <span className="text-slate-400">Total: {salesOrders.length} Pedidos de Varejo</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pedido / Cliente</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4 text-center">Qtd Pedida</th>
                  <th className="py-3 px-4 text-center">Qtd Entregue</th>
                  <th className="py-3 px-4 text-center">Corte (Short-Shipment)</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Multa Contratual</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-400 block">{so.code}</span>
                      <strong className="text-white">{so.customerName}</strong>
                      <span className="block text-[10px] text-slate-400">Prazo: {so.deliveryDeadline}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-semibold text-white block">{so.productName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{so.productSku}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {formatNumberBR(so.qtyOrdered)} un
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-300">
                      {formatNumberBR(so.qtyDelivered)} un
                    </td>
                    <td className="py-3 px-4 text-center">
                      {so.shortShipmentQty > 0 ? (
                        <span className="font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          -{formatNumberBR(so.shortShipmentQty)} un
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Zero Corte</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white font-mono">
                      {formatCurrencyBRL(so.totalValue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {so.penaltyFee > 0 ? (
                        <span className="font-bold text-rose-400 font-mono">
                          {formatCurrencyBRL(so.penaltyFee)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">R$ 0,00</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          so.status === 'Faturado Total'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : so.status === 'Entregue com Multa'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : so.status === 'Short-Shipment (Risco)'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: Dados dos Clientes */}
      {activeTab === 'clientes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <span className="font-mono text-amber-400 text-xs font-bold">{c.code}</span>
                  <h3 className="font-bold text-white text-base leading-tight">{c.name}</h3>
                  <span className="text-[11px] text-slate-400 block">{c.corporateName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.rating === 'A' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                }`}>
                  Classificação {c.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CNPJ do Cliente:</span>
                  <strong className="text-slate-200 font-mono">{c.cnpj}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Limite de Crédito Aprovado:</span>
                  <strong className="text-emerald-400 font-mono">{formatCurrencyBRL(c.creditLimit)}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Contato Comercial: <strong>{c.contactPerson}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>E-mail: <strong className="text-blue-300">{c.contactEmail}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Telefone: <strong>{c.phone}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400">{c.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Condição: <strong className="text-slate-200">{c.paymentTerms}</strong></span>
                <span className="text-rose-400 text-[11px] font-semibold">Cláusula de Short-Shipment Ativa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 3: Acordos de Multa */}
      {activeTab === 'multas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              Contratos Comerciais com Redes Varejistas &amp; Cláusulas de Multa
            </h3>
            <p className="text-xs text-slate-400">
              Regras de corte de carga que geraram R$ 150.000 em penalidades no último trimestre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block text-sm">Contrato Rede Magazine Brasil:</span>
              <p className="text-slate-400 leading-relaxed">
                Multa contratual de <strong>R$ 257,14 por unidade cortada</strong> caso o faturamento seja inferior a 95% do volume confirmado na ordem de compra.
              </p>
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 font-semibold">
                Multa aplicada no trimestre: R$ 90.000,00 (corte de 350 lavadoras).
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block text-sm">Contrato Casas do Sul Eletro:</span>
              <p className="text-slate-400 leading-relaxed">
                Multa contratual de <strong>R$ 333,33 por unidade cortada</strong> com retenção de duplicatas mercantis para entregas com atraso superior a 48 horas.
              </p>
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 font-semibold">
                Multa aplicada no trimestre: R$ 60.000,00 (corte de 180 refrigeradores).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

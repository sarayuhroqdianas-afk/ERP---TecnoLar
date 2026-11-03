import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  CheckCircle,
  Eye,
  Plus,
  Search,
  ExternalLink,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/formulas';

export const InvoicingView: React.FC = () => {
  const { invoices, openPrintModal } = useApp();

  const [selectedXml, setSelectedXml] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Módulo Fiscal &amp; Expedição
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
              SEFAZ Integrado
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Faturamento, Emissão de NF-e &amp; DANFE
          </h2>
          <p className="text-xs text-slate-400">
            Geração de notas fiscais de entrada de matéria-prima e saída de eletrodomésticos com vínculo a estoque e pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPrintModal('danfe')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir DANFE Atual</span>
        </button>
      </div>

      {/* Tabela de Notas Fiscais */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Notas Fiscais Eletrônicas Emitidas &amp; Recebidas
          </span>
          <span className="text-slate-400">Total: {invoices.length} Documentos Fiscais</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Número / Tipo</th>
                <th className="py-3 px-4">Razão Social / Cliente ou Fornecedor</th>
                <th className="py-3 px-4">Chave de Acesso SEFAZ (44 dígitos)</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Status SEFAZ</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-400 block">NF-e {inv.number}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${inv.type === 'Saída' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white">{inv.partyName}</span>
                    <span className="block text-[10px] text-slate-400">Pedido Vinculado: {inv.linkedOrderCode}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {inv.accessKey}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-white">
                    {formatCurrencyBRL(inv.totalValue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center gap-1 w-max mx-auto">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedXml(inv.xmlMock)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                        title="Ver XML da NF-e"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openPrintModal('danfe')}
                        className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>DANFE</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Visualização de XML */}
      {selectedXml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl p-5 text-slate-100 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-white">Visualizador de XML Assinado (SEFAZ)</h4>
              <button onClick={() => setSelectedXml(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <pre className="bg-slate-950 p-3 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
              {selectedXml}
            </pre>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedXml(null)} className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-200">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

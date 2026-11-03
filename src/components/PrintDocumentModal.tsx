import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  FileText,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrencyBRL, formatNumberBR } from '../utils/formulas';

export const PrintDocumentModal: React.FC = () => {
  const {
    isPrintModalOpen,
    setIsPrintModalOpen,
    printDocType,
    components,
    downtimes,
    products,
    requisitions,
    invoices,
    currentUser,
    purchaseOrders,
    employees,
  } = useApp();

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isPrintModalOpen) return null;

  // Impressão robusta via iframe isolado no DOM (evita bloqueios de popup em ambiente iframe)
  const handlePrint = () => {
    if (!printAreaRef.current) {
      window.print();
      return;
    }

    try {
      const existingIframe = document.getElementById('tecnolar-print-frame') as HTMLIFrameElement | null;
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'tecnolar-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>TecnoLar S.A. - Documento Oficial</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #111; font-size: 11px; line-height: 1.5; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                th { background-color: #f1f5f9; font-weight: bold; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
                .signatures { margin-top: 220px; padding-top: 24px; border-top: 2px solid #475569; display: flex; justify-content: space-around; text-align: center; }
                .sig-line { width: 240px; border-top: 1.5px solid #0f172a; margin: 0 auto 6px auto; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
              </style>
            </head>
            <body>
              ${printAreaRef.current.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 300);
      }
    } catch {
      window.print();
    }
  };

  // Download do documento formatado em arquivo HTML/PDF
  const handleDownloadDocument = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TecnoLar S.A. - Relatório Oficial</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #0f172a; font-size: 12px; line-height: 1.5; max-width: 900px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background-color: #f1f5f9; font-weight: bold; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .signatures { margin-top: 240px; padding-top: 24px; border-top: 2px solid #475569; display: flex; justify-content: space-around; text-align: center; }
    .sig-line { width: 240px; border-top: 1.5px solid #0f172a; margin: 0 auto 6px auto; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-oficial-tecnolar-${printDocType}.html`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('Documento baixado com sucesso! Você pode abri-lo e imprimi-lo em qualquer navegador.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const totalDowntimeCost = downtimes.reduce((a, b) => a + b.totalCost, 0);

  // Assinaturas personalizadas por cargo do funcionário conectado
  const getDocumentSignatures = () => {
    switch (currentUser.role) {
      case 'Almoxarife':
        return [
          { role: 'Conferente / Almoxarife Responsável', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Líder de Abastecimento Milk Run (400m)', name: 'Antônio Prado', mat: 'LOG-4091' },
        ];
      case 'Operador de Máquina':
        return [
          { role: 'Operador de Linha de Montagem', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Supervisor de Turno Fabril', name: 'Roberto Camargo', mat: 'SUP-1088' },
        ];
      case 'Analista de Qualidade':
        return [
          { role: 'Inspetor da Garantia da Qualidade', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Gerente da Qualidade Assegurada', name: 'Dra. Beatriz Albuquerque', mat: 'QUA-7703' },
        ];
      case 'Comprador / Suprimentos':
        return [
          { role: 'Comprador de Suprimentos', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Gerente de Compras & Suprimentos', name: 'Gustavo Meireles', mat: 'CMP-5020' },
        ];
      case 'Engenheiro de Produção':
      case 'Analista de PCP':
        return [
          { role: 'Engenheiro Responsável Técnico (CREA)', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Gerente Geral de Operações Fabris', name: 'Carlos Drummond', mat: 'ENG-4091' },
        ];
      case 'Analista de RH / HCM':
        return [
          { role: 'Gestor de Recursos Humanos & HCM', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Colaborador Homologado', name: 'Assinatura do Empregado', mat: 'Declaração CLT' },
        ];
      case 'Engenheiro de TI':
      case 'Diretor de TI/CIO':
        return [
          { role: 'Engenheiro de Sistemas & Segurança TI', name: currentUser.name, mat: currentUser.matricula },
          { role: 'Diretoria de Tecnologia / CIO', name: 'Eng. Marcelo Queiroz', mat: 'CIO-0010' },
        ];
      default:
        return [
          { role: 'Diretoria Industrial / CEO', name: 'Helena Montenegro', mat: 'DIR-0001' },
          { role: 'Diretoria de Operações Fabris', name: 'Carlos Drummond', mat: 'ENG-4091' },
        ];
    }
  };

  const signatures = getDocumentSignatures();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black">
        {/* Barra de Ferramentas Superior (Oculta na Impressão) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 print:hidden gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Visualização Oficial de Documento TecnoLar
              </h3>
              <p className="text-[11px] text-slate-400">
                Adaptado ao cargo: <strong className="text-cyan-300">{currentUser.role}</strong> ({currentUser.name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDocument}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shadow-xs"
              title="Baixar arquivo HTML/PDF formatado"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition border border-rose-500 flex items-center gap-1"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-950/90 border-b border-emerald-700 text-emerald-200 text-xs px-6 flex items-center gap-2 print:hidden animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Folha de Impressão Estilizada (Folha A4) */}
        <div ref={printAreaRef} className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-4">
          {/* Cabeçalho da Empresa */}
          <div className="header border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                TECNOLAR INDÚSTRIA DE ELETRODOMÉSTICOS S.A.
              </h1>
              <p className="text-xs text-slate-600">
                CNPJ: 01.234.567/0001-89 | Inscrição Estadual: 112.334.556.778
              </p>
              <p className="text-xs text-slate-600">
                Planta Fabril: Distrito Industrial - Manaus/AM | Capacidade: 1.200 un/dia (Lavadoras &amp; Refrigeradores)
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-extrabold block text-slate-900 uppercase">
                {currentUser.role === 'Operador de Máquina'
                  ? 'Instrução de Trabalho & Apontamento de Produção'
                  : currentUser.role === 'Almoxarife'
                  ? 'Guia de Separação WMS & Abastecimento Milk Run (400m)'
                  : currentUser.role === 'Comprador / Suprimentos'
                  ? 'Espelho de Pedido de Compra & Rastreabilidade de Insumos'
                  : currentUser.role === 'Analista de Qualidade'
                  ? 'Certificado de Inspeção e Liberação de Lote'
                  : currentUser.role === 'Analista de RH / HCM'
                  ? 'Espelho de Ponto Eletrônico & Conformidade Médica (NR-7)'
                  : currentUser.role === 'Funcionário Comum'
                  ? 'Espelho de Ponto Individual & Recibo de EPI'
                  : 'Demonstrativo Consolidado Industrial & Relatório de Gestão'}
              </span>
              <span className="text-slate-500 block mt-0.5">
                Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </span>
              <span className="text-slate-700 font-semibold block">
                Responsável: {currentUser.name} ({currentUser.matricula} - {currentUser.role})
              </span>
            </div>
          </div>

          {/* VISÃO PERSONALIZADA: OPERADOR DE MÁQUINA */}
          {currentUser.role === 'Operador de Máquina' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Posto de Trabalho: Linha 1 - Montagem Final de Lavadoras Turbo 15kg
                </h3>
                <p><strong>Operador:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Meta do Turno:</strong> 235 unidades | <strong>Ritmo de Esteira:</strong> 1 peça a cada 2,4 minutos</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">Ordem de Produção (OP)</th>
                    <th className="border border-slate-300 p-2">Modelo</th>
                    <th className="border border-slate-300 p-2 text-center">Planejado</th>
                    <th className="border border-slate-300 p-2 text-center">Peças Boas</th>
                    <th className="border border-slate-300 p-2 text-center">Refugo/Scrap</th>
                    <th className="border border-slate-300 p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-mono font-bold">OP-2026-0881</td>
                    <td className="border border-slate-300 p-2">Lavadora Turbo 15kg EcoClean Inverter</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">700 un</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">465 un</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-rose-700">2 un</td>
                    <td className="border border-slate-300 p-2 text-center">Em Produção</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded">
                <h4 className="font-bold text-xs text-slate-900 mb-1">Checklist de Posto &amp; Segurança (NR-12):</h4>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                  <li>Cortina de luz e botão de emergência testados e operacionais.</li>
                  <li>Uso obrigatório de protetor auricular e luvas antiestáticas.</li>
                  <li>Peças com defeito plástico encaminhadas à caixa de segregação da Qualidade.</li>
                </ul>
              </div>
            </div>
          )}

          {/* VISÃO PERSONALIZADA: ALMOXARIFE */}
          {currentUser.role === 'Almoxarife' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Ordem de Separação WMS &amp; Abastecimento do Circuito Milk Run (400 Metros)
                </h3>
                <p><strong>Almoxarife:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Regra de Baixa:</strong> Imediata no leitor a cada palete retirado (eliminando baixa acumulada de fim de turno).</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">SKU</th>
                    <th className="border border-slate-300 p-2">Componente</th>
                    <th className="border border-slate-300 p-2">Endereçamento WMS</th>
                    <th className="border border-slate-300 p-2 text-center">Lote Rastreio</th>
                    <th className="border border-slate-300 p-2 text-center">Saldo WMS</th>
                    <th className="border border-slate-300 p-2 text-center">Ponto Pedido ROP</th>
                  </tr>
                </thead>
                <tbody>
                  {components.slice(0, 8).map((c) => (
                    <tr key={c.id}>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{c.sku}</td>
                      <td className="border border-slate-300 p-2 font-medium">{c.name}</td>
                      <td className="border border-slate-300 p-2">{c.wmsLocation}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{c.batchNumber}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{formatNumberBR(c.currentStock)} {c.unit}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{formatNumberBR(c.ropCalculated)} {c.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISÃO PERSONALIZADA: COMPRADOR */}
          {currentUser.role === 'Comprador / Suprimentos' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Espelho de Pedidos de Compra &amp; Gestão de Fornecedores Críticos
                </h3>
                <p><strong>Comprador Responsável:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Lote Econômico de Compra Padrão (LEC):</strong> 9.354 unidades para componentes plásticos.</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">Pedido (PO)</th>
                    <th className="border border-slate-300 p-2">Fornecedor</th>
                    <th className="border border-slate-300 p-2">Componente</th>
                    <th className="border border-slate-300 p-2 text-center">Quantidade</th>
                    <th className="border border-slate-300 p-2 text-right">Valor Total</th>
                    <th className="border border-slate-300 p-2">Solicitante</th>
                    <th className="border border-slate-300 p-2 text-center">Previsão</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.slice(0, 6).map((po) => (
                    <tr key={po.id}>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{po.code}</td>
                      <td className="border border-slate-300 p-2">{po.supplierName}</td>
                      <td className="border border-slate-300 p-2 font-medium">{po.componentName}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{formatNumberBR(po.qtyOrdered)} un</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(po.totalValue)}</td>
                      <td className="border border-slate-300 p-2">{po.requestedBy || 'PCP TecnoLar'}</td>
                      <td className="border border-slate-300 p-2 text-center">{po.expectedDeliveryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISÃO PERSONALIZADA: QUALIDADE */}
          {currentUser.role === 'Analista de Qualidade' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Certificado de Inspeção, Liberação e Bloqueio de Lotes Fabris
                </h3>
                <p><strong>Inspetor Responsável:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Escopo:</strong> Componentes plásticos injetados, compressores e chicotes eletrônicos com efeito imediato no WMS.</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">Componente / SKU</th>
                    <th className="border border-slate-300 p-2">Lote Rastreio</th>
                    <th className="border border-slate-300 p-2">Ensaio Técnico</th>
                    <th className="border border-slate-300 p-2 text-center">Status</th>
                    <th className="border border-slate-300 p-2">Observações da Qualidade</th>
                  </tr>
                </thead>
                <tbody>
                  {components.slice(0, 6).map((c) => (
                    <tr key={c.id}>
                      <td className="border border-slate-300 p-2 font-medium">{c.name} ({c.sku})</td>
                      <td className="border border-slate-300 p-2 font-mono">{c.batchNumber}</td>
                      <td className="border border-slate-300 p-2">Dimensional &amp; Resistência Térmica</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{c.qualityStatus}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">Amostragem NQA 0.65 conforme norma ABNT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISÃO PERSONALIZADA: RH / HCM */}
          {currentUser.role === 'Analista de RH / HCM' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Quadro Oficial de Pessoal, Escalas de Turno &amp; Saúde Ocupacional (NR-7)
                </h3>
                <p><strong>Gestor RH:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Total de Colaboradores:</strong> {employees.length} colaboradores ativos nos 3 turnos.</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border border-slate-300 p-2">Matrícula</th>
                    <th className="border border-slate-300 p-2">Colaborador</th>
                    <th className="border border-slate-300 p-2">Cargo / Função</th>
                    <th className="border border-slate-300 p-2">Turno</th>
                    <th className="border border-slate-300 p-2 text-center">Exame ASO</th>
                    <th className="border border-slate-300 p-2 text-right">Salário Base</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 8).map((emp) => (
                    <tr key={emp.id}>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{emp.matricula}</td>
                      <td className="border border-slate-300 p-2 font-medium">{emp.name}</td>
                      <td className="border border-slate-300 p-2">{emp.role}</td>
                      <td className="border border-slate-300 p-2">{emp.shift}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{emp.healthExamStatus}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrencyBRL(emp.salary || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VISÃO PERSONALIZADA: FUNCIONÁRIO COMUM */}
          {currentUser.role === 'Funcionário Comum' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-100 rounded border border-slate-300">
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Espelho de Ponto Individual &amp; Comprovante de Entrega de EPI
                </h3>
                <p><strong>Colaborador:</strong> {currentUser.name} | <strong>Matrícula:</strong> {currentUser.matricula}</p>
                <p><strong>Departamento:</strong> {currentUser.department} | <strong>Admissão:</strong> 15/03/2023</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-2">
                <h4 className="font-bold text-slate-900">Registros Recentes de Ponto Eletrônico (Portaria 671 MTE):</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Hoje - Entrada: <strong>05:52</strong> (Turno 1)</div>
                  <div>Hoje - Intervalo Refeição: <strong>11:30 às 12:30</strong></div>
                  <div>Ontem - Entrada: <strong>05:55</strong> | Saída: <strong>14:25</strong></div>
                  <div>Banco de Horas Positivo: <strong>+4h 20min</strong></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-1">
                <h4 className="font-bold text-slate-900">Equipamentos de Proteção Individual (EPIs com C.A. Ativo):</h4>
                <p>• Calçado de Segurança com bico de composite (C.A. 42.115) - Entregue em 10/01/2026</p>
                <p>• Protetor Auricular tipo Concha 24dB (C.A. 28.520) - Entregue em 15/02/2026</p>
                <p>• Óculos de Proteção Antirrisco e Anti-embaçante (C.A. 35.890) - Entregue em 15/02/2026</p>
              </div>
            </div>
          )}

          {/* VISÃO PADRÃO DIRETORIA / ENGENHARIA / CUSTOS */}
          {currentUser.role !== 'Operador de Máquina' &&
            currentUser.role !== 'Almoxarife' &&
            currentUser.role !== 'Comprador / Suprimentos' &&
            currentUser.role !== 'Analista de Qualidade' &&
            currentUser.role !== 'Analista de RH / HCM' &&
            currentUser.role !== 'Funcionário Comum' && (
              <div className="space-y-6 text-xs">
                <div className="bg-slate-100 p-4 rounded border border-slate-300">
                  <h3 className="font-bold text-sm text-slate-900 mb-2">
                    1. Diagnóstico Consolidado de Paradas no Trimestre (Prejuízo de R$ 766.000)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-600 block">Horas Totais Paradas:</span>
                      <strong className="text-base text-rose-700">28,0 horas</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Custo de Máquina (R$ 22.000/h):</span>
                      <strong className="text-base text-slate-900">{formatCurrencyBRL(616000)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Multas por Short-Shipment:</span>
                      <strong className="text-base text-rose-700">{formatCurrencyBRL(150000)}</strong>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-300 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Prejuízo Total Acumulado:</span>
                    <span className="font-extrabold text-lg text-rose-700">
                      {formatCurrencyBRL(totalDowntimeCost)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">
                    2. Detalhamento de Causas Raiz Conforme Curva ABC
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300">
                    <thead className="bg-slate-200">
                      <tr>
                        <th className="border border-slate-300 p-2">Causa Raiz da Ruptura</th>
                        <th className="border border-slate-300 p-2 text-center">Ocorrências</th>
                        <th className="border border-slate-300 p-2 text-center">Horas Paradas</th>
                        <th className="border border-slate-300 p-2 text-right">Impacto Financeiro</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">Atraso de Fornecedor (Plásticos Injetados - 63% do impacto)</td>
                        <td className="border border-slate-300 p-2 text-center">7</td>
                        <td className="border border-slate-300 p-2 text-center">14,0 h</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(308000)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">Logística Interna (Trajeto 400m Almoxarifado-Linha)</td>
                        <td className="border border-slate-300 p-2 text-center">12</td>
                        <td className="border border-slate-300 p-2 text-center">6,0 h</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(132000)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">Divergência de Estoque (Baixa de fim de turno)</td>
                        <td className="border border-slate-300 p-2 text-center">5</td>
                        <td className="border border-slate-300 p-2 text-center">5,0 h</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(110000)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">Não Conformidade de Qualidade</td>
                        <td className="border border-slate-300 p-2 text-center">3</td>
                        <td className="border border-slate-300 p-2 text-center">3,0 h</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(66000)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">Multas Contratuais por Short-Shipment</td>
                        <td className="border border-slate-300 p-2 text-center">2</td>
                        <td className="border border-slate-300 p-2 text-center">-</td>
                        <td className="border border-slate-300 p-2 text-right font-bold">{formatCurrencyBRL(150000)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* LINHA DE ASSINATURA COLOCADA BASTANTE MAIS PARA BAIXO CONFORME SOLICITAÇÃO (mt-56) */}
          <div className="signatures mt-56 pt-10 border-t-2 border-slate-800 grid grid-cols-2 gap-16 text-center text-xs">
            <div>
              <div className="sig-line w-64 h-0.5 bg-slate-900 mx-auto mb-2" />
              <p className="font-extrabold text-slate-900 text-sm">{signatures[0].name}</p>
              <p className="text-slate-700 font-semibold">{signatures[0].role}</p>
              <p className="text-slate-500 text-[10px]">Matrícula: {signatures[0].mat} | TecnoLar Indústria S.A.</p>
            </div>
            <div>
              <div className="sig-line w-64 h-0.5 bg-slate-900 mx-auto mb-2" />
              <p className="font-extrabold text-slate-900 text-sm">{signatures[1].name}</p>
              <p className="text-slate-700 font-semibold">{signatures[1].role}</p>
              <p className="text-slate-500 text-[10px]">Matrícula: {signatures[1].mat} | TecnoLar Indústria S.A.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

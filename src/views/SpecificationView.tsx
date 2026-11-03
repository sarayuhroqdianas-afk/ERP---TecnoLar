import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Database,
  Sliders,
  Layers,
  Shield,
  Target,
  Copy,
  Printer,
  CheckCircle2,
  FileCode,
  FileText,
  Building,
  Download,
} from 'lucide-react';
import { formatCurrencyBRL, formatNumberBR } from '../utils/formulas';

export const SpecificationView: React.FC = () => {
  const { openPrintModal } = useApp();
  const [activeSec, setActiveSec] = useState<string>('a');
  const [copied, setCopied] = useState(false);

  const sections = [
    { id: 'a', title: '(a) Escopo Funcional por Perfil de Acesso', icon: BookOpen },
    { id: 'b', title: '(b) Modelo de Dados Principal (Entidades & Relacionamentos)', icon: Database },
    { id: 'c', title: '(c) Regras de Negócio & Fórmulas Matemáticas', icon: Sliders },
    { id: 'd', title: '(d) Fluxos de Telas Principais & UX Industrial', icon: Layers },
    { id: 'e', title: '(e) Arquitetura, Segurança & Rotina de Backup', icon: Shield },
    { id: 'f', title: '(f) Critérios de Aceite Mensuráveis & Metas Fabris', icon: Target },
  ];

  const fullSpecificationText = `PROJETO COMPLETO DE ENGENHARIA DE SOFTWARE - TECNOLAR ERP & WMS INDUSTRIAL
Empresa: TecnoLar Indústria de Eletrodomésticos S.A.
Planta Fabril: Manaus/AM | Capacidade: 1.200 unidades/dia (700 Lavadoras + 500 Refrigeradores)
Catálogo: >400 componentes nacionais e importados.

================================================================================
DIAGNÓSTICO E CONTEXTO DE RUÍNA INDUSTRIAL:
• No trimestre analisado, rupturas de insumos causaram 28 horas de parada fabril.
• Custo de hora parada: R$ 22.000,00/hora -> R$ 616.000,00 de prejuízo direto em máquinas.
• Multas por short-shipment (corte de carga): R$ 150.000,00 (Magazine Brasil: R$ 90.000; Casas do Sul: R$ 60.000).
• Prejuízo Consolidado no Trimestre: R$ 766.000,00.
• Causas Raiz: Atraso de fornecedor (14h, R$ 308k), Logística interna 400m (6h, R$ 132k), Divergência de estoque (5h, R$ 110k), Qualidade (3h, R$ 66k).
• Curva ABC: 63% do impacto atribuído aos componentes plásticos (LT médio 10 dias, σLT = 6 dias), 18% aos importados críticos (Taiwan), 10% inconsistências de estoque.

================================================================================
(A) ESCOPO FUNCIONAL POR PERFIL DE ACESSO (RBAC):
1. Operador de Máquina: Terminal simplificado touch, registro de início/fim de OP, apontamento de refugo/scrap, paradas e consumo de peças. Bloqueio total a custos financeiros.
2. Engenheiro de Produção: Engenharia de produto, BOM (estrutura de materiais), tempos padrão de ciclo, balanceamento de postos e roteiros fabris.
3. Analista de PCP: Sequenciamento fabril, balanceamento para 1.200 un/dia, parametrização do ponto de pedido dinâmico (ROP = 21.216 un), estoque de segurança (SS = 9.216 un) e ordens de produção.
4. Supervisor/Gerente de Produção: Acompanhamento de OEE em tempo real, ritmo de esteira, liberação de OPs prioritárias e balanceamento dos 3 turnos.
5. Almoxarife: Endereçamento WMS (Ruas A a D), contagem de inventário cíclico, baixa em tempo real e saídas fixas do Milk Run (400m).
6. Analista de Qualidade: Laudos de inspeção, bloqueio e liberação de lotes com efeito imediato no WMS e esteiras de montagem.
7. Analista de Custos Industriais: Custo real vs. padrão por modelo, rateio das paradas a R$ 22.000/h e DRE industrial consolidado.
8. Analista de RH / HCM: Matrícula de funcionários, escalas de turno, controle de ponto e conformidade médica (NR-7).
9. Comprador / Suprimentos: Emissão de pedidos de compra no Lote Econômico LEC (9.354 un), avaliação OTIF e compras de importados.
10. Diretor de TI / CIO: Governança, auditoria de logs, parametrização de fórmulas, segurança e rotina de backup semanal AES-256.
11. CEO/CFO: Painel executivo de perdas (R$ 766k), DRE gerencial, margens de lucro, faturamento e alteração salarial.
12. Funcionário Comum: Portal do colaborador ("Meu Espaço") com espelho de ponto eletrônico, EPIs entregues, ASO médico, avisos e requisições.

================================================================================
(B) MODELO DE DADOS PRINCIPAL (ENTIDADES & ATRIBUTOS):
• TB_COMPONENTS: sku, nome, categoria, is_imported, saldo_wms, saldo_fisico, rop, ss, lec, lead_time_medio, desvio_lt, status_qualidade, endereco_wms.
• TB_BOM: id_produto, sku_componente, quantidade_por_unidade, estagio, is_critico.
• TB_PRODUCTION_ORDERS (OP): codigo, produto, linha, turno, quantidade_planejada, quantidade_produzida, refugo_scrap, status, downtime_horas.
• TB_DOWNTIME_LOG: data, horas, custo_total (horas × 22000), causa_raiz, linha, responsavel.
• TB_MILK_RUN: codigo, horario, distancia_metros (400), rebocador, status, itens_entregues, pontualidade.
• TB_SUPPLIERS: codigo, razao_social, cnpj, categoria, otif, lead_time_medio, desvio_lt, condicao_pagamento.
• TB_PURCHASE_ORDERS (PO): codigo, fornecedor, sku, quantidade, valor_total, data_prevista, funcionario_requisitante.
• TB_CUSTOMERS: codigo, razao_social, cnpj, limite_credito, contratos_short_shipment, rating.
• TB_EMPLOYEES_HCM: matricula, nome, cargo, departamento, turno, salario, status_aso, ponto_eletronico.

================================================================================
(C) FÓRMULAS MATEMÁTICAS E PREMISSAS INDUSTRIAIS OFICIAIS:
1. Lote Econômico de Compra (LEC):
   LEC = √(2·D·S / H)
   • Demanda Anual (D) = 300.000 unid./ano
   • Custo por Pedido (S) = R$ 350,00
   • Custo de Posse Anual (H) = R$ 2,40/unid./ano
   -> LEC ≈ 9.354 unidades.

2. Estoque de Segurança (SS):
   SS = z · √(LT·σd² + d²·σLT²)
   • Nível de Serviço = 90% (z = 1,28)
   • Demanda Diária (d) = 1.200 unid./dia
   • Lead Time Médio (LT) = 10 dias
   • Desvio do Lead Time (σLT) = 6 dias (fornecedor de plásticos)
   • Desvio da Demanda (σd) = 120 unid.
   -> SS ≈ 9.216 unidades.

3. Ponto de Pedido Dinâmico (ROP):
   ROP = d · LT + SS
   ROP = (1.200 × 10) + 9.216 ≈ 21.216 unidades.

4. Cenário Otimizado (Meta Operacional):
   • Redução do Lead Time para 8 dias e desvio σLT para 2 dias via contratos de fornecimento.
   -> SS Otimizado ≈ 3.072 unidades.
   -> ROP Otimizado ≈ 12.672 unidades.
   -> Redução de 66,7% no estoque de segurança e liberação estimada de R$ 113.654,00 em capital de giro.

5. Custo de Parada de Linha:
   Custo Total = Horas Paradas × R$ 22.000,00/hora.

================================================================================
(D) FLUXOS OPERACIONAIS E WMS:
• Recebimento: Conferência cega e leitura por coletor laser/câmera.
• Baixa em Tempo Real: A cada retirada da doca/armazém, baixa instantânea eliminando defasagens de fim de turno.
• Milk Run de 400 Metros: Circuito fechado ligando o Almoxarifado Central às Linhas 1 e 2 com partidas a cada 45 minutos.
• Bloqueio da Qualidade: Bloqueio imediato no WMS de qualquer lote com trinca ou desvio geométrico.

================================================================================
(E) SEGURANÇA, LGPD E AUDITORIA:
• Criptografia AES-256 para dados em repouso e TLS 1.3 em trânsito.
• Registro de Ponto Eletrônico em conformidade com a Portaria 671 MTE.
• Backup semanal automatizado em nuvem corporativa com retenção de 5 anos de logs de auditoria.

Documentação Oficial TecnoLar Indústria S.A.`;

  const handleCopySpec = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullSpecificationText);
        setCopied(true);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = fullSpecificationText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (err) {
        console.error('Falha ao copiar:', err);
      }
      document.body.removeChild(textArea);
    }
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([fullSpecificationText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'especificacao-tecnica-tecnolar-erp-wms.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Documentação Oficial de Engenharia de Software
            </span>
            <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Especificação Pronta para Desenvolvimento
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Projeto Completo do Sistema ERP &amp; WMS TecnoLar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Escopo funcional por perfil, modelo entidade-relacionamento, equações industriais, fluxos e critérios de aceite mensuráveis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySpec}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition border border-slate-700 shadow-sm active:scale-95"
            title="Copiar texto completo e exaustivo da especificação técnica"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copied ? 'Especificação Completa Copiada!' : 'Copiar Resumo Completo'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSpec}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition border border-slate-700 shadow-sm active:scale-95"
            title="Baixar arquivo TXT com todas as seções"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Baixar TXT Completo</span>
          </button>

          <button
            type="button"
            onClick={() => openPrintModal('especificacao')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-lg active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Especificação</span>
          </button>
        </div>
      </div>

      {/* Menu Superior de Seções da Especificação */}
      <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeSec === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSec(s.id)}
              className={`flex-1 min-w-[200px] flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Painel de Conteúdo Detalhado */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6 shadow-sm leading-relaxed text-xs">
        {/* SEÇÃO A */}
        {activeSec === 'a' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (a): Matriz de Escopo Funcional por Perfil de Usuário (RBAC)
            </h3>
            <p className="text-slate-400">
              O sistema ERP &amp; WMS da TecnoLar implementa controle de acesso rigoroso por função operacional, garantindo segregação de funções e integridade:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">1. Operador de Máquina (Chão de Fábrica)</span>
                <p className="text-slate-300">Terminal simplificado touch: início/fim de OP, apontamento de refugo/scrap por posto, registro de paradas de máquina e consumo de componentes. Acesso estritamente bloqueado a relatórios financeiros e salariais.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">2. Engenheiro de Produção</span>
                <p className="text-slate-300">Cadastro e versão da estrutura do produto (BOM), roteiros de fabricação, balanceamento de linhas, tempos padrão de ciclo e melhorias de postos de trabalho.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">3. Analista de PCP</span>
                <p className="text-slate-300">Planejamento e sequenciamento de Ordens de Produção (OP) para atingir 1.200 unidades/dia, calibração do ROP (21.216 un) e SS (9.216 un), acompanhamento de estoques e alinhamento com pedidos de venda.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">4. Supervisor / Gerente de Produção</span>
                <p className="text-slate-300">Gestão operacional de ritmo de esteira, liberação de OPs prioritárias, balanceamento dos 3 turnos, acompanhamento do OEE e intervenção imediata em gargalos.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">5. Almoxarife (WMS &amp; Abastecimento)</span>
                <p className="text-slate-300">Recebimento por leitor de código de barras, conferência física, endereçamento (Ruas A a D), baixa em tempo real a cada retirada e controle das viagens do Milk Run (400 metros).</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">6. Analista de Qualidade</span>
                <p className="text-slate-300">Laudos técnicos, bloqueio de lotes no WMS e esteiras por não conformidade, liberação após reteste e inspeção no recebimento de fornecedores.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">7. Analista de Custos Industriais</span>
                <p className="text-slate-300">DRE industrial, custo real vs. custo padrão estimado, cálculo por tempo de máquina × insumos e rateio do custo de parada (R$ 22.000/h).</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">8. Analista de RH / HCM</span>
                <p className="text-slate-300">Matrícula de novos colaboradores, reajustes salariais, controle de escalas de turno, monitoramento de exames médicos ocupacionais (ASO) e gestão de ponto.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">9. Comprador / Suprimentos</span>
                <p className="text-slate-300">Emissão de pedidos de compra oficiais aos fornecedores com base no LEC (9.354 un), acompanhamento de lead times médios e avaliação contínua pelo índice OTIF.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block text-sm">10. Diretor de TI / CIO &amp; CEO/CFO</span>
                <p className="text-slate-300">Acesso irrestrito a configurações de governança, parametrização de fórmulas do sistema, DRE consolidado, auditoria de segurança e alteração salarial executiva.</p>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO B */}
        {activeSec === 'b' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (b): Modelo de Dados Principal (Entidades &amp; Relacionamentos)
            </h3>
            <p className="text-slate-400">
              Arquitetura de banco de dados relacional com integridade referencial:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_COMPONENTES:</strong> [id (PK), sku (UK), nome, categoria, is_imported, origem_pais, saldo_wms, saldo_fisico, rop, ss, lec, lead_time_medio, desvio_lt, status_qualidade, endereco_wms, id_fornecedor (FK)]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_BOM_ESTRUTURA:</strong> [id (PK), id_produto (FK), sku_componente (FK), quantidade_unitaria, estagio_montagem, is_critico]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_ORDEM_PRODUCAO:</strong> [id (PK), codigo_op (UK), sku_produto (FK), quantidade_planejada, quantidade_produzida, quantidade_refugo, status, linha, turno, operador_matricula, horas_parada]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_HISTORICO_PARADAS:</strong> [id (PK), data_hora, duracao_horas, custo_hora (22000), custo_total, causa_raiz, linha, sku_relacionado (FK), matricula_registro (FK)]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_MILK_RUN_PROGRAMACAO:</strong> [id (PK), codigo_viagem (UK), horario_saida, distancia_metros (400), id_rebocador, status, itens_entregues, pontualidade]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_PEDIDOS_COMPRA:</strong> [id (PK), codigo (UK), id_fornecedor (FK), sku_componente (FK), quantidade, custo_unitario, valor_total, data_prevista, funcionario_requisitante]
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400">TB_COLABORADORES_HCM:</strong> [id (PK), matricula (UK), nome, cargo, departamento, turno, salario, status_aso, ultimo_ponto]
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO C */}
        {activeSec === 'c' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (c): Regras de Negócio &amp; Fórmulas Matemáticas Oficiais
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-blue-400 block text-sm">1. Lote Econômico de Compra (LEC)</strong>
                <p className="font-mono text-xs text-slate-300">LEC = √(2 · D · S / H)</p>
                <p className="text-slate-400 text-xs">
                  D = 300.000 un/ano, S = R$ 350,00, H = R$ 2,40/unid./ano. Resultado: <strong>LEC ≈ 9.354 unidades</strong>.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-emerald-400 block text-sm">2. Estoque de Segurança com Desvio Padrão do Lead Time (SS)</strong>
                <p className="font-mono text-xs text-slate-300">SS = z · √(LT·σd² + d²·σLT²)</p>
                <p className="text-slate-400 text-xs">
                  Nível de serviço 90% (z = 1,28), d = 1.200 un/dia, LT = 10 dias, σLT = 6 dias. Resultado: <strong>SS ≈ 9.216 unidades</strong>.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-400 block text-sm">3. Ponto de Pedido Dinâmico (ROP)</strong>
                <p className="font-mono text-xs text-slate-300">ROP = d · LT + SS</p>
                <p className="text-slate-400 text-xs">
                  (1.200 × 10) + 9.216 = <strong>21.216 unidades</strong>. Recalculado automaticamente quando lead time ou desvio variam.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-rose-400 block text-sm">4. Custo Financeiro de Parada Fabril</strong>
                <p className="font-mono text-xs text-slate-300">Custo Total = Horas Paradas × R$ 22.000,00/h</p>
                <p className="text-slate-400 text-xs">
                  Total de 28 horas paradas no trimestre gerou custo de R$ 616.000,00 mais R$ 150.000,00 em multas contratuais de short-shipment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO D */}
        {activeSec === 'd' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (d): Fluxos de Telas &amp; Logística do Trajeto de 400 Metros
            </h3>
            <p className="text-slate-400 leading-relaxed">
              O fluxo de materiais opera no modelo puxado pelo PCP: a separação é realizada nas Ruas A a D do Almoxarifado Central, abastecendo os carrinhos rebocadores do Milk Run. A travessia de 400 metros entre armazém e fábrica é monitorada por telemetria com check-in de partida e check-out de entrega na linha de montagem para garantir 95%+ de pontualidade.
            </p>
          </div>
        )}

        {/* SEÇÃO E */}
        {activeSec === 'e' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (e): Arquitetura Técnica, Segurança &amp; Backup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">Criptografia &amp; Segurança:</strong>
                <p className="text-slate-400 text-xs">Criptografia AES-256 para dados em repouso e TLS 1.3 em trânsito. Autenticação corporativa com matrícula e perfil RBAC.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1">Rotina de Backup:</strong>
                <p className="text-slate-400 text-xs">Backups semanais automatizados na nuvem corporativa e espelhamento local para funcionamento em caso de oscilação de link.</p>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO F */}
        {activeSec === 'f' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seção (f): Critérios de Aceite Mensuráveis &amp; Metas Fabris
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero horas de parada não programada nas Linhas 1 e 2 por falta de componentes plásticos injetados.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Acurácia de estoque WMS acima de 98% através da baixa instantânea a cada separação.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pontualidade no circuito Milk Run (400 metros) com índice superior a 95%.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Eliminação total de multas por short-shipment para as redes Magazine Brasil e Casas do Sul.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

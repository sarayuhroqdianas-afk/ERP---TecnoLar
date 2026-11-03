import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  Building,
  User,
  Filter,
  CheckCircle2,
  Tag,
  Shield,
  Wrench,
  Layers,
  Cpu,
} from 'lucide-react';
import { HelpTicket } from '../types';

export const HelpdeskView: React.FC = () => {
  const { helpTickets, addHelpTicket, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HelpTicket['category']>('Sistema / WMS');
  const [assignedSector, setAssignedSector] = useState<HelpTicket['assignedSector']>('TI & Infraestrutura');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>('Alta');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCategoryChange = (cat: HelpTicket['category']) => {
    setCategory(cat);
    // Sugestão automática de setor responsável conforme a categoria
    if (cat === 'Sistema / WMS' || cat === 'Dispositivo Coletor') {
      setAssignedSector('TI & Infraestrutura');
    } else if (cat === 'Falha Milk Run' || cat === 'Divergência de Dados') {
      setAssignedSector('WMS & Logística');
    } else if (cat === 'Manutenção Mecânica') {
      setAssignedSector('Manutenção Elétrica e Mecânica');
    } else if (cat === 'Recursos Humanos') {
      setAssignedSector('Recursos Humanos / HCM');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addHelpTicket({
      title,
      category,
      assignedSector,
      priority,
      reportedBy: `${currentUser.name} (${currentUser.matricula})`,
      status: 'Aberto',
      description,
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
    setSuccessMsg(`Chamado encaminhado diretamente para o setor de [${assignedSector}] com sucesso!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const isHRAuthorized =
    currentUser.role === 'Analista de RH / HCM' ||
    currentUser.role === 'CEO' ||
    currentUser.role === 'CFO' ||
    currentUser.role === 'CEO/CFO';

  const isIT = currentUser.role === 'Engenheiro de TI' || currentUser.role === 'Diretor de TI/CIO';

  const filteredTickets = helpTickets.filter((t) => {
    // Segregação: TI não deve ver chamados confidenciais de RH / Folha / Medicina
    if (t.assignedSector === 'Recursos Humanos / HCM' && !isHRAuthorized && !t.reportedBy.includes(currentUser.name)) {
      return false;
    }
    if (sectorFilter !== 'todos' && t.assignedSector !== sectorFilter) return false;
    if (statusFilter !== 'todos' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Suporte Técnico, Manutenção &amp; Qualidade
            </span>
            <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Helpdesk da Planta Industrial
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Central de Ajuda &amp; Roteamento para Setores Responsáveis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Abertura e triagem de ocorrências operacionais com encaminhamento direto para TI, Manutenção, WMS, Qualidade e RH.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Barra de Filtro de Setor Responsável */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-slate-300 font-semibold">Filtrar por Setor Responsável:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs"
          >
            <option value="todos">Todos os Setores ({helpTickets.length} chamados)</option>
            <option value="TI & Infraestrutura">TI &amp; Infraestrutura</option>
            <option value="WMS & Logística">WMS &amp; Logística</option>
            <option value="Manutenção Elétrica e Mecânica">Manutenção Elétrica e Mecânica</option>
            <option value="Garantia da Qualidade">Garantia da Qualidade</option>
            <option value="Recursos Humanos / HCM">Recursos Humanos / HCM</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs"
          >
            <option value="todos">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      {/* Lista de Chamados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Ocorrências Industriais por Setor Responsável
          </span>
          <span className="text-slate-400">Exibindo {filteredTickets.length} ocorrências</span>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((tkt) => (
              <div key={tkt.id} className="p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold">{tkt.code}</span>
                    <h4 className="font-bold text-white text-sm">{tkt.title}</h4>
                    
                    {/* Badge do Setor Responsável Bem Evidente */}
                    <span className="bg-purple-950 text-purple-300 border border-purple-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Building className="w-3 h-3 text-purple-400" />
                      Setor: {tkt.assignedSector}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tkt.priority === 'Crítica'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : tkt.priority === 'Alta'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      Prioridade: {tkt.priority}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">{tkt.description}</p>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                    <span>Categoria: <strong className="text-slate-200">{tkt.category}</strong></span>
                    <span>Aberto por: <strong className="text-slate-200">{tkt.reportedBy}</strong></span>
                    <span>Abertura: {tkt.createdAt}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tkt.status === 'Resolvido'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : tkt.status === 'Em Análise'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {tkt.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum chamado encontrado para o setor '{sectorFilter}'.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Abrir Novo Chamado com Setor Responsável */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Registrar Chamado na Central de Ajuda</h3>
                <span className="text-[11px] text-slate-400">Encaminhamento com notificação ao setor responsável da TecnoLar</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Título do Problema:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Leitor de código de barras travando na Doca 3 do WMS"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoria do Problema:</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Sistema / WMS">Sistema / WMS</option>
                    <option value="Dispositivo Coletor">Dispositivo Coletor / Scanner</option>
                    <option value="Divergência de Dados">Divergência de Dados / Estoque</option>
                    <option value="Falha Milk Run">Falha Milk Run (Rota 400m)</option>
                    <option value="Manutenção Mecânica">Manutenção Mecânica &amp; Prensas</option>
                    <option value="Recursos Humanos">Recursos Humanos / Escala</option>
                  </select>
                </div>

                {/* Campo Explícito do Setor Responsável */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Setor Responsável para Solução:
                  </label>
                  <select
                    value={assignedSector}
                    onChange={(e) => setAssignedSector(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold text-purple-300"
                  >
                    <option value="TI & Infraestrutura">TI &amp; Infraestrutura</option>
                    <option value="WMS & Logística">WMS &amp; Logística</option>
                    <option value="Manutenção Elétrica e Mecânica">Manutenção Elétrica e Mecânica</option>
                    <option value="Garantia da Qualidade">Garantia da Qualidade</option>
                    <option value="Recursos Humanos / HCM">Recursos Humanos / HCM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Prioridade Operacional:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Baixa">Baixa (Dúvida ou sugestão)</option>
                  <option value="Média">Média (Não impacta o ritmo de linha)</option>
                  <option value="Alta">Alta (Risco iminente de lentidão fabril)</option>
                  <option value="Crítica">Crítica (Linha parada / Risco de R$ 22.000/h)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição Detalhada do Problema:</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que ocorreu, posto de trabalho afetado e mensagem de erro apresentada..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Encaminhar ao Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

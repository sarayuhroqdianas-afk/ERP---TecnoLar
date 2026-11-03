import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Clock,
  ShieldCheck,
  HeartPulse,
  HardHat,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Send,
  HelpCircle,
  Check,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const EmployeePortalView: React.FC = () => {
  const { currentUser, employees, recordEmployeePoint, addInternalRequisition, addHelpTicket, helpTickets } = useApp();

  const [pointSuccess, setPointSuccess] = useState<string | null>(null);
  const [epiSuccess, setEpiSuccess] = useState<string | null>(null);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqItem, setReqItem] = useState('Luvas Nitrílicas e Antiestáticas');
  const [reqQty, setReqQty] = useState(2);
  const [reqPriority, setReqPriority] = useState<'Normal' | 'Urgente (Risco de Parada)'>('Normal');

  const currentEmp = employees.find((e) => e.matricula === currentUser.matricula) || {
    matricula: currentUser.matricula,
    name: currentUser.name,
    role: currentUser.role,
    department: currentUser.department,
    shift: 'Turno 1 (06:00 - 14:20)',
    admissionDate: '2023-03-15',
    salary: 3450,
    healthExamStatus: 'Em Dia' as const,
    lastPointRecord: 'Hoje às 05:52 (Entrada)',
    trainingCompliancePercent: 100,
    vacationStatus: 'Disponível' as const,
    bankHoursBalance: 3.5,
  };

  const handleRegisterPoint = () => {
    recordEmployeePoint(currentUser.matricula);
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setPointSuccess(`Ponto registrado eletronicamente às ${timeStr} com sucesso!`);
    setTimeout(() => setPointSuccess(null), 3000);
  };

  const handleRequestEpi = (epiName: string) => {
    setEpiSuccess(`Solicitação de reposição de "${epiName}" enviada ao Almoxarifado/Segurança do Trabalho!`);
    setTimeout(() => setEpiSuccess(null), 3000);
  };

  const handleSendReq = (e: React.FormEvent) => {
    e.preventDefault();
    addInternalRequisition({
      requestedBy: `${currentUser.name} (${currentUser.matricula})`,
      line: currentEmp.department,
      componentSku: 'MAT-CONSUMO-DIV',
      componentName: reqItem,
      qtyRequested: reqQty,
      priority: reqPriority,
    });
    setIsReqModalOpen(false);
    setEpiSuccess(`Requisição interna de ${reqQty} un de ${reqItem} registrada com sucesso!`);
    setTimeout(() => setEpiSuccess(null), 3000);
  };

  const userTickets = helpTickets.filter((t) => t.reportedBy.includes(currentUser.matricula) || t.reportedBy.includes(currentUser.name));

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Portal do Colaborador */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-900/60 rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-500 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Portal do Colaborador TecnoLar
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                Matrícula Ativa
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Matrícula: <strong className="text-white font-mono">{currentUser.matricula}</strong> | Cargo: <strong className="text-blue-300">{currentUser.role}</strong> | Setor: <strong className="text-slate-200">{currentUser.department}</strong>
            </p>
          </div>
        </div>

        {/* Botão de Registro Rápido de Ponto */}
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleRegisterPoint}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95 text-xs sm:text-sm"
          >
            <Clock className="w-5 h-5 animate-pulse" />
            <span>Registrar Ponto Eletrônico</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Último registro: <strong className="text-slate-200">{currentEmp.lastPointRecord}</strong>
          </span>
        </div>
      </div>

      {pointSuccess && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{pointSuccess}</span>
        </div>
      )}

      {epiSuccess && (
        <div className="p-4 bg-blue-950/90 border border-blue-700 text-blue-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">{epiSuccess}</span>
        </div>
      )}

      {/* Cartões de Indicadores Pessoais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ponto & Banco de Horas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-1">
            <span>Banco de Horas</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            +{currentEmp.bankHoursBalance || 3.5}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Saldo acumulado neste mês. Compensação automática ou folga negociada.
          </p>
        </div>

        {/* Escala & Turno */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-1">
            <span>Escala Operacional</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {currentEmp.shift}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Segunda a Sexta (Intervalo 40 min de refeição).
          </p>
        </div>

        {/* Saúde Ocupacional / ASO */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-1">
            <span>Exame Médico (ASO)</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-white">Periódico Anual</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              {currentEmp.healthExamStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Próximo exame clínico e audiométrico: Novembro/2026.
          </p>
        </div>

        {/* Férias & Benefícios */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-1">
            <span>Período Aquisitivo de Férias</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-300 mt-1">
            30 dias {currentEmp.vacationStatus || 'Disponível'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Admissão em {currentEmp.admissionDate}.
          </p>
        </div>
      </div>

      {/* Grid Central: EPIs e DDS da Fábrica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção 1: Equipamentos de Proteção Individual (EPIs) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">
                  Equipamentos de Proteção Individual (EPIs Vinculados)
                </h3>
                <p className="text-[11px] text-slate-400">
                  NR-6 MTE: Uso obrigatório nas Linhas de Montagem 1 e 2 e no Almoxarifado.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReqModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Solicitar Reposição / Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block text-sm">Protetor Auricular Tipo Concha</strong>
                <span className="text-[11px] text-slate-400">CA: 14235 | Atenuação 22 dB</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Validade: 12/2027 • Em Uso</span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestEpi('Protetor Auricular')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold border border-slate-700"
              >
                Trocar
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block text-sm">Óculos de Proteção UV Antirrisco</strong>
                <span className="text-[11px] text-slate-400">CA: 28014 | Lente Incolor</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Validade: 08/2027 • Em Uso</span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestEpi('Óculos de Proteção')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold border border-slate-700"
              >
                Trocar
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block text-sm">Botina de Segurança com Bico de Aço</strong>
                <span className="text-[11px] text-slate-400">CA: 32190 | Solado Bidensidade PU</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Validade: 03/2028 • Em Uso</span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestEpi('Botina de Segurança')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold border border-slate-700"
              >
                Trocar
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block text-sm">Luvas Nitrílicas e Antiestáticas</strong>
                <span className="text-[11px] text-slate-400">CA: 41029 | Montagem de Componentes</span>
                <span className="text-[10px] text-amber-400 block mt-0.5">Ciclo: Reposição Semanal</span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestEpi('Luvas Nitrílicas')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold border border-slate-700"
              >
                Trocar
              </button>
            </div>
          </div>
        </div>

        {/* Seção 2: Mural de Avisos da Fábrica & DDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Diálogo Diário de Segurança (DDS) &amp; Mural
            </h3>
            <p className="text-[11px] text-slate-400">
              Comunicados oficiais da Gerência Industrial e CIPA.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl space-y-1">
              <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded font-bold uppercase">
                Destaque Fabril
              </span>
              <h4 className="font-bold text-white text-xs">
                Meta Diária Atingida: 1.200 unidades!
              </h4>
              <p className="text-[11px] text-slate-300">
                A Linha 1 montou 700 lavadoras e a Linha 2 finalizou 500 refrigeradores sem paradas não programadas ontem.
              </p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl space-y-1">
              <span className="text-[10px] bg-amber-900 text-amber-200 px-1.5 py-0.2 rounded font-bold uppercase">
                Segurança do Trabalho
              </span>
              <h4 className="font-bold text-white text-xs">
                Travessia de 400m do Milk Run
              </h4>
              <p className="text-[11px] text-slate-300">
                Mantenha a faixa de pedestres desobstruída no corredor central entre o Almoxarifado e a linha. O rebocador elétrico opera a cada 45 minutos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Solicitação de Material / EPI */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Solicitar Reposição de EPI ou Material</h3>
              <button onClick={() => setIsReqModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendReq} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Item Necessário:</label>
                <select
                  value={reqItem}
                  onChange={(e) => setReqItem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Luvas Nitrílicas e Antiestáticas">Luvas Nitrílicas e Antiestáticas (CA 41029)</option>
                  <option value="Protetor Auricular Tipo Concha">Protetor Auricular Tipo Concha (CA 14235)</option>
                  <option value="Óculos de Proteção UV Antirrisco">Óculos de Proteção UV Antirrisco (CA 28014)</option>
                  <option value="Estilete com Trava de Segurança">Estilete com Trava de Segurança e Lâmina Retrátil</option>
                  <option value="Fita Adesiva Industrial de Embalagem">Fita Adesiva Industrial de Embalagem</option>
                  <option value="Pano Microfibra e Álcool Isopropílico">Pano Microfibra e Álcool Isopropílico para Limpeza</option>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
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
                    <option value="Urgente (Risco de Parada)">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

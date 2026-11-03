import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Clock,
  ShieldCheck,
  Lock,
  HeartPulse,
  Award,
  CheckCircle2,
  Plus,
  Edit3,
  DollarSign,
  UserPlus,
  Briefcase,
  Calendar,
  Search,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/formulas';
import { EmployeeHCM, UserRole } from '../types';

export const HRView: React.FC = () => {
  const { employees, registerNewEmployee, updateEmployee, recordEmployeePoint, currentUser, formatCurrency } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('todos');
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeHCM | null>(null);
  const [newSalary, setNewSalary] = useState<number>(3500);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State para Novo Funcionário
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState(`COL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [role, setRole] = useState<UserRole>('Operador de Máquina');
  const [department, setDepartment] = useState('Linha 1 - Lavadoras');
  const [shift, setShift] = useState('Turno 1 (06:00 - 14:20)');
  const [salary, setSalary] = useState(3250);
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().substring(0, 10));
  const [healthExamStatus, setHealthExamStatus] = useState<'Em Dia' | 'Próximo do Vencimento' | 'Vencido'>('Em Dia');

  // Segregação estrita: TI e outros cargos NÃO gerenciam dados salariais ou exames de RH
  const canManageHR =
    currentUser.role === 'CEO' ||
    currentUser.role === 'CFO' ||
    currentUser.role === 'CEO/CFO' ||
    currentUser.role === 'Analista de RH / HCM';

  const filteredEmployees = employees.filter((emp) => {
    if (departmentFilter !== 'todos' && emp.department !== departmentFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.matricula.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPayroll = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const asoCompliance = (
    (employees.filter((e) => e.healthExamStatus === 'Em Dia').length / employees.length) *
    100
  ).toFixed(0);

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !matricula) return;

    registerNewEmployee({
      matricula,
      name,
      role,
      department,
      shift,
      admissionDate,
      salary,
      healthExamStatus,
      trainingCompliancePercent: 100,
    });

    setIsHireModalOpen(false);
    setActionSuccess(`Colaborador ${name} matriculado com sucesso na TecnoLar!`);
    setName('');
    setMatricula(`COL-${Math.floor(1000 + Math.random() * 9000)}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUpdateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || newSalary <= 0) return;

    updateEmployee(selectedEmp.id, { salary: newSalary });
    setIsSalaryModalOpen(false);
    setActionSuccess(`Salário de ${selectedEmp.name} atualizado para ${formatCurrencyBRL(newSalary)}!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleOpenSalaryEdit = (emp: EmployeeHCM) => {
    setSelectedEmp(emp);
    setNewSalary(emp.salary || 3500);
    setIsSalaryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Recursos Humanos &amp; Gestão do Capital Humano (HCM)
            </span>
            <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Gestão de Equipes &amp; Folha Salarial
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Quadro Funcional, Matrículas, Salários &amp; Medicina Ocupacional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Escalas dos 3 turnos, conformidade ASO (NR-7), controle de ponto eletrônico e reajustes salariais.
          </p>
        </div>

        {/* Botão de Matrícula de Novo Funcionário */}
        {canManageHR ? (
          <button
            type="button"
            onClick={() => setIsHireModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Matricular Novo Funcionário</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-amber-300">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Acesso restrito para Gestão de RH e Diretoria Executiva ({currentUser.role}).</span>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Cartões Executivos de RH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Colaboradores Ativos</span>
          <div className="text-2xl font-black text-white">{employees.length}</div>
          <span className="text-[11px] text-slate-400">Distribuídos em 3 turnos de montagem</span>
        </div>

        {canManageHR ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Folha Salarial Mensal</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{formatCurrencyBRL(totalPayroll)}</div>
            <span className="text-[11px] text-slate-400">Total bruto com encargos diretos</span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm opacity-60">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Folha Salarial Mensal</span>
            <div className="text-lg font-bold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Restrito Diretoria / RH</span>
            </div>
            <span className="text-[11px] text-slate-500">Dados confidenciais</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Conformidade Médica (ASO)</span>
          <div className="text-2xl font-black text-cyan-400">{asoCompliance}%</div>
          <span className="text-[11px] text-emerald-400 font-medium">Exames periódicos em dia</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Treinamento &amp; Segurança</span>
          <div className="text-2xl font-black text-purple-400">98.4%</div>
          <span className="text-[11px] text-slate-400">Treinamento NR-12 e NR-6 em dia</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 items-center gap-2 max-w-md bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por nome, matrícula ou cargo..."
            className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Departamento:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs"
          >
            <option value="todos">Todos os Departamentos</option>
            <option value="Linha 1 - Lavadoras">Linha 1 - Lavadoras</option>
            <option value="Linha 2 - Refrigeradores">Linha 2 - Refrigeradores</option>
            <option value="Almoxarifado Central">Almoxarifado Central</option>
            <option value="Planejamento e Controle da Produção (PCP)">PCP</option>
            <option value="Garantia da Qualidade">Garantia da Qualidade</option>
            <option value="Diretoria Industrial">Diretoria Industrial</option>
          </select>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Quadro Funcional Homologado da TecnoLar S.A.
          </span>
          <span className="text-slate-400">Exibindo {filteredEmployees.length} colaboradores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Matrícula / Nome</th>
                <th className="py-3 px-4">Cargo / Departamento</th>
                <th className="py-3 px-4">Escala de Turno</th>
                <th className="py-3 px-4 text-center">Último Registro de Ponto</th>
                <th className="py-3 px-4 text-center">Exame Médico ASO</th>
                {canManageHR && <th className="py-3 px-4 text-right">Salário Base</th>}
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-400 block">{emp.matricula}</span>
                    <strong className="text-white text-sm">{emp.name}</strong>
                    <span className="text-[10px] text-slate-500 block">Admitido em {emp.admissionDate}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200 font-semibold">{emp.role}</span>
                    <span className="block text-[11px] text-slate-400">{emp.department}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {emp.shift}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-300">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {emp.lastPointRecord}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.healthExamStatus === 'Em Dia'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {emp.healthExamStatus}
                    </span>
                  </td>
                  {canManageHR && (
                    <td className="py-3 px-4 text-right font-black text-emerald-400 font-mono text-sm">
                      {formatCurrencyBRL(emp.salary)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          recordEmployeePoint(emp.matricula);
                          setActionSuccess(`Ponto registrado para ${emp.name}!`);
                          setTimeout(() => setActionSuccess(null), 2000);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded text-[11px] font-semibold border border-slate-700 transition"
                        title="Bater ponto para este colaborador"
                      >
                        Bater Ponto
                      </button>

                      {canManageHR && (
                        <button
                          type="button"
                          onClick={() => handleOpenSalaryEdit(emp)}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                          title="Modificar salário ou reajuste"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Salário</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Matricular Novo Funcionário */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Matricular Novo Funcionário na TecnoLar</h3>
                <span className="text-[11px] text-slate-400">Cadastro de empregado com cargo, turno, salário e exames admissionais</span>
              </div>
              <button onClick={() => setIsHireModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Matrícula Funcional:</label>
                  <input
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cargo / Função:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Operador de Máquina">Operador de Máquina</option>
                    <option value="Engenheiro de Produção">Engenheiro de Produção</option>
                    <option value="Analista de PCP">Analista de PCP</option>
                    <option value="Supervisor/Gerente de Produção">Supervisor/Gerente de Produção</option>
                    <option value="Almoxarife">Almoxarife</option>
                    <option value="Analista de Qualidade">Analista de Qualidade</option>
                    <option value="Analista de Custos Industriais">Analista de Custos Industriais</option>
                    <option value="Analista de RH / HCM">Analista de RH / HCM</option>
                    <option value="Comprador / Suprimentos">Comprador / Suprimentos</option>
                    <option value="Diretor de TI/CIO">Diretor de TI/CIO</option>
                    <option value="CEO/CFO">CEO/CFO</option>
                    <option value="Funcionário Comum">Funcionário Comum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Departamento / Área:</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Linha 1 - Lavadoras">Linha 1 - Lavadoras</option>
                    <option value="Linha 2 - Refrigeradores">Linha 2 - Refrigeradores</option>
                    <option value="Almoxarifado Central">Almoxarifado Central</option>
                    <option value="Planejamento e Controle da Produção (PCP)">PCP</option>
                    <option value="Garantia da Qualidade">Garantia da Qualidade</option>
                    <option value="Manutenção Mecânica & Elétrica">Manutenção Mecânica</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Suprimentos & Compras">Suprimentos &amp; Compras</option>
                    <option value="Diretoria Industrial">Diretoria Industrial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Escala de Turno:</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Turno 1 (06:00 - 14:20)">Turno 1 (06:00 - 14:20)</option>
                    <option value="Turno 2 (14:20 - 22:40)">Turno 2 (14:20 - 22:40)</option>
                    <option value="Turno 3 (22:40 - 06:00)">Turno 3 (22:40 - 06:00)</option>
                    <option value="Comercial (08:00 - 17:48)">Comercial (08:00 - 17:48)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Salário Base (R$):</label>
                  <input
                    type="number"
                    min="1412"
                    required
                    value={salary}
                    onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data de Admissão:</label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Exame Admissional (ASO):</label>
                  <select
                    value={healthExamStatus}
                    onChange={(e) => setHealthExamStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Em Dia">Aprovado (Em Dia)</option>
                    <option value="Próximo do Vencimento">Próximo do Vencimento</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Matricular Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Modificar Salário do Colaborador */}
      {isSalaryModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Reajuste Salarial &amp; Promoção</h3>
                <span className="text-[11px] text-slate-400">{selectedEmp.name} ({selectedEmp.matricula})</span>
              </div>
              <button onClick={() => setIsSalaryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateSalary} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Cargo Atual:</span>
                  <strong className="text-white">{selectedEmp.role}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Salário Atual:</span>
                  <strong className="text-slate-200 font-mono">{formatCurrencyBRL(selectedEmp.salary)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Novo Salário Base (R$):</label>
                <input
                  type="number"
                  min="1412"
                  step="50"
                  required
                  value={newSalary}
                  onChange={(e) => setNewSalary(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirmar Reajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

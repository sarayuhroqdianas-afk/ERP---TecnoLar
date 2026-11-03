import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../data/mockData';
import { Lock, Mail, UserCheck, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser, switchRole } = useApp();

  const [identifier, setIdentifier] = useState('carlos.drummond@tecnolar.ind.br');
  const [password, setPassword] = useState('••••••••••••');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === cleanId || u.matricula.toLowerCase() === cleanId
    );

    if (found) {
      setCurrentUser(found);
      setAuthSuccess(true);
      setAuthError(null);
      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 1000);
    } else {
      setAuthError('Credencial não encontrada. Use uma das matrículas ou e-mails sugeridos.');
    }
  };

  const handleSelectQuickUser = (user: typeof MOCK_USERS[0]) => {
    setIdentifier(user.email);
    setCurrentUser(user);
    setAuthSuccess(true);
    setTimeout(() => {
      setAuthSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-2 border border-blue-500 shadow-md">
            TL
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            TecnoLar Indústria de Eletrodomésticos
          </h2>
          <p className="text-xs text-slate-400">
            Acesso ao Sistema Integrado ERP &amp; WMS (1.200 unidades/dia)
          </p>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-4">
          {authSuccess && (
            <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Autenticação autorizada! Resolvendo perfil de acesso...</span>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-950 border border-rose-800 text-rose-200 text-xs rounded-lg">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Matrícula ou E-mail Corporativo:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: PCP-3022 ou mariana.esteves@tecnolar.ind.br"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Senha de Acesso:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Seleção Rápida de Perfil Corporativo */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Acesso Rápido por Perfil (Homologação RBAC):
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {MOCK_USERS.slice(0, 8).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectQuickUser(u)}
                  className="p-2 text-left bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-[11px] transition"
                >
                  <strong className="text-white block truncate">{u.name.split(' ')[0]} ({u.matricula})</strong>
                  <span className="text-slate-400 text-[10px] truncate block">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-[11px] text-slate-400">
          <span>Ambiente Corporativo Seguro</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

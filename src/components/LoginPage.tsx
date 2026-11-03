import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../data/mockData';
import {
  Lock,
  Mail,
  UserCheck,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';

export const LoginPage: React.FC = () => {
  const { loginUser, setCurrentUser, switchRole } = useApp();

  const [identifier, setIdentifier] = useState('carlos.drummond@tecnolar.ind.br');
  const [password, setPassword] = useState('tecnolar2026');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    const success = loginUser(identifier, password);
    if (success) {
      setAuthSuccess('Autenticação corporativa autorizada! Carregando workspace...');
      setAuthError(null);
    } else {
      setAuthError('Credencial não encontrada. Utilize uma matrícula válida ou selecione um perfil abaixo.');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    setIdentifier(user.email);
    setCurrentUser(user);
    loginUser(user.email, 'tecnolar2026');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0b1329] to-[#020617] text-slate-100 p-4 font-sans relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-md relative z-10 space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-white text-2xl mx-auto shadow-xl border border-blue-400">
            TL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TecnoLar Indústria S.A.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistema Integrado ERP &amp; WMS Industrial (1.200 unidades/dia)
          </p>
        </div>

        {/* Feedback de Autenticação */}
        {authSuccess && (
          <div className="p-3.5 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{authSuccess}</span>
          </div>
        )}

        {authError && (
          <div className="p-3.5 bg-rose-950/90 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-semibold">{authError}</span>
          </div>
        )}

        {/* Formulário de Login Tradicional */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Matrícula ou E-mail Corporativo:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: PCP-3022 ou carlos.drummond@tecnolar.ind.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Senha de Acesso:
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Seção de Acesso Rápido por Perfil para Homologação */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Entrar Rápido por Perfil (Homologação RBAC):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="p-2.5 text-left bg-slate-950/80 hover:bg-blue-900/30 rounded-xl border border-slate-800 hover:border-blue-600/60 transition group text-xs"
              >
                <div className="font-bold text-white group-hover:text-cyan-300 truncate">
                  {u.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-blue-400 font-mono truncate">
                  {u.matricula}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {u.role}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ambiente Seguro TLS 1.3 • AES-256</span>
          <span>TecnoLar Indústria de Eletrodomésticos S.A.</span>
        </div>
      </div>
    </div>
  );
};

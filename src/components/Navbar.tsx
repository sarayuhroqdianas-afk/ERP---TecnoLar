import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Search,
  PlusCircle,
  MinusCircle,
  Scan,
  Bot,
  Settings,
  Printer,
  AlertTriangle,
  Truck,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Sun,
  Moon,
  Globe,
  LogOut,
  LogIn,
  Menu,
  X,
  MapPin,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

const ROLES_LIST: UserRole[] = [
  'Engenheiro de Produção',
  'Analista de PCP',
  'Supervisor/Gerente de Produção',
  'Operador de Máquina',
  'Almoxarife',
  'Analista de Qualidade',
  'Analista de Custos Industriais',
  'Analista de RH / HCM',
  'Comprador / Suprimentos',
  'Engenheiro de TI',
  'Diretor de TI/CIO',
  'CEO',
  'CFO',
  'Funcionário Comum',
];

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    currentUser,
    switchRole,
    searchQuery,
    setSearchQuery,
    components,
    setIsBarcodeModalOpen,
    setIsQuickMoveModalOpen,
    setQuickMoveType,
    setQuickMoveInitialSku,
    setIsSettingsModalOpen,
    setIsAiAssistantOpen,
    openPrintModal,
    settings,
    updateSettings,
    milkRunTrips,
    downtimes,
    t,
    formatCurrency,
    isLoggedIn,
    logoutUser,
    openLoginModal,
    setActiveView,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalFinancialLoss = downtimes.reduce((acc, curr) => acc + curr.totalCost, 0);
  const activeMilkRun = milkRunTrips.find((t) => t.status === 'Em Trânsito (400m)');

  const handleOpenQuickMove = (type: 'entrada' | 'saida', sku?: string) => {
    setQuickMoveType(type);
    setQuickMoveInitialSku(sku);
    setIsQuickMoveModalOpen(true);
    setIsSearchDropdownOpen(false);
  };

  // Filtragem flexível por Código (SKU), Nome ou Categoria
  const searchResults = searchQuery.trim()
    ? components.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.sku.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.batchNumber.toLowerCase().includes(q)
        );
      })
    : [];

  const isDark = settings.theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 border-b shadow-md transition-colors ${
        isDark
          ? 'bg-[#020617] border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Faixa superior de Alertas Industriais da TecnoLar */}
      <div
        className={`px-4 py-1 text-xs flex flex-wrap items-center justify-between border-b ${
          isDark
            ? 'bg-gradient-to-r from-[#0b1329] via-[#020617] to-[#0f172a] border-slate-800 text-slate-300'
            : 'bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 border-blue-900 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold tracking-wide text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TECNOLAR S.A.
          </span>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="font-medium hidden sm:inline">
            {t('dailyTarget')}: <strong>1.200 {t('unitsPerDay')}</strong> (700 Lavadoras + 500 Refrigeradores)
          </span>
          <span className="opacity-40 hidden md:inline">|</span>
          <span className="hidden md:inline">
            Catálogo: <strong>&gt;400 Componentes</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {t('recentLoss')}: <strong>28h | {formatCurrency(totalFinancialLoss)}</strong>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-sky-300 bg-sky-950/70 border border-sky-700/60 px-2 py-0.5 rounded text-[11px]">
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {t('milkRunRoute')}: {activeMilkRun ? `Em Trânsito (${activeMilkRun.code})` : 'Normal (400m)'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra Principal de Navegação (Layout espaçoso e sem sobreposição de botões) */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Lado Esquerdo: Botão Mobile + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`md:hidden p-2 rounded-xl border transition ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
              aria-label="Abrir menu lateral"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-700 flex items-center justify-center font-black text-white text-base sm:text-lg tracking-wider shadow-md border border-blue-500 shrink-0">
            TL
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight leading-none">
                {t('appName')}
              </h1>
              <span className="text-[10px] bg-blue-900 text-blue-100 border border-blue-600 font-bold px-1.5 py-0.5 rounded">
                v4.9
              </span>
            </div>
            <p className="text-[11px] opacity-70 leading-tight">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Centro: Barra de Pesquisa TOTALMENTE INDEPENDENTE (sem sobreposição) */}
        <div ref={searchContainerRef} className="flex-1 max-w-lg min-w-[160px] relative">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 opacity-50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              placeholder={t('searchPlaceholder')}
              aria-label="Pesquisar componentes por SKU, nome ou categoria"
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchDropdownOpen(false);
                }}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown de Resultados da Pesquisa em Tempo Real */}
          {isSearchDropdownOpen && searchQuery.trim() && (
            <div
              className={`absolute left-0 right-0 mt-1 rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto animate-in fade-in ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase flex justify-between">
                <span>Resultados Encontrados ({searchResults.length})</span>
                <span>Pressione Esc para fechar</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-blue-900/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-500 text-xs">{item.sku}</span>
                          <span className="font-semibold text-xs">{item.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            item.qualityStatus === 'Liberado' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {item.qualityStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Categoria: <strong>{item.category}</strong></span>
                          <span>Estoque WMS: <strong className="text-white">{item.currentStock.toLocaleString('pt-BR')} {item.unit}</strong></span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            {item.wmsLocation}
                          </span>
                        </div>
                      </div>

                      {/* Botões Rápidos dentro do resultado de busca */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveView('wms');
                            setIsSearchDropdownOpen(false);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold"
                          title="Abrir no Módulo WMS"
                        >
                          Ver WMS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickMove('entrada', item.sku)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                        >
                          + Entrada
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickMove('saida', item.sku)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold"
                        >
                          - Baixa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum componente encontrado para '{searchQuery}'. Tente buscar por 'CMP-PLAS', 'Gabinete' ou 'Plásticos'.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botões de Entrada e Saída (EM CONTAINER SEPARADO - NUNCA SOBREPÕEM A BUSCA) */}
        <div className="hidden xl:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenQuickMove('entrada')}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs focus:ring-2 focus:ring-emerald-400"
            title="Registrar Entrada de Matéria-Prima com Quantidade Editável"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('entryBtn')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenQuickMove('saida')}
            className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs focus:ring-2 focus:ring-rose-400"
            title="Registrar Baixa em Tempo Real com Quantidade Editável"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{t('exitBtn')}</span>
          </button>
        </div>

        {/* Lado Direito: Scanner, IA, Impressão, Idioma, Tema, Perfil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Scanner de Código de Barras (Câmera) */}
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(true)}
            title="Escanear Código de Barras / QR Code (Câmera)"
            className={`p-2 rounded-xl border transition ${
              isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-blue-600'
            }`}
            aria-label="Abrir Leitor de Código de Barras"
          >
            <Scan className="w-4 h-4" />
          </button>

          {/* IA Assistente Industrial */}
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            title="Copiloto Industrial TecnoLar (Gemini 3.8 Flash)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-sm border border-blue-500/50 transition"
          >
            <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden xl:inline">{t('assistant')}</span>
          </button>

          {/* Impressão Oficial */}
          <button
            type="button"
            onClick={() => openPrintModal('financeiro')}
            title="Imprimir Relatório Oficial"
            className={`p-2 rounded-xl border transition ${
              isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            aria-label="Imprimir Relatório"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Dropdown de Idioma (pt-BR, en-US, es-ES) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              title="Mudar Idioma da Interface"
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline uppercase text-[11px]">{settings.language.split('-')[0]}</span>
            </button>

            {isLangDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl py-1 z-50 border text-xs animate-in fade-in ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="px-3 py-1.5 border-b border-slate-800/40 text-[10px] font-bold text-slate-400 uppercase">
                  Idioma / Language
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ language: 'pt-BR' });
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-600 hover:text-white transition ${
                    settings.language === 'pt-BR' ? 'font-bold text-blue-500' : ''
                  }`}
                >
                  <span>Português (Brasil)</span>
                  {settings.language === 'pt-BR' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ language: 'en-US' });
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-600 hover:text-white transition ${
                    settings.language === 'en-US' ? 'font-bold text-blue-500' : ''
                  }`}
                >
                  <span>English (US)</span>
                  {settings.language === 'en-US' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ language: 'es-ES' });
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-600 hover:text-white transition ${
                    settings.language === 'es-ES' ? 'font-bold text-blue-500' : ''
                  }`}
                >
                  <span>Español</span>
                  {settings.language === 'es-ES' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Dropdown Direto de Moeda (BRL, USD, EUR) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              title="Mudar Moeda Padrão de Custos"
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-emerald-700'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline uppercase text-[11px]">{settings.currency}</span>
            </button>

            {isCurrencyDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl py-1 z-50 border text-xs animate-in fade-in ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  Moeda / Currency
                </div>
                {[
                  { code: 'BRL', label: 'Real (R$ - BRL)' },
                  { code: 'USD', label: 'Dólar ($ - USD)' },
                  { code: 'EUR', label: 'Euro (€ - EUR)' },
                ].map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => {
                      updateSettings({ currency: cur.code as any });
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-600 hover:text-white transition ${
                      settings.currency === cur.code ? 'font-bold text-blue-500' : ''
                    }`}
                  >
                    <span>{cur.label}</span>
                    {settings.currency === cur.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alternador de Modo Claro / Escuro */}
          <button
            type="button"
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            title={isDark ? t('themeLight') : t('themeDark')}
            className={`p-2 rounded-xl border transition ${
              isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            aria-label="Alternar Tema Claro / Escuro"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Configurações */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            title="Configurações do Sistema"
            className={`p-2 rounded-xl border transition ${
              isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            aria-label="Abrir Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dropdown de Perfis de Acesso & Login */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition text-left ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              aria-label="Perfil do Usuário"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-bold truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-blue-500 font-semibold truncate max-w-[110px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl py-2 z-50 border text-xs animate-in fade-in ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="px-4 py-2 border-b border-slate-800/40">
                  <div className="font-bold text-sm text-blue-500">{currentUser.name}</div>
                  <div className="text-[11px] opacity-70">Matrícula: {currentUser.matricula} | {currentUser.department}</div>
                  <div className="mt-1 inline-block text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-800">
                    Cargo: {currentUser.role}
                  </div>
                </div>

                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Alternar Cargo Homologado:
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {ROLES_LIST.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        switchRole(role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-600 hover:text-white transition ${
                        currentUser.role === role ? 'font-bold bg-blue-500/10 text-blue-500' : ''
                      }`}
                    >
                      <span className="truncate">{role}</span>
                      {currentUser.role === role && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">Ativo</span>}
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-800/40 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      openLoginModal();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-500 hover:underline"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Trocar de Conta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      logoutUser();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:underline font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

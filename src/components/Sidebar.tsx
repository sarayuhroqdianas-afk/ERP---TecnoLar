import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Factory,
  Layers,
  Truck,
  ShoppingCart,
  TrendingUp,
  FileText,
  DollarSign,
  Users,
  Shield,
  Sliders,
  HelpCircle,
  FileCode2,
  HardHat,
  ChevronRight,
  UserCheck,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeView, setActiveView, currentUser, t, settings } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: 'BI',
      badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700',
    },
    {
      id: 'pcp',
      label: t('navPCP'),
      icon: Factory,
      badge: '1.200/dia',
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'operador',
      label: t('navOperator'),
      icon: HardHat,
      badge: 'Chão Fabril',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'colaborador',
      label: t('navEmployeePortal'),
      icon: UserCheck,
      badge: 'Meu Espaço',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'wms',
      label: t('navWMS'),
      icon: Layers,
      badge: 'Tempo Real',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'milkrun',
      label: t('navMilkRun'),
      icon: Truck,
      badge: '400m',
      badgeColor: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300',
    },
    {
      id: 'compras',
      label: t('navPurchasing'),
      icon: ShoppingCart,
      badge: 'Fornecedores',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'vendas',
      label: t('navSales'),
      icon: TrendingUp,
      badge: 'Multas',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'faturamento',
      label: t('navInvoicing'),
      icon: FileText,
    },
    {
      id: 'custos',
      label: t('navCosts'),
      icon: DollarSign,
      badge: 'R$ 22k/h',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'rh',
      label: t('navHR'),
      icon: Users,
      badge: 'HCM',
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'seguranca',
      label: t('navSecurity'),
      icon: Shield,
      badge: 'AES-256',
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'formulas',
      label: t('navFormulas'),
      icon: Sliders,
      badge: 'Parâmetros',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'especificacao',
      label: t('navSpec'),
      icon: FileCode2,
      badge: 'Docs',
      badgeColor: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300',
    },
    {
      id: 'chamados',
      label: t('navHelp'),
      icon: HelpCircle,
    },
  ];

  // Mapeamento Estrito de Abas por Área de Atuação e Cargo (13 Perfis Oficiais)
  const getVisibleModuleIdsForRole = (role: UserRole): string[] => {
    switch (role) {
      case 'Engenheiro de Produção':
        return ['dashboard', 'pcp', 'formulas', 'especificacao', 'chamados'];
      case 'Analista de PCP':
        return ['dashboard', 'pcp', 'wms', 'milkrun', 'formulas', 'chamados'];
      case 'Supervisor/Gerente de Produção':
        return ['dashboard', 'pcp', 'operador', 'wms', 'milkrun', 'chamados'];
      case 'Operador de Máquina':
        return ['operador', 'chamados'];
      case 'Almoxarife':
        return ['wms', 'milkrun', 'chamados'];
      case 'Analista de Qualidade':
        return ['dashboard', 'wms', 'pcp', 'chamados'];
      case 'Analista de Custos Industriais':
        return ['dashboard', 'custos', 'faturamento', 'vendas', 'chamados'];
      case 'Analista de RH / HCM':
        return ['rh', 'colaborador', 'chamados'];
      case 'Comprador / Suprimentos':
        return ['dashboard', 'compras', 'wms', 'chamados'];
      case 'Engenheiro de TI':
      case 'Diretor de TI/CIO':
        // Segregação estrita: TI NÃO vê salários ou exames de RH nem custos administrativos
        return ['dashboard', 'seguranca', 'formulas', 'especificacao', 'chamados'];
      case 'CEO':
        return ['dashboard', 'custos', 'pcp', 'vendas', 'faturamento', 'rh', 'chamados'];
      case 'CFO':
        return ['dashboard', 'custos', 'faturamento', 'vendas', 'chamados'];
      case 'CEO/CFO':
        return ['dashboard', 'custos', 'pcp', 'vendas', 'faturamento', 'rh', 'chamados'];
      case 'Funcionário Comum':
      default:
        return ['colaborador', 'chamados'];
    }
  };

  const allowedIds = getVisibleModuleIdsForRole(currentUser.role);
  const visibleItems = navItems.filter((item) => allowedIds.includes(item.id));

  const isDark = settings.theme === 'dark';

  const sidebarContent = (
    <aside
      className={`w-64 h-full flex flex-col border-r transition-colors ${
        isDark
          ? 'bg-[#020617] border-slate-800 text-slate-300'
          : 'bg-white border-slate-200 text-slate-700'
      }`}
    >
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div className="text-[11px] font-extrabold tracking-wider uppercase opacity-70 px-2 py-0.5">
          Módulos Autorizados
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveView(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : isDark
                  ? 'hover:bg-slate-900 hover:text-white text-slate-300'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isActive ? 'bg-blue-800 text-blue-100' : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Cartão de Identificação do Perfil Ativo */}
      <div className={`p-3 m-3 rounded-xl border text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center justify-between opacity-70 mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Perfil Ativo</span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{currentUser.matricula}</span>
        </div>
        <strong className="text-slate-900 dark:text-white block text-xs truncate">{currentUser.name}</strong>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate mt-0.5">
          {currentUser.role}
        </span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Visualização Desktop */}
      <div className="hidden md:block h-full">
        {sidebarContent}
      </div>

      {/* Visualização Mobile com Drawer Deslizante */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * TecnoLar Indústria de Eletrodomésticos S.A.
 * Sistema Integrado ERP & WMS Industrial
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { QuickMovementModal } from './components/QuickMovementModal';
import { PrintDocumentModal } from './components/PrintDocumentModal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { OperatorTerminal } from './components/OperatorTerminal';

// Views
import { DashboardView } from './views/DashboardView';
import { ProductionView } from './views/ProductionView';
import { WMSView } from './views/WMSView';
import { MilkRunView } from './views/MilkRunView';
import { PurchasingView } from './views/PurchasingView';
import { SalesCRMView } from './views/SalesCRMView';
import { InvoicingView } from './views/InvoicingView';
import { CostFinanceView } from './views/CostFinanceView';
import { HRView } from './views/HRView';
import { SecurityBackupView } from './views/SecurityBackupView';
import { FormulaConfigView } from './views/FormulaConfigView';
import { SpecificationView } from './views/SpecificationView';
import { HelpdeskView } from './views/HelpdeskView';
import { EmployeePortalView } from './views/EmployeePortalView';

const MainLayout: React.FC = () => {
  const { activeView, isLoggedIn, settings } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Se o usuário não estiver autenticado, exibe a tela de login completa
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  const isDark = settings.theme === 'dark';

  // Renderização dinâmica da tela ativa de acordo com o módulo ou perfil
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pcp':
        return <ProductionView />;
      case 'operador':
        return <OperatorTerminal />;
      case 'colaborador':
        return <EmployeePortalView />;
      case 'wms':
        return <WMSView />;
      case 'milkrun':
        return <MilkRunView />;
      case 'compras':
        return <PurchasingView />;
      case 'vendas':
        return <SalesCRMView />;
      case 'faturamento':
        return <InvoicingView />;
      case 'custos':
        return <CostFinanceView />;
      case 'rh':
        return <HRView />;
      case 'seguranca':
        return <SecurityBackupView />;
      case 'formulas':
        return <FormulaConfigView />;
      case 'especificacao':
        return <SpecificationView />;
      case 'chamados':
        return <HelpdeskView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Barra de Navegação Superior com suporte a Mobile Drawer */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Área Central: Sidebar + Conteúdo */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu Lateral de Módulos (com Drawer responsivo para Mobile e Tablet) */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Conteúdo Principal com Rolagem Suave */}
        <main
          className={`flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-6 ${
            isDark ? 'bg-[#060c1e]/90 text-slate-100' : 'bg-slate-100/90 text-slate-900'
          }`}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Modais Globais do Sistema */}
      <SettingsModal />
      <AIAssistantModal />
      <BarcodeScannerModal />
      <QuickMovementModal />
      <PrintDocumentModal />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

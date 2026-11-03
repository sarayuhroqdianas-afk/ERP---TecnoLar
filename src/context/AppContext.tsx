// AppContext.tsx - Estado Central Reativo do ERP & WMS TecnoLar
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  ComponentItem,
  ProductionOrder,
  DowntimeOccurrence,
  MilkRunSchedule,
  Supplier,
  Customer,
  PurchaseOrder,
  SalesOrder,
  InvoiceNFe,
  EmployeeHCM,
  InternalRequisition,
  FormulaParameters,
  HelpTicket,
  AuditLog,
  FinishedProduct,
} from '../types';
import {
  MOCK_USERS,
  MOCK_PRODUCTS,
  MOCK_COMPONENTS,
  MOCK_DOWNTIMES,
  MOCK_MILK_RUN,
  MOCK_SUPPLIERS,
  MOCK_CUSTOMERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_PRODUCTION_ORDERS,
  MOCK_SALES_ORDERS,
  MOCK_INVOICES,
  MOCK_EMPLOYEES,
  MOCK_REQUISITIONS,
  MOCK_AUDIT_LOGS,
  MOCK_TICKETS,
} from '../data/mockData';
import {
  DEFAULT_FORMULA_PARAMS,
  calculateLEC,
  calculateSafetyStock,
  calculateROP,
  calculateDowntimeCost,
  formatCurrencyWithSettings,
} from '../utils/formulas';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

export interface AppSettings {
  theme: 'light' | 'dark';
  language: SupportedLanguage;
  currency: 'BRL' | 'USD' | 'EUR';
  timezone: string;
  notificationsEnabled: boolean;
  cameraPermission: 'prompt' | 'granted' | 'denied';
  microphonePermission: 'prompt' | 'granted' | 'denied';
  offlineCacheEnabled: boolean;
  dataSaverMode: boolean;
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  loginUser: (identifier: string, pass: string) => boolean;
  logoutUser: () => void;
  openLoginModal: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Dados do ERP
  components: ComponentItem[];
  products: FinishedProduct[];
  productionOrders: ProductionOrder[];
  downtimes: DowntimeOccurrence[];
  milkRunTrips: MilkRunSchedule[];
  suppliers: Supplier[];
  customers: Customer[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  invoices: InvoiceNFe[];
  employees: EmployeeHCM[];
  requisitions: InternalRequisition[];
  auditLogs: AuditLog[];
  helpTickets: HelpTicket[];
  
  // Parâmetros de Cálculo da Diretoria
  formulaParams: FormulaParameters;
  updateFormulaParams: (newParams: Partial<FormulaParameters>) => void;
  resetFormulaParams: () => void;

  // Ações de Negócio WMS
  deductComponentStockRealtime: (sku: string, qty: number, reason: string) => void;
  addComponentStock: (sku: string, qty: number, batchNumber: string) => void;
  toggleQualityLock: (sku: string) => void;
  updatePhysicalStockCount: (sku: string, count: number) => void;
  
  // Produção e PCP
  updateProductionOrder: (id: string, updates: Partial<ProductionOrder>) => void;
  recordDowntime: (downtime: Omit<DowntimeOccurrence, 'id' | 'totalCost'>) => void;
  
  // Milk Run
  performMilkRunCheckIn: (tripId: string) => void;
  performMilkRunCheckOut: (tripId: string) => void;

  // Compras & Requisições
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'code' | 'orderDate' | 'status'>) => void;
  addInternalRequisition: (req: Omit<InternalRequisition, 'id' | 'code' | 'status' | 'requestTime' | 'qtySeparated'>) => void;

  // RH & Funcionários
  registerNewEmployee: (emp: Omit<EmployeeHCM, 'id' | 'lastPointRecord'>) => void;
  updateEmployee: (id: string, updates: Partial<EmployeeHCM>) => void;
  recordEmployeePoint: (matricula: string) => void;

  // Modais de Controle
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;
  isQuickMoveModalOpen: boolean;
  setIsQuickMoveModalOpen: (open: boolean) => void;
  quickMoveType: 'entrada' | 'saida';
  setQuickMoveType: (type: 'entrada' | 'saida') => void;
  quickMoveInitialSku?: string;
  setQuickMoveInitialSku: (sku: string | undefined) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  printDocType: 'financeiro' | 'estoque' | 'requisicoes' | 'danfe' | 'especificacao';
  openPrintModal: (type: 'financeiro' | 'estoque' | 'requisicoes' | 'danfe' | 'especificacao') => void;

  // Configurações & Idioma
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: string) => string;
  formatCurrency: (valueInBRL: number) => string;
  emitPurchaseOrderFromROP: (sku: string, qty?: number) => PurchaseOrder | null;
  
  // Central de Ajuda
  addHelpTicket: (ticket: Omit<HelpTicket, 'id' | 'code' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Autenticação & Usuário Ativo
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[1]); // Mariana Esteves (PCP)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dados Centrais
  const [components, setComponents] = useState<ComponentItem[]>(MOCK_COMPONENTS);
  const [products] = useState<FinishedProduct[]>(MOCK_PRODUCTS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(MOCK_PRODUCTION_ORDERS);
  const [downtimes, setDowntimes] = useState<DowntimeOccurrence[]>(MOCK_DOWNTIMES);
  const [milkRunTrips, setMilkRunTrips] = useState<MilkRunSchedule[]>(MOCK_MILK_RUN);
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(MOCK_SALES_ORDERS);
  const [invoices, setInvoices] = useState<InvoiceNFe[]>(MOCK_INVOICES);
  const [employees, setEmployees] = useState<EmployeeHCM[]>(MOCK_EMPLOYEES);
  const [requisitions, setRequisitions] = useState<InternalRequisition[]>(MOCK_REQUISITIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>(MOCK_TICKETS);

  // Parâmetros de Fórmulas
  const [formulaParams, setFormulaParams] = useState<FormulaParameters>(DEFAULT_FORMULA_PARAMS);

  // Modais
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isQuickMoveModalOpen, setIsQuickMoveModalOpen] = useState(false);
  const [quickMoveType, setQuickMoveType] = useState<'entrada' | 'saida'>('entrada');
  const [quickMoveInitialSku, setQuickMoveInitialSku] = useState<string | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<'financeiro' | 'estoque' | 'requisicoes' | 'danfe' | 'especificacao'>('financeiro');

  // Configurações
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    language: 'pt-BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo (UTC-03:00)',
    notificationsEnabled: true,
    cameraPermission: 'granted',
    microphonePermission: 'prompt',
    offlineCacheEnabled: true,
    dataSaverMode: false,
  });

  // Aplicação estrita do tema escuro/claro
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#020617] text-slate-100 antialiased selection:bg-blue-600 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#f8fafc] text-slate-900 antialiased selection:bg-blue-600 selection:text-white';
    }
  }, [settings.theme]);

  const t = (key: string): string => {
    return TRANSLATIONS[settings.language]?.[key] || TRANSLATIONS['pt-BR']?.[key] || key;
  };

  const formatCurrency = (valInBRL: number): string => {
    return formatCurrencyWithSettings(valInBRL, settings.currency, settings.language);
  };

  const addAuditLog = (action: string, entity: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: `${currentUser.name} (${currentUser.matricula})`,
      role: currentUser.role,
      action,
      entity,
      details,
      ipAddress: '192.168.10.25',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === role) || {
      id: `usr-${Date.now()}`,
      matricula: 'GEN-0000',
      name: `Usuário (${role})`,
      email: 'usuario@tecnolar.ind.br',
      role,
      department: 'TecnoLar Geral',
    };
    setCurrentUser(targetUser);

    addAuditLog(
      'Troca de Sessão / Perfil',
      'Controle de Acesso RBAC',
      `Perfil alterado para ${role} (${targetUser.matricula})`
    );

    if (role === 'Operador de Máquina') {
      setActiveView('operador');
    } else if (role === 'Funcionário Comum') {
      setActiveView('colaborador');
    }
  };

  const loginUser = (identifier: string, _pass: string): boolean => {
    const clean = identifier.trim().toLowerCase();
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === clean || u.matricula.toLowerCase() === clean
    );
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      addAuditLog('Login Autorizado', 'Sessão de Usuário', `Autenticação bem-sucedida para ${found.name}`);
      if (found.role === 'Operador de Máquina') setActiveView('operador');
      else if (found.role === 'Funcionário Comum') setActiveView('colaborador');
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
    addAuditLog('Logout do Sistema', 'Sessão de Usuário', `Encerramento de sessão de ${currentUser.name}`);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const updateFormulaParams = (newParams: Partial<FormulaParameters>) => {
    setFormulaParams((prev) => {
      const updated = { ...prev, ...newParams };
      const newLec = calculateLEC(
        updated.annualDemand,
        updated.orderCost,
        updated.holdingCostPerUnitYear
      );
      const newSS = calculateSafetyStock(
        updated.serviceLevelZ,
        updated.dailyDemand,
        updated.leadTimeDays,
        updated.leadTimeStdDev,
        updated.demandStdDev
      );
      const newRop = calculateROP(updated.dailyDemand, updated.leadTimeDays, newSS);

      setComponents((comps) =>
        comps.map((c) => {
          if (c.category === 'Plásticos Injetados') {
            return {
              ...c,
              lecCalculated: newLec,
              safetyStockCalculated: newSS,
              ropCalculated: newRop,
            };
          }
          return c;
        })
      );

      addAuditLog(
        'Alteração de Parâmetros de Fórmulas',
        'Diretoria / ROP Dinâmico',
        `Parâmetros atualizados: D=${updated.annualDemand}, S=${updated.orderCost}, H=${updated.holdingCostPerUnitYear}. Novo ROP: ${newRop}, SS: ${newSS}, LEC: ${newLec}`
      );

      return updated;
    });
  };

  const resetFormulaParams = () => {
    updateFormulaParams(DEFAULT_FORMULA_PARAMS);
  };

  const deductComponentStockRealtime = (sku: string, qty: number, reason: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.sku === sku) {
          return {
            ...c,
            currentStock: Math.max(0, c.currentStock - qty),
            physicalStock: Math.max(0, c.physicalStock - qty),
          };
        }
        return c;
      })
    );
    addAuditLog('Baixa de Estoque em Tempo Real', `Componente ${sku}`, `Baixa de ${qty} un. Motivo: ${reason}`);
  };

  const addComponentStock = (sku: string, qty: number, batchNumber: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.sku === sku) {
          return {
            ...c,
            currentStock: c.currentStock + qty,
            physicalStock: c.physicalStock + qty,
            batchNumber: batchNumber || c.batchNumber,
          };
        }
        return c;
      })
    );
    addAuditLog('Entrada de Estoque WMS', `Componente ${sku}`, `Entrada de ${qty} un. Lote: ${batchNumber}`);
  };

  const toggleQualityLock = (sku: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.sku === sku) {
          const newStatus = c.qualityStatus === 'Liberado' ? 'Bloqueado' : 'Liberado';
          addAuditLog('Auditoria de Qualidade', `Lote ${c.batchNumber} (${sku})`, `Status alterado para [${newStatus}]`);
          return { ...c, qualityStatus: newStatus };
        }
        return c;
      })
    );
  };

  const updatePhysicalStockCount = (sku: string, count: number) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.sku === sku) {
          addAuditLog('Inventário Cíclico', `Componente ${sku}`, `Contagem física: ${count} un`);
          return { ...c, physicalStock: count };
        }
        return c;
      })
    );
  };

  const updateProductionOrder = (id: string, updates: Partial<ProductionOrder>) => {
    setProductionOrders((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...updates } : op))
    );
  };

  const recordDowntime = (data: Omit<DowntimeOccurrence, 'id' | 'totalCost'>) => {
    const totalCost = calculateDowntimeCost(data.durationHours, data.costPerHour);
    const newOccurrence: DowntimeOccurrence = {
      ...data,
      id: `DWN-${Date.now()}`,
      totalCost,
    };
    setDowntimes((prev) => [newOccurrence, ...prev]);
    addAuditLog(
      'Registro de Parada de Linha',
      `${data.line} - ${data.cause}`,
      `Duração: ${data.durationHours}h. Custo: R$ ${totalCost.toLocaleString('pt-BR')} (R$ 22.000/h). Motivo: ${data.description}`
    );
  };

  const performMilkRunCheckIn = (tripId: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMilkRunTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId ? { ...trip, status: 'Em Trânsito (400m)', departureTime: nowTime } : trip
      )
    );
    addAuditLog('Milk Run - Check-In', `Viagem ${tripId}`, `Partida do Almoxarifado Central (400m) às ${nowTime}`);
  };

  const performMilkRunCheckOut = (tripId: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMilkRunTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId ? { ...trip, status: 'Concluído', arrivalTime: nowTime, onTime: true } : trip
      )
    );
    addAuditLog('Milk Run - Check-Out', `Viagem ${tripId}`, `Chegada e abastecimento da linha concluídos às ${nowTime}`);
  };

  // Compras & Fornecedores
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'code' | 'orderDate' | 'status'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      code: `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'Pendente',
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog('Emissão de Pedido de Compra', `${newPO.code} - ${poData.supplierName}`, `Qtd: ${poData.qtyOrdered} un de ${poData.componentSku}. Total: R$ ${poData.totalValue.toLocaleString('pt-BR')}`);
  };

  const emitPurchaseOrderFromROP = (sku: string, qty?: number): PurchaseOrder | null => {
    const comp = components.find((c) => c.sku === sku);
    if (!comp) return null;
    const finalQty = qty && qty > 0 ? qty : comp.lecCalculated || 9354;
    const totalVal = finalQty * comp.unitCost;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      componentSku: comp.sku,
      componentName: comp.name,
      supplierId: comp.supplierId,
      supplierName: comp.supplierName,
      qtyOrdered: finalQty,
      unitCost: comp.unitCost,
      totalValue: totalVal,
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: new Date(Date.now() + comp.standardLeadTimeDays * 86400000).toISOString().substring(0, 10),
      status: 'Pendente',
      isImported: comp.isImported,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog(
      'Emissão Automática de Compra (ROP/LEC)',
      `${newPO.code} - ${comp.sku}`,
      `Lote Econômico emitido: ${finalQty} un para suprir ponto de pedido. Fornecedor: ${comp.supplierName}. Total: R$ ${totalVal.toLocaleString('pt-BR')}`
    );
    return newPO;
  };

  // Requisições Internas de Linha
  const addInternalRequisition = (reqData: Omit<InternalRequisition, 'id' | 'code' | 'status' | 'requestTime' | 'qtySeparated'>) => {
    const newReq: InternalRequisition = {
      ...reqData,
      id: `req-${Date.now()}`,
      code: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pendente',
      qtySeparated: 0,
      requestTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setRequisitions((prev) => [newReq, ...prev]);
    addAuditLog('Nova Requisição de Linha', `${newReq.code} (${reqData.line})`, `Solicitado ${reqData.qtyRequested} un de ${reqData.componentSku}`);
  };

  // RH / HCM
  const registerNewEmployee = (empData: Omit<EmployeeHCM, 'id' | 'lastPointRecord'>) => {
    const newEmp: EmployeeHCM = {
      ...empData,
      id: `emp-${Date.now()}`,
      lastPointRecord: 'Primeiro dia - Registro pendente',
      vacationStatus: 'Disponível',
      bankHoursBalance: 0,
    };
    setEmployees((prev) => [...prev, newEmp]);
    addAuditLog('Admissão de Colaborador', `Matrícula ${newEmp.matricula}`, `Cadastrado: ${newEmp.name} - Cargo: ${newEmp.role}`);
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeHCM>) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          addAuditLog('Alteração Cadastral HCM', `Colaborador ${e.name} (${e.matricula})`, `Dados atualizados com sucesso`);
          return updated;
        }
        return e;
      })
    );
  };

  const recordEmployeePoint = (matricula: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toLocaleDateString('pt-BR');
    const pointStr = `${today} ${nowTime} (Batida Eletrônica Registrada)`;
    setEmployees((prev) =>
      prev.map((e) => (e.matricula === matricula ? { ...e, lastPointRecord: pointStr } : e))
    );
    addAuditLog('Ponto Eletrônico Registrado', `Matrícula ${matricula}`, `Horário: ${pointStr}`);
  };

  const openPrintModal = (type: 'financeiro' | 'estoque' | 'requisicoes' | 'danfe' | 'especificacao') => {
    setPrintDocType(type);
    setIsPrintModalOpen(true);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addHelpTicket = (ticket: Omit<HelpTicket, 'id' | 'code' | 'createdAt'>) => {
    const newTkt: HelpTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      code: `CHAM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setHelpTickets((prev) => [newTkt, ...prev]);
    addAuditLog('Abertura de Chamado', `${newTkt.code} -> ${ticket.assignedSector}`, `${ticket.title} (Prioridade: ${ticket.priority})`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        isLoggedIn,
        loginUser,
        logoutUser,
        openLoginModal,
        isLoginModalOpen,
        setIsLoginModalOpen,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        components,
        products,
        productionOrders,
        downtimes,
        milkRunTrips,
        suppliers,
        customers,
        purchaseOrders,
        salesOrders,
        invoices,
        employees,
        requisitions,
        auditLogs,
        helpTickets,
        formulaParams,
        updateFormulaParams,
        resetFormulaParams,
        deductComponentStockRealtime,
        addComponentStock,
        toggleQualityLock,
        updatePhysicalStockCount,
        updateProductionOrder,
        recordDowntime,
        performMilkRunCheckIn,
        performMilkRunCheckOut,
        addPurchaseOrder,
        addInternalRequisition,
        registerNewEmployee,
        updateEmployee,
        recordEmployeePoint,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isQuickMoveModalOpen,
        setIsQuickMoveModalOpen,
        quickMoveType,
        setQuickMoveType,
        quickMoveInitialSku,
        setQuickMoveInitialSku,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isPrintModalOpen,
        setIsPrintModalOpen,
        printDocType,
        openPrintModal,
        settings,
        updateSettings,
        t,
        formatCurrency,
        emitPurchaseOrderFromROP,
        addHelpTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};

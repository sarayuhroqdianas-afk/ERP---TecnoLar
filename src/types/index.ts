// TecnoLar ERP & WMS - Tipos e Interfaces do Sistema Industrial

export type UserRole =
  | 'Engenheiro de TI'
  | 'Engenheiro de Produção'
  | 'Analista de PCP'
  | 'Supervisor/Gerente de Produção'
  | 'Operador de Máquina'
  | 'Almoxarife'
  | 'Analista de Qualidade'
  | 'Analista de Custos Industriais'
  | 'Analista de RH / HCM'
  | 'Comprador / Suprimentos'
  | 'Diretor de TI/CIO'
  | 'CEO'
  | 'CFO'
  | 'CEO/CFO'
  | 'Funcionário Comum';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  matricula: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export type ComponentCategory =
  | 'Plásticos Injetados'
  | 'Importados Críticos'
  | 'Compressores e Motores'
  | 'Chapas e Gabinetes Metálicos'
  | 'Placas Eletrônicas e Chicotes'
  | 'Vedações e Borrachas'
  | 'Embalagens e Fixadores';

export interface ComponentItem {
  id: string;
  sku: string;
  name: string;
  category: ComponentCategory;
  isImported: boolean;
  originCountry: string;
  unit: string;
  currentStock: number;
  physicalStock: number; // Para inventário cíclico
  reservedStock: number;
  wmsLocation: string; // ex: "Rua A - Prateleira 02 - Nível 3 - Vão 04"
  batchNumber: string;
  qualityStatus: 'Liberado' | 'Bloqueado' | 'Em Quarentena';
  unitCost: number; // R$
  standardLeadTimeDays: number;
  actualLeadTimeMean: number;
  leadTimeStdDev: number; // σLT
  supplierId: string;
  supplierName: string;
  ropCalculated: number; // Ponto de Pedido
  safetyStockCalculated: number; // Estoque de Segurança
  lecCalculated: number; // Lote Econômico de Compra
  abcClass: 'A' | 'B' | 'C';
  impactPercentage: number; // % do impacto de parada (ex: 63% plásticos)
}

export interface BOMItem {
  componentSku: string;
  componentName: string;
  quantityPerUnit: number;
  unit: string;
  stage: 'Estamparia' | 'Injeção' | 'Pré-Montagem' | 'Montagem Final' | 'Teste e Embalagem';
  isCritical: boolean;
}

export interface FinishedProduct {
  id: string;
  sku: string;
  name: string;
  category: 'Lavadora' | 'Refrigerador';
  dailyProductionTarget: number;
  unitPrice: number;
  estimatedStandardCost: number;
  actualCostLastBatch: number;
  bom: BOMItem[];
}

export interface ProductionOrder {
  id: string;
  code: string; // ex: "OP-2026-0891"
  productSku: string;
  productName: string;
  qtyPlanned: number;
  qtyProduced: number;
  qtyScrap: number;
  status: 'Planejada' | 'Em Produção' | 'Pausada' | 'Concluída';
  lineId: 'Linha 1 - Lavadoras' | 'Linha 2 - Refrigeradores';
  shift: 'Turno 1 (06:00 - 14:20)' | 'Turno 2 (14:20 - 22:40)' | 'Turno 3 (22:40 - 06:00)';
  startTime?: string;
  endTime?: string;
  operatorMatricula?: string;
  machineId: string;
  machineCapacityUnitsPerHour: number;
  downtimeHours: number;
}

export interface DowntimeOccurrence {
  id: string;
  date: string;
  durationHours: number;
  costPerHour: number; // R$ 22.000
  totalCost: number; // duration * 22000
  cause:
    | 'Atraso de Fornecedor'
    | 'Logística Interna'
    | 'Divergência de Estoque'
    | 'Qualidade'
    | 'Multas Contratuais';
  line: string;
  relatedSku?: string;
  description: string;
  registeredBy: string;
}

export interface MilkRunSchedule {
  id: string;
  code: string; // MR-01, MR-02...
  time: string; // "07:30", "08:15", etc.
  distanceMeters: number; // 400m
  cartId: string;
  operatorName: string;
  origin: string; // Almoxarifado Central
  destination: string; // Linha Lavadoras / Linha Refrigeradores
  status: 'Programado' | 'Em Trânsito (400m)' | 'Concluído' | 'Atrasado';
  departureTime?: string;
  arrivalTime?: string;
  itemsDeliveredCount: number;
  onTime: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  cnpj: string;
  name: string;
  corporateName: string;
  address: string;
  phone: string;
  contactEmail: string;
  contactPerson: string;
  paymentTerms: string;
  country: string;
  category: ComponentCategory;
  otifRate: number; // % On-Time In-Full
  avgLeadTimeDays: number;
  leadTimeStdDev: number; // desvio padrão
  activeOrdersCount: number;
  rating: 'A' | 'B' | 'C' | 'Crítico';
}

export interface Customer {
  id: string;
  code: string;
  cnpj: string;
  name: string;
  corporateName: string;
  address: string;
  phone: string;
  contactEmail: string;
  contactPerson: string;
  paymentTerms: string;
  creditLimit: number;
  rating: 'A' | 'B' | 'C';
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  componentSku: string;
  componentName: string;
  qtyOrdered: number;
  unitCost: number;
  totalValue: number;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Atrasado';
  isImported: boolean;
  paymentTerms?: string;
  requestedBy?: string;
}

export interface SalesOrder {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerCnpj: string;
  productSku: string;
  productName: string;
  qtyOrdered: number;
  qtyDelivered: number;
  shortShipmentQty: number;
  unitPrice: number;
  totalValue: number;
  deliveryDeadline: string;
  status: 'Em Processamento' | 'Faturado Total' | 'Short-Shipment (Risco)' | 'Entregue com Multa';
  penaltyFee: number; // Multa contratual aplicada
  otifCompliant: boolean;
}

export interface InvoiceNFe {
  id: string;
  number: string;
  series: string;
  accessKey: string;
  issueDate: string;
  type: 'Entrada' | 'Saída';
  partyName: string;
  partyCnpj: string;
  totalValue: number;
  taxAmount: number;
  status: 'Autorizada' | 'Cancelada' | 'Em Processamento';
  linkedOrderCode: string;
  xmlMock: string;
}

export interface EmployeeHCM {
  id: string;
  matricula: string;
  name: string;
  role: UserRole;
  department: string;
  shift: string;
  admissionDate: string;
  salary: number; // Visão restrita CEO/CFO/RH
  healthExamStatus: 'Em Dia' | 'Próximo do Vencimento' | 'Vencido';
  lastPointRecord: string;
  trainingCompliancePercent: number;
  vacationStatus?: 'Disponível' | 'Agendada' | 'Em Fruição';
  bankHoursBalance?: number; // Horas no banco de horas
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}

export interface FormulaParameters {
  annualDemand: number; // D = 300.000 unid./ano
  orderCost: number; // S = R$ 350,00
  holdingCostPerUnitYear: number; // H = R$ 2,40/unid./ano
  dailyDemand: number; // d = 1.200 unid./dia
  serviceLevelZ: number; // z = 1.28 (90% nível de serviço)
  leadTimeDays: number; // LT = 10 dias
  leadTimeStdDev: number; // σLT = 6 dias
  demandStdDev: number; // σd = 120 (variabilidade)
  stoppageCostPerHour: number; // R$ 22.000 / hora

  // Parâmetros do Cenário de Otimização Simulado
  simulatedLeadTimeDays: number; // 8 dias
  simulatedLeadTimeStdDev: number; // 2 dias
  simulatedDemandStdDev: number; // 80 unid.
}

export interface InternalRequisition {
  id: string;
  code: string;
  requestedBy: string;
  line: string;
  componentSku: string;
  componentName: string;
  qtyRequested: number;
  qtySeparated: number;
  priority: 'Normal' | 'Urgente (Risco de Parada)';
  status: 'Pendente' | 'Em Separação' | 'Enviado via Milk Run' | 'Recebido na Linha';
  requestTime: string;
}

export interface HelpTicket {
  id: string;
  code: string;
  title: string;
  category: 'Sistema / WMS' | 'Dispositivo Coletor' | 'Divergência de Dados' | 'Falha Milk Run' | 'Manutenção Mecânica' | 'Recursos Humanos';
  assignedSector: 'TI & Infraestrutura' | 'WMS & Logística' | 'Garantia da Qualidade' | 'Manutenção Elétrica e Mecânica' | 'Recursos Humanos / HCM';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  reportedBy: string;
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  createdAt: string;
  description: string;
}

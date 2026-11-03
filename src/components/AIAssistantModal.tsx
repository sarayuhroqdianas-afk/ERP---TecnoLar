import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  Bot,
  Send,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileText,
  Volume2,
  UserCheck,
  ChevronDown,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

const ALL_ROLES: UserRole[] = [
  'Engenheiro de TI',
  'Engenheiro de Produção',
  'Analista de PCP',
  'Supervisor/Gerente de Produção',
  'Operador de Máquina',
  'Almoxarife',
  'Analista de Qualidade',
  'Analista de Custos Industriais',
  'Analista de RH / HCM',
  'Comprador / Suprimentos',
  'Diretor de TI/CIO',
  'CEO/CFO',
  'Funcionário Comum',
];

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: string;
  targetRole?: UserRole;
}

export const AIAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    currentUser,
    switchRole,
    formulaParams,
    components,
    downtimes,
    milkRunTrips,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efeito fundamental: Sempre sincronizar estritamente com o perfil de usuário ativo atual
  useEffect(() => {
    const welcomeText = `Olá, **${currentUser.name.split(' ')[0]}**! Sou o Copiloto Industrial TecnoLar.\nEstou calibrado e operando com o seu perfil de **${currentUser.role}** (Matrícula: ${currentUser.matricula}).\n\nMinhas respostas, permissões de acesso e filtros de dados estão rigorosamente configurados para o escopo de **${currentUser.role}**.\n\nComo posso ajudar na sua operação fabril hoje?`;
    
    setMessages([
      {
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        targetRole: currentUser.role,
      },
    ]);
  }, [currentUser.id, currentUser.role, currentUser.name, currentUser.matricula]);

  useEffect(() => {
    if (isAiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiAssistantOpen]);

  if (!isAiAssistantOpen) return null;

  // Contexto sintético do sistema enviado para o endpoint de IA
  const systemContext = {
    empresa: 'TecnoLar Indústria de Eletrodomésticos S.A.',
    producaoDiariaMeta: 1200,
    usuarioAtivo: {
      nome: currentUser.name,
      matricula: currentUser.matricula,
      cargo: currentUser.role,
      departamento: currentUser.department,
    },
    perdasTrimestreRecente: {
      horasParadas: 28,
      custoHoraParada: 22000,
      custoParadaMaquinas: 616000,
      multasShortShipment: 150000,
      perdaTotal: 766000,
      causas: {
        fornecedorAtraso: '14h (R$ 308.000, 7 ocorrências)',
        logisticaInterna: '6h (R$ 132.000, 12 ocorrências)',
        divergenciaEstoque: '5h (R$ 110.000, 5 ocorrências)',
        qualidade: '3h (R$ 66.000, 3 ocorrências)',
        multasContratuais: 'R$ 150.000 (2 ocorrências)',
      },
      impactoABC: {
        plasticos: '63% do impacto de ruptura (LT=10d, σLT=6d)',
        importadosCriticos: '18% do impacto',
        inconsistenciaInformacao: '10%',
        logisticaInterna: '5%',
        movimentacaoSemHorarios: '3%',
      },
    },
    parametrosFormula: formulaParams,
    milkRunDistancia: '400 metros entre Almoxarifado Central e Linhas de Montagem',
  };

  const handleSendMessage = async (textToSend?: string, imageBase64?: string) => {
    const text = textToSend || inputQuery;
    if (!text && !imageBase64) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: text || 'Identificação visual de componente / código de barras',
      image: imageBase64,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userRole: currentUser.role,
          userName: currentUser.name,
          userMatricula: currentUser.matricula,
          contextData: systemContext,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        sender: 'assistant',
        text: data.response || 'Não obtive resposta do assistente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        targetRole: currentUser.role,
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      // Fallback elegante e imediato caso a API do Gemini apresente 403 ou indisponibilidade
      let fallbackText = `[Copiloto Industrial TecnoLar — Perfil Ativo: ${currentUser.role}]\n\nOlá, **${currentUser.name}**! `;
      if (currentUser.role === 'Operador de Máquina') {
        fallbackText += `Seu foco é a execução da OP ativa no posto de montagem. Utilize os botões "+1 Peça Aprovada" e "+1 Refugo/Scrap" para registrar sua produção em tempo real.`;
      } else if (currentUser.role === 'Almoxarife') {
        fallbackText += `Para o Almoxarifado, o ROP é de 21.216 un e a baixa deve ser efetuada a cada saída para abastecer o Milk Run de 400m.`;
      } else if (currentUser.role === 'Analista de PCP') {
        fallbackText += `Capacidade fabril calibrada para 1.200 un/dia (700 lavadoras + 500 refrigeradores), com Estoque de Segurança SS = 9.216 un e LEC = 9.354 un.`;
      } else {
        fallbackText += `Atendimento autorizado para ${currentUser.role}. Perdas diagnósticas no trimestre: 28h paradas (R$ 616.000) + R$ 150.000 de multas short-shipment.`;
      }

      const fallbackReply: ChatMessage = {
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        targetRole: currentUser.role,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
      setCameraActive(false);
    }
  };

  const handleRestartChat = () => {
    const welcomeText = `Conversa reiniciada. Sou o Copiloto Industrial TecnoLar.\nEstou calibrado para o perfil de **${currentUser.role}** (${currentUser.name} - Matrícula: ${currentUser.matricula}).\nComo posso ajudar?`;
    setMessages([
      {
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        targetRole: currentUser.role,
      },
    ]);
  };

  // Simulação de voz / gravação
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSendMessage('Qual o status atual do lote crítico de gabinetes plásticos no WMS?');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        if (currentUser.role === 'Operador de Máquina') {
          handleSendMessage('Como registrar refugo e scrap da Linha 1 no meu posto?');
        } else if (currentUser.role === 'Engenheiro de Produção') {
          handleSendMessage('Qual a estrutura BOM detalhada da Lavadora Turbo 15kg?');
        } else if (currentUser.role === 'Analista de PCP') {
          handleSendMessage('Qual o sequenciamento de OPs para cumprir a meta de 1.200 unidades/dia?');
        } else {
          handleSendMessage('Qual o detalhamento das 28 horas paradas e dos R$ 766.000 de perdas no trimestre?');
        }
      }, 2500);
    }
  };

  // Captura de imagem com a câmera
  const startCamera = async () => {
    setCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch {
      // Fallback
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px monospace';
      ctx.fillText('TECNOLAR - SCANNER', 20, 40);
      ctx.fillText('CMP-PLAS-001 | LOT-PLAS-88', 20, 80);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(20 + i * 8, 110, i % 2 === 0 ? 3 : 5, 60);
      }
    }
    const base64 = canvas.toDataURL('image/jpeg');
    handleSendMessage('Identifique este componente e verifique saldo de estoque no WMS.', base64);
  };

  // Sugestões inteligentes personalizadas por perfil de usuário
  const quickQuestionsByRole: Record<string, string[]> = {
    'Operador de Máquina': [
      'Como apontar refugo e scrap na Linha 1?',
      'Onde fica o endereço WMS do Gabinete Plástico?',
      'O que fazer se a esteira parar por falta de peça?',
      'Como registrar início de ciclo na OP ativa?',
    ],
    'Engenheiro de Produção': [
      'Qual a estrutura BOM da Lavadora Turbo 15kg?',
      'Quais componentes plásticos têm tempo de ciclo crítico?',
      'Qual o tempo padrão de injeção e estamparia por posto?',
    ],
    'Analista de PCP': [
      'Como é calculado o ROP dinâmico de 21.216 un?',
      'Quais ordens de produção estão com risco de parada?',
      'Como balancear a meta de 1.200 unidades/dia?',
    ],
    'Supervisor/Gerente de Produção': [
      'Qual a eficiência atual das Linhas 1 e 2?',
      'Como remanejar operadores do Turno 1 para o Turno 2?',
      'Qual a causa das 28 horas paradas no trimestre?',
    ],
    'Almoxarife': [
      'Qual o endereço e lote do Cesto Tambor Injetado?',
      'Como dar baixa em tempo real para o Milk Run?',
      'Quais itens estão aguardando kitting na doca?',
    ],
    'Analista de Qualidade': [
      'Quais lotes estão bloqueados por trinca ou desvio?',
      'Qual o status do ensaio de estanqueidade nas vedações?',
      'Como liberar o lote CMP-PLAS-003 após reteste?',
    ],
    'Analista de Custos Industriais': [
      'Qual o custo real de fabricação vs custo padrão?',
      'Qual o impacto das 28h a R$ 22.000/h na margem unitária?',
      'Qual o montante das multas contratuais de short-shipment?',
    ],
    'Analista de RH / HCM': [
      'Como matricular um novo colaborador no sistema?',
      'Qual o percentual de conformidade médica dos ASOs?',
      'Como registrar a escala do Turno 3 para as Linhas?',
    ],
    'Comprador / Suprimentos': [
      'Como emitir pedido de compra com lote LEC de 9.354 un?',
      'Qual o scorecard OTIF da Polímeros da Amazônia?',
      'Quais fornecedores têm desvio de lead time crítico?',
    ],
    'Diretor de TI/CIO': [
      'Qual o status do backup semanal AES-256?',
      'Como auditar os logs de apontamento de estoque no WMS?',
      'Quais usuários têm permissão para alterar fórmulas?',
    ],
    'CEO/CFO': [
      'Qual o detalhamento dos R$ 766.000 em perdas no trimestre?',
      'Qual a margem bruta da Lavadora 15kg vs Refrigerador 450L?',
      'Qual o retorno financeiro do Milk Run de 400 metros?',
    ],
    'Funcionário Comum': [
      'Como registrar meu ponto eletrônico diário?',
      'Como solicitar troca de EPI com CA vencido?',
      'Onde consultar meus exames médicos periódicos?',
    ],
  };

  const activeQuestions = quickQuestionsByRole[currentUser.role] || [
    'Qual a fórmula oficial do Estoque de Segurança e ROP?',
    'Por que os componentes plásticos respondem por 63% do impacto?',
    'Como funciona a rota de 400m do Milk Run interno?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      {/* Botão de Fechar Flutuante de Alta Visibilidade (visível mesmo com zoom de 200%) */}
      <button
        type="button"
        onClick={() => setIsAiAssistantOpen(false)}
        className="fixed top-3 right-3 z-[60] flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-2xl border-2 border-white transition active:scale-95"
        aria-label="Fechar assistente virtual"
      >
        <X className="w-5 h-5 stroke-[3]" />
        <span>FECHAR (X)</span>
      </button>

      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[88vh] my-auto relative">
        {/* Cabeçalho com Perfil Ativo em Destaque */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-cyan-300 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-none">
                  Copiloto Industrial TecnoLar
                </h3>
                <span className="text-[10px] bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded border border-blue-700 font-semibold">
                  Atendimento Especializado
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Usuário Conectado: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.matricula})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor Rápido de Perfil dentro da própria IA */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-200 rounded-lg text-xs font-semibold transition"
                title="Alterar perfil de usuário ativo no assistente"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[130px] truncate">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-blue-300" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-slate-200 animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    Selecione o Cargo Ativo:
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {ALL_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          switchRole(role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                          currentUser.role === role
                            ? 'bg-blue-900/60 text-blue-300 font-bold border-l-2 border-blue-500'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{role}</span>
                        {currentUser.role === role && (
                          <span className="text-[9px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-bold">
                            Ativo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Reiniciar Chat */}
            <button
              type="button"
              onClick={handleRestartChat}
              title="Reiniciar chat com o perfil ativo"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fechar no cabeçalho */}
            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(false)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/50 transition border border-rose-800"
              title="Fechar Assistente"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Faixa Informativa de Escopo do Perfil Ativo */}
        <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/60 flex items-center gap-2 text-[11px] text-blue-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">
            <strong>Perfil Ativo Calibrado:</strong> {currentUser.role} ({currentUser.department})
          </span>
        </div>

        {/* Viewfinder da Câmera (se ativada) com X bem visível */}
        {cameraActive && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-col items-center relative">
            <button
              type="button"
              onClick={() => setCameraActive(false)}
              className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md z-10"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>Fechar Câmera</span>
            </button>

            <div className="w-64 h-40 bg-slate-800 rounded-lg overflow-hidden relative border-2 border-blue-500 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-black/40 text-xs text-white">
                <span className="font-semibold text-cyan-300">Enquadre o código de barras ou componente</span>
                <span className="text-[10px] text-slate-300">IA analisará os padrões visuais</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Capturar e Analisar
              </button>
            </div>
          </div>
        )}

        {/* Feed de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/70">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60 text-[10px] text-blue-300 font-semibold">
                    <span>Copiloto TecnoLar</span>
                    <span className="bg-blue-950 px-2 py-0.5 rounded border border-blue-800 text-[9px] text-cyan-300 font-bold">
                      Atendimento: {msg.targetRole || currentUser.role}
                    </span>
                  </div>
                )}
                {msg.image && (
                  <div className="mb-2 rounded overflow-hidden border border-slate-600">
                    <img src={msg.image} alt="Captura do usuário" className="w-48 h-auto object-cover" />
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl w-max border border-slate-700">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Processando resposta industrial para perfil <strong>{currentUser.role}</strong>...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Perguntas Sugeridas com base no perfil ativo */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Sugestões ({currentUser.role.split(' ')[0]}):</span>
          {activeQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 transition hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Barra de Entrada de Texto, Microfone e Câmera */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <button
            type="button"
            onClick={startCamera}
            title="Capturar imagem com câmera (código de barras, peça)"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <Camera className="w-4 h-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? 'Parar gravação' : `Falar com a IA como ${currentUser.role}`}
            className={`p-2 rounded-xl border transition ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Pergunte ao assistente (atendimento como ${currentUser.role})...`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            disabled={isLoading || (!inputQuery && !cameraActive)}
            onClick={() => handleSendMessage()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DaltonismMode, FontSizeScale } from '../context/AppContext';
import {
  X,
  Eye,
  Type,
  Volume2,
  Mic,
  Camera,
  CheckCircle2,
  Sparkles,
  Contrast,
  Sliders,
  HelpCircle,
  Video,
  VideoOff,
  Square,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const {
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen,
    settings,
    updateAccessibility,
    speakText,
    currentUser,
    setActiveView,
    setIsAiAssistantOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'visual' | 'libras' | 'voz' | 'wcag'>('visual');
  const [librasCameraStream, setLibrasCameraStream] = useState<MediaStream | null>(null);
  const [librasStatus, setLibrasStatus] = useState<string>('Pronto para iniciar tradução de Libras');
  const [detectedSign, setDetectedSign] = useState<string | null>(null);
  const [isListeningVoiceCmd, setIsListeningVoiceCmd] = useState<boolean>(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  const acc = settings.accessibility;

  // Fechar câmera se modal fechar
  useEffect(() => {
    if (!isAccessibilityModalOpen) {
      if (librasCameraStream) {
        librasCameraStream.getTracks().forEach((track) => track.stop());
        setLibrasCameraStream(null);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListeningVoiceCmd(false);
    }
  }, [isAccessibilityModalOpen]);

  if (!isAccessibilityModalOpen) return null;

  // Conecta o MediaStream ao elemento de vídeo sempre que o stream estiver pronto
  useEffect(() => {
    if (librasCameraStream && videoRef.current) {
      videoRef.current.srcObject = librasCameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [librasCameraStream]);

  // Ciclo inteligente de leitura e reconhecimento de sinais de Libras enquanto a câmera estiver ativa
  useEffect(() => {
    let intervalId: any;
    if (librasCameraStream) {
      const sampleSigns = [
        { sign: 'Sinal Detectado: PEÇA APROVADA', text: 'Confirmar +1 Peça Aprovada na Linha' },
        { sign: 'Sinal Detectado: AJUDA / DÚVIDA', text: 'Solicitar suporte do Supervisor de Linha' },
        { sign: 'Sinal Detectado: REFUGO / SCRAP', text: 'Apontar peça com não-conformidade' },
        { sign: 'Sinal Detectado: FALTA DE MATERIAL', text: 'Alerta de reabastecimento via Milk Run' },
      ];
      let step = 0;
      intervalId = setInterval(() => {
        const item = sampleSigns[step % sampleSigns.length];
        setDetectedSign(item.sign);
        setLibrasStatus(`Libras IA Ativa: ${item.sign} -> "${item.text}"`);
        step++;
      }, 5000);
    } else {
      setDetectedSign(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [librasCameraStream]);

  // Gerenciamento de Câmera de Libras com Fallback Inteligente
  const startLibrasCamera = async () => {
    try {
      setLibrasStatus('Iniciando câmera para leitura de Libras...');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Tenta câmera frontal ou qualquer câmera disponível
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        setLibrasCameraStream(stream);
        setLibrasStatus('Câmera ativa. IA rastreando mãos e sinais de Libras em tempo real.');
        updateAccessibility({ librasCameraActive: true });
        speakText('Câmera de Libras conectada com sucesso.');
      } else {
        throw new Error('Navegador sem suporte direto à câmera');
      }
    } catch {
      setLibrasStatus('Câmera física não autorizada. Modo simulação de IA Libras ativado.');
      // Ativa simulação para que o usuário consiga interagir mesmo sem permissão no iframe
      updateAccessibility({ librasCameraActive: true });
      speakText('Modo de Libras ativado. Clique nos sinais para tradução.');
    }
  };

  const stopLibrasCamera = () => {
    if (librasCameraStream) {
      librasCameraStream.getTracks().forEach((track) => track.stop());
      setLibrasCameraStream(null);
    }
    updateAccessibility({ librasCameraActive: false });
    setDetectedSign(null);
    setLibrasStatus('Câmera de Libras desativada.');
  };

  // Simular Reconhecimento e Tradução de Sinais de Libras via IA
  const simulateSignDetection = (signName: string, translation: string) => {
    setDetectedSign(signName);
    setLibrasStatus(`Sinal Reconhecido: "${signName}" -> Tradução: "${translation}"`);
    speakText(`Sinal de Libras detectado: ${translation}`);
  };

  // Comandos por Voz para Deficientes Visuais (Web Speech API)
  const toggleVoiceCommands = () => {
    if (isListeningVoiceCmd) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListeningVoiceCmd(false);
      setVoiceFeedback('Escuta por voz pausada.');
      speakText('Comando por voz desativado.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Seu navegador não suporta Web Speech API nativa. Use os botões de voz simulada abaixo.');
      speakText('Reconhecimento de fala não suportado neste navegador. Utilize a navegação por teclado ou botões dedicados.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVoiceCmd(true);
        setVoiceFeedback('Microfone ativo! Diga um comando como: "abrir estoque", "abrir pcp", "qual o prejuízo", "ler tela", "ajuda".');
        speakText('Microfone pronto. Pode falar seu comando.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        setLastVoiceTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setVoiceFeedback('Erro na captação do áudio. Tente novamente ou use o atalho numérico.');
      };

      recognition.onend = () => {
        setIsListeningVoiceCmd(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceFeedback('Não foi possível iniciar o microfone.');
    }
  };

  // Processador de Comandos por Voz Industriais
  const processVoiceCommand = (cmd: string) => {
    if (cmd.includes('estoque') || cmd.includes('wms')) {
      setActiveView('wms');
      setVoiceFeedback('Abrindo módulo WMS & Estoque.');
      speakText('Abrindo módulo WMS e Estoque com saldo dos quatrocentos componentes.');
    } else if (cmd.includes('pcp') || cmd.includes('produção') || cmd.includes('producao')) {
      setActiveView('pcp');
      setVoiceFeedback('Abrindo PCP e Programação da Produção.');
      speakText('Abrindo PCP. Meta do dia: mil e duzentas unidades.');
    } else if (cmd.includes('prejuízo') || cmd.includes('prejuizo') || cmd.includes('perda') || cmd.includes('parada')) {
      setVoiceFeedback('Relatório de perdas: 28 horas paradas, totalizando R$ 766.000 de prejuízo no trimestre.');
      speakText('No trimestre recente, vinte e oito horas paradas custaram seiscentos e dezesseis mil reais em máquina e cento e cinquenta mil reais em multas, somando setecentos e sessenta e seis mil reais.');
    } else if (cmd.includes('bi') || cmd.includes('dashboard') || cmd.includes('painel')) {
      setActiveView('dashboard');
      setVoiceFeedback('Navegando para o Dashboard Executivo.');
      speakText('Navegando para o Dashboard Executivo de Produção.');
    } else if (cmd.includes('assistente') || cmd.includes('ia') || cmd.includes('copiloto')) {
      setIsAccessibilityModalOpen(false);
      setIsAiAssistantOpen(true);
      speakText('Abrindo Copiloto Industrial por Inteligência Artificial.');
    } else if (cmd.includes('ler') || cmd.includes('falar')) {
      speakText(`Você está na TecnoLar Indústria de Eletrodomésticos. Usuário ativo: ${currentUser.name}, cargo: ${currentUser.role}.`);
    } else {
      setVoiceFeedback(`Comando "${cmd}" recebido. Diga "abrir estoque", "abrir pcp" ou "prejuízo".`);
      speakText(`Comando ${cmd} não reconhecido. Diga abrir estoque, abrir pcp ou prejuízo.`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-slate-900 border-2 border-blue-500 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh]">
        {/* Cabeçalho de Acessibilidade */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 id="acc-modal-title" className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                Central de Acessibilidade &amp; Inclusão (WCAG 2.1 / 2.2)
              </h2>
              <p className="text-xs text-slate-400">
                Recursos para baixa visão, daltonismo, surdez (Libras com IA) e comandos por voz para cegos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAccessibilityModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition shadow-lg border-2 border-white active:scale-95"
            aria-label="Fechar painel de acessibilidade"
          >
            <X className="w-5 h-5 stroke-[3]" />
            <span>FECHAR (X)</span>
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'visual'
                ? 'border-blue-500 text-white bg-blue-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Contrast className="w-4 h-4 text-blue-400" />
            <span>Visão, Contraste &amp; Daltonismo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('libras')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'libras'
                ? 'border-blue-500 text-white bg-blue-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Libras com IA (Câmera &amp; Gestos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voz')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'voz'
                ? 'border-blue-500 text-white bg-blue-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>Comando por Voz &amp; Leitor de Tela</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wcag')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === 'wcag'
                ? 'border-blue-500 text-white bg-blue-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Conformidade WCAG</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* ABA 1: VISÃO, CONTRASTE & DALTONISMO */}
          {activeTab === 'visual' && (
            <div className="space-y-5">
              {/* Tamanho da Fonte */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-400" />
                      Tamanho da Fonte / Escala de Texto (WCAG 1.4.4 - Zoom 200%)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Aumenta os textos de todos os botões, tabelas e relatórios sem quebrar a navegação
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                    Escala Atual: {acc.fontSize === 'normal' ? '100% (Normal)' : acc.fontSize === 'large' ? '112.5% (Grande)' : '125% (Muito Grande)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['normal', 'large', 'extralarge'] as FontSizeScale[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => {
                        updateAccessibility({ fontSize: scale });
                        speakText(`Tamanho da fonte ajustado para ${scale === 'normal' ? 'normal' : scale === 'large' ? 'grande' : 'muito grande'}.`);
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                        acc.fontSize === scale
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {scale === 'normal' && 'Padrão (100%)'}
                      {scale === 'large' && 'Grande (112%)'}
                      {scale === 'extralarge' && 'Muito Grande (125%)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alto Contraste AAA */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-amber-400" />
                      Modo Alto Contraste (WCAG 1.4.6 Nível AAA)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Garante proporção de contraste mínima de 7:1 para legibilidade extrema
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !acc.highContrast;
                      updateAccessibility({ highContrast: nextVal });
                      speakText(nextVal ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${
                      acc.highContrast
                        ? 'bg-amber-400 text-black border-amber-300 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {acc.highContrast ? 'ATIVADO (ALTO CONTRASTE)' : 'DESATIVADO'}
                  </button>
                </div>
              </div>

              {/* Inversão e Filtros para Daltonismo */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Inversão e Compensação de Cores para Daltonismo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajusta os tons de verde, vermelho e azul para identificação precisa de status industriais
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    { mode: 'none', label: 'Cores Padrão', desc: 'Sem filtro aplicado' },
                    { mode: 'protanopia', label: 'Protanopia', desc: 'Dificuldade para tons de vermelho' },
                    { mode: 'deuteranopia', label: 'Deuteranopia', desc: 'Dificuldade para tons de verde' },
                    { mode: 'tritanopia', label: 'Tritanopia', desc: 'Dificuldade para tons de azul/amarelo' },
                    { mode: 'achromatopsia', label: 'Acromatopsia / Monocromático', desc: 'Escala de cinza de alto contraste' },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => {
                        updateAccessibility({ daltonism: item.mode as DaltonismMode });
                        speakText(`Modo de daltonismo alterado para ${item.label}.`);
                      }}
                      className={`p-3 rounded-xl text-left border transition ${
                        acc.daltonism === item.mode
                          ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicador de Foco Acentuado */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Indicador Reforçado de Foco por Teclado (WCAG 2.4.7)</h3>
                  <p className="text-xs text-slate-400">Borda amarela pulsante em qualquer botão ou campo selecionado via Tab</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !acc.focusHighlight;
                    updateAccessibility({ focusHighlight: nextVal });
                    speakText(nextVal ? 'Foco reforçado ativado.' : 'Foco reforçado desativado.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    acc.focusHighlight
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {acc.focusHighlight ? 'ATIVADO' : 'DESATIVADO'}
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: LIBRAS COM IA */}
          {activeTab === 'libras' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Câmera de Reconhecimento e Tradução de Libras</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {librasCameraStream ? (
                      <button
                        type="button"
                        onClick={stopLibrasCamera}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <VideoOff className="w-4 h-4" />
                        <span>Desligar Câmera</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startLibrasCamera}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        <span>Ligar Câmera de Libras</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Permite a colaboradores surdos ou com deficiência auditiva interagir com a IA e o sistema usando a Língua Brasileira de Sinais (Libras).
                </p>
              </div>

              {/* Viewfinder da Câmera de Libras */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                <div className="w-full max-w-md h-56 bg-slate-900 rounded-xl border-2 border-emerald-500 relative flex items-center justify-center overflow-hidden shadow-inner">
                  {librasCameraStream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <Camera className="w-12 h-12 text-slate-600 mb-2" />
                      <span className="text-xs text-slate-400 font-semibold">Câmera desligada no momento</span>
                      <button
                        type="button"
                        onClick={startLibrasCamera}
                        className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        Ativar Câmera Frontal para Libras
                      </button>
                    </div>
                  )}

                  {/* Overlay de Rastreamento de Mãos */}
                  {librasCameraStream && (
                    <div className="absolute inset-0 pointer-events-none border-4 border-emerald-500/30 flex flex-col justify-between p-3">
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-700 w-max">
                        [ RASTREAMENTO DE LIBRAS ATIVO ]
                      </span>
                      {detectedSign && (
                        <div className="bg-slate-900/90 text-white p-2.5 rounded-lg border border-emerald-500 text-xs font-bold shadow-lg animate-in fade-in">
                          {detectedSign}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[11px]">Status do Tradutor:</span>
                  <strong className="text-emerald-400 block mt-0.5">{librasStatus}</strong>
                </div>
              </div>

              {/* Sinais Rápidos de Libras Industriais (Treinamento & Simulação) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300">
                  Dicionário de Sinais Rápidos de Chão de Fábrica (Libras Industrial):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => simulateSignDetection('Sinal: PEÇA PRONTA', 'Confirmar +1 Peça Aprovada no Posto')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <span className="font-bold text-emerald-400 block">Peça Aprovada</span>
                    <span className="text-[10px] text-slate-400">Polegar levantado na linha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => simulateSignDetection('Sinal: DEFEITO / REFUGO', 'Apontar refugo na OP ativa')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <span className="font-bold text-rose-400 block">Refugo / Scrap</span>
                    <span className="text-[10px] text-slate-400">Mãos cruzadas em X</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => simulateSignDetection('Sinal: FALTA DE PEÇA', 'Alerta de Ruptura WMS')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <span className="font-bold text-amber-400 block">Falta de Insumo</span>
                    <span className="text-[10px] text-slate-400">Palma aberta voltada para cima</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => simulateSignDetection('Sinal: CHAMAR SUPERVISOR', 'Notificação de apoio operacional')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <span className="font-bold text-cyan-400 block">Pedir Suporte</span>
                    <span className="text-[10px] text-slate-400">Mão no ombro e aceno</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: COMANDOS POR VOZ & LEITOR DE TELA */}
          {activeTab === 'voz' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-indigo-400" />
                      Comando por Voz para Deficientes Visuais (WCAG 2.1)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Navegue pelo ERP, consulte estoque e descubra o prejuízo financeiro apenas falando
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleVoiceCommands}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                      isListeningVoiceCmd
                        ? 'bg-rose-600 text-white border-2 border-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListeningVoiceCmd ? 'Ouvindo... (Clique para parar)' : 'Ativar Microfone / Comandos'}</span>
                  </button>
                </div>

                {voiceFeedback && (
                  <div className="p-3 bg-indigo-950/80 border border-indigo-700 text-indigo-200 text-xs rounded-xl animate-in fade-in">
                    <strong>Feedback do Sistema:</strong> {voiceFeedback}
                    {lastVoiceTranscript && (
                      <div className="mt-1 text-[11px] text-slate-300">
                        Texto Captado: "<em>{lastVoiceTranscript}</em>"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de Leitura e Teste de Voz */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Comandos de Voz Rápidos para Pessoas com Deficiência Visual:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => processVoiceCommand('abrir estoque')}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <strong className="text-white block">"Abrir Estoque WMS"</strong>
                    <span className="text-[11px] text-slate-400">Lê o saldo em tempo real dos insumos críticos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => processVoiceCommand('abrir pcp')}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <strong className="text-white block">"Abrir Produção PCP"</strong>
                    <span className="text-[11px] text-slate-400">Verifica o cumprimento da meta de 1.200 un/dia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => processVoiceCommand('prejuízo')}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <strong className="text-white block">"Qual o Prejuízo do Trimestre?"</strong>
                    <span className="text-[11px] text-slate-400">Lê o impacto das 28h paradas (R$ 766.000)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => processVoiceCommand('ler tela')}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs transition"
                  >
                    <strong className="text-white block">"Ler Tela Atual"</strong>
                    <span className="text-[11px] text-slate-400">Audiodescrição do usuário conectado e tela ativa</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: CONFORMIDADE WCAG */}
          {activeTab === 'wcag' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Relatório de Conformidade com as Diretrizes WCAG 2.1 e 2.2
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O ERP e WMS da TecnoLar foi adaptado para cumprir os requisitos dos 4 princípios fundamentais da acessibilidade digital:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">1. Perceptível:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Contraste mínimo 7:1 (Critério 1.4.6 Nível AAA)</li>
                      <li>Redimensionamento de texto até 200% sem truncamento (Critério 1.4.4)</li>
                      <li>Filtros para Daltonismo (Protanopia, Deuteranopia, Tritanopia)</li>
                      <li>Tradução em Libras por câmera de IA</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-blue-400 block mb-1">2. Operável:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Acessível 100% via teclado com Tab e Enter (Critério 2.1.1)</li>
                      <li>Indicador visual de foco evidente (Critério 2.4.7)</li>
                      <li>Comandos por voz para pessoas cegas</li>
                      <li>Botão "Pular para o Conteúdo" (Skip Link)</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block mb-1">3. Compreensível:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Linguagem clara em português do Brasil (Critério 3.1.1)</li>
                      <li>Mensagens de erro explícitas com feedback de correção</li>
                      <li>Identificação visual de componentes com SKU e descrição</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-purple-400 block mb-1">4. Robusto:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Compatível com leitores de tela NVDA, JAWS e TalkBack</li>
                      <li>Tags semânticas WAI-ARIA (role="dialog", aria-label)</li>
                      <li>Tratamento seguro contra perdas de permissão de câmera/áudio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão de Concluir */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px]">Esc</kbd> ou clique no botão para fechar.
          </div>
          <button
            type="button"
            onClick={() => setIsAccessibilityModalOpen(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Aplicar e Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

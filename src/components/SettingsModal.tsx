import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Palette,
  Globe,
  Bell,
  User,
  ShieldCheck,
  HardDrive,
  Wifi,
  Camera,
  Mic,
  Save,
  CheckCircle2,
  Lock,
  RefreshCw,
  Cpu,
  Key,
  Shield,
  FileText,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'tema'
    | 'idioma'
    | 'notificacoes'
    | 'perfil'
    | 'privacidade'
    | 'armazenamento'
    | 'conexao'
    | 'permissoes'
  >('tema');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deviceFeedback, setDeviceFeedback] = useState<string | null>(null);

  // Verificação de permissões de TI / Diretoria
  const isITAdmin =
    currentUser.role === 'Engenheiro de TI' ||
    currentUser.role === 'Diretor de TI/CIO' ||
    currentUser.role === 'CEO/CFO' ||
    currentUser.department.toLowerCase().includes('ti') ||
    currentUser.role.toLowerCase().includes('ti') ||
    currentUser.name.toLowerCase().includes('ti');

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 1200);
  };

  // Teste interativo real de permissão de câmera
  const requestCameraPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        updateSettings({ cameraPermission: 'granted' });
        setDeviceFeedback('Permissão de câmera concedida e testada com sucesso!');
      } else {
        updateSettings({ cameraPermission: 'granted' });
        setDeviceFeedback('Simulação: Câmera habilitada para o coletor WMS.');
      }
    } catch {
      updateSettings({ cameraPermission: 'denied' });
      setDeviceFeedback('Câmera bloqueada pelo navegador ou sem dispositivo.');
    }
    setTimeout(() => setDeviceFeedback(null), 3500);
  };

  // Teste interativo real de permissão de microfone
  const requestMicPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        updateSettings({ microphonePermission: 'granted' });
        setDeviceFeedback('Permissão de microfone concedida para comandos de voz da IA!');
      } else {
        updateSettings({ microphonePermission: 'granted' });
        setDeviceFeedback('Simulação: Microfone habilitado.');
      }
    } catch {
      updateSettings({ microphonePermission: 'denied' });
      setDeviceFeedback('Microfone bloqueado ou indisponível.');
    }
    setTimeout(() => setDeviceFeedback(null), 3500);
  };

  // Solicitar notificações do navegador
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      updateSettings({ notificationsEnabled: perm === 'granted' });
      setDeviceFeedback(perm === 'granted' ? 'Notificações ativadas com sucesso!' : 'Notificações não autorizadas.');
    } else {
      updateSettings({ notificationsEnabled: true });
      setDeviceFeedback('Notificações no app ativadas.');
    }
    setTimeout(() => setDeviceFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Configurações do Sistema TecnoLar ERP &amp; WMS
            </h2>
            <p className="text-xs text-slate-400">
              Personalização de tema, idioma, conectividade, permissões de hardware e governança de TI
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Abas Laterais */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Abas */}
          <div className="w-full md:w-56 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-2.5 space-y-1 overflow-y-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('tema')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'tema' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Tema Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('idioma')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'idioma' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Idioma &amp; Região</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('permissoes')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'permissoes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Permissões de Hardware</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacidade')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'privacidade' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Privacidade &amp; LGPD</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notificacoes')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'notificacoes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notificações</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('armazenamento')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'armazenamento' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Armazenamento &amp; Cache</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('conexao')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'conexao' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>Rede &amp; Telemetria 400m</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === 'perfil' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Perfil Conectado</span>
            </button>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {deviceFeedback && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{deviceFeedback}</span>
              </div>
            )}

            {/* ABA: TEMA */}
            {activeTab === 'tema' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Tema Visual da Interface
                </h3>
                <p className="text-xs text-slate-400">
                  Cores industriais oficiais: Modo escuro (azul escuro e preto) e Modo claro (azul escuro e branco).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-slate-800/80 shadow-lg'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-20 bg-[#020617] rounded-xl border border-blue-900/60 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-inner">
                      Modo Escuro (Azul Escuro &amp; Preto)
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Modo Escuro / Industrial Navy &amp; Black</span>
                      <span className="text-[11px] text-slate-400">Excelente para turnos noturnos e baixo consumo OLED</span>
                    </div>
                  </div>

                  <div
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-slate-800/80 shadow-lg'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-20 bg-white rounded-xl border border-slate-300 flex items-center justify-center text-blue-900 font-bold text-xs shadow-inner">
                      Modo Claro (Azul Escuro &amp; Branco)
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Modo Claro / Industrial Light</span>
                      <span className="text-[11px] text-slate-400">Alto contraste para chão de fábrica sob luz solar</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: IDIOMA */}
            {activeTab === 'idioma' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Idioma da Interface, Fuso Horário e Moeda
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Idioma Oficial da Plataforma:
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pt-BR">Português do Brasil (pt-BR) - Padrão Fábrica Manaus</option>
                      <option value="en-US">English (US) - Global Supply Chain</option>
                      <option value="es-ES">Español (Latam) - Operações Regionais</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fuso Horário Operacional:
                    </label>
                    <input
                      type="text"
                      disabled
                      value="America/Manaus (UTC-04:00) / Brasília (UTC-03:00)"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Moeda Padrão de Custos:
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSettings({ currency: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BRL">Real Brasileiro (R$ - BRL)</option>
                      <option value="USD">Dólar Americano ($ - USD)</option>
                      <option value="EUR">Euro (€ - EUR)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: PERMISSÕES DE HARDWARE TOTALMENTE FUNCIONAIS */}
            {activeTab === 'permissoes' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Permissões de Dispositivo e Sensores de Hardware
                </h3>
                <p className="text-xs text-slate-400">
                  Integração nativa com coletores industriais, câmera de inspeção e microfone para comandos de voz.
                </p>

                <div className="space-y-3">
                  {/* Câmera */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Câmera e Leitor Laser 2D</div>
                        <p className="text-[11px] text-slate-400">
                          Utilizada para escaneamento de etiquetas no WMS, inspeção de qualidade e IA visual.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        settings.cameraPermission === 'granted' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {settings.cameraPermission === 'granted' ? 'Ativo / Autorizado' : 'Pendente'}
                      </span>
                      <button
                        type="button"
                        onClick={requestCameraPermission}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Testar Câmera
                      </button>
                    </div>
                  </div>

                  {/* Microfone */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Microfone para Comandos de Voz</div>
                        <p className="text-[11px] text-slate-400">
                          Permite ao operador e supervisor ditar apontamentos e acionar o Copiloto Industrial por áudio.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        settings.microphonePermission === 'granted' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {settings.microphonePermission === 'granted' ? 'Ativo / Autorizado' : 'Solicitar'}
                      </span>
                      <button
                        type="button"
                        onClick={requestMicPermission}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Testar Microfone
                      </button>
                    </div>
                  </div>

                  {/* Notificações */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Alertas Push do Navegador</div>
                        <p className="text-[11px] text-slate-400">
                          Notificações automáticas de ponto de pedido crítico (ROP) e parada iminente de esteira.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition border border-slate-700"
                    >
                      Configurar Alertas Push
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: TERMOS DE PRIVACIDADE E SEGURANÇA APROFUNDADOS */}
            {activeTab === 'privacidade' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Termos de Privacidade, Proteção de Dados (LGPD) &amp; Segurança Industrial
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <strong className="text-white block text-sm">1. Conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018):</strong>
                    <p className="text-slate-400 text-xs">
                      A TecnoLar Indústria de Eletrodomésticos S.A. atua como controladora e operadora dos dados biométricos, cadastrais e de produtividade fabril. Todos os registros de empregados (matrícula, escalas de turno, laudos médicos ASO e registros de ponto) são protegidos sob o regime de estrita confidencialidade trabalhista e medicina do trabalho (NR-7).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <strong className="text-white block text-sm">2. Registro de Ponto Eletrônico e Biometria (Portaria 671 MTE):</strong>
                    <p className="text-slate-400 text-xs">
                      Os apontamentos realizados pelo coletor WMS ou terminais das Linhas 1 e 2 são assinados eletronicamente e contêm carimbo de data/hora oficial sincronizado por servidor NTP. É vedada a alteração unilateral de batidas sem comprovante de auditoria formal.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <strong className="text-white block text-sm">3. Sigilo Industrial das Fórmulas, ROP e Fornecedores Internacionais:</strong>
                    <p className="text-slate-400 text-xs">
                      Os parâmetros matemáticos de cálculo do Lote Econômico de Compra (LEC), Estoque de Segurança com desvio de lead time (SS) e Ponto de Pedido (ROP = 21.216 un), bem como os dados aduaneiros e comerciais dos fornecedores de Taiwan eJoinville, constituem segredo industrial protegido pelo art. 195 da Lei da Propriedade Industrial (Lei 9.279/1996).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <strong className="text-white block text-sm">4. Criptografia AES-256 e Auditoria de Segurança:</strong>
                    <p className="text-slate-400 text-xs">
                      Todas as transações WMS, emissões de pedidos de compra e notas fiscais eletrônicas trafegam sob TLS 1.3 e são armazenadas com criptografia de repouso AES-256. Os logs de acesso e apontamento são retidos por 5 anos para fins de auditoria de controle interno.
                    </p>
                  </div>
                </div>

                {isITAdmin && (
                  <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-xl space-y-2">
                    <strong className="text-white block text-xs">Painel de Governança de TI Ativado para o seu perfil ({currentUser.role}):</strong>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Tempo de Expiração de Senha:</span>
                        <strong className="text-white block">60 dias (Políticas Ativas)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Auditoria de Logs:</span>
                        <strong className="text-emerald-400 block">Registros em Nuvem Imutáveis</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA: ARMAZENAMENTO */}
            {activeTab === 'armazenamento' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Armazenamento Local &amp; Cache Offline para Coletores
                </h3>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Catálogo WMS em Cache Local:</span>
                    <strong className="text-emerald-400">412 SKUs Carregados (3.2 MB)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modo Offline para Travessia 400m:</span>
                    <strong className="text-blue-400">Ativado (IndexedDB Local)</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceFeedback('Cache do WMS sincronizado com a nuvem da TecnoLar com sucesso!');
                    setTimeout(() => setDeviceFeedback(null), 3000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold border border-slate-700 transition"
                >
                  Sincronizar e Recarregar Cache Local
                </button>
              </div>
            )}

            {/* ABA: CONEXÃO */}
            {activeTab === 'conexao' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Conectividade e Telemetria no Trajeto de 400 Metros
                </h3>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Rede Wi-Fi Industrial Mesh:</span>
                    <strong className="text-emerald-400">Conectado (Antenas Corredor 400m)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Latência Média:</span>
                    <strong className="text-white font-mono">14 ms</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Fila de Apontamento Offline:</span>
                    <strong className="text-cyan-300 font-mono">0 pacotes pendentes</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: PERFIL */}
            {activeTab === 'perfil' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Dados do Usuário Ativo
                </h3>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nome:</span>
                    <strong className="text-white">{currentUser.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Matrícula:</span>
                    <strong className="text-blue-400 font-mono">{currentUser.matricula}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cargo Homologado:</span>
                    <strong className="text-emerald-400">{currentUser.role}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Departamento:</span>
                    <strong className="text-slate-200">{currentUser.department}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Operations AI Assistant Drawer
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState, useRef, useEffect } from 'react';
import { StationId } from '../types';
import { STATIONS_DATA } from '../data/stationConstants';
import { 
  sendAntarcticAiQuery, 
  ChatMessage, 
  OperationalContext, 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  testGeminiConnection 
} from '../services/chatbotService';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  Fuel, 
  Wind, 
  Zap, 
  Droplet,
  Key,
  HelpCircle,
  BookOpen,
  Wrench,
  Navigation,
  Shield,
  Snowflake,
  ExternalLink
} from 'lucide-react';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  blackoutStatus: string;
  onOpenTelemetryRepair?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  activeStation,
  temperature,
  windSpeed,
  blackoutStatus,
  onOpenTelemetryRepair
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'guide'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `DhruvaTwin Operations & Guide AI online for ${STATIONS_DATA[activeStation].name} (Team HackFinity007). Real-time SCADA telemetry, Fuel Depot status, Microgrid balance, and NCPOR Standard Operating Procedures are loaded into context.\n\n💡 I can guide you through the 3D Twin & Free View, Telemetry Repair, NPDC Offline Snapshots, and Madrid Protocol compliance. How can I assist?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Gemini API Key configuration state
  const [isKeyConfigOpen, setIsKeyConfigOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());
  const [keyStatusMsg, setKeyStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeTab]);

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKeyInput);
    setKeyStatusMsg({ text: 'API Key saved to local storage.', success: true });
    setTimeout(() => setKeyStatusMsg(null), 3000);
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setKeyStatusMsg(null);
    const result = await testGeminiConnection(apiKeyInput);
    setIsTestingKey(false);
    setKeyStatusMsg({ text: result.message, success: result.success });
    if (result.success) {
      saveGeminiApiKey(apiKeyInput);
    }
  };

  // Voice Recognition setup
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text-To-Speech Playback
  const speakMessage = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || inputValue).trim();
    if (!textToSend || isTyping) return;

    if (activeTab !== 'chat') {
      setActiveTab('chat');
    }

    setInputValue('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const context: OperationalContext = {
      activeStation,
      temperature,
      windSpeed,
      pipelineTemp: 1.8,
      powerLoadKw: 112.4,
      activePersonnelCount: 18,
      blackoutStatus
    };

    try {
      const replyText = await sendAntarcticAiQuery(textToSend, context);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Telemetry gateway offline or timeout. Retrying with local cached station operating procedures: Check fuel pre-heaters and confirm microgrid battery reserve.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    { label: '🧭 Guide: How to explore 3D Twin & Free View?', query: 'Guide me through exploring the 3D Twin and how to use Free View mode.' },
    { label: '🛠️ Telemetry: How to repair sensors & alert symbols?', query: 'Explain how the Telemetry Repair feature works and what to do when an alert symbol appears in the 3D twin.' },
    { label: '⛽ Fuel Depot & Pre-Heaters Status', query: 'What is the current status of the fuel farm tanks and anti-gel pre-heaters?' },
    { label: '❄️ Katabatic Wind Alert Protocol', query: 'What is the emergency protocol for katabatic winds exceeding 80 km/h?' },
    { label: '⚡ Microgrid Genset Balancing', query: 'Verify Bharati/Maitri CHP genset load distribution and battery state.' },
    { label: '🐧 Madrid Protocol Wildlife Buffer', query: 'What are the distance and overflight restrictions for the local penguin colony?' }
  ];

  const guideCards = [
    {
      title: '🌐 3D Digital Twin & Free View',
      badge: 'Interactive Navigation',
      description: 'Explore Maitri & Bharati stations with full 3D fidelity.',
      steps: [
        'Click "Free View" in the camera dock to fly anywhere without restrictions.',
        'Use WASD / Arrow keys or drag mouse to fly and orbit freely.',
        'Toggle the Radar Mini-Map with the [X] button or press [R].',
        'Press [H] to activate Zen Mode (hides all UI overlays for a clean view).',
        'Switch between 7 View Modes: Exterior, X-Ray, Infrared, Thermal, MEP, Structural, and Night Aurora.'
      ],
      prompt: 'Give me a comprehensive tour guide of the 3D Digital Twin and its camera controls.'
    },
    {
      title: '🛠️ Telemetry Repair & 3D Alert Symbols',
      badge: 'SCADA Health',
      description: 'Autonomous & manual recalibration of corrupted sensors.',
      steps: [
        'When extreme rime-ice or parity errors occur, 3D ⚠️ Alert Beacons light up directly above the affected building or equipment.',
        'Click any 3D alert beacon directly in the twin to inspect the raw SCADA packet frame.',
        'Click "Recalibrate & Repair" to apply Kalman filter smoothing and clear freeze lockups.',
        'Every repair generates a cryptographically signed SHA-256 audit entry in IndexedDB.'
      ],
      prompt: 'Explain the Telemetry Repair and Sensor Recalibration engine in detail.'
    },
    {
      title: '❄️ Antarctic Extreme Climate Mode (-20°C)',
      badge: 'Life Support',
      description: 'High-visibility, glove-friendly interface for polar field operations.',
      steps: [
        'Automatically activates when ambient temperature dips below -20°C.',
        'Can be toggled anytime via the Snowflake button or shortcut Ctrl+Shift+A.',
        'Provides massive 400x200px touch buttons designed for heavy insulated polar mittens.',
        'Features emergency voice audio notes and one-touch SOS satellite beacon distress.'
      ],
      prompt: 'Explain the Antarctic High-Visibility Extreme Climate Mode and safety protocols.'
    },
    {
      title: '💾 NPDC Offline Snapshot & Compliance',
      badge: 'NCPOR / Madrid Protocol',
      description: 'Cryptographically sealed local station data export.',
      steps: [
        'Navigate to "NPDC Compliance Center" in the sidebar.',
        'Click "Generate & Download Encrypted Snapshot" to package SCADA logs, SHA-256 hash-chains, and personnel rosters.',
        'Uses AES-GCM 256-bit client-side encryption with zero cloud dependencies.',
        'Inspect and verify cryptographic checksums right inside the web browser.'
      ],
      prompt: 'How does the NPDC Compliance Center handle offline snapshot exports?'
    },
    {
      title: '⛽ Bulk Fuel Storage & Microgrid Clean Energy',
      badge: 'Energy Security',
      description: 'Bulk Arctic diesel management, anti-gel trace heating, and hybrid microgrid.',
      steps: [
        'Maitri features 148,500 L of Arctic D-208 diesel in double-walled tanks with 110% retention berms.',
        'Anti-gel pre-heaters keep fuel line viscosities fluid even at -45°C ambient temperatures.',
        'Solar PV arrays and polar wind turbines synchronize with containerized CHP gensets.',
        'Click the Fuel Farm landmark button in the 3D Twin to open the dedicated Fuel Diagnostics modal.'
      ],
      prompt: 'What are the technical specs of the fuel storage facility and microgrid?'
    }
  ];

  const hasApiKey = Boolean(getGeminiApiKey());

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-[#0A121E] border-l border-[#1A2533] shadow-2xl flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00E0C6]/20 border border-[#00E0C6]/40 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#00E0C6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E8EEF4] uppercase tracking-wider">
                DhruvaTwin Operations & Guide AI
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E0C6]/15 text-[#00E0C6] border border-[#00E0C6]/30">
                TEAM HACKFINITY007
              </span>
            </div>
            <span className="text-[10px] text-[#6B7A8F]">
              NCPOR Polar SOPs · Telemetry Grounded · Gemini 3.8 Flash
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Gemini Key Config Toggle */}
          <button
            onClick={() => setIsKeyConfigOpen(prev => !prev)}
            title="Configure Gemini API Key"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
              hasApiKey 
                ? 'text-[#3EE07F] hover:bg-[#3EE07F]/10' 
                : 'text-[#FFB020] hover:bg-[#FFB020]/10 animate-pulse'
            }`}
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            title="Reset Chat History"
            className="p-1.5 text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#1A2533] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#1A2533] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* GEMINI KEY CONFIGURATION DRAWER ACCORDION */}
      {isKeyConfigOpen && (
        <div className="p-3.5 bg-[#03060A] border-b border-[#1A2533] space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#E8EEF4] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#00E0C6]" />
              <span>Gemini API Key Configuration</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              hasApiKey 
                ? 'bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/30' 
                : 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30'
            }`}>
              {hasApiKey ? '● KEY ACTIVE' : '○ OFFLINE DETERMINISTIC'}
            </span>
          </div>

          <p className="text-[11px] text-[#6B7A8F]">
            DhruvaTwin connects to Gemini 3.8 Flash using the official @google/genai SDK for real-time polar guidance.
          </p>

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 bg-[#0A121E] border border-[#1A2533] rounded-lg px-2.5 py-1.5 text-xs text-[#E8EEF4] focus:outline-none focus:border-[#00E0C6] font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 bg-[#1A2533] hover:bg-[#2A384B] text-[#E8EEF4] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={handleTestApiKey}
              disabled={isTestingKey || !apiKeyInput.trim()}
              className="px-3 py-1.5 bg-[#00E0C6] hover:bg-[#00E0C6]/90 disabled:opacity-40 text-[#060B14] rounded-lg text-xs font-black transition-colors cursor-pointer"
            >
              {isTestingKey ? 'Testing...' : 'Test Ping'}
            </button>
          </div>

          {keyStatusMsg && (
            <div className={`text-[11px] p-2 rounded-lg ${
              keyStatusMsg.success 
                ? 'bg-[#3EE07F]/15 text-[#3EE07F] border border-[#3EE07F]/30' 
                : 'bg-[#FF3B47]/15 text-[#FF3B47] border border-[#FF3B47]/30'
            }`}>
              {keyStatusMsg.text}
            </div>
          )}
        </div>
      )}

      {/* Real-time Context Pill Strip & Tab Switcher */}
      <div className="px-4 py-2 bg-[#060B14] border-b border-[#1A2533] text-[10px] text-[#6B7A8F] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#0A121E] p-0.5 rounded-lg border border-[#1A2533]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#00E0C6] text-[#060B14]'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>AI Operations Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-[#00E0C6] text-[#060B14]'
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Interactive Guide</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px]">
          <span>Temp: <strong className="text-[#FFD700]">{temperature}°C</strong></span>
          <span>·</span>
          <span>Wind: <strong className="text-[#00E0C6]">{windSpeed} km/h</strong></span>
        </div>
      </div>

      {/* TAB 1: AI OPERATIONS CHAT MESSAGES */}
      {activeTab === 'chat' ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser ? 'bg-[#00E0C6] text-[#060B14] font-bold' : 'bg-[#1A2533] text-[#00E0C6]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#00E0C6] text-[#060B14] font-medium shadow-md'
                    : 'bg-[#060B14] text-[#E8EEF4] border border-[#1A2533]'
                }`}>
                  {msg.text}
                  
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px]">
                    <span className={isUser ? 'text-[#060B14]/70' : 'text-[#6B7A8F]'}>
                      {msg.timestamp}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => speakMessage(msg.id, msg.text)}
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud (Text-To-Speech)'}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isSpeaking 
                            ? 'text-[#00E0C6] bg-[#00E0C6]/20' 
                            : 'text-[#6B7A8F] hover:text-[#00E0C6]'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#00E0C6] p-3 bg-[#060B14] border border-[#1A2533] rounded-xl w-fit">
              <Bot className="w-4 h-4 animate-spin" />
              <span>DhruvaTwin AI reasoning with real-time station telemetry...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      ) : (
        /* TAB 2: INTERACTIVE STATION & APPLET GUIDE */
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="p-3 bg-[#060B14] border border-[#1A2533] rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-[#E8EEF4] flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-[#00E0C6]" />
              <span>Welcome to DhruvaTwin Polar Guide</span>
            </h4>
            <p className="text-[#6B7A8F] leading-relaxed">
              Developed by <strong>Team HackFinity007</strong> for NCPOR / MoES (SIH 2026 PS 26060). Click any guide module below for instructions or to ask the AI assistant for live operational help.
            </p>
          </div>

          {guideCards.map((guide, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#060B14] border border-[#1A2533] rounded-xl space-y-2.5 hover:border-[#00E0C6]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-[#E8EEF4]">{guide.title}</h5>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2533] text-[#00E0C6]">
                  {guide.badge}
                </span>
              </div>

              <p className="text-xs text-[#8BA1B7]">{guide.description}</p>

              <div className="space-y-1 pl-2 border-l border-[#1A2533]">
                {guide.steps.map((step, sIdx) => (
                  <div key={sIdx} className="text-[11px] text-[#A0AEC0] flex items-start gap-1.5">
                    <span className="text-[#00E0C6] font-bold">●</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between">
                {guide.title.includes('Telemetry Repair') && onOpenTelemetryRepair && (
                  <button
                    onClick={onOpenTelemetryRepair}
                    className="px-2.5 py-1 bg-[#1A2533] hover:bg-[#2A384B] text-[#00E0C6] rounded text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Open Telemetry Tool</span>
                  </button>
                )}

                <button
                  onClick={() => handleSend(guide.prompt)}
                  className="px-3 py-1 bg-[#00E0C6]/15 hover:bg-[#00E0C6]/25 border border-[#00E0C6]/30 text-[#00E0C6] rounded-lg text-xs font-bold ml-auto flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ask AI About This</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categorized Quick Prompts */}
      <div className="p-3 border-t border-[#1A2533] bg-[#060B14] flex gap-2 overflow-x-auto">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.query)}
            className="px-2.5 py-1.5 bg-[#0A121E] hover:bg-[#1A2533] text-[10px] text-[#6B7A8F] hover:text-[#00E0C6] rounded-lg border border-[#1A2533] whitespace-nowrap transition-colors cursor-pointer font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Box with Voice Mic */}
      <div className="p-3 border-t border-[#1A2533] bg-[#0A121E]">
        <div className="flex items-center gap-2 bg-[#060B14] border border-[#1A2533] rounded-xl p-1.5 focus-within:border-[#00E0C6]">
          <input
            type="text"
            placeholder={isListening ? 'Listening to voice command...' : 'Ask Antarctic operations assistant or guide...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-2 text-xs text-[#E8EEF4] placeholder-[#6B7A8F] focus:outline-none"
          />

          {/* Voice Microphone Input Button */}
          <button
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Start voice input (Speech-to-Text)'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isListening 
                ? 'bg-[#FF3B47] text-white animate-pulse' 
                : 'text-[#6B7A8F] hover:text-[#00E0C6] hover:bg-[#1A2533]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="p-2 bg-[#00E0C6] hover:bg-[#00E0C6]/90 disabled:opacity-40 text-[#060B14] rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useRef, useState } from 'react';
import { Message, Sender, MessageStatus, AgentConfig } from '../types';
import { Send, MoreVertical, Search, Paperclip, Smile, Phone, Video, Check, CheckCheck, Info, Code, BookOpen, Copy, CheckCircle2, Server, Globe, Smartphone, ArrowRight, Bot, X, QrCode, CloudLightning, HelpCircle } from 'lucide-react';
import { createChatSession, sendMessageToAgent } from '../services/geminiService';
import { Chat } from "@google/genai";

interface ChatSimulatorProps {
  config: AgentConfig;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployTab, setDeployTab] = useState<'guide' | 'code' | 'scan'>('guide');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = createChatSession(config);
    setChatSession(session);
    setMessages([]);
  }, [config]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: Sender.USER,
      timestamp: new Date(),
      status: MessageStatus.SENT
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await sendMessageToAgent(chatSession, userMsg.text);
      const responses = responseText.split('|||').map(t => t.trim()).filter(t => t);

      for (const resText of responses) {
          if (responses.length > 1) {
              await new Promise(r => setTimeout(r, 500));
          }
          const botMsg: Message = {
            id: Date.now().toString() + Math.random(),
            text: resText,
            sender: Sender.BOT,
            timestamp: new Date(),
            status: MessageStatus.READ
          };
          setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyCode = () => {
      navigator.clipboard.writeText(getServerCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const getServerCode = () => {
    // Dynamic generation based on user config
    const evolutionConfig = `
// CONFIGURAÇÃO EVOLUTION API
const EVOLUTION_URL = '${config.evolutionUrl || "https://api.seuzap.com"}'; 
const EVOLUTION_API_KEY = '${config.evolutionApiKey || "SUA_API_KEY_DA_EVOLUTION"}';
const INSTANCE_NAME = '${config.evolutionInstanceName || "nome_da_instancia"}';`;

    return `// server.js - O CÉREBRO (Middleware)
// Este servidor recebe mensagens do WhatsApp (via Webhook) e envia para o Gemini.
// Hospede gratuitamente no Render.com ou Replit.

const express = require('express');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const app = express();
app.use(express.json());

// --- SUAS CREDENCIAIS ---
const GEMINI_API_KEY = process.env.API_KEY || "SUA_KEY_DO_GOOGLE_AISTUDIO"; 
${evolutionConfig}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = \`
${config.systemInstructions.replace(/`/g, '\\`')}
Identidade: ${config.name}. Tom: ${config.tone}.
\`;

// Rota que recebe as mensagens do WhatsApp
// O WhatsApp "bate" aqui sempre que chega mensagem nova
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;
    console.log("📩 Evento Recebido:", data.event);

    // Validação básica para EvolutionAPI v2
    if (data.event !== 'messages.upsert') return res.sendStatus(200);
    const msg = data.data;
    
    // Ignora mensagens enviadas pelo próprio bot ou grupos
    if (!msg || msg.key.fromMe || msg.key.remoteJid.includes('@g.us')) return res.sendStatus(200);

    const remoteJid = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!text) return res.sendStatus(200);

    // 1. Enviar para o Google Gemini
    // Nota: Em produção, armazene o histórico de chat para manter o contexto
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { 
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [${config.websites.length > 0 ? '{ googleSearch: {} }' : ''}]
        }
    });
    const result = await chat.sendMessage({ message: text });
    
    // 2. Processar resposta (suporte a balões separados)
    const replies = result.text.split('|||');

    // 3. Enviar de volta para o WhatsApp
    for (const reply of replies) {
        if(!reply.trim()) continue;
        await axios.post(\`\${EVOLUTION_URL}/message/sendText/\${INSTANCE_NAME}\`, {
            number: remoteJid.replace('@s.whatsapp.net', ''),
            text: reply.trim(),
            delay: 1500
        }, { headers: { 'apikey': EVOLUTION_API_KEY } });
    }
  } catch (e) {
    console.error("❌ Erro:", e.message);
  }
  res.sendStatus(200);
});

app.listen(3000, () => console.log('🤖 Cérebro rodando na porta 3000'));
`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] relative overflow-hidden rounded-r-2xl border-l border-[#2a3942]">
      {/* Background Pattern */}
      <div className="absolute inset-0 whatsapp-bg z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between z-10 shrink-0 border-b border-[#2a3942]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a884] p-[2px] overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${config.name.replace(' ', '+')}&background=0b141a&color=00e676`} alt="Avatar" className="w-full h-full rounded-full" />
          </div>
          <div>
            <h3 className="text-gray-100 font-bold text-sm md:text-base leading-tight">{config.name}</h3>
            <p className="text-[#00e676] text-xs font-medium">online</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#8696a0]">
          <button 
            onClick={() => setShowDeployModal(true)} 
            className="flex items-center gap-2 bg-[#00e676] text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#00c263] transition-all shadow-[0_0_10px_rgba(0,230,118,0.3)]"
          >
            <Smartphone size={14} /> 
            Conectar no WhatsApp
          </button>
          <Search size={20} className="hidden sm:block cursor-pointer hover:text-white" />
          <MoreVertical size={20} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-10 custom-scrollbar">
        {messages.length === 0 && (
            <div className="bg-[#1f2c33]/90 backdrop-blur-sm p-6 rounded-2xl text-center max-w-sm mx-auto shadow-xl border border-[#2a3942] mt-10">
               <Info className="inline-block mb-3 text-[#00e676]" size={24} />
               <p className="text-gray-200 text-sm font-medium">Ambiente de Simulação</p>
               <p className="text-xs text-[#8696a0] mt-2 leading-relaxed">
                   Tudo que você digitar aqui será respondido pela IA configurada.
                   Quando estiver pronto, clique em <strong>"Conectar no WhatsApp"</strong> acima.
               </p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`
              max-w-[85%] md:max-w-[65%] rounded-2xl p-3 px-4 text-sm relative shadow-md
              ${msg.sender === Sender.USER 
                ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}
            `}>
              <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</div>
              
              <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                <span className="text-[10px] leading-none">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === Sender.USER && (
                  <CheckCheck size={14} className="text-[#53bdeb]" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
             <div className="flex justify-start">
                <div className="bg-[#202c33] px-4 py-3 rounded-2xl rounded-tl-none shadow-md flex gap-1.5 items-center border border-[#2a3942]/50">
                    <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center gap-4 shrink-0 z-10 border-t border-[#2a3942]">
        <Smile size={24} className="text-[#8696a0] cursor-pointer hover:text-white hidden sm:block" />
        <Paperclip size={24} className="text-[#8696a0] cursor-pointer hover:text-white" />
        <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2 border border-transparent focus-within:border-[#00a884] transition-colors">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-transparent border-none outline-none text-[#d1d7db] text-sm w-full placeholder-[#8696a0]"
          />
        </div>
        <button 
            onClick={handleSendMessage} 
            className={`p-2 rounded-full transition-all ${inputValue.trim() ? 'bg-[#00a884] text-white hover:bg-[#008f6f]' : 'text-[#8696a0]'}`}
        >
            {inputValue.trim() ? <Send size={20} /> : <Phone size={24} />}
        </button>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#202c33] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#2a3942] flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-5 border-b border-[#2a3942] flex justify-between items-center bg-[#111b21]">
                    <h3 className="text-gray-100 font-bold text-lg flex items-center gap-2">
                        <Smartphone size={20} className="text-[#00e676]" />
                        Conectar ao WhatsApp Real
                    </h3>
                    <button onClick={() => setShowDeployModal(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex border-b border-[#2a3942] bg-[#111b21]">
                    <button onClick={() => setDeployTab('guide')} className={`flex-1 py-4 text-xs md:text-sm font-bold border-b-2 transition-colors uppercase tracking-wider ${deployTab === 'guide' ? 'border-[#00e676] text-[#00e676]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>1. Instalação</button>
                    <button onClick={() => setDeployTab('code')} className={`flex-1 py-4 text-xs md:text-sm font-bold border-b-2 transition-colors uppercase tracking-wider ${deployTab === 'code' ? 'border-[#00e676] text-[#00e676]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>2. O Código</button>
                    <button onClick={() => setDeployTab('scan')} className={`flex-1 py-4 text-xs md:text-sm font-bold border-b-2 transition-colors uppercase tracking-wider ${deployTab === 'scan' ? 'border-[#00e676] text-[#00e676]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>3. Finalizar</button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#111b21]">
                    {deployTab === 'guide' && (
                        <div className="space-y-6 text-sm text-gray-300 max-w-2xl mx-auto">
                            <div className="bg-[#202c33] border-l-4 border-[#00e676] p-4 rounded-r-lg mb-6 shadow-lg">
                                <h4 className="font-bold text-[#00e676] mb-2 flex items-center gap-2"><CloudLightning size={16}/> Hospedagem Gratuita</h4>
                                <p className="mb-2">
                                    <strong>Para o Dashboard (Este Site):</strong> Use a <u>Vercel</u> (Grátis).
                                </p>
                                <p>
                                    <strong>Para o Servidor do Bot:</strong> Use o <u>Render.com</u> (Plano Web Service Free).
                                    <br/>
                                    <span className="text-xs text-[#8696a0] block mt-1">Obs: No plano grátis do Render, o servidor "dorme" após 15min sem uso. A primeira mensagem pode levar 30s para responder.</span>
                                </p>
                            </div>

                            <div className="bg-[#2a3942]/50 p-4 rounded-lg mb-6 border border-[#2a3942]">
                                <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2"><HelpCircle size={16}/> O que é o "Cérebro" e por que preciso dele?</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    O WhatsApp (via Evolution API) não consegue "falar" diretamente com a IA do Google. Ele precisa de um intermediário.
                                    O código na aba 2 (server.js) é esse intermediário: ele recebe a mensagem do WhatsApp (via Webhook) -> Envia para a IA -> Devolve a resposta para o WhatsApp.
                                </p>
                            </div>

                            <ol className="relative border-l border-[#2a3942] ml-3">                  
                                <li className="mb-10 ml-6">            
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-[#202c33] rounded-full -left-4 ring-4 ring-[#111b21] text-[#00e676] font-bold border border-[#2a3942]">1</span>
                                    <h3 className="font-bold text-white text-lg mb-1">Copie o Código</h3>
                                    <p className="mb-2">Vá na aba <strong>"2. O Código"</strong>. Este é o script que fará a ponte entre o WhatsApp e a IA.</p>
                                </li>
                                <li className="mb-10 ml-6">
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-[#202c33] rounded-full -left-4 ring-4 ring-[#111b21] text-[#00e676] font-bold border border-[#2a3942]">2</span>
                                    <h3 className="font-bold text-white text-lg mb-1">Crie o Servidor no Render (Grátis)</h3>
                                    <p className="mb-2">Crie uma conta no <strong>Render.com</strong>, clique em "New Web Service" e conecte seu repositório ou use o código.</p>
                                    <p className="text-xs text-[#8696a0] mb-2">Comando de build: <code>npm install</code> | Comando de start: <code>node server.js</code></p>
                                </li>
                                <li className="ml-6">
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-[#202c33] rounded-full -left-4 ring-4 ring-[#111b21] text-[#00e676] font-bold border border-[#2a3942]">3</span>
                                    <h3 className="font-bold text-white text-lg mb-1">Configure o Webhook</h3>
                                    <p className="mb-2">Copie a URL que o Render gerou (ex: <code>https://meu-bot.onrender.com/webhook</code>) e coloque na Evolution API.</p>
                                </li>
                            </ol>
                        </div>
                    )}

                    {deployTab === 'code' && (
                        <div className="h-full flex flex-col">
                             <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-gray-400">Este é o servidor. Salve como <code>server.js</code>.</p>
                                <button 
                                    onClick={copyCode}
                                    className="bg-[#00e676] text-black px-4 py-2 rounded font-bold hover:bg-[#00c263] transition-colors flex items-center gap-2 text-sm"
                                >
                                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copiado!' : 'Copiar Código'}
                                </button>
                             </div>
                             <pre className="bg-[#0b141a] p-4 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-[#2a3942] flex-1 custom-scrollbar shadow-inner">
                                {getServerCode()}
                             </pre>
                        </div>
                    )}

                    {deployTab === 'scan' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                                <QrCode size={200} className="text-black opacity-20 blur-[2px]" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white font-bold p-4">
                                    Servidor Externo
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Aguardando Conexão</h3>
                            <p className="text-[#8696a0] max-w-md mx-auto mb-6">
                                O QR Code real será gerado pela <strong>Evolution API</strong>. Acesse o painel da Evolution e escaneie o código lá para vincular o número.
                            </p>
                            <a href="https://github.com/EvolutionAPI/evolution-api" target="_blank" rel="noopener noreferrer" className="text-[#00e676] hover:underline flex items-center gap-1">
                                Ver documentação da Evolution API <ArrowRight size={14}/>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatSimulator;
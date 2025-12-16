import React, { useState, useEffect } from 'react';
import ChatSimulator from './components/ChatSimulator';
import ConfigurationPanel from './components/ConfigurationPanel';
import AgentDashboard from './components/AgentDashboard';
import LoginScreen from './components/LoginScreen';
import { AgentConfig } from './types';
import { Settings, MessageCircle, AlertTriangle, Zap, ArrowLeft, LayoutGrid, Bot, X, Trash2, LogOut, Loader2 } from 'lucide-react';
import { auth, logout } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Default Template for new agents
const CREATE_NEW_AGENT = (): AgentConfig => ({
  id: Date.now().toString(),
  lastModified: new Date(),
  name: 'Novo Assistente',
  companyName: 'Minha Empresa',
  role: 'Atendente Virtual',
  tone: 'Profissional e Formal',
  systemInstructions: 'Responda dúvidas sobre a empresa.',
  maxResponseLength: 200,
  responseDelayMin: 1,
  responseDelayMax: 3,
  examples: [],
  documents: [],
  websites: [],
  integrationType: 'evolution',
  evolutionUrl: '',
  evolutionApiKey: '',
  evolutionInstanceName: ''
});

const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: '1',
    lastModified: new Date(),
    name: 'Ana',
    companyName: 'Tech Solutions',
    role: 'Vendas',
    tone: 'Amigável e Casual',
    systemInstructions: 'O objetivo é ajudar o cliente a escolher o melhor produto. Sempre termine a conversa perguntando se o cliente tem mais dúvidas.',
    maxResponseLength: 200,
    responseDelayMin: 1,
    responseDelayMax: 3,
    examples: [
        {
            id: '1',
            userQuery: 'Qual o valor do frete?',
            agentResponse: 'O frete é calculado no checkout! 🚛 Geralmente fica em torno de R$15,00 para a capital.'
        }
    ],
    documents: [
        {
        id: '1',
        name: 'Exemplo: Horário de Funcionamento',
        content: 'Estamos abertos de Segunda a Sexta das 09:00 às 18:00. Sábados das 09:00 às 13:00. Não abrimos feriados.',
        type: 'text',
        mimeType: 'text/plain',
        uploadDate: new Date()
        }
    ],
    websites: ['https://google.com'],
    integrationType: 'evolution',
    evolutionUrl: 'https://api.seuserver.com',
    evolutionApiKey: '',
    evolutionInstanceName: 'minha_instancia'
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'config' | 'chat'>('config');
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Agent CRUD Operations
  const handleCreateAgent = () => {
    const newAgent = CREATE_NEW_AGENT();
    setAgents(prev => [...prev, newAgent]);
    setSelectedAgentId(newAgent.id);
    setActiveView('config');
  };

  const handleUpdateAgent = (updatedAgent: AgentConfig) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? { ...updatedAgent, lastModified: new Date() } : a));
  };

  const handleDeleteRequest = (id: string) => {
    setAgentToDelete(id);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
        setAgents(prev => prev.filter(a => a.id !== agentToDelete));
        if (selectedAgentId === agentToDelete) setSelectedAgentId(null);
        setAgentToDelete(null);
    }
  };

  const handleLogout = async () => {
      await logout();
      // State updates automatically via onAuthStateChanged
  };

  // Check for API KEY
  if (!process.env.API_KEY) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4">
        <div className="bg-[#202c33] p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-l-4 border-red-500">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Chave API Ausente</h1>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">
             Para usar a plataforma, você precisa configurar a variável de ambiente <code>API_KEY</code> com sua chave da Google Gemini API.
          </p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[#00e676] hover:underline">Gerar Chave Agora &rarr;</a>
        </div>
      </div>
    );
  }

  if (authLoading) {
      return (
          <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
              <Loader2 className="animate-spin text-[#00e676]" size={40} />
          </div>
      );
  }

  // Render Login Screen if not logged in
  if (!user) {
      return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b141a] overflow-hidden font-sans text-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-[#111b21] border-b border-[#2a3942] h-16 flex items-center justify-between px-6 shrink-0 z-20 shadow-lg relative">
        <div className="flex items-center gap-4">
          {selectedAgentId && (
            <button 
                onClick={() => setSelectedAgentId(null)}
                className="mr-2 text-[#8696a0] hover:text-[#00e676] transition-colors p-2 rounded-full hover:bg-[#202c33]"
                title="Voltar para Dashboard"
            >
                <ArrowLeft size={24} />
            </button>
          )}
          
          <div 
            onClick={() => setSelectedAgentId(null)}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="bg-gradient-to-br from-[#00a884] to-[#00e676] p-2 rounded-xl text-[#0b141a] shadow-[0_0_15px_rgba(0,230,118,0.4)] group-hover:scale-105 transition-transform">
                <Bot size={22} fill="currentColor" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">
                Zap <span className="text-[#00e676]">Agent</span>
            </h1>
          </div>

          {selectedAgent && (
             <div className="hidden md:flex items-center gap-3 ml-6 px-4 py-1.5 bg-[#202c33] rounded-full border border-[#2a3942]">
                <span className="w-2 h-2 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]"></span>
                <span className="text-xs text-[#8696a0] font-medium uppercase tracking-wider">Agente: <strong className="text-white ml-1">{selectedAgent.name}</strong></span>
             </div>
          )}
        </div>

        <div className="flex items-center gap-3">
            {/* View Switcher (Only visible when an agent is selected) */}
            {selectedAgentId && (
                <div className="flex bg-[#0b141a] rounded-xl p-1 gap-1 border border-[#2a3942] mr-4">
                <button
                    onClick={() => setActiveView('config')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    activeView === 'config' 
                        ? 'bg-[#202c33] text-[#00e676] shadow-sm' 
                        : 'text-[#8696a0] hover:text-gray-200 hover:bg-[#111b21]'
                    }`}
                >
                    <Settings size={16} />
                    <span className="hidden sm:inline">Configurar</span>
                </button>
                <button
                    onClick={() => setActiveView('chat')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    activeView === 'chat' 
                        ? 'bg-[#202c33] text-[#00e676] shadow-sm' 
                        : 'text-[#8696a0] hover:text-gray-200 hover:bg-[#111b21]'
                    }`}
                >
                    <MessageCircle size={16} />
                    <span className="hidden sm:inline">Simular</span>
                </button>
                </div>
            )}
            
            <div className="flex items-center gap-4 pl-4 border-l border-[#2a3942]">
                 {!selectedAgentId && user.photoURL && (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-[#2a3942]" />
                 )}
                 <button 
                    onClick={handleLogout} 
                    className="text-[#8696a0] hover:text-red-400 p-2 rounded-full hover:bg-[#202c33] transition-colors"
                    title="Sair"
                 >
                    <LogOut size={20} />
                 </button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-[#0b141a]">
        {!selectedAgentId ? (
            // DASHBOARD VIEW
            <div className="h-full overflow-y-auto custom-scrollbar">
                <AgentDashboard 
                    agents={agents} 
                    onCreate={handleCreateAgent}
                    onSelect={(agent) => {
                        setSelectedAgentId(agent.id);
                        setActiveView('config');
                    }}
                    onDelete={handleDeleteRequest}
                />
            </div>
        ) : (
            // EDITOR VIEW (Config + Chat)
            <div className="max-w-[1600px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-0 p-0">
            
            {/* Config Panel - 7 Cols */}
            <div className={`h-full transition-all duration-300 lg:col-span-7 border-r border-[#2a3942] ${activeView === 'config' ? 'block' : 'hidden lg:block'}`}>
                {selectedAgent && (
                    <div className="h-full p-0 lg:p-6 bg-[#0b141a]">
                        <ConfigurationPanel 
                            key={selectedAgent.id} 
                            config={selectedAgent} 
                            onUpdate={handleUpdateAgent} 
                        />
                    </div>
                )}
            </div>

            {/* Chat Simulator - 5 Cols */}
            <div className={`h-full flex flex-col transition-all duration-300 lg:col-span-5 ${activeView === 'chat' ? 'block' : 'hidden lg:block'}`}>
                {selectedAgent && (
                    <ChatSimulator 
                        key={selectedAgent.id + '-chat'} 
                        config={selectedAgent} 
                    />
                )}
            </div>
            </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#202c33] p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-[#2a3942] transform transition-all scale-100">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
                    <Trash2 className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-100 mb-2">Excluir Agente?</h3>
                <p className="text-[#8696a0] text-center text-sm mb-6 leading-relaxed">
                    Você tem certeza que deseja remover este agente? Esta ação é irreversível e todas as configurações serão perdidas.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setAgentToDelete(null)}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-300 hover:bg-[#2a3942] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        Sim, Excluir
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
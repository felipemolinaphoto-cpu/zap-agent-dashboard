import React from 'react';
import { AgentConfig } from '../types';
import { Plus, Settings, Bot, Trash2, Smartphone, Terminal } from 'lucide-react';

interface AgentDashboardProps {
  agents: AgentConfig[];
  onCreate: () => void;
  onSelect: (agent: AgentConfig) => void;
  onDelete: (id: string) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ agents, onCreate, onSelect, onDelete }) => {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fadeIn min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#2a3942] pb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Meus <span className="text-[#00e676]">Agentes</span>
          </h2>
          <p className="text-[#8696a0] text-lg">
            Central de comando da sua inteligência artificial.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-[#00e676] hover:bg-[#00c263] text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
          Criar Novo Agente
        </button>
      </div>

      {/* Grid */}
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#2a3942] rounded-3xl bg-[#111b21]/50">
          <div className="bg-[#202c33] p-6 rounded-full mb-6 animate-pulse">
            <Bot size={64} className="text-[#00e676]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-200 mb-2">Nenhum agente ativo</h3>
          <p className="text-[#8696a0] mb-8 max-w-md text-center">
            Você ainda não criou nenhum assistente. Clique no botão abaixo para começar a automatizar seu WhatsApp.
          </p>
          <button onClick={onCreate} className="text-[#00e676] font-bold hover:underline underline-offset-4 decoration-2">
            + Criar meu primeiro agente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => onSelect(agent)}
              className="bg-[#111b21] border border-[#2a3942] rounded-2xl overflow-hidden hover:border-[#00e676] transition-all duration-300 group relative flex flex-col h-full cursor-pointer hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e676] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Card Header */}
              <div className="p-6 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#202c33] p-1 border border-[#2a3942] group-hover:border-[#00e676]/50 transition-colors">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${agent.name.replace(' ', '+')}&background=00e676&color=000&bold=true`} 
                            alt={agent.name} 
                            className="w-full h-full rounded-xl object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-white leading-tight group-hover:text-[#00e676] transition-colors">{agent.name}</h3>
                        <p className="text-sm text-[#8696a0] font-medium">{agent.companyName}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
                    className="text-[#8696a0] hover:text-red-500 p-2 rounded-lg hover:bg-[#202c33] transition-colors z-10"
                    title="Excluir Agente Definitivamente"
                >
                    <Trash2 size={20} />
                </button>
              </div>

              {/* Card Body */}
              <div className="px-6 pb-6 flex-1 flex flex-col gap-4">
                <div className="space-y-3 bg-[#202c33]/50 p-4 rounded-xl border border-[#2a3942]/50">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Bot size={16} className="text-[#00e676]" />
                        <span className="truncate font-medium">{agent.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Smartphone size={16} className={agent.integrationType === 'evolution' ? "text-blue-400" : "text-purple-400"} />
                        <span className="truncate font-mono text-xs">
                            {agent.integrationType === 'evolution' 
                                ? (agent.evolutionUrl ? 'Evolution API Configurada' : 'Evolution API (Pendente)') 
                                : 'Meta Cloud API (Oficial)'}
                        </span>
                    </div>
                </div>
                
                <div className="mt-auto pt-2 flex items-center justify-between text-xs font-mono text-[#00a884]">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
                        Status: Ativo
                    </span>
                    <span className="text-[#8696a0]">
                         Editado: {new Date(agent.lastModified).toLocaleDateString()}
                    </span>
                </div>
              </div>
              
              {/* Hover Action Overlay */}
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                   <button className="bg-[#00e676] text-black font-bold px-8 py-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                        <Settings size={20} />
                        Gerenciar Agente
                   </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
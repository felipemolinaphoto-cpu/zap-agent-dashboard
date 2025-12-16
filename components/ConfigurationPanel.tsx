import React, { useState } from 'react';
import { AgentConfig, KnowledgeDocument, TrainingExample } from '../types';
import { Save, FileText, Trash2, Plus, Upload, Bot, Building2, UserCircle, MessageSquare, Clock, TextSelect, FileType, Sparkles, PlugZap, Globe, Key, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ConfigurationPanelProps {
  config: AgentConfig;
  onUpdate: (newConfig: AgentConfig) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);
  const [newDocText, setNewDocText] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'examples' | 'connection'>('persona');
  const [newExample, setNewExample] = useState({ query: '', response: '' });

  const handleChange = (field: keyof AgentConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        const base64Content = base64String.split(',')[1];
        
        const newDoc: KnowledgeDocument = {
          id: Date.now().toString(),
          name: file.name,
          content: base64Content,
          type: 'file',
          mimeType: file.type,
          uploadDate: new Date()
        };
        
        setLocalConfig(prev => ({
          ...prev,
          documents: [...prev.documents, newDoc]
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAddTextDoc = () => {
    if (!newDocText.trim()) return;
    
    const newDoc: KnowledgeDocument = {
      id: Date.now().toString(),
      name: `Nota Rápida ${localConfig.documents.length + 1}`,
      content: newDocText,
      type: 'text',
      mimeType: 'text/plain',
      uploadDate: new Date()
    };
    
    setLocalConfig(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
    setNewDocText('');
  };

  const handleRemoveDoc = (id: string) => {
    setLocalConfig(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const handleAddWebsite = () => {
      if(!newWebsite.trim()) return;
      setLocalConfig(prev => ({
          ...prev,
          websites: [...(prev.websites || []), newWebsite.trim()]
      }));
      setNewWebsite('');
  };

  const handleRemoveWebsite = (url: string) => {
      setLocalConfig(prev => ({
          ...prev,
          websites: prev.websites.filter(w => w !== url)
      }));
  };

  const handleAddExample = () => {
    if (!newExample.query.trim() || !newExample.response.trim()) return;
    const example: TrainingExample = {
        id: Date.now().toString(),
        userQuery: newExample.query,
        agentResponse: newExample.response
    };
    setLocalConfig(prev => ({
        ...prev,
        examples: [...prev.examples, example]
    }));
    setNewExample({ query: '', response: '' });
  };

  const handleRemoveExample = (id: string) => {
    setLocalConfig(prev => ({
        ...prev,
        examples: prev.examples.filter(e => e.id !== id)
    }));
  };

  const handleSave = () => {
    onUpdate(localConfig);
  };

  // Helper classes
  const inputClass = "w-full bg-[#2a3942] border border-[#2a3942] rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-[#00e676] focus:border-[#00e676] outline-none transition-all placeholder-gray-500";
  const labelClass = "block text-xs font-semibold text-[#8696a0] mb-1 flex items-center gap-1";
  const sectionClass = "bg-[#202c33] p-4 rounded-lg border border-[#2a3942] shadow-sm";
  const tabClass = (isActive: boolean) => 
    `flex-1 min-w-[100px] py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
      isActive 
      ? 'border-[#00e676] text-[#00e676] bg-[#202c33]' 
      : 'border-transparent text-[#8696a0] hover:text-gray-300 hover:bg-[#202c33]/50'
    }`;

  return (
    <div className="bg-[#202c33] rounded-lg shadow-xl h-full flex flex-col overflow-hidden border border-[#2a3942]">
      <div className="p-4 bg-[#202c33] border-b border-[#2a3942] flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Bot className="text-[#00e676]" />
            Configuração
        </h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#00a884] text-white px-4 py-2 rounded-lg hover:bg-[#008f6f] transition-all shadow-[0_0_10px_rgba(0,168,132,0.4)] text-sm font-bold"
        >
          <Save size={18} />
          Salvar
        </button>
      </div>

      <div className="flex border-b border-[#2a3942] shrink-0 overflow-x-auto scrollbar-hide bg-[#111b21]">
        <button className={tabClass(activeTab === 'persona')} onClick={() => setActiveTab('persona')}>Personalidade</button>
        <button className={tabClass(activeTab === 'knowledge')} onClick={() => setActiveTab('knowledge')}>Conhecimento</button>
        <button className={tabClass(activeTab === 'examples')} onClick={() => setActiveTab('examples')}>Exemplos</button>
        <button className={tabClass(activeTab === 'connection')} onClick={() => setActiveTab('connection')}>Conexão</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#111b21]">
        
        {activeTab === 'persona' && (
            <div className="space-y-4 animate-fadeIn">
                {/* Identity Section */}
                <div className={sectionClass}>
                    <h3 className="text-sm font-bold text-[#00e676] mb-3 uppercase tracking-wide">Identidade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}><UserCircle size={14}/> Nome do Agente</label>
                            <input
                                type="text"
                                value={localConfig.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}><Building2 size={14}/> Empresa</label>
                            <input
                                type="text"
                                value={localConfig.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                         <label className={labelClass}>Papel / Função</label>
                         <input
                            type="text"
                            value={localConfig.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Behavior & Naturalness */}
                <div className={sectionClass}>
                    <h3 className="text-sm font-bold text-[#00e676] mb-3 uppercase tracking-wide">Comportamento e Naturalidade</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={labelClass}>Tom de Voz</label>
                            <select
                                value={localConfig.tone}
                                onChange={(e) => handleChange('tone', e.target.value)}
                                className={inputClass}
                            >
                                <option value="Profissional e Formal">Profissional e Formal</option>
                                <option value="Amigável e Casual">Amigável e Casual</option>
                                <option value="Entusiasmado e Vendedor">Entusiasmado e Vendedor</option>
                                <option value="Empático e Calmo">Empático e Calmo (Suporte)</option>
                                <option value="Direto e Conciso">Direto e Conciso</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>
                                <TextSelect size={14}/> Máx. Caracteres
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={localConfig.maxResponseLength}
                                onChange={(e) => handleChange('maxResponseLength', parseInt(e.target.value))}
                                className="w-full h-2 bg-[#2a3942] rounded-lg appearance-none cursor-pointer accent-[#00a884]"
                            />
                            <div className="text-right text-xs text-[#8696a0]">{localConfig.maxResponseLength} chars</div>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className={labelClass}>
                            <Clock size={14}/> Delay de Resposta (Simular Digitação)
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <span className="text-xs text-[#8696a0] block mb-1">Mínimo (s)</span>
                                <input 
                                    type="number" 
                                    min="0" max="20"
                                    value={localConfig.responseDelayMin}
                                    onChange={(e) => handleChange('responseDelayMin', parseInt(e.target.value))}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-[#8696a0] block mb-1">Máximo (s)</span>
                                <input 
                                    type="number" 
                                    min="0" max="30"
                                    value={localConfig.responseDelayMax}
                                    onChange={(e) => handleChange('responseDelayMax', parseInt(e.target.value))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}><MessageSquare size={16}/> Instruções do Sistema (Prompt)</label>
                    <textarea
                        value={localConfig.systemInstructions}
                        onChange={(e) => handleChange('systemInstructions', e.target.value)}
                        rows={6}
                        className={`${inputClass} font-mono`}
                        placeholder="Ex: Nunca forneça descontos acima de 10%. Sempre peça o email do cliente no final. Se o cliente perguntar X, responda Y."
                    />
                </div>
            </div>
        )}

        {activeTab === 'knowledge' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#202c33] p-4 rounded-lg border border-[#00a884]/30">
                    <h3 className="text-sm font-semibold text-[#00e676] mb-1">Base de Conhecimento Híbrida</h3>
                    <p className="text-xs text-[#8696a0]">
                        Forneça documentos (PDF/Texto) e Links. A IA usará essas informações para responder com precisão.
                    </p>
                </div>

                {/* Website Links Section */}
                <div className={sectionClass}>
                    <h4 className="font-medium text-sm text-gray-200 mb-3 flex items-center gap-2">
                        <Globe size={16} className="text-blue-400"/> Sites & Links
                    </h4>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="url"
                            placeholder="https://sua-empresa.com/precos"
                            value={newWebsite}
                            onChange={(e) => setNewWebsite(e.target.value)}
                            className={inputClass}
                        />
                        <button 
                            onClick={handleAddWebsite}
                            disabled={!newWebsite.trim()}
                            className="bg-[#2a3942] hover:bg-[#374248] text-[#00e676] px-3 rounded-md border border-gray-600 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(localConfig.websites || []).map((site, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-[#111b21] rounded border border-[#2a3942] group">
                                <a href={site} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate flex items-center gap-1">
                                    <ExternalLink size={10} /> {site}
                                </a>
                                <button onClick={() => handleRemoveWebsite(site)} className="text-[#8696a0] hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {(!localConfig.websites || localConfig.websites.length === 0) && (
                            <p className="text-xs text-[#8696a0] italic">Nenhum site vinculado.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Text Input */}
                    <div className={`${sectionClass} flex flex-col`}>
                        <h4 className="font-medium text-sm text-gray-200 mb-2 flex items-center gap-2"><TextSelect size={16}/> Colar Texto</h4>
                        <textarea
                            value={newDocText}
                            onChange={(e) => setNewDocText(e.target.value)}
                            className={`${inputClass} flex-1 min-h-[100px] mb-2`}
                            placeholder="Cole aqui FAQs, Preços ou Políticas..."
                        />
                        <button 
                            onClick={handleAddTextDoc}
                            disabled={!newDocText.trim()}
                            className="w-full py-2 bg-[#2a3942] border border-gray-600 rounded-md text-sm font-medium text-[#00e676] hover:bg-[#374248] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={16}/> Adicionar Texto
                        </button>
                    </div>

                    {/* File Upload */}
                    <div className={`${sectionClass} flex flex-col items-center justify-center text-center border-dashed border-gray-600`}>
                        <Upload size={32} className="text-[#00e676] mb-2" />
                        <h4 className="font-medium text-sm text-gray-200">Upload de Arquivo</h4>
                        <p className="text-xs text-[#8696a0] mb-4">PDF, PNG, JPG, TXT</p>
                        <label className="cursor-pointer bg-[#00a884] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-[#008f6f] transition-all shadow-[0_0_10px_rgba(0,168,132,0.4)]">
                            Escolher Arquivo
                            <input 
                                type="file" 
                                accept=".txt,.pdf,.png,.jpg,.jpeg,.webp" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                        </label>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
                        <FileText size={18} /> Documentos ({localConfig.documents.length})
                    </h4>
                    {localConfig.documents.length === 0 ? (
                        <div className="text-center py-8 bg-[#202c33] rounded-lg border border-dashed border-[#2a3942]">
                            <p className="text-sm text-[#8696a0]">Nenhum documento adicionado.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {localConfig.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-[#202c33] border border-[#2a3942] rounded-lg shadow-sm group hover:border-[#00e676]/30 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded shrink-0 ${doc.type === 'file' ? 'bg-[#2a3942] text-orange-400' : 'bg-[#2a3942] text-[#00e676]'}`}>
                                            {doc.mimeType?.includes('image') ? <FileType size={18}/> : <FileText size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate">{doc.name}</p>
                                            <p className="text-[10px] text-[#8696a0] uppercase">{doc.mimeType?.split('/')[1] || 'TXT'} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveDoc(doc.id)}
                                        className="text-[#8696a0] hover:text-red-400 p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'examples' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#202c33] p-4 rounded-lg border border-[#00a884]/30">
                    <h3 className="text-sm font-semibold text-[#00e676] mb-1 flex items-center gap-2"><Sparkles size={16}/> Treinamento por Exemplos</h3>
                    <p className="text-xs text-[#8696a0]">
                        Ensine o "jeito de falar" dando exemplos práticos. A IA tentará imitar este padrão.
                    </p>
                </div>

                <div className={sectionClass}>
                    <h4 className="text-sm font-medium text-gray-200 mb-3">Novo Exemplo</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder='Usuário diz: "Qual o preço?"'
                            value={newExample.query}
                            onChange={(e) => setNewExample(prev => ({...prev, query: e.target.value}))}
                            className={inputClass}
                        />
                        <textarea
                            placeholder='Agente responde: "Olá! Nossos planos começam em R$99. Quer ver a tabela?"'
                            value={newExample.response}
                            onChange={(e) => setNewExample(prev => ({...prev, response: e.target.value}))}
                            rows={2}
                            className={inputClass}
                        />
                        <button 
                            onClick={handleAddExample}
                            disabled={!newExample.query.trim() || !newExample.response.trim()}
                            className="w-full py-2 bg-[#00a884] text-white rounded-md text-sm font-bold hover:bg-[#008f6f] disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(0,168,132,0.4)]"
                        >
                            Adicionar Exemplo
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {localConfig.examples.map((ex) => (
                        <div key={ex.id} className="bg-[#202c33] border border-[#2a3942] rounded-lg p-3 relative group hover:border-[#00e676]/30 transition-all">
                            <button 
                                onClick={() => handleRemoveExample(ex.id)}
                                className="absolute top-2 right-2 text-[#8696a0] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                            <div className="mb-2">
                                <span className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Usuário</span>
                                <p className="text-sm text-gray-300 bg-[#2a3942] p-2 rounded">{ex.userQuery}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-[#00e676] uppercase tracking-wider">Agente</span>
                                <p className="text-sm text-gray-300 bg-[#2a3942] p-2 rounded border border-[#00a884]/20">{ex.agentResponse}</p>
                            </div>
                        </div>
                    ))}
                    {localConfig.examples.length === 0 && (
                        <p className="text-center text-sm text-[#8696a0] py-4 italic">Sem exemplos cadastrados.</p>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'connection' && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="bg-[#202c33] p-4 rounded-lg border border-[#00a884]/30">
                    <h3 className="text-sm font-semibold text-[#00e676] mb-1 flex items-center gap-2"><PlugZap size={16}/> Configuração de API</h3>
                    <p className="text-xs text-[#8696a0]">
                        Conecte seu bot ao WhatsApp real usando a <strong>Evolution API</strong>. Esta é a integração mais estável e recomendada.
                    </p>
                </div>

                <div className={sectionClass}>
                    <h4 className="text-sm font-medium text-gray-200 mb-4">Credenciais Evolution API</h4>
                   
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className={labelClass}><Globe size={14}/> URL da API (Evolution/Z-API)</label>
                            <input
                                type="text"
                                placeholder="Ex: https://api.meuzap.com"
                                value={localConfig.evolutionUrl || ''}
                                onChange={(e) => handleChange('evolutionUrl', e.target.value)}
                                className={inputClass}
                            />
                            <p className="text-[10px] text-[#8696a0] mt-1">O endereço do seu servidor EvolutionAPI.</p>
                        </div>
                        <div>
                            <label className={labelClass}><Key size={14}/> API Key (Global ou da Instância)</label>
                            <input
                                type="password"
                                placeholder="Ex: 429683C4C977..."
                                value={localConfig.evolutionApiKey || ''}
                                onChange={(e) => handleChange('evolutionApiKey', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}><MessageSquare size={14}/> Nome da Instância</label>
                            <input
                                type="text"
                                placeholder="Ex: MinhaEmpresa01"
                                value={localConfig.evolutionInstanceName || ''}
                                onChange={(e) => handleChange('evolutionInstanceName', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPanel;
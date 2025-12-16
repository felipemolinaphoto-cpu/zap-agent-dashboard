import { GoogleGenAI, Chat, Content } from "@google/genai";
import { AgentConfig } from "../types";

const API_KEY = process.env.API_KEY || '';

// Singleton instance helper
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

export const createChatSession = (config: AgentConfig) => {
  const ai = getAI();
  
  // 1. Process Text Documents
  const textDocs = config.documents.filter(d => d.type === 'text' || (d.type === 'file' && d.mimeType?.startsWith('text/')));
  const textKnowledgeBase = textDocs.map(doc => 
    `--- DOCUMENTO DE REFERÊNCIA: ${doc.name} ---\n${doc.content}\n--- FIM DO DOCUMENTO ---`
  ).join('\n\n');

  // 2. Process Websites
  const websiteInstructions = config.websites && config.websites.length > 0
    ? `
    SITES OFICIAIS DA EMPRESA (Use a ferramenta de busca para verificar informações nestes links se necessário):
    ${config.websites.map(url => `- ${url}`).join('\n')}
    `
    : '';

  // 3. Process Examples (Few-Shot Learning)
  const examplesText = config.examples.length > 0 
    ? `
    EXEMPLOS DE COMPORTAMENTO (Siga este padrão de resposta):
    ${config.examples.map(ex => `
    Usuário: "${ex.userQuery}"
    ${config.name}: "${ex.agentResponse}"
    `).join('\n')}
    ` 
    : '';

  // 4. Construct System Instruction
  const fullSystemInstruction = `
    Você é ${config.name}, um assistente de IA para a empresa ${config.companyName}.
    Seu papel é: ${config.role}.
    Seu tom de voz deve ser: ${config.tone}.
    
    INSTRUÇÕES TÉCNICAS E DE ESTILO (CRUCIAL):
    1. Responda como se estivesse no WhatsApp.
    2. **MENSAGENS MÚLTIPLAS**: Se for natural para a conversa, você PODE e DEVE enviar mais de uma mensagem curta em vez de um texto longo. Para fazer isso, separe as frases estritamente com o símbolo "|||".
       Exemplo: "Olá, boa tarde! ||| Como posso te ajudar hoje?"
    3. Tamanho máximo da resposta (total): Tente manter abaixo de ${config.maxResponseLength} caracteres somando todas as partes.
    4. NUNCA invente informações. Use APENAS a Base de Conhecimento fornecida, os Sites listados e os Arquivos visuais/PDFs anexados.
    5. Se a informação não estiver nos documentos, peça para o humano intervir ou diga que não sabe.
    6. **IDIOMA**: Detecte e responda no idioma do usuário.
    
    ${config.systemInstructions}

    ${examplesText}

    ${websiteInstructions}

    BASE DE CONHECIMENTO (TEXTO):
    ${textKnowledgeBase}
  `;

  // 5. Handle Media Files (PDFs, Images)
  const mediaDocs = config.documents.filter(d => d.type === 'file' && !d.mimeType?.startsWith('text/'));
  
  let history: Content[] = [];

  if (mediaDocs.length > 0) {
    const parts = mediaDocs.map(doc => ({
      inlineData: {
        mimeType: doc.mimeType || 'application/pdf',
        data: doc.content // This is the base64 string
      }
    }));

    parts.push({
      text: "Aqui estão os documentos visuais, catálogos e manuais (PDF/Imagens) da empresa. Use o conteúdo destes arquivos como sua fonte primária."
    } as any);

    history = [
      { role: "user", parts: parts },
      { role: "model", parts: [{ text: "Entendido. Analisei os arquivos visuais e PDFs fornecidos." }] }
    ];
  }

  // Configure tools - enable Google Search if websites are present or just generally useful
  const tools = config.websites.length > 0 ? [{ googleSearch: {} }] : undefined;

  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash', // Supports Search tool
    history: history,
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
      tools: tools
    },
  });

  return chat;
};

export const sendMessageToAgent = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result = await chat.sendMessage({
      message: message
    });
    
    // Check for grounding metadata (sources) if needed, but for WhatsApp we return plain text.
    // The model usually incorporates the info into the text.
    return result.text || "Desculpe, não consegui processar a resposta.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Ocorreu um erro ao conectar com a IA. (Verifique sua conexão ou chave API).";
  }
};
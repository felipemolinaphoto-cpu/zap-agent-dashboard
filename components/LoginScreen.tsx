import React, { useState } from 'react';
import { Bot, Chrome, Loader2, AlertCircle } from 'lucide-react';
import { loginWithGoogle } from '../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O login foi cancelado.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Erro de Configuração: Verifique o arquivo services/firebase.ts');
      } else {
        setError('Falha ao conectar com Google. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 whatsapp-bg z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#00e676]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#00a884]/10 rounded-full blur-[100px]"></div>

      <div className="z-10 w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#00e676] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,230,118,0.3)]">
            <Bot size={40} className="text-[#0b141a]" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
            Zap <span className="text-[#00e676]">Agent</span>
          </h1>
          <p className="text-[#8696a0] text-center mt-2">
            Automatize seu WhatsApp com IA de verdade.
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-200 text-sm mb-4">
               <AlertCircle size={16} />
               {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[#e9edef] hover:bg-white text-[#0b141a] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <Loader2 size={20} className="animate-spin text-[#0b141a]" />
            ) : (
                <Chrome size={20} className="text-blue-500" />
            )}
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </button>
          
          <div className="relative flex py-4 items-center">
             <div className="flex-grow border-t border-[#2a3942]"></div>
             <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Acesso Seguro</span>
             <div className="flex-grow border-t border-[#2a3942]"></div>
          </div>

          <p className="text-xs text-center text-[#8696a0] leading-relaxed">
            Ao continuar, você concorda com os Termos de Serviço da plataforma. Seus agentes são salvos na nuvem.
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-[#8696a0] text-sm">
        Powered by <strong className="text-[#00e676]">Gemini 2.5</strong> & Firebase
      </div>
    </div>
  );
};

export default LoginScreen;
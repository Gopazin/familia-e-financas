import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface VoiceCommandResponse {
  action: 'navigate' | 'create_transaction' | 'show_info' | 'search' | 'error';
  target?: string;
  params?: any;
  response: string;
}

const GlobalVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [showCard, setShowCard] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setShowCard(true);
      setTranscript('');
      setResponse('');
      
      toast({
        title: "🎤 Escutando...",
        description: "Fale seu comando agora",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique as permissões do navegador",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error('Failed to convert audio');
        }

        // Step 1: Transcribe audio using OpenAI Whisper
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'ai-transaction-processor',
          {
            body: { audio: base64Audio, type: 'transcribe' }
          }
        );

        if (transcriptionError) throw transcriptionError;

        const transcribedText = transcriptionData.text || transcriptionData.transcription;
        setTranscript(transcribedText);

        // Step 2: Process command with AI
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const { data: commandData, error: commandError } = await supabase.functions.invoke(
          'voice-command-router',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: { 
              command: transcribedText,
              currentPage: location.pathname
            }
          }
        );

        if (commandError) throw commandError;

        const result: VoiceCommandResponse = commandData;
        setResponse(result.response);

        // Execute action
        if (result.action === 'navigate' && result.target) {
          setTimeout(() => {
            navigate(result.target!);
            toast({
              title: "✅ Navegando",
              description: result.response,
            });
            setShowCard(false);
          }, 2000);
        } else if (result.action === 'create_transaction') {
          toast({
            title: "✅ Transação criada",
            description: result.response,
          });
          // Refresh page data if on transactions page
          if (location.pathname === '/transacoes') {
            window.location.reload();
          }
        } else if (result.action === 'show_info') {
          // Info is already in response
          toast({
            title: "📊 Informações",
            description: "Veja os detalhes no card",
          });
        }
      };

    } catch (error) {
      console.error('Error processing audio:', error);
      setResponse('Erro ao processar comando. Tente novamente.');
      toast({
        title: "Erro ao processar comando",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      <Button
        onClick={handleMicClick}
        disabled={isProcessing}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-50 transition-all",
          isListening 
            ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
            : "bg-gradient-primary hover:bg-primary"
        )}
        size="icon"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        ) : isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Response Card */}
      {showCard && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] p-4 z-50 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-prosperity flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assistente de Voz</h4>
                <p className="text-xs text-muted-foreground">
                  {isListening ? 'Escutando...' : isProcessing ? 'Processando...' : 'Concluído'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCard(false)}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {transcript && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Você disse:</p>
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-medium text-primary mb-1">Resposta:</p>
              <p className="text-sm text-foreground whitespace-pre-line">{response}</p>
            </div>
          )}

          {isProcessing && !response && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default GlobalVoiceAssistant;

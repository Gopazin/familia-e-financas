import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmailConfirmationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Email confirmation handler:', { token, type, error, errorDescription });

      // Handle errors from Supabase
      if (error) {
        let message = 'Erro na confirmação do email.';
        
        if (error === 'expired_token') {
          message = 'Link de confirmação expirado. Solicite um novo link.';
        } else if (error === 'invalid_token') {
          message = 'Link de confirmação inválido. Verifique se o link está correto.';
        } else if (errorDescription) {
          message = errorDescription;
        }

        toast({
          variant: "destructive",
          title: "Erro na confirmação",
          description: message,
          duration: 10000,
        });
        return;
      }

      // Handle email confirmation
      if (token && type === 'email') {
        try {
          const { data, error: confirmError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (confirmError) {
            console.error('Email confirmation error:', confirmError);
            
            let message = 'Erro ao confirmar email.';
            if (confirmError.message.includes('expired')) {
              message = 'Link de confirmação expirado. Solicite um novo link através da opção "Reenviar confirmação".';
            } else if (confirmError.message.includes('invalid')) {
              message = 'Link de confirmação inválido. Verifique se o link está correto ou solicite um novo.';
            }

            toast({
              variant: "destructive",
              title: "Erro na confirmação",
              description: message,
              duration: 12000,
            });
          } else if (data.user) {
            console.log('Email confirmed successfully:', data.user.email);
            toast({
              title: "Email confirmado com sucesso!",
              description: "Sua conta foi ativada. Você já pode usar todos os recursos.",
              duration: 8000,
            });
            
            // Redirect to main page after successful confirmation
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } catch (error) {
          console.error('Unexpected error during email confirmation:', error);
          toast({
            variant: "destructive",
            title: "Erro inesperado",
            description: "Ocorreu um erro durante a confirmação. Tente novamente.",
          });
        }
      }

      // Handle password recovery
      if (type === 'recovery') {
        toast({
          title: "Link de recuperação válido",
          description: "Você pode alterar sua senha agora.",
        });
        navigate('/reset-password', { replace: true });
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  // Show a loading state if we're processing
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const error = searchParams.get('error');

  if (token && type && !error) {
    return (
      <div className="min-h-screen bg-gradient-prosperity flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl">Processando confirmação...</CardTitle>
            <CardDescription>
              Aguarde enquanto confirmamos seu email
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-prosperity flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Erro na confirmação</CardTitle>
            <CardDescription>
              {error === 'expired_token' 
                ? 'Link de confirmação expirado' 
                : 'Link de confirmação inválido'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {error === 'expired_token' 
                ? 'Solicite um novo link de confirmação através da opção "Reenviar confirmação" na página de login.'
                : 'Verifique se o link está correto ou solicite um novo link de confirmação.'
              }
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/auth')}
              >
                Ir para Login
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                Página Inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no token or type, just show the normal auth page content
  return null;
};

export default EmailConfirmationHandler;
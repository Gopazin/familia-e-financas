import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validação de força da senha
  const validatePassword = (password: string) => {
    let score = 0;
    let feedback = '';
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    switch (score) {
      case 0:
      case 1:
        feedback = 'Muito fraca - Use pelo menos 8 caracteres';
        break;
      case 2:
        feedback = 'Fraca - Adicione maiúsculas e números';
        break;
      case 3:
        feedback = 'Boa - Considere adicionar símbolos';
        break;
      case 4:
      case 5:
        feedback = 'Forte - Senha segura!';
        break;
    }
    
    return { score, feedback };
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(validatePassword(newPassword));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Erro de login",
            description: "Email ou senha incorretos. Verifique suas credenciais.",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "Email não confirmado",
            description: "Verifique seu email e clique no link de confirmação.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro de conexão",
            description: "Não foi possível fazer login. Tente novamente.",
          });
        }
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Digite seu email para recuperar a senha.",
      });
      return;
    }

    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setShowForgotPassword(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar força da senha antes de enviar
    if (passwordStrength.score < 3) {
      toast({
        variant: "destructive",
        title: "Senha muito fraca",
        description: "Use uma senha mais forte para maior segurança.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
          });
        } else if (error.message.includes('Password should be at least 6 characters')) {
          toast({
            variant: "destructive",
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 6 caracteres.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message || "Não foi possível criar a conta.",
          });
        }
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta. Pode estar na pasta de spam.",
          duration: 8000,
        });
        // Limpar formulário
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login com Google",
          description: "Não foi possível conectar com Google. Tente novamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login com Google.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-prosperity flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center text-white space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Família e Finanças</h1>
          <p className="text-white/90">
            Gerencie as finanças da sua família com segurança e praticidade
          </p>
        </div>

        {/* Auth Form */}
        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-prosperity bg-clip-text text-transparent">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta ou crie uma nova para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <Button 
                       type="submit" 
                       className="w-full bg-gradient-primary hover:bg-primary shadow-primary"
                       disabled={loading}
                     >
                       {loading ? 'Entrando...' : 'Entrar'}
                     </Button>
                   </div>
                   <div className="text-center">
                     <button
                       type="button"
                       onClick={() => setShowForgotPassword(true)}
                       className="text-sm text-primary hover:underline"
                     >
                       Esqueci minha senha
                     </button>
                   </div>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="signup-password"
                         type="password"
                         placeholder="Mínimo 8 caracteres, use maiúsculas e símbolos"
                         value={password}
                         onChange={(e) => handlePasswordChange(e.target.value)}
                         className="pl-10"
                         minLength={8}
                         required
                       />
                     </div>
                     {password && (
                       <div className="space-y-2">
                         <div className="flex items-center gap-2 text-sm">
                           {passwordStrength.score >= 3 ? (
                             <CheckCircle className="w-4 h-4 text-green-600" />
                           ) : (
                             <AlertCircle className="w-4 h-4 text-orange-500" />
                           )}
                           <span className={passwordStrength.score >= 3 ? 'text-green-600' : 'text-orange-500'}>
                             {passwordStrength.feedback}
                           </span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div 
                             className={`h-2 rounded-full transition-all ${
                               passwordStrength.score <= 2 ? 'bg-red-500' :
                               passwordStrength.score === 3 ? 'bg-orange-500' : 'bg-green-500'
                             }`}
                             style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                           />
                         </div>
                       </div>
                      )}
                   </div>
                   <Button
                     type="submit" 
                     className="w-full bg-gradient-secondary hover:bg-secondary shadow-success"
                     disabled={loading || (password && passwordStrength.score < 3)}
                   >
                     {loading ? 'Criando conta...' : 'Criar conta'}
                   </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full border-2 hover:bg-accent transition-smooth"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Conectando...' : 'Continuar com Google'}
            </Button>

            <Separator className="my-6" />

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-primary">Segurança Avançada</p>
                <p className="text-muted-foreground">
                  Criptografia AES-256, autenticação 2FA disponível e proteção contra ataques
                </p>
              </div>
            </div>
            
            {/* Email Confirmation Notice */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Confirmação por email</p>
                <p className="text-blue-600">
                  Após o cadastro, verifique seu email (inclusive spam) para ativar sua conta
                </p>
              </div>
            </div>

             {/* Trial Info */}
             <div className="mt-4 p-4 bg-gradient-success rounded-lg text-white text-center">
               <p className="font-semibold">🎉 7 dias grátis para novos usuários!</p>
               <p className="text-sm text-white/90 mt-1">
                 Experimente todas as funcionalidades sem compromisso
               </p>
             </div>
           </CardContent>
         </Card>

         {/* Forgot Password Modal */}
         {showForgotPassword && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
             <Card className="w-full max-w-md bg-white">
               <CardHeader>
                 <CardTitle>Recuperar Senha</CardTitle>
                 <CardDescription>
                   Digite seu email para receber o link de recuperação
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <form onSubmit={handleForgotPassword} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="reset-email">Email</Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="reset-email"
                         type="email"
                         placeholder="seu@email.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-10"
                         required
                       />
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button
                       type="button"
                       variant="outline"
                       className="flex-1"
                       onClick={() => setShowForgotPassword(false)}
                     >
                       Cancelar
                     </Button>
                     <Button
                       type="submit"
                       className="flex-1"
                       disabled={loading}
                     >
                       {loading ? 'Enviando...' : 'Enviar'}
                     </Button>
                   </div>
                 </form>
               </CardContent>
             </Card>
           </div>
         )}
       </div>
     </div>
   );
};

export default Auth;
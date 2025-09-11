import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [searchParams] = useSearchParams();
  const { updatePassword, session } = useAuth();
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

  useEffect(() => {
    // Se não há sessão e não há access_token na URL, redirecionar para login
    const accessToken = searchParams.get('access_token');
    if (!session && !accessToken) {
      toast({
        variant: "destructive",
        title: "Sessão inválida",
        description: "Link de recuperação inválido ou expirado.",
      });
      navigate('/auth');
    }
  }, [session, searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "Confirme se as senhas são idênticas.",
      });
      return;
    }

    if (passwordStrength.score < 3) {
      toast({
        variant: "destructive",
        title: "Senha muito fraca",
        description: "Use uma senha mais forte para maior segurança.",
      });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    
    if (!error) {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso. Redirecionando...",
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-prosperity flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center text-white space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
          <h1 className="text-3xl font-bold">Redefinir Senha</h1>
          <p className="text-white/90">
            Digite sua nova senha
          </p>
        </div>

        {/* Reset Form */}
        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-prosperity bg-clip-text text-transparent">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-center">
              Escolha uma senha forte e segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">As senhas não coincidem</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary shadow-primary"
                disabled={loading || passwordStrength.score < 3 || password !== confirmPassword}
              >
                {loading ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Notification from '../common/Notification';

const Register: React.FC = () => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }
    
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Erro já será tratado pelo contexto de autenticação
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ikigai Planner</h1>
          <p className="mt-2 text-gray-600">Crie sua conta para começar</p>
        </div>
        
        <Card>
          {error && (
            <Notification 
              type="error" 
              message="Erro no registro" 
              description={error} 
              onClose={clearError} 
            />
          )}
          
          {errorMessage && (
            <Notification 
              type="warning" 
              message="Atenção" 
              description={errorMessage} 
              onClose={() => setErrorMessage(null)} 
            />
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              helperText="Mínimo de 6 caracteres"
              required
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
            >
              Registrar
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                Faça login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;

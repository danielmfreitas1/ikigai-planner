import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Notification from '../common/Notification';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      await login(email, password);
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
          <p className="mt-2 text-gray-600">Entre para acessar seu planner</p>
        </div>
        
        <Card>
          {error && (
            <Notification 
              type="error" 
              message="Erro de autenticação" 
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
              required
            />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar-me
                </label>
              </div>
              
              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
            >
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500">
                Registre-se
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

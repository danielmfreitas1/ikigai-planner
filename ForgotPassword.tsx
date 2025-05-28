import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Notification from '../common/Notification';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { forgotPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email) {
      setErrorMessage('Por favor, informe seu email');
      return;
    }
    
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      // Erro já será tratado pelo contexto de autenticação
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ikigai Planner</h1>
          <p className="mt-2 text-gray-600">Recuperação de senha</p>
        </div>
        
        <Card>
          {error && (
            <Notification 
              type="error" 
              message="Erro na recuperação" 
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
          
          {submitted ? (
            <div className="text-center py-4">
              <svg 
                className="mx-auto h-12 w-12 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Email enviado!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enviamos instruções para recuperar sua senha para {email}.
                Por favor, verifique sua caixa de entrada.
              </p>
              <div className="mt-6">
                <Link to="/login">
                  <Button variant="outline">Voltar para o login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-sm text-gray-600">
                Informe seu email e enviaremos instruções para redefinir sua senha.
              </p>
              
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
              >
                Enviar instruções
              </Button>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

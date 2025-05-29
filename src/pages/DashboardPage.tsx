import React from 'react';
import { usePlanner } from '../contexts/PlannerContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const DashboardPage: React.FC = () => {
  const { planners, loading, error, fetchPlanners, createPlanner, deletePlanner } = usePlanner();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    fetchPlanners();
  }, [fetchPlanners]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTitle('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    try {
      const response = await createPlanner({
        title,
        ikigaiValues: {
          mission: '',
          vision: '',
          values: [],
          yearFocus: ''
        }
      });
      
      setSuccessMessage('Planner criado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseModal();
      
      // Navegar para o novo planner
      if (response && typeof response === 'object' && '_id' in response) {
        navigate(`/planner/${response._id}`);
      }
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este planner? Esta ação não pode ser desfeita.')) {
      try {
        await deletePlanner(id);
        setSuccessMessage('Planner excluído com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        // Erro já será tratado pelo contexto
      }
    }
  };

  const handleOpenPlanner = (id: string) => {
    navigate(`/planner/${id}`);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Meus Planners</h1>
        <Button onClick={handleOpenModal}>Novo Planner</Button>
      </div>

      {error && (
        <Notification
          type="error"
          message="Erro ao carregar planners"
          description={error}
        />
      )}
      
      {successMessage && (
        <Notification
          type="success"
          message={successMessage}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planners && planners.length > 0 ? (
            planners.map((planner) => (
              <Card
                key={planner._id}
                title={planner.title}
                className="hover:shadow-lg transition-shadow duration-300"
                footer={
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Criado em: {new Date(planner.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleDelete(planner._id)}
                      >
                        Excluir
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => handleOpenPlanner(planner._id)}
                      >
                        Abrir
                      </Button>
                    </div>
                  </div>
                }
              >
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Missão</h4>
                  <p className="text-gray-600 text-sm">
                    {planner.ikigaiValues.mission || 'Nenhuma missão definida'}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Foco do Ano</h4>
                  <p className="text-gray-600 text-sm">
                    {planner.ikigaiValues.yearFocus || 'Nenhum foco definido'}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Nenhum planner encontrado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando seu primeiro Ikigai Planner.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleOpenModal}>Criar Planner</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Planner"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" form="planner-form" isLoading={loading}>
              Criar
            </Button>
          </div>
        }
      >
        <form id="planner-form" onSubmit={handleSubmit}>
          <Input
            label="Título do Planner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Meu Ikigai 2025"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Você poderá definir sua missão, visão, valores e foco do ano após criar o planner.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;

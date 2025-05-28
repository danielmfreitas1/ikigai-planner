import React from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';

interface MonthlyGoalsProps {
  plannerId: string;
}

const MonthlyGoals: React.FC<MonthlyGoalsProps> = ({ plannerId }) => {
  const { goals, fetchGoals, createGoal, updateGoal, deleteGoal, loading, error } = usePlanner();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentGoal, setCurrentGoal] = React.useState<any>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [lifeRole, setLifeRole] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    fetchGoals(plannerId, currentMonth, currentYear);
  }, [fetchGoals, plannerId, currentMonth, currentYear]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setLifeRole('');
    setCurrentGoal(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setCurrentGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setDueDate(goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '');
    setLifeRole(goal.lifeRole || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      lifeRole,
      month: currentMonth,
      year: currentYear,
      completed: currentGoal?.completed || false,
      progress: currentGoal?.progress || 0
    };
    
    try {
      if (currentGoal) {
        await updateGoal(currentGoal._id, goalData);
        setSuccessMessage('Meta atualizada com sucesso!');
      } else {
        await createGoal(plannerId, goalData);
        setSuccessMessage('Meta criada com sucesso!');
      }
      handleCloseModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await deleteGoal(id);
        setSuccessMessage('Meta excluída com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        // Erro já será tratado pelo contexto
      }
    }
  };

  const handleToggleComplete = async (goal: any) => {
    try {
      await updateGoal(goal._id, {
        ...goal,
        completed: !goal.completed,
        progress: !goal.completed ? 100 : goal.progress
      });
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleUpdateProgress = async (goal: any, progress: number) => {
    try {
      await updateGoal(goal._id, {
        ...goal,
        progress,
        completed: progress === 100
      });
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month - 1];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Metas de {getMonthName(currentMonth)} {currentYear}
        </h2>
        <Button onClick={() => handleOpenModal()}>Nova Meta</Button>
      </div>

      {error && (
        <Notification
          type="error"
          message="Erro ao carregar metas"
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
        <div className="space-y-4">
          {goals && goals.length > 0 ? (
            goals.map((goal: any) => (
              <Card
                key={goal._id}
                className={`border-l-4 ${goal.completed ? 'border-l-green-500' : 'border-l-blue-500'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => handleToggleComplete(goal)}
                      className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className={`font-medium ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {goal.lifeRole && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {goal.lifeRole}
                          </span>
                        )}
                        {goal.dueDate && (
                          <span>
                            Prazo: {new Date(goal.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso: {goal.progress}%</span>
                    <span>{goal.completed ? 'Concluído' : 'Em andamento'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleUpdateProgress(goal, value)}
                        className={`text-xs px-2 py-1 rounded ${
                          goal.progress === value
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          ) : (
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
                  Nenhuma meta para este mês
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando suas metas mensais para acompanhar seu progresso.
                </p>
                <div className="mt-6">
                  <Button onClick={() => handleOpenModal()}>Criar Meta</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentGoal ? 'Editar Meta' : 'Nova Meta'}
        size="lg"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" form="goal-form" isLoading={loading}>
              {currentGoal ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <form id="goal-form" onSubmit={handleSubmit}>
          <Input
              label="Título"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Digite o título da meta..."
              required
          />       
          <Input
            label="Descrição"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            placeholder="Digite uma descrição detalhada..."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data de Conclusão"
              type="date"
              value={dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
            />
            
            <Input
              label="Papel de Vida"
              value={lifeRole}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLifeRole(e.target.value)}
              placeholder="Ex: Profissional, Familiar, Pessoal..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MonthlyGoals;

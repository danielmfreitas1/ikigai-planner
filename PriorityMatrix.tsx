import React from 'react';
import { usePlanner } from '../../contexts/PlannerContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Notification from '../common/Notification';

interface PriorityMatrixProps {
  plannerId: string;
}

const PriorityMatrix: React.FC<PriorityMatrixProps> = ({ plannerId }) => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, loading, error } = usePlanner();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState<any>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [lifeRole, setLifeRole] = React.useState('');
  const [importance, setImportance] = React.useState(false);
  const [urgency, setUrgency] = React.useState(false);
  const [energyCategory, setEnergyCategory] = React.useState('');
  const [entropyCategory, setEntropyCategory] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTasks(plannerId);
  }, [fetchTasks, plannerId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setLifeRole('');
    setImportance(false);
    setUrgency(false);
    setEnergyCategory('');
    setEntropyCategory('');
    setCurrentTask(null);
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setLifeRole(task.lifeRole || '');
      setImportance(task.importance || false);
      setUrgency(task.urgency || false);
      setEnergyCategory(task.energyCategory || '');
      setEntropyCategory(task.entropyCategory || '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      lifeRole,
      importance,
      urgency,
      energyCategory,
      entropyCategory,
      completed: currentTask?.completed || false,
      priority: getPriorityLabel(importance, urgency)
    };
    
    try {
      if (currentTask) {
        await updateTask(currentTask._id, taskData);
        setSuccessMessage('Tarefa atualizada com sucesso!');
      } else {
        await createTask(plannerId, taskData);
        setSuccessMessage('Tarefa criada com sucesso!');
      }
      handleCloseModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(id);
        setSuccessMessage('Tarefa excluída com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        // Erro já será tratado pelo contexto
      }
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      await updateTask(task._id, {
        ...task,
        completed: !task.completed
      });
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const getPriorityLabel = (important: boolean, urgent: boolean) => {
    if (important && urgent) return 'Fazer Agora';
    if (important && !urgent) return 'Agendar';
    if (!important && urgent) return 'Delegar';
    return 'Eliminar';
  };

  const getQuadrantTasks = (important: boolean, urgent: boolean) => {
    return tasks.filter(task => 
      task.importance === important && 
      task.urgency === urgent
    );
  };

  const getQuadrantColor = (important: boolean, urgent: boolean) => {
    if (important && urgent) return 'bg-red-50 border-red-200';
    if (important && !urgent) return 'bg-blue-50 border-blue-200';
    if (!important && urgent) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getQuadrantTitle = (important: boolean, urgent: boolean) => {
    if (important && urgent) return 'Fazer Agora';
    if (important && !urgent) return 'Agendar';
    if (!important && urgent) return 'Delegar';
    return 'Eliminar';
  };

  const getQuadrantDescription = (important: boolean, urgent: boolean) => {
    if (important && urgent) return 'Tarefas importantes e urgentes que exigem atenção imediata';
    if (important && !urgent) return 'Tarefas importantes mas não urgentes que devem ser planejadas';
    if (!important && urgent) return 'Tarefas urgentes mas não importantes que podem ser delegadas';
    return 'Tarefas nem importantes nem urgentes que podem ser eliminadas';
  };

  const energyCategories = ['EMOCIONAL', 'ESPIRITUAL', 'MENTAL', 'FÍSICA'];
  const entropyCategories = ['Ação', 'Planejamento', 'Organização', 'HiperFoco', 'Única Coisa', 'Conhecimento'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Matriz de Priorização</h2>
        <Button onClick={() => handleOpenModal()}>Nova Tarefa</Button>
      </div>

      {error && (
        <Notification
          type="error"
          message="Erro ao carregar tarefas"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrante 1: Importante e Urgente */}
          <Card className={`${getQuadrantColor(true, true)} border`}>
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-800">{getQuadrantTitle(true, true)}</h3>
              <p className="text-sm text-gray-600">{getQuadrantDescription(true, true)}</p>
            </div>
            <div className="space-y-2">
              {getQuadrantTasks(true, true).length > 0 ? (
                getQuadrantTasks(true, true).map((task: any) => (
                  <div 
                    key={task._id} 
                    className={`p-2 rounded border ${task.completed ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </h4>
                          {task.lifeRole && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mt-1">
                              {task.lifeRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleOpenModal(task)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma tarefa neste quadrante</p>
              )}
            </div>
          </Card>

          {/* Quadrante 2: Importante e Não Urgente */}
          <Card className={`${getQuadrantColor(true, false)} border`}>
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-800">{getQuadrantTitle(true, false)}</h3>
              <p className="text-sm text-gray-600">{getQuadrantDescription(true, false)}</p>
            </div>
            <div className="space-y-2">
              {getQuadrantTasks(true, false).length > 0 ? (
                getQuadrantTasks(true, false).map((task: any) => (
                  <div 
                    key={task._id} 
                    className={`p-2 rounded border ${task.completed ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </h4>
                          {task.lifeRole && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mt-1">
                              {task.lifeRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleOpenModal(task)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma tarefa neste quadrante</p>
              )}
            </div>
          </Card>

          {/* Quadrante 3: Não Importante e Urgente */}
          <Card className={`${getQuadrantColor(false, true)} border`}>
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-800">{getQuadrantTitle(false, true)}</h3>
              <p className="text-sm text-gray-600">{getQuadrantDescription(false, true)}</p>
            </div>
            <div className="space-y-2">
              {getQuadrantTasks(false, true).length > 0 ? (
                getQuadrantTasks(false, true).map((task: any) => (
                  <div 
                    key={task._id} 
                    className={`p-2 rounded border ${task.completed ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                          className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </h4>
                          {task.lifeRole && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mt-1">
                              {task.lifeRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleOpenModal(task)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma tarefa neste quadrante</p>
              )}
            </div>
          </Card>

          {/* Quadrante 4: Não Importante e Não Urgente */}
          <Card className={`${get
(Content truncated due to size limit. Use line ranges to read in chunks)
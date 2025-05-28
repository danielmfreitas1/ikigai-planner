import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../../contexts/PlannerContext';
import { useParams } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Notification from '../../../components/common/Notification';

interface Project {
  _id: string;
  plannerId: string;
  title: string;
  description: string;
  dueDate: string | null;
  completed: boolean;
  progress: number;
  lifeRole: string;
}

interface RouteParams {
  id: string;
  [key: string]: string | undefined;
}

const Projects: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject } = usePlanner();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lifeRole, setLifeRole] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProjects(id);
    }
  }, [id, fetchProjects]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setLifeRole('');
    setCurrentProject(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setDueDate(project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '');
    setLifeRole(project.lifeRole || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      lifeRole,
      completed: currentProject?.completed || false,
      progress: currentProject?.progress || 0
    };
    
    try {
      if (currentProject) {
        await updateProject(currentProject._id, projectData);
        setSuccessMessage('Projeto atualizado com sucesso!');
      } else if (id) {
        await createProject(id, projectData);
        setSuccessMessage('Projeto criado com sucesso!');
      }
      handleCloseModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProject(id);
        setSuccessMessage('Projeto excluído com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        // Erro já será tratado pelo contexto
      }
    }
  };

  const handleToggleComplete = async (project: any) => {
    try {
      await updateProject(project._id, {
        ...project,
        completed: !project.completed,
        progress: !project.completed ? 100 : project.progress
      });
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  const handleUpdateProgress = async (project: any, progress: number) => {
    try {
      await updateProject(project._id, {
        ...project,
        progress,
        completed: progress === 100
      });
    } catch (err: any) {
      // Erro já será tratado pelo contexto
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Projetos Importantes</h2>
        <Button onClick={() => handleOpenModal()}>Novo Projeto</Button>
      </div>

      {error && (
        <Notification
          type="error"
          message="Erro ao carregar projetos"
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
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Card
                key={project._id}
                className={`border-l-4 ${project.completed ? 'border-l-green-500' : 'border-l-purple-500'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={project.completed}
                      onChange={() => handleToggleComplete(project)}
                      className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className={`font-medium ${project.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {project.lifeRole && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {project.lifeRole}
                          </span>
                        )}
                        {project.dueDate && (
                          <span>
                            Prazo: {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
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
                    <span>Progresso: {project.progress}%</span>
                    <span>{project.completed ? 'Concluído' : 'Em andamento'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleUpdateProgress(project, value)}
                        className={`text-xs px-2 py-1 rounded ${
                          project.progress === value
                            ? 'bg-purple-100 text-purple-800'
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
                  Nenhum projeto importante
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando seus projetos importantes para acompanhar seu progresso.
                </p>
                <div className="mt-6">
                  <Button onClick={() => handleOpenModal()}>Criar Projeto</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentProject ? 'Editar Projeto' : 'Novo Projeto'}
        size="lg"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" form="project-form" isLoading={loading}>
              {currentProject ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <form id="project-form" onSubmit={handleSubmit}>
          <Input
              label="Título"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Digite o título do projeto..."
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

export default Projects;

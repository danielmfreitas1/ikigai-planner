import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { plannerService, taskService, projectService, goalService } from '../services/services';

interface Planner {
  _id: string;
  userId: string;
  title: string;
  ikigaiValues: {
    mission: string;
    vision: string;
    values: string[];
    yearFocus: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  plannerId: string;
  title: string;
  description: string;
  dueDate: string | null;
  completed: boolean;
  energyCategory: string;
  entropyCategory: string;
  lifeRole: string;
  priority: string;
  importance: boolean;
  urgency: boolean;
  projectId?: string;
  reminders: {
    time: string;
    sent: boolean;
  }[];
}

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

interface Goal {
  _id: string;
  plannerId: string;
  title: string;
  description: string;
  dueDate: string | null;
  completed: boolean;
  progress: number;
  lifeRole: string;
  month: number;
  year: number;
}

interface PlannerContextType {
  planners: Planner[];
  currentPlanner: Planner | null;
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  
  // Planner actions
  fetchPlanners: () => Promise<void>;
  fetchPlanner: (id: string) => Promise<void>;
  createPlanner: (plannerData: Partial<Planner>) => Promise<Planner>;
  updatePlanner: (id: string, plannerData: Partial<Planner>) => Promise<Planner>;
  deletePlanner: (id: string) => Promise<void>;
  
  // Task actions
  fetchTasks: (plannerId: string) => Promise<void>;
  createTask: (plannerId: string, taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Project actions
  fetchProjects: (plannerId: string) => Promise<void>;
  createProject: (plannerId: string, projectData: Partial<Project>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Goal actions
  fetchGoals: (plannerId: string, month?: number, year?: number) => Promise<void>;
  createGoal: (plannerId: string, goalData: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  clearError: () => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [currentPlanner, setCurrentPlanner] = useState<Planner | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Planner actions
  const fetchPlanners = async () => {
    setLoading(true);
    try {
      const response = await plannerService.getPlanners();
      setPlanners(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar planners');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanner = async (id: string) => {
    setLoading(true);
    try {
      const response = await plannerService.getPlanner(id);
      setCurrentPlanner(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar planner');
    } finally {
      setLoading(false);
    }
  };

  const createPlanner = async (plannerData: Partial<Planner>): Promise<Planner> => {
    setLoading(true);
    try {
      const response = await plannerService.createPlanner(plannerData);
      setPlanners([...planners, response.data]);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar planner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlanner = async (id: string, plannerData: Partial<Planner>): Promise<Planner> => {
    setLoading(true);
    try {
      const response = await plannerService.updatePlanner(id, plannerData);
      setPlanners(planners.map(p => p._id === id ? response.data : p));
      if (currentPlanner && currentPlanner._id === id) {
        setCurrentPlanner(response.data);
      }
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar planner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlanner = async (id: string) => {
    setLoading(true);
    try {
      await plannerService.deletePlanner(id);
      setPlanners(planners.filter(p => p._id !== id));
      if (currentPlanner && currentPlanner._id === id) {
        setCurrentPlanner(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir planner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Task actions
  const fetchTasks = async (plannerId: string) => {
    setLoading(true);
    try {
      const response = await taskService.getTasks(plannerId);
      setTasks(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (plannerId: string, taskData: Partial<Task>) => {
    setLoading(true);
    try {
      const response = await taskService.createTask(plannerId, taskData);
      setTasks([...tasks, response.data]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar tarefa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    setLoading(true);
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(tasks.map(t => t._id === id ? response.data : t));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar tarefa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir tarefa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Project actions
  const fetchProjects = async (plannerId: string) => {
    setLoading(true);
    try {
      const response = await projectService.getProjects(plannerId);
      setProjects(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar projetos');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (plannerId: string, projectData: Partial<Project>) => {
    setLoading(true);
    try {
      const response = await projectService.createProject(plannerId, projectData);
      setProjects([...projects, response.data]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar projeto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    setLoading(true);
    try {
      const response = await projectService.updateProject(id, projectData);
      setProjects(projects.map(p => p._id === id ? response.data : p));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar projeto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir projeto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Goal actions
  const fetchGoals = async (plannerId: string, month?: number, year?: number) => {
    setLoading(true);
    try {
      const response = await goalService.getGoals(plannerId, month, year);
      setGoals(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar metas');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (plannerId: string, goalData: Partial<Goal>) => {
    setLoading(true);
    try {
      const response = await goalService.createGoal(plannerId, goalData);
      setGoals([...goals, response.data]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    setLoading(true);
    try {
      const response = await goalService.updateGoal(id, goalData);
      setGoals(goals.map(g => g._id === id ? response.data : g));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setLoading(true);
    try {
      await goalService.deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir meta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpar erros
  const clearError = () => {
    setError(null);
  };

  return (
    <PlannerContext.Provider
      value={{
        planners,
        currentPlanner,
        tasks,
        projects,
        goals,
        loading,
        error,
        fetchPlanners,
        fetchPlanner,
        createPlanner,
        updatePlanner,
        deletePlanner,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        clearError
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

// Hook personalizado para usar o contexto do planner
export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner deve ser usado dentro de um PlannerProvider');
  }
  return context;
};

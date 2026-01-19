import { create } from 'zustand';

interface Task {
  id: string;
  type: 'prompt' | 'script' | 'analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

interface TaskStore {
  tasks: Record<string, Task>;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},

  addTask: (task) => {
    set((state) => ({
      tasks: { ...state.tasks, [task.id]: task }
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: { ...state.tasks[id], ...updates }
      }
    }));
  },

  removeTask: (id) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[id];
      return { tasks: newTasks };
    });
  },

  getTask: (id) => {
    return get().tasks[id];
  },
}));
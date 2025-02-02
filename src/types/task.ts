export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "shopping" | "health";
export type ViewMode = "board" | "list";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type ActivityType = "created" | "edited" | "deleted" | "status_changed";

export interface TaskActivity {
  id: string;
  type: ActivityType;
  timestamp: string;
  details: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string;
  dueDate: string;
  status: TaskStatus;
  activities?: TaskActivity[];
}

export interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  onComplete: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onTasksReorder?: (tasks: Task[]) => void;
}
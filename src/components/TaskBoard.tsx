import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TaskBoardProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskBoard = ({ tasks, onComplete, onTaskClick, onEdit, onDelete }: TaskBoardProps) => {
  const columns = {
    todo: {
      title: "TO-DO",
      tasks: tasks.filter((task) => !task.completed),
      bgColor: "bg-pink-100",
    },
    inProgress: {
      title: "IN-PROGRESS",
      tasks: tasks.filter(
        (task) => !task.completed && task.category === "work"
      ),
      bgColor: "bg-blue-100",
    },
    completed: {
      title: "COMPLETED",
      tasks: tasks.filter((task) => task.completed),
      bgColor: "bg-green-100",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(columns).map(([key, column]) => (
        <div key={key} className="space-y-4">
          <div className={`${column.bgColor} p-4 rounded-lg`}>
            <h2 className="font-medium">
              {column.title} ({column.tasks.length})
            </h2>
          </div>

          <div className="space-y-4">
            {column.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No tasks in {column.title.toLowerCase()}
              </div>
            ) : (
              column.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg p-4 space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(task.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Badge
                      variant="secondary"
                      className={`${
                        task.category === "work"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {task.category}
                    </Badge>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
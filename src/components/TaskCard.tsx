import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onClick: (task: Task) => void;
}

const priorityColors = {
  low: "bg-task-low text-sky-700",
  medium: "bg-task-medium text-amber-700",
  high: "bg-task-high text-red-700",
};

const categoryColors = {
  work: "bg-purple-100 text-purple-700",
  personal: "bg-green-100 text-green-700",
  shopping: "bg-blue-100 text-blue-700",
  health: "bg-pink-100 text-pink-700",
};

export const TaskCard = ({ task, onComplete, onClick }: TaskCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="task-card group"
      onClick={() => onClick(task)}
    >
      <Card className="border-0 shadow-none">
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            className="mt-1 transition-transform duration-200 hover:scale-110"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </button>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3
                className={`font-medium ${
                  task.completed ? "text-gray-400 line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {task.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={`${categoryColors[task.category]} border-0`}
              >
                {task.category}
              </Badge>
              {task.dueDate && (
                <Badge variant="outline" className="border-gray-200">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
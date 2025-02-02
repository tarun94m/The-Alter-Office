import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";

interface DraggableTaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

export const DraggableTaskItem = ({ task, onComplete }: DraggableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-move"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onComplete(task.id)}
        className="h-5 w-5 rounded-full border-2 border-gray-300"
      />
      <div className="grid grid-cols-4 gap-4 flex-1 items-center">
        <div className="font-medium">{task.title}</div>
        <div className="text-sm text-gray-500">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
        </div>
        <div>
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700"
          >
            {task.completed ? "COMPLETED" : "TO-DO"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
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
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
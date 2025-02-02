import { Task, Category, TaskStatus, TaskActivity, TaskListProps } from "@/types/task";
import { Button } from "./ui/button";
import { Plus, MoreHorizontal, GripVertical, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NoResults } from "./NoResults";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { DraggableTaskItem } from "./DraggableTaskItem";

export const TaskList = ({
  tasks,
  searchQuery,
  onComplete,
  onTaskClick,
  onEdit,
  onDelete,
  onAddTask,
  onTasksReorder,
}: TaskListProps) => {
  const isMobile = useIsMobile();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "work" as Category,
    status: "todo" as TaskStatus,
    dueDate: new Date().toISOString().split("T")[0],
  });
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    todo: false,
    inProgress: false,
    completed: false,
  });
  const { toast } = useToast();

  const sections = {
    todo: tasks.filter((task) => !task.completed && task.status === "todo"),
    inProgress: tasks.filter(
      (task) => !task.completed && task.status === "in-progress"
    ),
    completed: tasks.filter((task) => task.completed || task.status === "completed"),
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addTaskActivity = (task: Task, type: TaskActivity["type"], details: string) => {
    const activity: TaskActivity = {
      id: Math.random().toString(36).substring(7),
      type,
      timestamp: new Date().toISOString(),
      details,
    };

    const updatedTask = {
      ...task,
      activities: [...(task.activities || []), activity],
    };

    onEdit(updatedTask);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    const task: Partial<Task> = {
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      status: "todo",
      dueDate: newTask.dueDate,
    };

    onAddTask(task);
    setNewTask({
      title: "",
      description: "",
      category: "work" as Category,
      status: "todo" as TaskStatus,
      dueDate: new Date().toISOString().split("T")[0],
    });
    setShowAddTaskInput(false);
  };

  const formatDueDate = (date: string) => {
    const today = new Date();
    const dueDate = new Date(date);
    
    if (
      today.getDate() === dueDate.getDate() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getFullYear() === dueDate.getFullYear()
    ) {
      return "Today";
    }
    
    return new Date(date).toLocaleDateString();
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        status: newStatus,
        completed: newStatus === "completed",
      };
      addTaskActivity(
        task,
        "status_changed",
        `Status changed from ${task.status} to ${newStatus}`
      );
      onEdit(updatedTask);
    }
  };

  const handleEdit = (task: Task) => {
    addTaskActivity(task, "edited", "Task details were updated");
    onEdit(task);
  };

  const handleDelete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      addTaskActivity(task, "deleted", "Task was deleted");
      onDelete(taskId);
    }
  };

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    selectedTasks.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        onEdit({
          ...task,
          status: newStatus,
          completed: newStatus === "completed",
        });
      }
    });
    setSelectedTasks([]);
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach((taskId) => {
      onDelete(taskId);
    });
    setSelectedTasks([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeTask = tasks.find((t) => t.id === active.id);
      const overTask = tasks.find((t) => t.id === over.id);
      
      if (activeTask && overTask) {
        const reorderedTasks = [...tasks];
        const activeIndex = tasks.indexOf(activeTask);
        const overIndex = tasks.indexOf(overTask);
        
        reorderedTasks.splice(activeIndex, 1);
        reorderedTasks.splice(overIndex, 0, activeTask);
        
        if (onTasksReorder) {
          onTasksReorder(reorderedTasks);
        }
      }
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="space-y-4 relative min-h-[600px]">
      {!isMobile && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Due On</TableHead>
              <TableHead>Task Status</TableHead>
              <TableHead>Task Category</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )}
 
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionKey, sectionTasks]) => (
          <motion.div
            key={sectionKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div
              className={`p-4 rounded-lg ${
                sectionKey === "todo"
                  ? "bg-pink-100"
                  : sectionKey === "inProgress"
                  ? "bg-blue-100"
                  : "bg-green-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => toggleSection(sectionKey)}
                >
                  <h3 className="font-medium capitalize">
                    {sectionKey === "inProgress" ? "In-Progress" : sectionKey} (
                    {sectionTasks.length})
                  </h3>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      collapsedSections[sectionKey] ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
                {sectionKey === "todo" && !showAddTaskInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddTaskInput(true)}
                    className="text-gray-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>

            {!collapsedSections[sectionKey] && (
              <>
                {sectionKey === "todo" && showAddTaskInput && (
                  <div className="p-4 border rounded-lg bg-white space-y-4">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                      />
                      <Select
                        value={newTask.category}
                        onValueChange={(value: Category) =>
                          setNewTask({ ...newTask, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          {/* <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="health">Health</SelectItem> */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-start gap-2">
                      <Button onClick={handleAddTask} className="bg-purple-600">
                        ADD
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddTaskInput(false)}
                      >
                        CANCEL
                      </Button>
                    </div>
                  </div>
                )}

                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  {isMobile ? (
                    <div className="space-y-2">
                      {sectionTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 bg-white rounded-lg border ${
                            task.completed ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={task.completed ? "line-through" : ""}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={() => toggleTaskSelection(task.id)}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableBody>
                      {sectionTasks.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-gray-500 py-8"
                          >
                            No tasks in{" "}
                            {sectionKey === "inProgress"
                              ? "in-progress"
                              : sectionKey.toLowerCase()}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <SortableContext
                          items={sectionTasks}
                          strategy={verticalListSortingStrategy}
                        >
                          {sectionTasks.map((task) => (
                            <TableRow
                              key={task.id}
                              className={task.completed ? "line-through" : ""}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedTasks.includes(task.id)}
                                  onCheckedChange={() => toggleTaskSelection(task.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                              </TableCell>
                              <TableCell>{task.title}</TableCell>
                              <TableCell>{formatDueDate(task.dueDate)}</TableCell>
                              <TableCell>
                                <Select
                                  value={task.status}
                                  onValueChange={(value) =>
                                    handleStatusChange(task.id, value as TaskStatus)
                                  }
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">Todo</SelectItem>
                                    <SelectItem value="in-progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="capitalize">{task.category}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </SortableContext>
                      )}
                      </TableBody>
                    </Table>
                  )}
                </DndContext>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Action Bar */}
      <AnimatePresence>
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <span>{selectedTasks.length} Tasks Selected</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTasks([])}
                className="text-white hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-6 w-px bg-zinc-700" />
            <Select onValueChange={(value) => handleBulkStatusChange(value as TaskStatus)}>
              <SelectTrigger className="w-[130px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editingTask && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingTask.title}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={editingTask.category}
                        onValueChange={(value: Category) =>
                          setEditingTask({ ...editingTask, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={new Date(editingTask.dueDate)
                          .toISOString()
                          .split("T")[0]}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            dueDate: new Date(e.target.value).toISOString(),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={editingTask.status}
                        onValueChange={(value: TaskStatus) =>
                          setEditingTask({
                            ...editingTask,
                            status: value,
                            completed: value === "completed",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Activity</h3>
                  <div className="space-y-4">
                    {editingTask.activities?.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between text-sm"
                      >
                        <div>
                          <p className="text-gray-700">{activity.details}</p>
                          <p className="text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <input id="file" type="file" onChange={()=>{}} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingTask) {
                  handleEdit(editingTask);
                  setEditingTask(null);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

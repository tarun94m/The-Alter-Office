import { useState } from "react";
import { Task, ViewMode, Priority, Category, TaskActivity } from "@/types/task";
import { TaskList } from "@/components/TaskList";
import { TaskBoard } from "@/components/TaskBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Search, X, ChevronDown, List, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { auth, googleProvider, signInWithGoogle } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Textarea } from "@/components/ui/textarea";
import { NoResults } from "@/components/NoResults";
import { useIsMobile } from "@/hooks/use-mobile";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Interview with Design Team",
    description: "Initial interview with the product design team",
    priority: "high",
    category: "work",
    completed: false,
    status: "todo",
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    activities: [
      {
        id: "act1",
        type: "created",
        timestamp: new Date().toISOString(),
        details: "Task created",
      },
    ],
  },
  {
    id: "2",
    title: "Morning Workout",
    description: "30 minutes cardio and strength training",
    priority: "medium",
    category: "personal",
    completed: false,
    status: "todo",
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    activities: [
      {
        id: "act2",
        type: "created",
        timestamp: new Date().toISOString(),
        details: "Task created",
      },
    ],
  },
  {
    id: "3",
    title: "Submit Project Proposal",
    description: "Final review and submission of the project proposal",
    priority: "high",
    category: "work",
    completed: true,
    status: "completed",
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    activities: [
      {
        id: "act3",
        type: "created",
        timestamp: new Date().toISOString(),
        details: "Task created",
      },
    ],
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedDueDate, setSelectedDueDate] = useState<string>("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "work" as Category,
    priority: "medium" as Priority,
    dueDate: new Date().toISOString(),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleTasksReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    toast({
      title: "Tasks reordered",
      description: "The task order has been updated",
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
  };

  const handleAddTask = (param:any) => {
    let data: any;
    data = (param.hasOwnProperty('title')) ? param : newTask
    console.log(data);
    
    if (!data.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Math.random().toString(36).substring(7),
      ...data,
      completed: false,
      status: "todo",
      createdAt: new Date().toISOString(),
      activities: [
        {
          id: Math.random().toString(36).substring(7),
          type: "created",
          timestamp: new Date().toISOString(),
          details: "Task created",
        },
      ],
    };

    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: "",
      description: "",
      category: "work" as Category,
      priority: "medium" as Priority,
      dueDate: new Date().toISOString(),
    });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Task added successfully",
    });
  };

  const handleEdit = (task: Task) => {
    const activity: TaskActivity = {
      id: Math.random().toString(36).substring(7),
      type: "edited",
      timestamp: new Date().toISOString(),
      details: "Task details were updated",
    };

    const updatedTask = {
      ...task,
      activities: [...(task.activities || []), activity],
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    );
    
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  const handleDelete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const activity: TaskActivity = {
        id: Math.random().toString(36).substring(7),
        type: "deleted",
        timestamp: new Date().toISOString(),
        details: "Task was deleted",
      };

      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    
    const matchesDueDate = !selectedDueDate || 
      new Date(task.dueDate).toISOString().split('T')[0] === selectedDueDate;

    return matchesSearch && matchesCategory && matchesDueDate;
  });

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src="/lovable-uploads/4d7af250-4b32-4b97-a895-71998a67213d.png" alt="TaskBuddy Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">TaskBuddy</h1>
            <p className="text-lg text-gray-600">
              Streamline your workflow and track progress effortlessly with our all-in-one task management app.
            </p>
          </div>
          
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full max-w-sm mx-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 h-12"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-3 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <header className="flex flex-col gap-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-purple-600">📋</span> TaskBuddy
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User"}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium hidden md:inline">
                    {auth.currentUser?.displayName}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
                <p>Logout</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {!isMobile && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border rounded-lg p-1">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-purple-600" : ""}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === "board" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("board")}
                      className={viewMode === "board" ? "bg-purple-600" : ""}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Board
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-[200px] pr-10 border-gray-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      ADD TASK
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Description"
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Task Category</Label>
                          <Select
                            value={newTask.category}
                            onValueChange={(value: Category) =>
                              setNewTask((prev) => ({ ...prev, category: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              {/* <SelectItem value="shopping">Shopping</SelectItem>
                              <SelectItem value="health">Health</SelectItem> */}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Due on</Label>
                          <Input
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) =>
                              setNewTask((prev) => ({
                                ...prev,
                                dueDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Task Status</Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: Priority) =>
                              setNewTask((prev) => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Todo</SelectItem>
                              <SelectItem value="medium">In-Progress</SelectItem>
                              <SelectItem value="high">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <input id="file" type="file" onChange={()=>{}} />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTask}>
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <span className="text-sm text-gray-500">Filter by:</span>
              <div className="grid grid-cols-2 md:flex md:flex-row gap-4">
                <Select
                  value={selectedCategory}
                  onValueChange={(value: Category | "all") =>
                    setSelectedCategory(value)
                  }
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Categories</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    {/* <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="health">Health</SelectItem> */}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  className="w-full md:w-[150px]"
                />
              </div>
            </div>
          </header>

          {(filteredTasks.length) ?
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: viewMode === "board" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: viewMode === "board" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg p-4 md:p-6 shadow-sm"
            >
              {isMobile || viewMode === "list" ? (
                <TaskList
                  tasks={filteredTasks}
                  searchQuery={searchQuery}
                  onComplete={handleComplete}
                  onTaskClick={handleTaskClick}
                  onTasksReorder={handleTasksReorder}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTask={handleAddTask}
                />
              ) : (
                <TaskBoard
                  tasks={filteredTasks}
                  onComplete={handleComplete}
                  onTaskClick={handleTaskClick}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </motion.div>
            :
            <NoResults />}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

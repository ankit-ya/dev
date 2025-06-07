import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Search,
  Filter,
  Calendar,
  User,
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Edit2,
  Trash2,
  Users,
  FileText,
  X,
  Building2,
  Briefcase,
  Code,
  Settings,
  Headphones
} from "lucide-react";
import {
  createTask,
  updateTask,
  completeTask,
  approveTask,
  getCompanyTasks,
  getTaskById
} from "../API/apiService";

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;



const statusConfig = {
  "To Do": { 
    color: "bg-slate-100 text-slate-700 border-slate-200", 
    icon: AlertCircle,
    gradient: "from-slate-500 to-slate-600"
  },
  "Approved": { 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    icon: CheckCircle2,
    gradient: "from-blue-500 to-blue-600"
  },
  "In Progress": { 
    color: "bg-orange-100 text-orange-700 border-orange-200", 
    icon: Play,
    gradient: "from-orange-500 to-orange-600"
  },
  "Done": { 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-emerald-600"
  },
  "Rejected": { 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: XCircle,
    gradient: "from-red-500 to-red-600"
  },
  "On Hold": { 
    color: "bg-amber-100 text-amber-700 border-amber-200", 
    icon: Pause,
    gradient: "from-amber-500 to-amber-600"
  },
};

const priorityConfig = {
  "High": { 
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "🔴"
  },
  "Medium": { 
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "🟡"
  },
  "Low": { 
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "🟢"
  },
};

// Team configuration for different roles and access levels
const teamConfig = {
  "development": { 
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Code,
    gradient: "from-blue-500 to-blue-600"
  },
  "operations": { 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Settings,
    gradient: "from-emerald-500 to-emerald-600"
  },
  "support": { 
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Headphones,
    gradient: "from-purple-500 to-purple-600"
  },
  "management": { 
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Briefcase,
    gradient: "from-amber-500 to-amber-600"
  }
};

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
    dependencyId: "none",
    file: null,
  });
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // cards or table
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teamStats, setTeamStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingApproval: 0,
    overdueTasks: 0
  });

  const formTask = editTask || newTask;

  // Fetch teams data
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) {
          toast.error("Company ID not found");
          return;
        }
        // Add API call to fetch teams when available
        // For now using dummy data
        setTeams([
          { id: 'development', name: 'Development Team' },
          { id: 'operations', name: 'Operations Team' },
          { id: 'support', name: 'Support Team' },
          { id: 'management', name: 'Management Team' }
        ]);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        toast.error("Failed to load teams");
      }
    };

    fetchTeams();
  }, []);

  // Fetch tasks with team filtering
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const companyId = localStorage.getItem("companyId");
        if (!companyId) {
          toast.error("Company ID not found");
          return;
        }
        const response = await getCompanyTasks(companyId);
        if (response.resCode === 0 && response.res) {
          setTasks(response.res);
          
          // Calculate team statistics
          if (selectedTeam !== 'all') {
            const teamTasks = response.res.filter(task => task.teamId === selectedTeam);
            setTeamStats({
              totalTasks: teamTasks.length,
              completedTasks: teamTasks.filter(t => t.status === 'Done').length,
              pendingApproval: teamTasks.filter(t => t.status === 'Pending Approval').length,
              overdueTasks: teamTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done').length
            });
          }
          
          toast.success("Tasks loaded successfully");
        } else {
          throw new Error(response.resMsg || "Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formTask.title || !formTask.description || !formTask.assignee || !formTask.dueDate) {
        toast.error("Please fill all required fields");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User information not found. Please login again.");
        return;
      }

      setLoading(true);

      // Create FormData object
      const formData = new FormData();
      formData.append("employeeId", userId);
      formData.append("fromDate", formTask.dueDate);
      formData.append("toDate", formTask.dueDate);
      formData.append("reason", formTask.description);
      formData.append("leaveTypeId", formTask.assignee);
      
      if (formTask.file) {
        formData.append("attachment", formTask.file);
      }

      console.log('Submitting form data:', Object.fromEntries(formData));
      const response = await createTask(formData);
      console.log('Submission response:', response);

      if (response && response.resCode === 0) {
        toast.success("Task created successfully!");
        
        // Reset form and close modal
        setNewTask({
          title: "",
          description: "",
          assignee: "",
          priority: "Medium",
          dueDate: "",
          status: "To Do",
          dependencyId: "none",
          file: null,
        });
        setShowForm(false);
        
        // Refresh tasks list
        fetchTasks();
      } else {
        throw new Error(response?.resMsg || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    try {
      if (!editTask.title || !editTask.description) {
        toast.error("Please fill all required fields");
        return;
      }

      const companyId = localStorage.getItem("companyId");
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!companyId || !userId || !userEmail) {
        toast.error("User information not found. Please login again.");
        return;
      }

      // Format the task data according to API requirements
      const taskData = {
        id: editTask.id,
        taskName: editTask.title,
        description: editTask.description,
        companyId: companyId,
        teamId: editTask.assignee,
        assignedBy: userEmail,
        assignedTo: editTask.assignee,
        workers: editTask.workers || [],
        status: editTask.status.toLowerCase(),
        initialPhotoUrl: editTask.initialPhotoUrl || "",
        finalPhotoUrl: editTask.finalPhotoUrl || "",
        assignedDate: editTask.assignedDate || new Date().toISOString(),
        startDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString() : null,
        completionDate: editTask.completionDate || null,
        approvalRequired: true,
        approvedBy: editTask.approvedBy || "",
        approvedDate: editTask.approvedDate || null,
        priority: editTask.priority,
        dependencyId: editTask.dependencyId === "none" ? null : editTask.dependencyId
      };

      const response = await updateTask(taskData);
      if (response.resCode === 0 && response.res) {
        const updatedTasks = tasks.map((t) => (t.id === response.res.id ? response.res : t));
        setTasks(updatedTasks);
        setEditTask(null);
        setShowForm(false);
        toast.success("Task updated successfully!");
      } else {
        throw new Error(response.resMsg || "Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    try {
      // Note: Add deleteTask API function if available
      const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
      setTasks(updatedTasks);
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      const response = await completeTask(task.id);
      if (response.resCode === 0 && response.res) {
        const updatedTasks = tasks.map((t) => (t.id === response.res.id ? response.res : t));
        setTasks(updatedTasks);
        toast.success("Task marked as complete");
      } else {
        throw new Error(response.resMsg || "Failed to complete task");
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast.error("Failed to complete task");
    }
  };

  const handleApproveTask = async (task) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await approveTask(task.id, userId);
      if (response.resCode === 0 && response.res) {
        const updatedTasks = tasks.map((t) => (t.id === response.res.id ? response.res : t));
        setTasks(updatedTasks);
        toast.success("Task approved successfully");
      } else {
        throw new Error(response.resMsg || "Failed to approve task");
      }
    } catch (error) {
      console.error("Failed to approve task:", error);
      toast.error("Failed to approve task");
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(task => task.teamId === selectedTeam);
    }
    
    return filtered;
  }, [tasks, searchQuery, filterStatus, selectedTeam]);

  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]));

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "To Do").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "Done").length,
  };

  const renderTeamStats = () => {
    if (selectedTeam === 'all') return null;

    const team = teams.find(t => t.id === selectedTeam);
    if (!team) return null;

    const TeamIcon = teamConfig[selectedTeam]?.icon || Building2;
    const gradient = teamConfig[selectedTeam]?.gradient || "from-slate-500 to-slate-600";

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
            <TeamIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{team.name} Statistics</h3>
            <p className="text-sm text-slate-600">Performance overview and metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-800">{teamStats.totalTasks}</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{teamStats.completedTasks}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-600 mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-blue-700">{teamStats.pendingApproval}</p>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm font-medium text-red-600 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-700">{teamStats.overdueTasks}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Task Management
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Manage and track all your workforce tasks efficiently
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "cards" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Table
                </button>
              </div>
              
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  setEditTask(null);
                  setShowForm(true);
                }}
              >
                <PlusCircle size={20} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Assignees</option>
              <option value="User 1">User 1</option>
              <option value="User 2">User 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="assignedDate">Assigned Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {/* Task Cards (Mobile) */}
        <div className="lg:hidden space-y-4">
          {sortedTasks.map((task) => {
            const dep = tasks.find((t) => t.id === task.dependencyId);
            const StatusIcon = statusConfig[task.status].icon;
            return (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${statusConfig[task.status].color}`}>
                    <StatusIcon className="w-3 h-3 inline mr-1" />
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-800">{taskStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">To Do</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.todo}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Play className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{taskStats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{taskStats.done}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Statistics */}
        {renderTeamStats()}

        {/* Tasks Display */}
        {viewMode === "cards" ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => {
              const dep = tasks.find((t) => t.id === task.dependencyId);
              const StatusIcon = statusConfig[task.status].icon;
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Done";
              
              return (
                <div key={task.id} className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${priorityConfig[task.priority].color}`}>
                        <span>{priorityConfig[task.priority].icon}</span>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${statusConfig[task.status].color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {task.status}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <Clock className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
            {/* Table content */}
          </div>
        )}

        {/* Add Task Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Create New Task
                        </h3>
                        <p className="text-sm text-slate-600">Fill in the task details below</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formTask.title}
                      onChange={(e) =>
                        editTask
                          ? setEditTask({ ...editTask, title: e.target.value })
                          : setNewTask({ ...newTask, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formTask.description}
                      onChange={(e) =>
                        editTask
                          ? setEditTask({ ...editTask, description: e.target.value })
                          : setNewTask({ ...newTask, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task description"
                      required
                    />
                  </div>

                  {/* Assignee & Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 mb-2">
                        Assignee *
                      </label>
                      <select
                        id="assignee"
                        value={formTask.assignee}
                        onChange={(e) =>
                          editTask
                            ? setEditTask({ ...editTask, assignee: e.target.value })
                            : setNewTask({ ...newTask, assignee: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Assignee</option>
                        <option value="CL">Casual Leave</option>
                        <option value="SL">Sick Leave</option>
                        <option value="PL">Privilege Leave</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        id="dueDate"
                        type="date"
                        value={formTask.dueDate}
                        onChange={(e) =>
                          editTask
                            ? setEditTask({ ...editTask, dueDate: e.target.value })
                            : setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-2">
                      Attachment
                    </label>
                    <input
                      id="file"
                      type="file"
                      onChange={(e) =>
                        editTask
                          ? setEditTask({ ...editTask, file: e.target.files[0] })
                          : setNewTask({ ...newTask, file: e.target.files[0] })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow transition-all ${
                      loading 
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
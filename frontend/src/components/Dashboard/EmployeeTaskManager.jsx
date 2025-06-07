import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  X, 
  MessageCircle, 
  Calendar, 
  User, 
  BarChart3, 
  Filter,
  Link2,
  Flag,
  Target,
  FileText,
  Plus
} from "lucide-react";

const statusColors = {
  "To Do": {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "text-slate-500",
    badge: "bg-slate-500"
  },
  Approved: {
    bg: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "text-blue-600",
    badge: "bg-blue-500"
  },
  "In Progress": {
    bg: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "text-amber-600",
    badge: "bg-amber-500"
  },
  Done: {
    bg: "bg-green-100 text-green-800 border-green-200",
    icon: "text-green-600",
    badge: "bg-green-500"
  },
  Rejected: {
    bg: "bg-red-100 text-red-800 border-red-200",
    icon: "text-red-600",
    badge: "bg-red-500"
  },
  "On Hold": {
    bg: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "text-purple-600",
    badge: "bg-purple-500"
  },
};

const priorityColors = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Low: "bg-green-100 text-green-800 border-green-200"
};

const defaultTasks = [
  {
    id: 1,
    title: "Design Homepage",
    description: "Create responsive UI for homepage with modern design principles",
    createdBy: "Admin",
    assignee: "User 1",
    priority: "High",
    status: "To Do",
    createdAt: "2024-04-01T08:00:00Z",
    dueDate: "2024-04-10",
    comments: [],
    progress: 0,
    tags: ["UI", "Design"]
  },
  {
    id: 2,
    title: "Setup API Endpoints",
    description: "Initialize REST API routes and implement dummy data for testing",
    createdBy: "Admin",
    assignee: "User 1",
    priority: "Medium",
    status: "Approved",
    createdAt: "2024-04-02T09:00:00Z",
    dueDate: "2024-04-15",
    comments: ["Reviewed by backend lead", "Database schema ready"],
    progress: 0,
    tags: ["Backend", "API"]
  },
  {
    id: 3,
    title: "User Authentication",
    description: "Implement secure login and registration system",
    createdBy: "Admin",
    assignee: "User 1",
    priority: "High",
    status: "In Progress",
    createdAt: "2024-04-03T10:00:00Z",
    dueDate: "2024-04-20",
    comments: ["JWT implementation started"],
    progress: 45,
    tags: ["Security", "Authentication"]
  }
];

export default function EmployeeTaskManager({ employeeName = "User 1" }) {
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    const profileData = localStorage.getItem("profileData");
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        user = { ...user, ...profile };
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    return user;
  };

  const currentUser = getUserData();
  const userName = currentUser ? 
    `${currentUser.firstName || currentUser.fullName || currentUser.name || employeeName} ${currentUser.lastName || ''}`.trim() : 
    employeeName;
  const employeeId = currentUser?.id || currentUser?.userId || currentUser?.username || localStorage.getItem("userId");

  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState({});
  const [newComments, setNewComments] = useState({});
  const [newDependencies, setNewDependencies] = useState({});
  const [showDependencyPicker, setShowDependencyPicker] = useState({});
  const [showCompleted, setShowCompleted] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    const allTasks = stored ? JSON.parse(stored) : defaultTasks;

    const tasksWithDefaults = allTasks.map((t, index) => ({
      id: t.id || index + 1,
      createdAt: t.createdAt || new Date().toISOString(),
      dueDate: t.dueDate || new Date().toISOString().split("T")[0],
      comments: t.comments || [],
      progress: t.progress || 0,
      tags: t.tags || [],
      ...t,
    }));

    localStorage.setItem("tasks", JSON.stringify(tasksWithDefaults));
    setTasks(tasksWithDefaults.filter((t) => t.assignee === employeeName));
  }, [employeeName]);

  const updateTaskStatus = (task, status) => {
    setLoading(true);
    const progress = status === "Done" ? 100 : status === "In Progress" ? task.progress || 0 : 0;
    const updated = { ...task, status, progress };
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const newAllTasks = allTasks.map((t) => (t.id === task.id ? updated : t));
    localStorage.setItem("tasks", JSON.stringify(newAllTasks));
    toast.success(`Task marked as ${status}`);
    setTasks(newAllTasks.filter((t) => t.assignee === employeeName));
    setLoading(false);
  };

  const confirmAndUpdateTaskStatus = (task, status) => {
    if (window.confirm(`Are you sure you want to mark task as ${status}?`)) {
      updateTaskStatus(task, status);
    }
  };

  const handleUpdateChange = (title, value) => {
    setUpdates((prev) => ({ ...prev, [title]: value }));
  };

  const handleCommentChange = (title, value) => {
    setNewComments((prev) => ({ ...prev, [title]: value }));
  };

  const addComment = (task) => {
    const comment = newComments[task.title];
    if (!comment) return;
    
    const updated = {
      ...task,
      comments: [...(task.comments || []), `${new Date().toLocaleDateString()}: ${comment}`],
    };
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const newAllTasks = allTasks.map((t) => (t.id === task.id ? updated : t));
    localStorage.setItem("tasks", JSON.stringify(newAllTasks));
    setTasks(newAllTasks.filter((t) => t.assignee === employeeName));
    setNewComments((prev) => ({ ...prev, [task.title]: "" }));
    toast.success("Comment added");
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    const isDone = task.status === "Done";
    return statusMatch && priorityMatch && (showCompleted || !isDone);
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorities = { High: 3, Medium: 2, Low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    }
    return new Date(b[sortBy]) - new Date(a[sortBy]);
  });

  const taskCounts = tasks.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});

  const getTaskIcon = (status) => {
    switch (status) {
      case "Done": return CheckCircle2;
      case "In Progress": return Play;
      case "On Hold": return Pause;
      case "Rejected": return X;
      case "Approved": return Target;
      default: return Clock;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-slate-600 mt-1">Manage and track your assigned tasks</p>
              <p className="text-sm text-slate-500 mt-1">Assignee: {userName} | ID: {employeeId}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                tasks.filter(t => t.status === "In Progress").length > 0
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {tasks.filter(t => t.status === "In Progress").length} Active Tasks
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statusColors).map(([status, colors]) => (
              <div key={status} className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">{status}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{taskCounts[status] || 0}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${colors.badge}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800">Filters & Sort</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    {Object.keys(statusColors).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Priority:</label>
                  <select
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Sort By:</label>
                  <select
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={() => setShowCompleted((prev) => !prev)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Show Completed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-6">
            {sortedTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200">
                <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Tasks Found</h3>
                <p className="text-slate-600">No tasks match your current filters.</p>
              </div>
            ) : (
              sortedTasks.map((task) => {
                const TaskIcon = getTaskIcon(task.status);
                const daysUntilDue = getDaysUntilDue(task.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <div key={task.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                    {/* Task Header */}
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${statusColors[task.status].bg.replace('text-', 'bg-').replace('100', '200')}`}>
                              <TaskIcon className={`w-5 h-5 ${statusColors[task.status].icon}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-slate-800">{task.title}</h3>
                              <p className="text-sm text-slate-500">ID: {task.id}</p>
                            </div>
                          </div>
                          <p className="text-slate-600 mb-4">{task.description}</p>
                          
                          {/* Task Meta */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">Created by: <span className="font-medium">{task.createdBy}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">Due: <span className={`font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                                {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue && ' (Overdue)'}
                                {isDueSoon && !isOverdue && ` (${daysUntilDue} days left)`}
                              </span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4 text-slate-400" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                                {task.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status].bg}`}>
                            {task.status}
                          </span>
                          {task.progress > 0 && (
                            <div className="w-24">
                              <div className="flex justify-between text-xs text-slate-600 mb-1">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dependency */}
                      {task.dependencyId && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Link2 className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-800">Depends on Task ID: <span className="font-medium">{task.dependencyId}</span></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div className="p-6 space-y-6">
                      
                      {/* Status Actions */}
                      {task.status === "To Do" && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => updateTaskStatus(task, "Approved")}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button 
                            onClick={() => confirmAndUpdateTaskStatus(task, "Rejected")}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {(task.status === "Approved" || task.status === "In Progress") && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Task Update</label>
                            <textarea
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              value={updates[task.title] ?? task.description}
                              onChange={(e) => handleUpdateChange(task.title, e.target.value)}
                              placeholder="Update task progress..."
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            {task.status === "Approved" && (
                              <button 
                                onClick={() => confirmAndUpdateTaskStatus(task, "In Progress")}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                              >
                                <Play className="w-4 h-4" />
                                Start Task
                              </button>
                            )}
                            {task.status === "In Progress" && (
                              <>
                                <button 
                                  onClick={() => confirmAndUpdateTaskStatus(task, "Done")}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark as Done
                                </button>
                                <button 
                                  onClick={() => confirmAndUpdateTaskStatus(task, "On Hold")}
                                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                                >
                                  <Pause className="w-4 h-4" />
                                  Put on Hold
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dependency Picker */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowDependencyPicker((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                          className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 text-sm"
                        >
                          <Link2 className="w-4 h-4" />
                          Set Dependency
                        </button>

                        {showDependencyPicker[task.id] && (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <select
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newDependencies[task.id] || ""}
                              onChange={(e) => setNewDependencies((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            >
                              <option value="">Select Task</option>
                              {tasks
                                .filter((t) => t.id !== task.id)
                                .map((dep) => (
                                  <option key={dep.id} value={dep.id}>
                                    {dep.title} (ID {dep.id})
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => {
                                const dependencyId = newDependencies[task.id];
                                if (!dependencyId) return;
                                const updated = { ...task, dependencyId };
                                const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
                                const newAllTasks = allTasks.map((t) => (t.id === task.id ? updated : t));
                                localStorage.setItem("tasks", JSON.stringify(newAllTasks));
                                setTasks(newAllTasks.filter((t) => t.assignee === employeeName));
                                setShowDependencyPicker((prev) => ({ ...prev, [task.id]: false }));
                                setNewDependencies((prev) => ({ ...prev, [task.id]: "" }));
                                toast.success("Dependency updated");
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                            >
                              Save Dependency
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comments Section */}
                      <div className="border-t border-slate-200 pt-6">
                        <button
                          onClick={() => setShowComments((prev) => ({ ...prev, [task.title]: !prev[task.title] }))}
                          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">Comments ({task.comments?.length || 0})</span>
                          {showComments[task.title] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showComments[task.title] && (
                          <div className="space-y-4">
                            {task.comments && task.comments.length > 0 && (
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {task.comments.map((comment, idx) => (
                                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-sm text-slate-700">{comment}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex gap-3">
                              <input
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newComments[task.title] || ""}
                                onChange={(e) => handleCommentChange(task.title, e.target.value)}
                                placeholder="Add a comment..."
                                onKeyPress={(e) => e.key === 'Enter' && addComment(task)}
                              />
                              <button
                                onClick={() => addComment(task)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

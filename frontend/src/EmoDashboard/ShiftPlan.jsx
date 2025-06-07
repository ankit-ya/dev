import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar,
  Users,
  MapPin,
  Copy,
  Save,
  Edit,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Building2,
  Eye,
  EyeOff,
  Star,
  Zap,
  ChevronDown,
  X,
  Settings,
  Search,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  Target,
  Layers,
  Command,
  ArrowRight,
  Plus,
  Minus,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

// Helper functions
const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to formatDate:', date);
    return new Date().toISOString().split("T")[0]; // fallback to today
  }
  return date.toISOString().split("T")[0];
};

const addDays = (date, days) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to addDays:', date);
    return new Date(); // fallback to today
  }
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const subDays = (date, days) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to subDays:', date);
    return new Date(); // fallback to today
  }
  return addDays(date, -days);
};

// Enhanced dummy data with more realistic content
const DEFAULT_LOCATIONS = [
  "DLF Cyber City - Gurgaon", 
  "Infosys SEZ - Bangalore", 
  "Tech Mahindra - Pune",
  "TCS Campus - Chennai",
  "Wipro Towers - Hyderabad"
];

const POSITIONS = [
  { id: "SEC", name: "Security Guard", color: "bg-blue-500", icon: "🛡️", skills: ["Security", "Patrol"] },
  { id: "SPV", name: "Supervisor", color: "bg-emerald-500", icon: "👨‍💼", skills: ["Leadership", "Management"] },
  { id: "TL", name: "Team Lead", color: "bg-purple-500", icon: "👨‍🏫", skills: ["Leadership", "Training"] },
  { id: "CLN", name: "Cleaner", color: "bg-orange-500", icon: "🧹", skills: ["Cleaning", "Maintenance"] },
  { id: "MNT", name: "Maintenance", color: "bg-red-500", icon: "🔧", skills: ["Technical", "Repair"] },
];

// Enhanced employee data with photos, skills, and availability
const DEFAULT_EMPLOYEES = [
  { 
    id: "EMP001", 
    name: "Ramesh Kumar", 
    photo: "👨‍💼", 
    skills: ["SEC", "SPV"], 
    phone: "+91 98765 43210",
    experience: "5 years",
    rating: 4.8,
    availability: {
      "2024-06-02": "available",
      "2024-06-03": "available", 
      "2024-06-04": "available",
      "2024-06-05": "available",
      "2024-06-06": "available",
      "2024-06-07": "partial",
      "2024-06-08": "unavailable"
    }
  },
  { 
    id: "EMP002", 
    name: "Sita Devi", 
    photo: "👩‍💼", 
    skills: ["SEC", "CLN"], 
    phone: "+91 98765 43211",
    experience: "3 years",
    rating: 4.6,
    availability: {
      "2024-06-02": "available",
      "2024-06-03": "available", 
      "2024-06-04": "unavailable",
      "2024-06-05": "available",
      "2024-06-06": "available",
      "2024-06-07": "available",
      "2024-06-08": "available"
    }
  },
  { 
    id: "EMP003", 
    name: "Arjun Singh", 
    photo: "👨‍🔧", 
    skills: ["TL", "MNT"], 
    phone: "+91 98765 43212",
    experience: "7 years",
    rating: 4.9,
    availability: {
      "2024-06-02": "available",
      "2024-06-03": "partial", 
      "2024-06-04": "available",
      "2024-06-05": "available",
      "2024-06-06": "available",
      "2024-06-07": "available",
      "2024-06-08": "available"
    }
  },
  { 
    id: "EMP004", 
    name: "Priya Sharma", 
    photo: "👩‍💻", 
    skills: ["SEC", "SPV"], 
    phone: "+91 98765 43213",
    experience: "4 years",
    rating: 4.7,
    availability: {
      "2024-06-02": "available",
      "2024-06-03": "available", 
      "2024-06-04": "available",
      "2024-06-05": "available",
      "2024-06-06": "unavailable",
      "2024-06-07": "unavailable",
      "2024-06-08": "available"
    }
  },
  { 
    id: "EMP005", 
    name: "Amit Gupta", 
    photo: "👨‍🏭", 
    skills: ["CLN", "MNT"], 
    phone: "+91 98765 43214",
    experience: "2 years",
    rating: 4.4,
    availability: {
      "2024-06-02": "available",
      "2024-06-03": "available", 
      "2024-06-04": "available",
      "2024-06-05": "partial",
      "2024-06-06": "available",
      "2024-06-07": "available",
      "2024-06-08": "available"
    }
  }
];

// Enhanced requirements with realistic shift patterns
const DEFAULT_REQUIREMENTS = (() => {
  const init = { 1: {}, 2: {} };
  const today = new Date();
  const rangeKeys = Array.from({ length: 7 }, (_, i) => formatDate(addDays(today, i)));
  
  DEFAULT_LOCATIONS.forEach((loc) => {
    [1, 2].forEach((shift) => {
      init[shift][loc] = {};
      rangeKeys.forEach((date) => {
        if (shift === 1) { // Morning shift
          init[shift][loc][date] = [
            { role: "SEC", count: 3 },
            { role: "SPV", count: 1 },
            { role: "CLN", count: 2 }
          ];
        } else { // Evening shift
          init[shift][loc][date] = [
            { role: "SEC", count: 4 },
            { role: "SPV", count: 1 },
            { role: "MNT", count: 1 }
          ];
        }
      });
    });
  });
  return init;
})();

export default function ShiftPlan({
  daysCount = 7,
  initialDate = new Date(),
  locations = DEFAULT_LOCATIONS,
  positions = POSITIONS,
  employees = DEFAULT_EMPLOYEES,
  requirements = DEFAULT_REQUIREMENTS,
}) {
  // Ensure initialDate is a valid Date object
  const validInitialDate = initialDate instanceof Date && !isNaN(initialDate.getTime()) 
    ? initialDate 
    : new Date();
    
  const [startDate, setStartDate] = useState(validInitialDate);
  const [dates, setDates] = useState(() => {
    return Array.from({ length: daysCount }, (_, i) => addDays(validInitialDate, i));
  });
  const [assignments, setAssignments] = useState({});
  
  // UI State
  const [viewMode, setViewMode] = useState("kanban"); // kanban, table, calendar
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [editing, setEditing] = useState({ 1: true, 2: true });
  const [activeShift, setActiveShift] = useState(1);
  const [showEmployeePanel, setShowEmployeePanel] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  
  // Advanced features
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  // Load saved assignments
  useEffect(() => {
    const saved = localStorage.getItem("shift-assignments");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved assignments:", error);
      }
    }
  }, []);

  // Initialize shift slots
  useEffect(() => {
    const range = Array.from({ length: daysCount }, (_, i) => addDays(startDate, i));
    setDates(range);
    
    if (Object.keys(assignments).length === 0) {
      const init = { 1: {}, 2: {} };
      [1, 2].forEach((shift) => {
        init[shift] = {};
        locations.forEach((loc) => {
          init[shift][loc] = {};
          range.forEach((d) => {
            const k = formatDate(d);
            const req = requirements[shift]?.[loc]?.[k] || [];
            init[shift][loc][k] = req.map((r) => Array(r.count).fill(null));
          });
        });
      });
      setAssignments(init);
    }
  }, [startDate, daysCount, locations, requirements]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && Object.keys(assignments).length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("shift-assignments", JSON.stringify(assignments));
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [assignments, autoSaveEnabled]);

  // Navigation functions
  const nav = (direction) => {
    const newStartDate = direction === "prev" 
      ? subDays(startDate, daysCount) 
      : addDays(startDate, daysCount);
    setStartDate(newStartDate);
    setAssignments({});
  };

  // Enhanced assignment function with conflict detection
  const assign = (shift, location, date, roleIndex, slotIndex, employeeId) => {
    if (!editing[shift]) return;
    
    setAssignments((prev) => {
      const updated = { ...prev };
      if (!updated[shift][location][date][roleIndex]) {
        updated[shift][location][date][roleIndex] = [];
      }
      updated[shift][location][date][roleIndex][slotIndex] = employeeId;
      return updated;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (employee) => {
    setDraggedEmployee(employee);
  };

  const handleDragEnd = () => {
    setDraggedEmployee(null);
  };

  const handleDrop = (shift, location, date, roleIndex, slotIndex) => {
    if (draggedEmployee && editing[shift]) {
      assign(shift, location, date, roleIndex, slotIndex, draggedEmployee.id);
      toast.success(`${draggedEmployee.name} assigned to ${location}`);
    }
  };

  // Conflict detection
  const getConflicts = (employeeId, date, shift) => {
    const conflicts = [];
    if (!employeeId) return conflicts;
    
    locations.forEach(loc => {
      const req = requirements[shift]?.[loc]?.[date] || [];
      req.forEach((r, roleIndex) => {
        const slots = assignments[shift]?.[loc]?.[date]?.[roleIndex] || [];
        slots.forEach((assignedId, slotIndex) => {
          if (assignedId === employeeId) {
            conflicts.push({ location: loc, role: r.role, slotIndex });
          }
        });
      });
    });
    
    return conflicts.length > 1 ? conflicts : [];
  };

  // Get employee by ID
  const getEmployee = (employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || emp.skills.includes(selectedRole);
      const hasAvailability = showAvailableOnly ? Object.values(emp.availability).some(status => status === "available") : true;
      
      return matchesSearch && matchesRole && hasAvailability;
    });
  }, [employees, searchTerm, selectedRole, showAvailableOnly]);

  // Get position details
  const getPositionDetails = (roleId) => {
    return positions.find(p => p.id === roleId) || { name: roleId, color: "bg-gray-500", icon: "👤" };
  };

  // Calculate statistics
  const getShiftStats = (shift) => {
    let totalSlots = 0;
    let filledSlots = 0;
    
    dates.forEach((date) => {
      const dateStr = formatDate(date);
      locations.forEach((loc) => {
        if (selectedLocation === "all" || selectedLocation === loc) {
          const req = requirements[shift]?.[loc]?.[dateStr] || [];
          req.forEach((r, roleIndex) => {
            totalSlots += r.count;
            const slots = assignments[shift]?.[loc]?.[dateStr]?.[roleIndex] || [];
            filledSlots += slots.filter(emp => emp).length;
          });
        }
      });
    });
    
    return { totalSlots, filledSlots, completion: totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0 };
  };

  // Enhanced Employee Card with Click-to-Select
  const EmployeeCard = ({ employee, selected, onSelect, currentDate }) => {
    const availability = employee.availability[currentDate] || "available";
    const conflicts = getConflicts(employee.id, currentDate, activeShift);
    
    const availabilityColors = {
      available: "border-emerald-300 bg-emerald-50",
      partial: "border-amber-300 bg-amber-50", 
      unavailable: "border-red-300 bg-red-50 opacity-60"
    };
    
    const handleClick = () => {
      if (availability !== "unavailable") {
        onSelect(employee);
      }
    };
    
    return (
      <div
        draggable={availability !== "unavailable"}
        onDragStart={() => availability !== "unavailable" && handleDragStart(employee)}
        onClick={handleClick}
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
          selected 
            ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105" 
            : availability === "unavailable"
              ? "border-slate-200 bg-slate-50 cursor-not-allowed"
              : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:transform hover:scale-102"
        } ${availabilityColors[availability]}`}
      >
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              {employee.photo}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              availability === "available" ? "bg-emerald-500" :
              availability === "partial" ? "bg-amber-500" : "bg-red-500"
            }`}></div>
            {conflicts.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm truncate">{employee.name}</h4>
            <div className="flex items-center space-x-1 mt-1">
              {employee.skills.map((skill) => {
                const pos = getPositionDetails(skill);
                return (
                  <span key={skill} className="text-xs px-2 py-1 bg-slate-100 rounded-lg">
                    {pos.icon}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">{employee.experience}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <span className="text-xs text-slate-600">{employee.rating}</span>
              </div>
            </div>
          </div>
        </div>
        
        {selected && (
          <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700 font-medium flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Click on any slot to assign
            </div>
          </div>
        )}
        
        {conflicts.length > 0 && !selected && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs text-red-700 font-medium">Conflicts detected!</div>
          </div>
        )}
      </div>
    );
  };

  // Simple Assignment Slot Component
  const AssignmentSlot = ({ shift, location, date, roleIndex, slotIndex, position, requirement }) => {
    const currentAssignment = assignments[shift]?.[location]?.[date]?.[roleIndex]?.[slotIndex];
    const employee = currentAssignment ? getEmployee(currentAssignment) : null;
    const conflicts = employee ? getConflicts(employee.id, date, shift) : [];
    
    const handleSlotClick = () => {
      if (!editing[shift]) return;
      
      if (selectedEmployee) {
        // Check if employee is qualified for this role
        if (!selectedEmployee.skills.includes(requirement.role)) {
          toast.error(`${selectedEmployee.name} is not qualified for ${position.name} role`);
          return;
        }
        
        // Check availability
        const availability = selectedEmployee.availability[date] || "unavailable";
        if (availability === "unavailable") {
          toast.error(`${selectedEmployee.name} is not available on this date`);
          return;
        }
        
        // Assign the employee
        assign(shift, location, date, roleIndex, slotIndex, selectedEmployee.id);
        toast.success(`${selectedEmployee.name} assigned to ${position.name} at ${location.split(' - ')[0]}`);
      } else if (employee) {
        // Remove current assignment
        assign(shift, location, date, roleIndex, slotIndex, null);
        toast.info("Employee removed from slot");
      } else {
        toast.info("Please select an employee from the left panel first");
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      if (editing[shift]) {
        e.currentTarget.classList.add('bg-blue-100', 'border-blue-400');
      }
    };
    
    const handleDragLeave = (e) => {
      e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
      
      if (draggedEmployee && editing[shift]) {
        // Check qualifications
        if (!draggedEmployee.skills.includes(requirement.role)) {
          toast.error(`${draggedEmployee.name} is not qualified for ${position.name} role`);
          return;
        }
        
        // Check availability
        const availability = draggedEmployee.availability[date] || "unavailable";
        if (availability === "unavailable") {
          toast.error(`${draggedEmployee.name} is not available on this date`);
          return;
        }
        
        assign(shift, location, date, roleIndex, slotIndex, draggedEmployee.id);
        toast.success(`${draggedEmployee.name} assigned to ${position.name} at ${location.split(' - ')[0]}`);
      }
    };

    return (
      <div
        onClick={handleSlotClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative min-h-[70px] p-3 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
          !editing[shift]
            ? "bg-slate-100 border-slate-300 cursor-not-allowed"
            : employee 
              ? conflicts.length > 0
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "bg-emerald-50 border-emerald-300 hover:border-emerald-400"
              : selectedEmployee
                ? "bg-blue-50 border-blue-300 border-dashed hover:border-blue-400 hover:bg-blue-100"
                : "bg-slate-50 border-slate-200 border-dashed hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        {employee ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {employee.photo}
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">{employee.name}</div>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{employee.rating}</span>
                </div>
              </div>
            </div>
            
            {editing[shift] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  assign(shift, location, date, roleIndex, slotIndex, null);
                  toast.info("Employee removed");
                }}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            {editing[shift] ? (
              selectedEmployee ? (
                <>
                  <Target className="w-5 h-5 mb-1" />
                  <span className="text-xs text-center">Click to assign {selectedEmployee.name}</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-xs text-center">Select employee & click here</span>
                </>
              )
            ) : (
              <>
                <X className="w-5 h-5 mb-1" />
                <span className="text-xs text-center">Empty slot</span>
              </>
            )}
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Enhanced Employee Panel Component
  const EmployeePanel = () => (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Team ({filteredEmployees.length})
          </h3>
          <button
            onClick={() => setShowEmployeePanel(false)}
            className="p-1 hover:bg-slate-200 rounded lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">All Roles</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAvailableOnly 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Available
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">💡 How to assign:</div>
            <div>1. Click to select an employee</div>
            <div>2. Click on any slot to assign them</div>
            <div>3. Or drag & drop employees directly</div>
          </div>
        </div>
      </div>
      
      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {filteredEmployees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              selected={selectedEmployee?.id === employee.id}
              onSelect={setSelectedEmployee}
              currentDate={formatDate(dates[0])}
            />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-slate-500">
            <Users className="w-8 h-8 mb-2" />
            <div className="text-sm text-center">
              No employees found matching your criteria
            </div>
          </div>
        )}
      </div>
      
      {/* Panel Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="space-y-2">
          {selectedEmployee && (
            <div className="p-2 bg-blue-100 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-700 font-medium">
                ✓ {selectedEmployee.name} selected
              </div>
              <div className="text-xs text-blue-600">
                Click on any slot to assign
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>🟢 Available  🟡 Partial  🔴 Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render shift section with enhanced layout
  const renderShift = (shift) => {
    const endDate = formatDate(addDays(startDate, daysCount - 1));
    const shiftName = shift === 1 ? "Morning Shift" : "Evening Shift";
    const shiftTime = shift === 1 ? "06:00 AM - 02:00 PM" : "02:00 PM - 10:00 PM";
    
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        {/* Shift Header */}
        <div className={`bg-gradient-to-r ${
          shift === 1 
            ? "from-blue-600 to-indigo-700" 
            : "from-purple-600 to-violet-700"
        } text-white p-6`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6" />
                <h2 className="text-2xl font-bold">{shiftName}</h2>
              </div>
              <p className="text-white/80">{shiftTime}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => nav("prev")}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="text-sm text-white/80">Week Period</div>
                <div className="font-semibold">
                  {formatDate(startDate)} — {endDate}
                </div>
              </div>
              
              <button 
                onClick={() => nav("next")}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Shift Content */}
        <div className="p-6 space-y-6">
          {renderShiftControls(shift)}
          
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "kanban" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-2 inline" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "table" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <List className="w-4 h-4 mr-2 inline" />
                Table
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "calendar" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Calendar
              </button>
            </div>
            
            <button
              onClick={() => setShowEmployeePanel(!showEmployeePanel)}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 lg:hidden"
            >
              {showEmployeePanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Employee Panel
            </button>
          </div>
          
          {/* Assignment Grid */}
          <div className="bg-slate-50 rounded-xl p-4">
            {viewMode === "kanban" && <KanbanView shift={shift} />}
            {viewMode === "table" && <EnhancedTableView shift={shift} />}
            {viewMode === "calendar" && <CalendarView shift={shift} />}
          </div>
        </div>
      </div>
    );
  };

  // Render legend
  const renderLegend = () => (
    <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Star className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">Position Legend</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {positions.map((pos) => (
          <div key={pos.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
            <span className="text-lg">{pos.icon}</span>
            <div>
              <div className="font-medium text-slate-800 text-sm">{pos.name}</div>
              <div className="text-xs text-slate-500">{pos.id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render employee statistics
  const renderEmployeeStats = () => {
    // Implement employee stats rendering logic
  };

  // Copy functionality for assignments
  const copyAssignments = (shift, sourceDate, targetDays) => {
    if (!editing[shift]) return;
    
    const sourceDateStr = formatDate(sourceDate);
    let copiedCount = 0;
    
    setAssignments((prev) => {
      const updated = { ...prev };
      
      // Copy to specified number of days starting from next day
      for (let i = 1; i <= targetDays && i < dates.length; i++) {
        const targetDateStr = formatDate(dates[i]);
        
        locations.forEach((loc) => {
          const sourceAssignments = updated[shift]?.[loc]?.[sourceDateStr];
          if (sourceAssignments) {
            if (!updated[shift][loc][targetDateStr]) {
              updated[shift][loc][targetDateStr] = [];
            }
            // Deep copy the assignments
            updated[shift][loc][targetDateStr] = JSON.parse(JSON.stringify(sourceAssignments));
            copiedCount++;
          }
        });
      }
      
      return updated;
    });
    
    toast.success(`Assignments copied to next ${targetDays} days for Shift ${shift}`);
  };

  // Enhanced Table View with Copy Functionality
  const EnhancedTableView = ({ shift }) => {
    const [copyDays, setCopyDays] = useState(2);
    
    if (!dates || dates.length === 0 || !dates.every(d => d instanceof Date && !isNaN(d.getTime()))) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-slate-500">Loading shift schedule...</div>
        </div>
      );
    }

    const filteredLocationsList = selectedLocation === "all" 
      ? locations 
      : [selectedLocation];
    
    return (
      <div className="space-y-4">
        {/* Copy Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Copy className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-700">Quick Copy</span>
              <span className="text-sm text-slate-500">Copy Monday's assignments to other days</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Duplicate:</span>
                <select
                  value={copyDays}
                  onChange={(e) => setCopyDays(Number(e.target.value))}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  disabled={!editing[shift]}
                >
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={4}>4 days</option>
                  <option value={5}>5 days</option>
                  <option value={6}>6 days</option>
                </select>
              </div>
              
              <button
                onClick={() => copyAssignments(shift, dates[0], copyDays)}
                disabled={!editing[shift]}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                title="Copy Monday's assignments to next days"
              >
                <Copy className="w-4 h-4" />
                Copy Next
              </button>
            </div>
          </div>
        </div>

        {/* Assignment Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700 border-r border-slate-200 w-48">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-slate-700 border-r border-slate-200 w-32">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Role</span>
                  </div>
                </th>
                {dates.map((d) => {
                  const isToday = formatDate(d) === formatDate(new Date());
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  
                  return (
                    <th key={formatDate(d)} className={`text-center p-4 font-semibold min-w-[140px] border-r border-slate-200 last:border-r-0 ${
                      isToday ? 'bg-blue-100 text-blue-700' : 
                      isWeekend ? 'bg-orange-50 text-orange-600' : 'text-slate-700'
                    }`}>
                      <div className="flex flex-col space-y-1">
                        <span className={`text-xs font-medium ${
                          isToday ? 'text-blue-600' : 
                          isWeekend ? 'text-orange-500' : 'text-slate-500'
                        }`}>
                          {new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}
                          {isToday && ' (Today)'}
                        </span>
                        <span className="text-sm">
                          {new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredLocationsList.map((loc) => {
                const req = requirements[shift]?.[loc]?.[formatDate(dates[0])] || [];
                
                return req.map((r, roleIndex) => {
                  const position = getPositionDetails(r.role);
                  const isFirstRole = roleIndex === 0;
                  
                  return (
                    <tr key={`${loc}-${roleIndex}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      {isFirstRole && (
                        <td className="p-4 align-top font-medium text-slate-800 border-r border-slate-200 bg-slate-50/30" rowSpan={req.length}>
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm leading-tight">{loc}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {req.reduce((sum, role) => sum + role.count, 0)} positions needed
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      
                      <td className="p-4 align-top border-r border-slate-200 bg-slate-50/20">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${position.color} bg-opacity-20`}>
                            <span className="text-lg">{position.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{position.name}</div>
                            <div className="text-xs text-slate-500">
                              Need {r.count} • {position.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {dates.map((d) => {
                        const k = formatDate(d);
                        const slots = assignments[shift]?.[loc]?.[k]?.[roleIndex] || [];
                        const filledSlots = slots.filter(emp => emp).length;
                        const isToday = k === formatDate(new Date());
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                        
                        return (
                          <td key={k} className={`p-3 align-top border-r border-slate-200 last:border-r-0 ${
                            isToday ? 'bg-blue-50/50' : 
                            isWeekend ? 'bg-orange-50/30' : ''
                          }`}>
                            <div className="space-y-2">
                              {/* Progress indicator */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-600">
                                  {filledSlots}/{r.count}
                                </span>
                                <div className="flex space-x-1">
                                  {Array.from({ length: r.count }, (_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${
                                      slots[i] ? 'bg-emerald-500' : 'bg-slate-200'
                                    }`}></div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Assignment slots */}
                              {Array.from({ length: r.count }, (_, slotIndex) => (
                                <AssignmentSlot
                                  key={slotIndex}
                                  shift={shift}
                                  location={loc}
                                  date={k}
                                  roleIndex={roleIndex}
                                  slotIndex={slotIndex}
                                  position={position}
                                  requirement={r}
                                />
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Kanban View Component  
  const KanbanView = ({ shift }) => {
    const filteredLocationsList = selectedLocation === "all" 
      ? locations 
      : [selectedLocation];

    return (
      <div className="space-y-6">
        {filteredLocationsList.map((location) => (
          <div key={location} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Location Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{location}</h3>
                    <p className="text-sm text-slate-600">
                      {dates.length} days • Multiple roles
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-slate-600">
                    {getLocationProgress(shift, location)}% complete
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full">
                    <div 
                      className="h-2 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${getLocationProgress(shift, location)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Days Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-4">
                {dates.map((date) => {
                  const dateStr = formatDate(date);
                  const isToday = dateStr === formatDate(new Date());
                  const requirements = getRequirementsForDate(shift, location, dateStr);
                  
                  return (
                    <div key={dateStr} className={`space-y-3 ${isToday ? 'bg-blue-50 p-3 rounded-xl' : ''}`}>
                      {/* Date Header */}
                      <div className="text-center">
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </div>
                        <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                          {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </div>
                      </div>

                      {/* Role Slots */}
                      <div className="space-y-2">
                        {requirements.map((req, roleIndex) => {
                          const position = getPositionDetails(req.role);
                          
                          return (
                            <div key={roleIndex} className="space-y-2">
                              {/* Role Header */}
                              <div className="flex items-center space-x-2 px-2">
                                <span className="text-sm">{position.icon}</span>
                                <span className="text-xs font-medium text-slate-700 truncate">
                                  {position.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({req.count})
                                </span>
                              </div>
                              
                              {/* Assignment Slots */}
                              <div className="space-y-1">
                                {Array.from({ length: req.count }, (_, slotIndex) => (
                                  <AssignmentSlot
                                    key={slotIndex}
                                    shift={shift}
                                    location={location}
                                    date={dateStr}
                                    roleIndex={roleIndex}
                                    slotIndex={slotIndex}
                                    position={position}
                                    requirement={req}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Calendar View Component
  const CalendarView = ({ shift }) => {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Week Calendar View
            </h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-200 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-3 py-1 bg-white rounded-lg border">
                {formatDate(dates[0])} - {formatDate(dates[dates.length - 1])}
              </span>
              <button className="p-2 hover:bg-slate-200 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dates.map((date) => {
              const dateStr = formatDate(date);
              const isToday = dateStr === formatDate(new Date());
              
              return (
                <div key={dateStr} className={`p-4 min-h-[200px] border border-slate-200 rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}>
                  {/* Day Header */}
                  <div className="text-center mb-3">
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                      {new Date(date).getDate()}
                    </div>
                  </div>

                  {/* Day Events */}
                  <div className="space-y-1">
                    {(selectedLocation === "all" ? locations : [selectedLocation]).map((location) => {
                      const req = requirements[shift]?.[location]?.[dateStr] || [];
                      const totalSlots = req.reduce((sum, r) => sum + r.count, 0);
                      const filledSlots = req.reduce((sum, r, rIndex) => {
                        const slots = assignments[shift]?.[location]?.[dateStr]?.[rIndex] || [];
                        return sum + slots.filter(emp => emp).length;
                      }, 0);
                      
                      if (totalSlots === 0) return null;
                      
                      return (
                        <div key={location} className={`p-2 rounded text-xs ${
                          filledSlots === totalSlots 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : filledSlots > 0
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          <div className="font-medium truncate">{location.split(' - ')[0]}</div>
                          <div className="text-xs opacity-75">{filledSlots}/{totalSlots} assigned</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper functions for the views
  const getLocationProgress = (shift, location) => {
    let totalSlots = 0;
    let filledSlots = 0;
    
    dates.forEach((date) => {
      const dateStr = formatDate(date);
      const req = requirements[shift]?.[location]?.[dateStr] || [];
      req.forEach((r, roleIndex) => {
        totalSlots += r.count;
        const slots = assignments[shift]?.[location]?.[dateStr]?.[roleIndex] || [];
        filledSlots += slots.filter(emp => emp).length;
      });
    });
    
    return totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
  };

  const getRequirementsForDate = (shift, location, date) => {
    return requirements[shift]?.[location]?.[date] || [];
  };

  // Enhanced shift controls with better UX
  const renderShiftControls = (shift) => {
    const stats = getShiftStats(shift);
    
    return (
      <div className="space-y-4">
        {/* Statistics Bar */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Progress: <span className="font-semibold text-slate-800">{stats.filledSlots}/{stats.totalSlots}</span>
              </div>
              <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[100px]">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completion}%` }}
                ></div>
              </div>
              <div className="text-sm font-semibold text-emerald-600">
                {stats.completion.toFixed(1)}%
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              editing[shift] 
                ? "bg-amber-100 text-amber-700 border border-amber-200" 
                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
            }`}>
              {editing[shift] ? "🔓 Editing" : "🔒 Locked"}
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Location Filter */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Location Filter</label>
            <select
              className="w-full px-4 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-8 flex flex-wrap gap-2">
            <button
              onClick={() => {
                // Auto-assign all available employees
                toast.success("Auto-assignment feature coming soon!");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              disabled={!editing[shift]}
            >
              <Zap className="w-4 h-4" />
              Auto Assign
            </button>
            
            <button
              onClick={() => {
                // Clear all assignments
                setAssignments(prev => {
                  const updated = { ...prev };
                  locations.forEach(loc => {
                    dates.forEach(d => {
                      const k = formatDate(d);
                      const req = requirements[shift]?.[loc]?.[k] || [];
                      req.forEach((r, roleIndex) => {
                        if (updated[shift][loc][k][roleIndex]) {
                          updated[shift][loc][k][roleIndex] = Array(r.count).fill(null);
                        }
                      });
                    });
                  });
                  return updated;
                });
                toast.info("All assignments cleared");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              disabled={!editing[shift]}
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </button>
            
            <button
              onClick={() => {
                // Save and lock
                localStorage.setItem("shift-assignments", JSON.stringify(assignments));
                setEditing((prev) => ({ ...prev, [shift]: false }));
                toast.success(`Shift ${shift} saved and locked successfully!`);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              disabled={!editing[shift]}
            >
              <Save className="w-4 h-4" />
              Save & Lock
            </button>
            
            <button
              onClick={() => {
                // Export CSV
                const csvData = [];
                csvData.push(["Date", "Location", "Role", "Employee", "Experience", "Rating"]);
                
                dates.forEach((date) => {
                  const dateStr = formatDate(date);
                  locations.forEach((loc) => {
                    const req = requirements[shift]?.[loc]?.[dateStr] || [];
                    req.forEach((r, roleIndex) => {
                      const slots = assignments[shift]?.[loc]?.[dateStr]?.[roleIndex] || [];
                      slots.forEach((employeeId) => {
                        const employee = getEmployee(employeeId);
                        if (employee) {
                          csvData.push([dateStr, loc, r.role, employee.name, employee.experience, employee.rating]);
                        }
                      });
                    });
                  });
                });
                
                const csv = csvData.map(row => row.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `shift-${shift}-assignments.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                toast.success(`Shift ${shift} data exported successfully!`);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Employee Panel */}
        {showEmployeePanel && (
          <div className="hidden lg:block">
            <EmployeePanel />
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Header Section */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Smart Shift Assignment
                    </h1>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Drag-and-drop employee assignment with intelligent conflict detection
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-700 font-medium text-sm">Live Sync</span>
                  </div>
                  
                  <button
                    onClick={() => setShowEmployeePanel(!showEmployeePanel)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 lg:hidden"
                  >
                    <Users className="w-4 h-4" />
                    {showEmployeePanel ? 'Hide' : 'Show'} Team
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Reset all assignments
                      localStorage.removeItem("shift-assignments");
                      setAssignments({});
                      setEditing({ 1: true, 2: true });
                      toast.info("All assignments reset");
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <RotateCcw size={20} />
                    <span>Reset All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Legend and Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Position Legend */}
              <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Position Legend</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {positions.map((pos) => (
                    <div key={pos.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <span className="text-lg">{pos.icon}</span>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{pos.name}</div>
                        <div className="text-xs text-slate-500">{pos.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Week Overview</h3>
                </div>
                
                <div className="space-y-4">
                  {[1, 2].map(shift => {
                    const stats = getShiftStats(shift);
                    return (
                      <div key={shift} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            {shift === 1 ? 'Morning' : 'Evening'} Shift
                          </span>
                          <span className="text-sm text-slate-600">
                            {stats.filledSlots}/{stats.totalSlots}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              shift === 1 ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${stats.completion}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {stats.completion.toFixed(1)}% complete
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shift Tabs */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-2">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveShift(1)}
                  className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeShift === 1 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Morning Shift</span>
                    <span className="text-xs opacity-75">(06:00 - 14:00)</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveShift(2)}
                  className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeShift === 2 
                      ? "bg-white text-purple-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Evening Shift</span>
                    <span className="text-xs opacity-75">(14:00 - 22:00)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Active Shift Section */}
            {renderShift(activeShift)}

            {/* Enhanced Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">💡 Pro Tips & Shortcuts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">🎯 Assignment Shortcuts</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• <strong>Drag & Drop:</strong> Drag employees from the left panel to any slot</li>
                        <li>• <strong>Conflict Detection:</strong> Red borders indicate scheduling conflicts</li>
                        <li>• <strong>Availability Status:</strong> Green = Available, Amber = Partial, Red = Unavailable</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">⚡ Power Features</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• <strong>Auto-save:</strong> Changes are automatically saved every 2 seconds</li>
                        <li>• <strong>Bulk Actions:</strong> Use the employee panel for efficient assignment</li>
                        <li>• <strong>Export:</strong> Download complete schedules with employee details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Employee Panel Overlay */}
      {showEmployeePanel && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowEmployeePanel(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <EmployeePanel />
          </div>
        </div>
      )}

      {/* Drag handler for employee reordering */}
      <div
        onDragEnd={handleDragEnd}
        className="hidden"
      />
    </div>
  );
}
import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Settings,
  Calendar,
  Briefcase,
  Save,
  Edit,
  Eye,
  Plus,
  Trash2,
  UserCheck,
  Building2,
  Zap,
  Star,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { planShifts } from "../API/apiService";
import { toast } from "sonner";

export default function ShiftPlanning() {
  const [step, setStep] = useState(1);
  const [numShifts, setNumShifts] = useState(1);
  const [shifts, setShifts] = useState([{ name: "Shift 1", startTime: "", endTime: "" }]);
  const [numLocations, setNumLocations] = useState(1);
  const [locations, setLocations] = useState([
    { name: "Location 1", shifts: [{ personsRequired: "", femaleRequired: "", supervisorRequired: false, workingDays: "", customDays: [] }] }
  ]);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (shifts.some(shift => !shift.name || !shift.startTime || !shift.endTime)) {
          toast.error("Please fill in all shift details");
          return false;
        }
        return true;
      case 2:
        if (locations.some(loc => !loc.name)) {
          toast.error("Please provide names for all locations");
          return false;
        }
        return true;
      case 3:
        if (locations.some(loc => 
          loc.shifts.some(shift => 
            !shift.personsRequired || parseInt(shift.personsRequired) < 1
          )
        )) {
          toast.error("Please specify required persons for all shifts and locations");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNumShiftsChange = (e) => {
    const val = Math.min(4, Math.max(1, parseInt(e.target.value) || 1));
    setNumShifts(val);
    setShifts(Array.from({ length: val }, (_, i) => shifts[i] || { name: `Shift ${i + 1}`, startTime: "", endTime: "" }));
    setLocations(prev => prev.map(loc => ({
      ...loc,
      shifts: Array.from({ length: val }, (_, s) => loc.shifts?.[s] || { personsRequired: "", femaleRequired: "", supervisorRequired: false, workingDays: "", customDays: [] })
    })));
  };

  const handleShiftChange = (index, field, value) => {
    setShifts(prev => prev.map((shift, i) => (i === index ? { ...shift, [field]: value } : shift)));
  };

  const handleNumLocationsChange = (e) => {
    const val = Math.min(20, Math.max(1, parseInt(e.target.value) || 1));
    setNumLocations(val);
    setLocations(Array.from({ length: val }, (_, i) => locations[i] || { name: `Location ${i + 1}`, shifts: shifts.map(() => ({ personsRequired: "", femaleRequired: "", supervisorRequired: false, workingDays: "", customDays: [] })) }));
  };

  const handleLocationChange = (index, field, value) => {
    setLocations(prev => prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc)));
  };

  const handleShiftLocationChange = (locationIndex, shiftIndex, field, value) => {
    setLocations(prev => prev.map((loc, i) => 
      i === locationIndex ? {
        ...loc,
        shifts: loc.shifts.map((shift, j) => 
          j === shiftIndex ? { ...shift, [field]: value } : shift
        )
      } : loc
    ));
  };

  const handleCustomDayToggle = (locationIndex, shiftIndex, day) => {
    setLocations(prev => prev.map((loc, i) => 
      i === locationIndex ? {
        ...loc,
        shifts: loc.shifts.map((shift, j) => 
          j === shiftIndex ? {
            ...shift,
            customDays: shift.customDays.includes(day) 
              ? shift.customDays.filter(d => d !== day)
              : [...shift.customDays, day]
          } : shift
        )
      } : loc
    ));
  };

  const addShift = () => {
    if (numShifts < 4) {
      const newShiftCount = numShifts + 1;
      setNumShifts(newShiftCount);
      setShifts(prev => [...prev, { name: `Shift ${newShiftCount}`, startTime: "", endTime: "" }]);
      setLocations(prev => prev.map(loc => ({
        ...loc,
        shifts: [...loc.shifts, { personsRequired: "", femaleRequired: "", supervisorRequired: false, workingDays: "", customDays: [] }]
      })));
    }
  };

  const removeShift = (index) => {
    if (numShifts > 1) {
      setNumShifts(numShifts - 1);
      setShifts(prev => prev.filter((_, i) => i !== index));
      setLocations(prev => prev.map(loc => ({
        ...loc,
        shifts: loc.shifts.filter((_, i) => i !== index)
      })));
    }
  };

  const addLocation = () => {
    if (numLocations < 20) {
      const newLocationCount = numLocations + 1;
      setNumLocations(newLocationCount);
      setLocations(prev => [...prev, { 
        name: `Location ${newLocationCount}`, 
        shifts: shifts.map(() => ({ personsRequired: "", femaleRequired: "", supervisorRequired: false, workingDays: "", customDays: [] }))
      }]);
    }
  };

  const removeLocation = (index) => {
    if (numLocations > 1) {
      setNumLocations(numLocations - 1);
      setLocations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const shiftDetails = shifts.reduce((acc, shift, index) => {
      acc[index + 1] = {
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime
      };
      return acc;
    }, {});
    
    const locationDetails = locations.map((loc) => ({
      name: loc.name,
      shifts: loc.shifts.map((shift, i) => ({
        shift: shifts[i]?.name || `Shift ${i + 1}`,
        personsRequired: Number(shift.personsRequired) || 0,
        femaleRequired: Number(shift.femaleRequired) || 0,
        supervisorRequired: !!shift.supervisorRequired,
        workingDays: shift.workingDays || "All Days",
        customDays: Array.isArray(shift.customDays) ? shift.customDays : []
      }))
    }));
    
    const payload = {
      startDate: formattedDate,
      endDate: formattedDate,
      shiftDetails,
      locationDetails
    };
    
    try {
      const response = await planShifts(payload);
      console.log("✅ Shift Plan Saved:", response);
      toast.success("Shift Planning saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Failed to save shift planning:", error);
      toast.error("Failed to save shift plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setStep(1);
  };

  // Enhanced stepper with icons
  const Stepper = () => {
    const steps = [
      { number: 1, title: "Define Shifts", icon: Clock, description: "Set up shift timings" },
      { number: 2, title: "Add Locations", icon: MapPin, description: "Configure work locations" },
      { number: 3, title: "Set Requirements", icon: Users, description: "Define staffing needs" },
      { number: 4, title: "Review & Save", icon: CheckCircle, description: "Finalize planning" }
    ];
    
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;
            const isUpcoming = step < stepItem.number;
            
            return (
              <React.Fragment key={stepItem.number}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg' 
                      : isActive 
                        ? 'bg-blue-500 text-white scale-110 shadow-lg' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-slate-500 hidden sm:block">
                      {stepItem.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    step > stepItem.number ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Define Your Shifts</h2>
              <p className="text-slate-600">Set up shift timings and schedules for your organization</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Shift Configuration</h3>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-slate-700">Number of Shifts:</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="4" 
                    value={numShifts} 
                    onChange={handleNumShiftsChange} 
                    className="w-20 px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-center font-semibold" 
                    disabled={!isEditing} 
                  />
                  <span className="text-sm text-slate-500">(Max: 4)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shifts.map((shift, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 relative">
                  {numShifts > 1 && (
                    <button
                      onClick={() => removeShift(i)}
                      className="absolute top-3 right-3 p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={!isEditing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500 text-white rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Shift {i + 1}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Shift Name</label>
                      <input 
                        type="text" 
                        value={shift.name} 
                        onChange={(e) => handleShiftChange(i, 'name', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200" 
                        placeholder={`Shift ${i + 1} Name`} 
                        disabled={!isEditing} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                        <input 
                          type="time" 
                          value={shift.startTime} 
                          onChange={(e) => handleShiftChange(i, 'startTime', e.target.value)} 
                          className="w-full px-4 py-3 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200" 
                          disabled={!isEditing} 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                        <input 
                          type="time" 
                          value={shift.endTime} 
                          onChange={(e) => handleShiftChange(i, 'endTime', e.target.value)} 
                          className="w-full px-4 py-3 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200" 
                          disabled={!isEditing} 
                        />
                      </div>
                    </div>
                    
                    {shift.startTime && shift.endTime && (
                      <div className="mt-3 p-3 bg-emerald-100 border border-emerald-200 rounded-xl">
                        <div className="flex items-center space-x-2 text-emerald-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Duration: {calculateDuration(shift.startTime, shift.endTime)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {numShifts < 4 && (
                <button
                  onClick={addShift}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-all duration-200 group"
                  disabled={!isEditing}
                >
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                  <span className="text-slate-500 group-hover:text-blue-600 font-medium">Add Another Shift</span>
                </button>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Configure Locations</h2>
              <p className="text-slate-600">Add and manage your work locations</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800">Location Management</h3>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-slate-700">Number of Locations:</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={numLocations} 
                    onChange={handleNumLocationsChange} 
                    className="w-20 px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-center font-semibold" 
                    disabled={!isEditing} 
                  />
                  <span className="text-sm text-slate-500">(Max: 20)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location, i) => (
                <div key={i} className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 relative">
                  {numLocations > 1 && (
                    <button
                      onClick={() => removeLocation(i)}
                      className="absolute top-3 right-3 p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={!isEditing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Location {i + 1}</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location Name</label>
                    <input 
                      type="text" 
                      value={location.name} 
                      onChange={(e) => handleLocationChange(i, 'name', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-200" 
                      placeholder={`Location ${i + 1} Name`} 
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
              ))}
              
              {numLocations < 20 && (
                <button
                  onClick={addLocation}
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-all duration-200 group"
                  disabled={!isEditing}
                >
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-2" />
                  <span className="text-slate-500 group-hover:text-emerald-600 font-medium text-sm">Add Location</span>
                </button>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Set Staffing Requirements</h2>
              <p className="text-slate-600">Define personnel needs for each shift and location</p>
            </div>
            
            <div className="space-y-6">
              {locations.map((location, locationIndex) => (
                <div key={locationIndex} className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">{location.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {shifts.map((shift, shiftIndex) => {
                        const shiftReq = location.shifts[shiftIndex] || {};
                        
                        return (
                          <div key={shiftIndex} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <div className="flex items-center space-x-3 mb-4">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-slate-800">{shift.name}</h4>
                              <span className="text-sm text-slate-500">({shift.startTime} - {shift.endTime})</span>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Total Required
                                  </label>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    value={shiftReq.personsRequired || ""} 
                                    onChange={(e) => handleShiftLocationChange(locationIndex, shiftIndex, 'personsRequired', e.target.value)} 
                                    className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" 
                                    placeholder="0"
                                    disabled={!isEditing} 
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Female Required
                                  </label>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    value={shiftReq.femaleRequired || ""} 
                                    onChange={(e) => handleShiftLocationChange(locationIndex, shiftIndex, 'femaleRequired', e.target.value)} 
                                    className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" 
                                    placeholder="0"
                                    disabled={!isEditing} 
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={shiftReq.supervisorRequired || false} 
                                    onChange={(e) => handleShiftLocationChange(locationIndex, shiftIndex, 'supervisorRequired', e.target.checked)} 
                                    className="w-4 h-4 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-blue-500"
                                    disabled={!isEditing} 
                                  />
                                  <span className="text-sm font-medium text-slate-700">Supervisor Required</span>
                                </label>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Working Days</label>
                                <select 
                                  value={shiftReq.workingDays || "All Days"} 
                                  onChange={(e) => handleShiftLocationChange(locationIndex, shiftIndex, 'workingDays', e.target.value)} 
                                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                                  disabled={!isEditing}
                                >
                                  <option value="All Days">All Days</option>
                                  <option value="Weekdays">Weekdays Only</option>
                                  <option value="Weekends">Weekends Only</option>
                                  <option value="Custom">Custom Days</option>
                                </select>
                              </div>
                              
                              {shiftReq.workingDays === "Custom" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Days</label>
                                  <div className="flex flex-wrap gap-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                      <button
                                        key={day}
                                        onClick={() => handleCustomDayToggle(locationIndex, shiftIndex, day)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                          shiftReq.customDays?.includes(day)
                                            ? "bg-blue-500 text-white"
                                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        }`}
                                        disabled={!isEditing}
                                      >
                                        {day}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Review & Finalize</h2>
              <p className="text-slate-600">Review your shift planning configuration before saving</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Shifts</p>
                    <p className="text-2xl font-bold text-blue-600">{numShifts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Locations</p>
                    <p className="text-2xl font-bold text-emerald-600">{numLocations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 text-white rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Staff Needed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {locations.reduce((total, loc) => 
                        total + loc.shifts.reduce((sum, shift) => sum + (parseInt(shift.personsRequired) || 0), 0), 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Review */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
                <h3 className="text-lg font-semibold">Configuration Overview</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Shifts Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Shift Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shifts.map((shift, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h5 className="font-semibold text-blue-800">{shift.name}</h5>
                        <p className="text-blue-600">{shift.startTime} - {shift.endTime}</p>
                        <p className="text-sm text-blue-500">
                          Duration: {calculateDuration(shift.startTime, shift.endTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Locations & Requirements */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                    Location Requirements
                  </h4>
                  <div className="space-y-4">
                    {locations.map((location, locIndex) => (
                      <div key={locIndex} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <h5 className="font-semibold text-emerald-800 mb-3">{location.name}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {location.shifts.map((shiftReq, shiftIndex) => (
                            <div key={shiftIndex} className="bg-white border border-emerald-200 rounded-lg p-3">
                              <p className="font-medium text-slate-800">{shifts[shiftIndex]?.name}</p>
                              <div className="text-sm text-slate-600 space-y-1">
                                <p>Total: {shiftReq.personsRequired || 0} persons</p>
                                <p>Female: {shiftReq.femaleRequired || 0} persons</p>
                                <p>Supervisor: {shiftReq.supervisorRequired ? "Required" : "Not required"}</p>
                                <p>Days: {shiftReq.workingDays || "All Days"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) {
      end.setDate(end.getDate() + 1); // Next day
    }
    
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Shift Planning Wizard
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Create comprehensive shift schedules with location-specific requirements
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium text-sm">
                  {isEditing ? "Planning Mode" : "Saved Configuration"}
                </span>
              </div>
              
              {!isEditing && (
                <button 
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Edit size={20} />
                  <span>Edit Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <Stepper />

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium transition-all duration-200 disabled:hover:bg-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Step {step} of 4</span>
          </div>

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isEditing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:transform-none"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!isEditing || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Plan
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Planning Tips</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Consider peak hours when setting staffing requirements</li>
                <li>• Ensure sufficient overlap between shifts for handovers</li>
                <li>• Plan for supervisor coverage across all locations</li>
                <li>• Factor in break times and lunch periods in your planning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
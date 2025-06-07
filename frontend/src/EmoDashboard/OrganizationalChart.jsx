import React, { useState } from "react";
import { 
  Plus, 
  Users, 
  Building2, 
  Crown, 
  Shield, 
  UserCheck, 
  Briefcase,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Save,
  X,
  Zap,
  Target,
  Globe
} from "lucide-react";
import { toast } from "sonner";

const OrganizationalChart = () => {
  const [structure, setStructure] = useState([
    { 
      id: 1, 
      name: "Super Admin (CEO)", 
      details: "Chief Executive Officer overseeing all operations", 
      departments: [],
      expanded: true
    }
  ]);

  const [editingNode, setEditingNode] = useState(null);
  const [editValue, setEditValue] = useState("");

  const addNode = (parentId, type) => {
    setStructure((prevStructure) => {
      const addChild = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentId) {
            const newNode = {
              id: Date.now(),
              name: `New ${type}`,
              details: `Enter details for this ${type.toLowerCase()}`,
              expanded: true,
              ...(type === "Department" && { managers: [] }),
              ...(type === "Manager" && { teamLeads: [] }),
              ...(type === "Team Lead" && { teams: [] }),
              ...(type === "Team" && {})
            };

            if (type === "Department") {
              return {
                ...node,
                departments: [...node.departments, newNode],
                expanded: true
              };
            }
            if (type === "Manager") {
              return {
                ...node,
                managers: [...node.managers, newNode],
                expanded: true
              };
            }
            if (type === "Team Lead") {
              return {
                ...node,
                teamLeads: [...node.teamLeads, newNode],
                expanded: true
              };
            }
            if (type === "Team") {
              return {
                ...node,
                teams: [...node.teams, newNode],
                expanded: true
              };
            }
          }
          return {
            ...node,
            departments: addChild(node.departments || []),
            managers: addChild(node.managers || []),
            teamLeads: addChild(node.teamLeads || []),
            teams: addChild(node.teams || [])
          };
        });
      };
      const updated = addChild(prevStructure);
      toast.success(`${type} added successfully!`);
      return updated;
    });
  };

  const handleInputChange = (id, field, value) => {
    setStructure((prevStructure) => {
      const updateNode = (nodes) => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, [field]: value };
          }
          return {
            ...node,
            departments: updateNode(node.departments || []),
            managers: updateNode(node.managers || []),
            teamLeads: updateNode(node.teamLeads || []),
            teams: updateNode(node.teams || [])
          };
        });
      };
      return updateNode(prevStructure);
    });
  };

  const toggleExpanded = (id) => {
    setStructure((prevStructure) => {
      const toggleNode = (nodes) => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, expanded: !node.expanded };
          }
          return {
            ...node,
            departments: toggleNode(node.departments || []),
            managers: toggleNode(node.managers || []),
            teamLeads: toggleNode(node.teamLeads || []),
            teams: toggleNode(node.teams || [])
          };
        });
      };
      return toggleNode(prevStructure);
    });
  };

  const deleteNode = (id) => {
    setStructure((prevStructure) => {
      const removeNode = (nodes) => {
        return nodes.filter(node => node.id !== id).map((node) => ({
          ...node,
          departments: removeNode(node.departments || []),
          managers: removeNode(node.managers || []),
          teamLeads: removeNode(node.teamLeads || []),
          teams: removeNode(node.teams || [])
        }));
      };
      const updated = removeNode(prevStructure);
      toast.success("Node deleted successfully!");
      return updated;
    });
  };

  const startEditing = (node) => {
    setEditingNode(node.id);
    setEditValue(node.name);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      handleInputChange(editingNode, 'name', editValue);
      setEditingNode(null);
      setEditValue("");
      toast.success("Node updated successfully!");
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditValue("");
  };

  const getNodeTypeIcon = (node) => {
    if (node.name.includes('CEO') || node.name.includes('Super Admin')) return Crown;
    if (node.departments !== undefined) return Building2;
    if (node.managers !== undefined) return Shield;
    if (node.teamLeads !== undefined) return UserCheck;
    if (node.teams !== undefined) return Briefcase;
    return Users;
  };

  const getNodeTypeColor = (node) => {
    if (node.name.includes('CEO') || node.name.includes('Super Admin')) 
      return { bg: 'bg-gradient-to-r from-purple-500 to-indigo-600', text: 'text-white', border: 'border-purple-200' };
    if (node.departments !== undefined) 
      return { bg: 'bg-gradient-to-r from-blue-500 to-cyan-600', text: 'text-white', border: 'border-blue-200' };
    if (node.managers !== undefined) 
      return { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600', text: 'text-white', border: 'border-emerald-200' };
    if (node.teamLeads !== undefined) 
      return { bg: 'bg-gradient-to-r from-orange-500 to-amber-600', text: 'text-white', border: 'border-orange-200' };
    if (node.teams !== undefined) 
      return { bg: 'bg-gradient-to-r from-pink-500 to-rose-600', text: 'text-white', border: 'border-pink-200' };
    return { bg: 'bg-gradient-to-r from-slate-500 to-slate-600', text: 'text-white', border: 'border-slate-200' };
  };

  const renderTree = (nodes, level = 0, prefix = "") => {
    return (
      <div className={`${level > 0 ? 'ml-8 pl-4 border-l-2 border-slate-200' : ''} space-y-4`}>
        {nodes.map((node, index) => {
          const sno = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
          const Icon = getNodeTypeIcon(node);
          const colors = getNodeTypeColor(node);
          const hasChildren = (node.departments?.length > 0) || 
                             (node.managers?.length > 0) || 
                             (node.teamLeads?.length > 0) || 
                             (node.teams?.length > 0);

          return (
            <div key={node.id} className="space-y-4">
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Expand/Collapse Button */}
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpanded(node.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {node.expanded ? 
                          <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        }
                      </button>
                    )}

                    {/* Node Icon and Info */}
                    <div className={`p-3 rounded-xl ${colors.bg} shadow-lg`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {sno}
                        </span>
                        {editingNode === node.id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 font-semibold"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <button
                              onClick={saveEdit}
                              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-lg font-bold text-slate-800">{node.name}</h3>
                        )}
                      </div>
                      
                      <textarea
                        placeholder="Enter details about this role or department..."
                        value={node.details}
                        onChange={(e) => handleInputChange(node.id, "details", e.target.value)}
                        className="w-full px-4 py-3 text-sm border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(node)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {node.id !== 1 && (
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Child Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                  {node.departments !== undefined && (
                    <button
                      onClick={() => addNode(node.id, "Department")}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Department
                    </button>
                  )}
                  {node.managers !== undefined && (
                    <button
                      onClick={() => addNode(node.id, "Manager")}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-xl hover:bg-emerald-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Manager
                    </button>
                  )}
                  {node.teamLeads !== undefined && (
                    <button
                      onClick={() => addNode(node.id, "Team Lead")}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Team Lead
                    </button>
                  )}
                  {node.teams !== undefined && (
                    <button
                      onClick={() => addNode(node.id, "Team")}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-xl hover:bg-pink-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Team
                    </button>
                  )}
                </div>

                {/* Children Sections */}
                {node.expanded && (
                  <div className="mt-6 space-y-6">
                    {node.departments && node.departments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                          Departments ({node.departments.length})
                        </h4>
                        {renderTree(node.departments, level + 1, sno)}
                      </div>
                    )}
                    {node.managers && node.managers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-emerald-600" />
                          Managers ({node.managers.length})
                        </h4>
                        {renderTree(node.managers, level + 1, sno)}
                      </div>
                    )}
                    {node.teamLeads && node.teamLeads.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <UserCheck className="w-4 h-4 mr-2 text-orange-600" />
                          Team Leads ({node.teamLeads.length})
                        </h4>
                        {renderTree(node.teamLeads, level + 1, sno)}
                      </div>
                    )}
                    {node.teams && node.teams.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-pink-600" />
                          Teams ({node.teams.length})
                        </h4>
                        {renderTree(node.teams, level + 1, sno)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Organizational Chart
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Design and manage your company's organizational structure with visual hierarchy
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium text-sm">Live Structure</span>
              </div>
              
              <button 
                onClick={() => toast.success("Export functionality coming soon!")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Zap size={20} />
                <span>Export Chart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Hierarchy Legend</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700">CEO/Admin</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">Department</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-700">Manager</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-700">Team Lead</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-pink-700">Team</span>
            </div>
          </div>
        </div>

        {/* Organizational Chart Tree */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Company Structure</h2>
          </div>
          
          {renderTree(structure)}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Pro Tips</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Click the expand/collapse buttons to navigate large organizational structures</li>
                <li>• Use the edit button (pencil icon) to rename any position or department</li>
                <li>• Add detailed descriptions in the text areas to document roles and responsibilities</li>
                <li>• Different colors represent different hierarchy levels for easy visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalChart;

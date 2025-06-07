import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Input, Select, message, Avatar } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Tree from 'react-d3-tree';
import { getUserOrgChartViews, createOrgChartView, updateOrgChartView, fetchAllProfiles ,sendInvite,createProfile,  uploadBulkEmployees, downloadBulkTemplate,         // <-- add this
  getBulkUploadInstructions} from '../API/apiService';

const { Option } = Select;

const OrgChart = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isElementModalVisible, setIsElementModalVisible] = useState(false);
  const [viewForm] = Form.useForm();
  const [elementForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  const [elements, setElements] = useState([]);
  const [userViews, setUserViews] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
const [creatingProfile, setCreatingProfile] = useState(false);

const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
const [bulkFile, setBulkFile] = useState(null);
const [downloadUrl, setDownloadUrl] = useState('');
const [isUploading, setIsUploading] = useState(false);



  const [treeData, setTreeData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef();

  const baseViewTypes = [
    { value: 'empty', label: 'Empty' },
    { value: 'standard', label: 'Standard Org Chart' },
    { value: 'custom', label: 'Existing Custom Org Chart' }
  ];

  const elementTypes = [
    { value: 'employee', label: 'Single employee (including inactive employees)' },
    { value: 'company', label: 'Company' },
    { value: 'department', label: 'Department' },
    { value: 'future_role', label: 'Future role' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'division', label: 'Division' },
    { value: 'team', label: 'Team' },
    { value: 'other', label: 'Other' }
  ];

  const [selectedLevel, setSelectedLevel] = useState('');

  const getLevelNameLabel = (type) => {
    switch (type) {
      case 'company':
        return 'Company Name';
      case 'department':
        return 'Department Name';
      case 'team':
        return 'Team Name';
      case 'division':
        return 'Division Name';
      case 'employee':
        return 'Employee Name';
      case 'future_role':
        return 'Role Name';
      case 'assistant':
        return 'Assistant Name';
      default:
        return 'Name';
    }
  };

  const handleLevelChange = (value) => {
    setSelectedLevel(value);
    elementForm.setFieldsValue({ levelName: '' }); // Reset level name when type changes
  };

  // Handle window resize and initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Failed to load profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewProfile = async () => {
  if (!newProfileName) return;

  try {
    setCreatingProfile(true);
    const newProfile = await createProfile({ name: newProfileName });
    message.success('Profile created successfully!');

    // Add the new profile to the list
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);

    // Select the new profile
    elementForm.setFieldsValue({ profileId: newProfile.name });
    setNewProfileName('');
  } catch (error) {
    console.error('Failed to create profile:', error);
    message.error('Failed to create profile');
  } finally {
    setCreatingProfile(false);
  }
};

const handleBulkUpload = async () => {
  if (!bulkFile) return;
  setIsUploading(true);
  setDownloadUrl(''); // reset before new upload

  try {
    const response = await uploadBulkEmployees(bulkFile);

    // 💡 Check for Content-Type header
    const contentType = response.headers?.['content-type'];

    if (contentType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType?.includes('application/octet-stream')) {
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      message.success('Bulk upload processed. Response file ready to download.');
    } else {
      // In case the backend sends JSON with status 200
      message.success('Bulk upload successful!');
    }

  } catch (error) {
    if (error?.res && (error.res.created || error.res.errors)) {
      const { created = [], errors = [] } = error.res;

      message.warning(`Some users were created. ${errors.length} error(s) found.`);

      Modal.info({
        title: 'Bulk Upload Summary',
        content: (
          <div>
            {created.length > 0 && (
              <>
                <p className="font-semibold mb-1">Created Users:</p>
                <ul className="mb-2">
                  {created.map((user, i) => (
                    <li key={i}>{user.email} ({user.username})</li>
                  ))}
                </ul>
              </>
            )}
            {errors.length > 0 && (
              <>
                <p className="font-semibold mb-1 text-red-500">Errors:</p>
                <ul>
                  {errors.map((err, i) => (
                    <li key={i} className="text-red-500">{err}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )
      });
    } else {
      message.error(error?.resMsg || 'Failed to upload bulk file');
    }
  } finally {
    setIsUploading(false);
  }
};






  // Fetch views on load
  useEffect(() => {
    const fetchViews = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const res = await getUserOrgChartViews(userId);
        setUserViews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch user views:', err);
        message.error('Failed to load organization chart views');
      }
    };
    fetchViews();
  }, []);

  // Transform flat data to hierarchical structure when currentView changes
  useEffect(() => {
    if (currentView && currentView.data) {
      const transformData = (data) => {
        const nodeMap = {};
        const rootNodes = [];

        // First pass: create all nodes and map them by ID
        data.forEach(node => {
          nodeMap[node.nodeId] = {
            ...node,
            children: [] // Initialize empty children array
          };
        });

        // Second pass: build the hierarchy
        data.forEach(node => {
          const currentNode = nodeMap[node.nodeId];
          
          // If node has a parent, add it to parent's children
          if (node.parentId && nodeMap[node.parentId]) {
            nodeMap[node.parentId].children.push(currentNode);
          } 
          // Otherwise, add to root nodes
          else if (!node.parentId) {
            rootNodes.push(currentNode);
          }
        });

        return rootNodes;
      };

      const transformedData = transformData(currentView.data);
      setElements(transformedData);
    } else {
      setElements([]);
    }
  }, [currentView]);

  // Update treeData whenever elements change
  useEffect(() => {
    setTreeData(elements);
  }, [elements]);

  const showModal = () => {
    viewForm.resetFields(); // Reset form fields when opening modal
    setIsModalVisible(true);
  };

  const handleCreateView = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const viewData = {
        name: values.name,
        baseViewType: values.baseViewType,
        createdBy: userId,
        data: []
      };

      const response = await createOrgChartView(viewData);
      if (response?.data) {
        setUserViews(prev => [...prev, response.data]);
        setCurrentView(response.data);
        message.success('Organization chart view created successfully!');
        setIsModalVisible(false); // Close the modal after successful creation
        viewForm.resetFields(); // Reset form fields
        
        // If empty view type, show element modal to add first element
        if (values.baseViewType === 'empty') {
          setIsElementModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error creating org chart view:', error);
      message.error(error.message || 'Failed to create organization chart view');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElement = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const newNodeId = `node-${Date.now()}`;
      const selectedNode = selectedElement?.parentElement;
      const isRoot = !selectedNode?.parentId;
      const parentId = isRoot ? selectedNode?.nodeId : selectedNode?.nodeId || '';

      const newElement = {
        nodeId: newNodeId,
        type: values.elementType,
        name: values.name,
        levelName: values.levelName,
        profileId: values.profileId || '',
        email: values.email || undefined,
        mobile: values.mobile || undefined,
        parentId: parentId,
        children: [],
        childrenIds: [],
        status: 'active',
        viewId: currentView.id,
      };

      // First create the updated view with the new element
      const updatedElements = [...currentView.data, newElement];
      if (parentId) {
        updatedElements.forEach(el => {
          if (el.nodeId === parentId) {
            el.childrenIds = [...(el.childrenIds || []), newNodeId];
          }
        });
      }

      const updatedView = {
        ...currentView,
        data: updatedElements,
      };

      // Save the updated view first
      const saveResponse = await updateOrgChartView(currentView.id, updatedView, token);
      
      // Only proceed with invite if the save was successful
      if (saveResponse.success) {
        // Now send the invite
        if (values.email || values.mobile) {
         const isRootElement = !selectedNode?.parentId;

const invitePayload = {
  name: values.name,
  email: values.email || '', 
  mobile: values.mobile || '',
  role: newElement.type,
  profile: values.profileId,
  viewId: currentView.id,
  isRootElement,
};

if (!isRootElement) {
  invitePayload.parentNodeId = selectedNode.nodeId;
}

await sendInvite(invitePayload);

        }

        // Refresh the view
        const refreshedViewRes = await getUserOrgChartViews(userId);
        const refreshedView = refreshedViewRes.data.find(v => v.id === currentView.id);
        
        if (refreshedView) {
          message.success('Element added successfully!');
          setCurrentView(refreshedView);
        } else {
          throw new Error('Failed to refresh view data');
        }
      }

      setIsElementModalVisible(false);
      elementForm.resetFields();
      setSelectedElement(null);
    } catch (error) {
      console.error('Error adding element:', error);
      message.error(error.message || 'Failed to add element');
    } finally {
      setLoading(false);
    }
  };

  const handleAddElement = (parentElement, relationType) => {
    setSelectedElement({ parentElement, relationType });
    setIsElementModalVisible(true);
  };

  const handleAddFirstElement = () => {
    // Reset the element form and clear any previous selections
    elementForm.resetFields();
    setSelectedElement(null);
    setIsElementModalVisible(true);
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    // Get profile data if available
    const profile = profiles.find(p => p._id === nodeDatum.profileId);
    
    // Define colors based on node type
    const nodeStyles = {
      company: {
        gradient: 'url(#companyGradient)',
        borderColor: '#4f46e5',
        iconBg: '#4f46e5'
      },
      department: {
        gradient: 'url(#departmentGradient)', 
        borderColor: '#10b981',
        iconBg: '#10b981'
      },
      employee: {
        gradient: 'url(#employeeGradient)',
        borderColor: '#3b82f6',
        iconBg: '#3b82f6'
      },
      default: {
        gradient: 'url(#defaultGradient)',
        borderColor: '#8b5cf6',
        iconBg: '#8b5cf6'
      }
    };
    
    const style = nodeStyles[nodeDatum.type] || nodeStyles.default;
    
    return (
      <g>
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="companyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="departmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="employeeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="cardShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000015"/>
          </filter>
        </defs>
        
        {/* Main Card Container */}
        <rect
          x="-90"
          y="-70"
          width="180"
          height="140"
          rx="16"
          ry="16"
          fill="#ffffff"
          stroke={style.borderColor}
          strokeWidth="2"
          filter="url(#cardShadow)"
          className="transition-all duration-300"
        />
        
        {/* Header Background */}
        <rect
          x="-90"
          y="-70"
          width="180"
          height="40"
          rx="16"
          ry="16"
          fill={style.gradient}
          opacity="0.1"
        />
        
        {/* Avatar Container */}
        <g transform="translate(0, -45)">
          {profile?.avatar ? (
            <g>
              <circle cx="0" cy="0" r="22" fill="#ffffff" stroke={style.borderColor} strokeWidth="3"/>
              <image
                x="-18"
                y="-18"
                width="36"
                height="36"
                href={profile.avatar}
                clipPath="circle(18px at center)"
              />
            </g>
          ) : (
            <g>
              <circle cx="0" cy="0" r="22" fill={style.gradient} stroke="#ffffff" strokeWidth="3"/>
              <text
                textAnchor="middle"
                dy="6"
                fill="white"
                fontSize="16"
                fontWeight="bold"
                className="font-sans"
              >
                {nodeDatum.name ? nodeDatum.name.charAt(0).toUpperCase() : '?'}
              </text>
            </g>
          )}
        </g>
        
        {/* Node Content */}
        <text
          textAnchor="middle"
          fill="#111827"
          strokeWidth="0"
          y="-5"
          fontSize="14"
          fontWeight="700"
          className="font-sans"
        >
          {nodeDatum.name.length > 15 ? `${nodeDatum.name.substring(0, 15)}...` : nodeDatum.name}
        </text>
        
        <text
          textAnchor="middle"
          fill="#6b7280"
          strokeWidth="0"
          y="15"
          fontSize="12"
          fontWeight="500"
          className="font-sans"
        >
          {nodeDatum.type.charAt(0).toUpperCase() + nodeDatum.type.slice(1)}
        </text>
        
        {profile?.position && (
          <text
            textAnchor="middle"
            fill="#9ca3af"
            strokeWidth="0"
            y="32"
            fontSize="11"
            className="font-sans"
          >
            {profile.position.length > 20 ? `${profile.position.substring(0, 20)}...` : profile.position}
          </text>
        )}
        
        {/* Status Indicator */}
        <circle
          cx="65"
          cy="-55"
          r="6"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Add Subordinate Button */}
        <g 
          transform="translate(0, 85)" 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleAddElement(nodeDatum, 'subordinate'); 
          }}
          className="cursor-pointer"
        >
          <circle 
            r="16" 
            fill="#ffffff" 
            stroke="#10b981" 
            strokeWidth="2" 
            filter="url(#cardShadow)"
            className="transition-all duration-300 hover:scale-110"
          />
          <text 
            textAnchor="middle" 
            dy="6" 
            fill="#10b981" 
            fontSize="16" 
            fontWeight="bold"
          >
            +
          </text>
        </g>
        
        {/* Side Action Buttons */}
        <g transform="translate(75, 0)">
          {/* Edit Button */}
          <g 
            transform="translate(0, -15)"
            className="cursor-pointer"
            onClick={(e) => { 
              e.stopPropagation(); 
              // Add edit functionality here
            }}
          >
            <circle r="12" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" opacity="0.9"/>
            <path
              d="M-4,-4 L-4,4 L4,4 L4,-4 Z M-2,-2 L2,-2 L2,2 L-2,2 Z"
              fill="#f59e0b"
              fontSize="8"
            />
          </g>
          
          {/* Info Button */}
          <g 
            transform="translate(0, 15)"
            className="cursor-pointer"
            onClick={(e) => { 
              e.stopPropagation(); 
              // Add info modal functionality here
            }}
          >
            <circle r="12" fill="#ffffff" stroke="#6366f1" strokeWidth="2" opacity="0.9"/>
            <text
              textAnchor="middle"
              dy="4"
              fill="#6366f1"
              fontSize="10"
              fontWeight="bold"
            >
              i
            </text>
          </g>
        </g>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Organization Chart
              </h1>
              <p className="text-slate-600 text-lg">Build and visualize your company's organizational structure</p>
            </div>
            <button 
              onClick={showModal}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-1 bg-white bg-opacity-20 rounded-lg">
                <PlusOutlined className="text-sm" />
              </div>
              <span className="font-semibold">Create Org Chart</span>
            </button>
          </div>
        </div>

        {/* Chart Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Select Organization Chart</h3>
              <p className="text-slate-600">Choose an existing chart or create a new one</p>
            </div>
          </div>
          
          <Select
            placeholder="Select Your Organization Chart"
            className="w-full max-w-md"
            size="large"
            value={currentView?.id || undefined}
            onChange={(viewId) => {
              const selectedView = userViews.find(view => view.id === viewId);
              setCurrentView(selectedView);
            }}
          >
            {userViews.map(view => (
              <Option key={`view-${view.id}`} value={view.id}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{view.name.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{view.name}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Visualization Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Chart Header */}
          {currentView?.name && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{currentView.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {currentView.name}
                    </h4>
                    <p className="text-slate-600">Organization Structure</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Active
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {treeData.length} {treeData.length === 1 ? 'Element' : 'Elements'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart Content */}
          <div className="p-6" ref={containerRef}>
            {treeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                {currentView ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Start Building Your Organization</h3>
                      <p className="text-slate-600 mb-6">Add your first team member or department to begin creating your organizational chart.</p>
                    </div>
                    <button 
                      onClick={handleAddFirstElement}
                      className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <PlusOutlined className="text-sm" />
                      <span className="font-semibold">Add First Element</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No Organization Chart Selected</h3>
                      <p className="text-slate-600">Select an existing chart from the dropdown above or create a new one to get started.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden">
                <Tree
                  data={treeData}
                  orientation="vertical"
                  pathFunc="step"
                  collapsible={true}
                  translate={{ x: dimensions.width / 2, y: 80 }}
                  nodeSize={{ x: 220, y: 180 }}
                  renderCustomNodeElement={renderCustomNode}
                  zoomable={true}
                  draggable={true}
                  separation={{ siblings: 1.2, nonSiblings: 1.5 }}
                  styles={{
                    links: {
                      stroke: '#cbd5e1',
                      strokeWidth: 3,
                    }
                  }}
                  shouldCollapseNeighborNodes={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Org Chart View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <PlusOutlined className="text-lg text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Organization Chart
              </h3>
              <p className="text-sm text-slate-600">
                Set up a new view of your organization structure
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={600}
        className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:border-0 [&_.ant-modal-content]:shadow-2xl"
      >
        <div className="p-6">
          <Form form={viewForm} layout="vertical" onFinish={handleCreateView} className="space-y-6">
            <Form.Item
              name="name"
              label={
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Chart Name
                </span>
              }
              rules={[{ required: true, message: 'Please enter a name for your org chart' }]}
            >
              <Input 
                placeholder="Enter a name for your organization chart" 
                size="large"
                className="rounded-xl border-slate-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="baseViewType"
              label={
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                  </svg>
                  Chart Type
                </span>
              }
              rules={[{ required: true, message: 'Please select a chart type' }]}
            >
              <Select
                placeholder="Select the type of organization chart"
                size="large"
                className="rounded-xl"
              >
                {baseViewTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        type.value === 'empty' ? 'bg-slate-100 text-slate-600' :
                        type.value === 'standard' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {type.value.charAt(0).toUpperCase()}
                      </div>
                      {type.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="pt-4 border-t border-slate-200">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Organization Chart
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

    <Modal
  title={<span className="text-lg font-semibold text-blue-700">Upload Bulk Employee File</span>}
  open={isBulkModalVisible}
  destroyOnClose={false}
  maskClosable={false}
  zIndex={1100}
  onCancel={() => {
    setIsBulkModalVisible(false);
    setBulkFile(null);
    setDownloadUrl('');
  }}
  footer={null}
  className="[&_.ant-modal-content]:rounded-lg [&_.ant-modal-content]:p-6"
>
  <div className="mb-4 flex justify-between items-center">
  <Button
    type="link"
    onClick={async () => {
      try {
        const response = await downloadBulkTemplate();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'bulk_user_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        message.success('Template downloaded!');
      } catch (err) {
        message.error('Failed to download template');
      }
    }}
  >
    📥 Download Template
  </Button>

  <Button
    type="link"
    onClick={async () => {
      try {
        const data = await getBulkUploadInstructions();
        Modal.info({
          title: 'Bulk Upload Instructions',
          content: (
            <div>
              <p><strong>Expected Columns:</strong></p>
              <ul className="list-disc ml-5">
                <li>Phone Number (required, 10 digits)</li>
                <li>User Type ("employee" or "employer")</li>
                <li>Email (optional, valid format)</li>
              </ul>
              <p className="mt-3 text-sm text-gray-600">{data.resMsg}</p>
            </div>
          )
        });
      } catch (err) {
        message.error('Could not fetch instructions');
      }
    }}
  >
    📘 View Instructions
  </Button>
</div>

  <Form layout="vertical" onFinish={handleBulkUpload} className="space-y-4">
    <Form.Item
      label={<span className="font-medium text-blue-600">Upload Excel or CSV File</span>}
      required
    >
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={(e) => setBulkFile(e.target.files[0])}
        className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </Form.Item>

    <Form.Item className="mb-0">
      <Button
        type="primary"
        htmlType="submit"
        loading={isUploading}
        disabled={!bulkFile}
        className="w-full bg-blue-600 hover:bg-blue-700 font-medium h-10 rounded-md"
      >
        Upload File
      </Button>
    </Form.Item>
  </Form>

  {downloadUrl && (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-blue-700 font-medium mb-2">
        ✅ Bulk upload processed successfully.
      </p>
      <a
        href={downloadUrl}
        download
        className="text-blue-600 underline hover:text-blue-800 font-medium"
      >
        Click here to download the response file
      </a>
    </div>
  )}
</Modal>

{/* Element Modal */}
<Modal
  title={
    <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
        <PlusOutlined className="text-lg text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {selectedElement ? `Add ${selectedElement.relationType}` : 'Add Organization Element'}
        </h3>
        <p className="text-sm text-slate-600">
          {selectedElement ? `Create a new ${selectedElement.relationType} position` : 'Add a new element to your organization'}
        </p>
      </div>
    </div>
  }
  open={isElementModalVisible}
  onCancel={() => {
    setIsElementModalVisible(false);
    elementForm.resetFields();
    setSelectedElement(null);
  }}
  footer={null}
  width={700}
  className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:border-0 [&_.ant-modal-content]:shadow-2xl"
>
  <div className="p-6">
    <Form form={elementForm} layout="vertical" onFinish={handleCreateElement} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          name="elementType"
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Organization Level
            </span>
          }
          rules={[{ required: true, message: 'Please select organization level' }]}
        >
          <Select 
            placeholder="Select position level"
            size="large"
            className="w-full rounded-xl"
            onChange={handleLevelChange}
          >
            {elementTypes.map(type => (
              <Option key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    type.value === 'company' ? 'bg-blue-100 text-blue-600' :
                    type.value === 'department' ? 'bg-purple-100 text-purple-600' :
                    type.value === 'employee' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {type.value.charAt(0).toUpperCase()}
                  </div>
                  {type.label}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedLevel && (
          <Form.Item
            name="levelName"
            label={
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {getLevelNameLabel(selectedLevel)}
              </span>
            }
            rules={[{ required: true, message: `Please enter ${getLevelNameLabel(selectedLevel).toLowerCase()}` }]}
          >
            <Input 
              placeholder={`Enter ${getLevelNameLabel(selectedLevel).toLowerCase()}`}
              size="large"
              className="rounded-xl"
            />
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Display Name
            </span>
          }
          rules={[{ required: true, message: 'Please enter display name' }]}
        >
          <Input 
            placeholder="Enter display name"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        {/* Profile Selection */}
        <Form.Item
          name="profileId"
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Profile
            </span>
          }
        >
          <Select
            placeholder="Select a profile"
            size="large"
            className="rounded-xl"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {profiles.map(profile => (
              <Option key={profile.id} value={profile.id}>
                {profile.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Optional Fields */}
        <Form.Item
          name="email"
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email
            </span>
          }
        >
          <Input 
            placeholder="Enter email address"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="mobile"
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Mobile
            </span>
          }
        >
          <Input 
            placeholder="Enter mobile number"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {selectedElement ? 'Add Element' : 'Create First Element'}
        </Button>
      </div>
    </Form>
  </div>
</Modal>

    </div>
  );
};

export default OrgChart;
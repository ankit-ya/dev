import api from '../axiosInstance';
import { format } from 'date-fns';


// Register API
export const registerUser = async (email, password, userType, number) => {
  console.log('Registering user with:', { email, password, userType, number });

  try {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      userType,
      number
     
    }, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response ? error.response.data : 'An error occurred';
  }
};

export const loginUser = async (username, password) => {
  console.log('Attempting login with:', { username, password });
  try {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    }, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });
    console.log('Login response:', response.data);
    return response.data; // Ensure the response includes userType
  } catch (error) {
    console.error('Login error:', error);
    throw error.response ? error.response.data : 'An error occurred during login';
  }
};

export const fetchUserProfile = async (token) => {
  try {
    // Ensure token exists
    if (!token) {
      throw new Error("No token found, please log in.");
    }
  

const userId = localStorage.getItem("userId");

    // Log the userId being used
    console.log("Fetching user profile with userId:", userId);

    // Make the request with the token in headers
    const response = await api.get(`/api/employees/fetch`, {
      headers: { Authorization: `Bearer ${token}` },
    });

  console.log("Raw response:", response);
  console.log("Employees Data:", response.data);
  console.log("Employee profile data (res):", response.data.res);
  console.log('Employees Data:', response.data);
  return response.data.res;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
// Create New Employee
export const createEmployee = async (token, employeeData) => {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating employee with data:", {
      userId: employeeData.id,
      employeeOverview: employeeData.employeeOverview,
      emergencyContact: employeeData.emergencyContact,
      qualification: employeeData.qualification,
      experience: employeeData.experience,
      bankDetail: employeeData.bankDetail,
    });

    const response = await fetch(`/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again");
      }
      if (response.status === 400) {
        throw new Error("Invalid data provided");
      }
      throw new Error(`Failed to create employee: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (token, userData) => {
  try {
    // Ensure token exists
    if (!token) {
      throw new Error("No token found, please log in.");
    }

    // Log the data being sent
    console.log("Updating profile with data:", JSON.stringify(userData, null, 2));

    // Make the API request
    const response = await api.put('/api/employees', userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('User Profile update response:', response.data);
    
    if (!response.data) {
      throw new Error("No response data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error.response?.data || error);
    
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || "Invalid data provided";
      console.error("Validation error details:", error.response.data);
      throw new Error(errorMessage);
    }
    if (error.response?.status === 404) {
      throw new Error("User not found");
    }
    
    throw error;
  }
};

// In apiService.js
export const updateEmployeeProfilePhoto = async (base64Image) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    throw new Error("Authentication required");
  }

  const payload = {
    file: base64Image, // 👈 this matches Swagger body
  };

  try {
    const response = await api.put(
      `/api/employees/updateEmployeePic?userName=${userId}`, // 👈 match Swagger path & query param
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[DEBUG] Upload success", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Upload failed", error);
    throw error;
  }
};



// Other APIs...

export const sendOtp = async (phone) => {
  const response = await api.post('/api/send-otp', { phone });
  return response.data;
};

export const verifyOtpAndResetPassword = async (phone, otp, newPassword) => {
  const response = await api.post('/api/verify-otp-reset-password', { phone, otp, newPassword });
  return response.data;
};


export const sendCheckInData = async (data) => {
  try {
    const token = localStorage.getItem("token");

    
    console.log("Check-in Data before API call:", data);
  


    
    const response = await api.post('/api/checkin', data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("Check-in Response:", response.data);
    
    return response.data;
  
  } catch (error) {
    console.error('Error sending check-in data:', error);
    throw error;
  }
};

export const sendCheckOutData = async (data) => {
  try {
    console.log("Check-out Data Before API Call:", data);  // Log request
    const token = localStorage.getItem("token");



    const response = await api.post('/api/checkout', data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Check-out Response:", response.data);  // Log response

    return response.data;
  } catch (error) {
    console.error('Error sending check-out data:', error.response?.data || error.message);
    throw error;
  }
};


export const fetchCheckInCheckOutData = async () => {
  try {
    const response = await api.get('/checkin-checkout-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching check-in/check-out data:', error);
    throw error;
  }
};


export const getRecentAttendance = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/api/getRecentAttendence`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    
    if (!response.data) {
      throw new Error('No data received from server');
    }
 console.log("Check-out Response:", response.data);  // Log response
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch recent attendance';
    console.error('Error fetching recent attendance:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getHistoricalAttendance = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/api/getHistoricalAttendence`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Add a flag to indicate empty history
    const isEmptyHistory = response.data.resCode === 200 && Array.isArray(response.data.res) && response.data.res.length === 0;
    
    return {
      ...response.data,
      isEmptyHistory // Add this flag
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch historical attendance';
    console.error('Error fetching historical attendance:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Register New User
    export const registerNewUser = async (userId, imageData) => {
      try {
        console.log('[API] Starting registerNewUser', {
          userId,
          imageType: imageData instanceof Blob ? 'Blob' : typeof imageData
        });
    
        // Validate inputs
        if (!userId?.trim()) {
          console.error('[API] Validation failed - missing userId');
          throw new Error('User ID is required');
        }
        if (!imageData) {
          console.error('[API] Validation failed - missing image');
          throw new Error('Image is required');
        }
    
        const token = localStorage.getItem('token');
        console.log('[API] Retrieved auth token:', token ? `****${token.slice(-4)}` : 'No token found');
        
        if (!token) {
          console.error('[API] Authentication failed - no token');
          throw new Error('Authentication required');
        }
    
        // Create FormData object
        const formData = new FormData();
        formData.append('file', imageData, 'profile.jpg');
        formData.append('userId', userId);
    
        console.log('[API] Preparing multipart request:', {
          url: `/api/register`,
          headers: {
            'Authorization': `Bearer ****${token.slice(-4)}`
            // Note: Don't set Content-Type - browser will set it with boundary
          }
        });
    
        const startTime = performance.now();
        const response = await api.post(
          `/api/register`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const endTime = performance.now();
    
        console.log('[API] Received response:', {
          status: response.status,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          data: response.data
        });
    
        return response.data;
        
      } catch (error) {
        console.error('[API] Registration failed:', {
          error: {
            message: error.message,
            responseData: error.response?.data,
            status: error.response?.status,
            config: error.config
          }
        });
        
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Registration failed. Please try again.'
        );
      }
    };



// API call for face recognition
export const recognizeUser = async (userId, imageData) => {
  try {
    console.log('[API] Starting recognizeUser', {
      userId,
      imageType: imageData instanceof Blob ? 'Blob' : typeof imageData
    });

    // Validate inputs
    if (!userId?.trim()) {
      console.error('[API] Validation failed - missing userId');
      throw new Error('User ID is required');
    }
    if (!imageData) {
      console.error('[API] Validation failed - missing image');
      throw new Error('Image is required');
    }

    const token = localStorage.getItem('token');
    console.log('[API] Retrieved auth token:', token ? `****${token.slice(-4)}` : 'No token found');
    
    if (!token) {
      console.error('[API] Authentication failed - no token');
      throw new Error('Authentication required');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('file', imageData, 'capture.jpg');
    formData.append('userId', userId);

    console.log('[API] Preparing multipart request:', {
      url: `/api/recognize`,
      headers: {
        'Authorization': `Bearer ****${token.slice(-4)}`
        // Note: Don't set Content-Type - browser will set it with boundary
      }
    });

    const startTime = performance.now();
    const response = await api.post(
      `/api/recognize`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const endTime = performance.now();

    console.log('[API] Received response:', {
      status: response.status,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      data: response.data
    });

    return response.data;
    
  } catch (error) {
    console.error('[API] Recognition failed:', {
      error: {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        config: error.config
      }
    });
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Face recognition failed. Please try again.'
    );
  }
};
//API FOR EMPLOYER YOUR PROFILE 

// Update Employer Profile
export const updateEmployerProfile = async (token, employerData) => {
  try {
    // Ensure token exists
    if (!token) {
      throw new Error("No token found, please log in.");
    }
    // Log the fields being sent in the request
    console.log("Updating employer profile with data:", employerData);
    console.log("Number of fields sent:", Object.keys(employerData).length);
    // Make the API request
    const response = await api.put('/api/employer', employerData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Employer Profile:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating employer profile:", error.response?.data || error);
    throw error;
  }
};



export const saveEmployerProfile = async (data) => {
  try {
    const response = await api.post('/api/saveEmployerProfile', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving employer profile:', error);
    throw error;
  }
};

/*export const getEmployerProfile = async (token) => {
  try {
    const response = await api.get('/api/employer/fetch', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Full Employer Profile API response:', response); // ✅ Log the full response here
    console.log('Employer profile extracted:', response.data.res); // ✅ Also log the exact data you're returning
    return response.data.res; // Adjust to match the new response structure

  } catch (error) {
    console.error('Error fetching employer profile:', error);
    throw error;
  }
}; */

export const getEmployerProfile = async (token) => {
  try {
    const response = await api.get('/api/employer/fetch', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Full response:', response);
    
    // Handle case where res might be null or undefined
    return response.data?.res || {};
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw error;
  }
};

// Fetch Employee Details
export const fetchEmployeeDetails = async (employeeId) => {
  try {
    const response = await api.get(`/api/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error;
  }
};
// Save Department Details
export const saveDepartmentDetails = async (token, departmentDetailsDto) => {
  try {
    console.log('Saving department with data:', departmentDetailsDto); // Log the data being sent
    const response = await api.post('/api/employer/saveDepartment', departmentDetailsDto, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Save department response:', response.data); // Log the response
    return response.data.res;
  } catch (error) {
    console.error("Error saving department details:", error.response?.data || error);
    throw error;
  }
};

// Fetch Department Details
// Fetch Department Details
// Fetch Department Details
/*export const fetchDepartmentDetails = async (token) => {
  try {
    const response = await api.get('/api/employer/fetchDepartment', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Fetch department details", response.data.res);
    const departments = Array.isArray(response.data.res) ? response.data.res : [response.data.res];
    return departments.filter(department => department !== null); // Filter out null values
  } catch (error) {
    console.error("Error fetching department details:", error.response?.data || error);
    throw error;
  }
};  */

// Send Affiliation Request
export const sendAffiliationRequest = async (data) => {
  try {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    console.log('Sending affiliation request with data:', data); // Log the data being sent
    const response = await api.post('/api/affiliation-requests', data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });
    console.log('Affiliation request response:', response.data); // Log the response
    return response.data;
  } catch (error) {
    console.error('Error sending affiliation request:', error);
    throw error;
  }
};
/* Fetch Pending Affiliation Requests
export const fetchPendingAffiliationRequests = async (token) => {
  try {
    const response = await api.get('/api/affiliation-requests/panding', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending affiliation requests:', error);
    throw error;
  }
}; */

export const fetchPendingAffiliationRequests = async (token, employerId) => {
  try {
    const response = await api.get('/api/affiliation-requests/employer', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        employerId, // ✅ passing employerId as query parameter
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending affiliation requests:', error);
    throw error;
  }
};


// Approve Affiliation Request
export const approveAffiliationRequest = async (requestId) => {
  try {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    console.log(`Approving affiliation request with ID: ${requestId}`); // Log the request ID
    const response = await api.put(`/api/affiliation-requests/${requestId}/approve`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });
    console.log('Approve affiliation request response:', response.data); // Log the response
    return response.data;
  } catch (error) {
    console.error('Error approving affiliation request:', error);
    throw error;
  }
};



// Create a new leave request
export const createLeave = async (leaveData, attachment) => {
  try {
    console.log("Preparing leave request data:", leaveData);
    console.log("Attachment:", attachment);

    const token = localStorage.getItem("token"); // Retrieve the token
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    // Prepare the request body
    const formData = new FormData();
    formData.append("employeeId", leaveData.employeeId);
    formData.append("fromDate", leaveData.fromDate);
    formData.append("toDate", leaveData.toDate);
    formData.append("leaveTypeId", String(leaveData.leaveTypeId).trim()); // Ensure leaveTypeId is a properly formatted string
    formData.append("reason", leaveData.reason || ""); // Provide a default empty string if reason is missing

    if (attachment) {
      formData.append("attachment", attachment); // Add attachment if provided
    }

    // Log FormData key-value pairs
    console.log("Final API request payload:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Make the API request
    const response = await api.post("/api/leaves", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Leave request submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating leave:", error.response?.data || error);
    throw error.response?.data || "An error occurred";
  }
};

// Update an existing leave
export const updateLeave = async (id, leaveData, attachment) => {
  const formData = new FormData();
  
  // Append leave data to FormData
  Object.keys(leaveData).forEach((key) => {
    formData.append(key, leaveData[key]);
  });

  // Append attachment if provided
  if (attachment) {
    formData.append("attachment", attachment);
  }

  try {
    const token = localStorage.getItem("token"); // Retrieve the token
    console.log("Sending request with token:", token);
    console.log("Sending updated leave data (FormData):");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`); // Log each key-value pair in FormData
    }

    // Make the PUT request
    const response = await api.put(`/api/leaves/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });

    console.log("Leave updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating leave:", error.response?.data || error);
    throw error.response?.data || "An error occurred";
  }
};

// Get all leaves
export const getAllLeaves = async () => {
  try {
    const response = await api.get('/api/leaves');
    return response.data;
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    throw error.response?.data || 'An error occurred';
  }
};

// Get leave by ID
export const getLeaveById = async (id) => {
  try {
    const response = await api.get(`/api/leaves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave by ID:', error);
    throw error.response?.data || 'An error occurred';
  }
};

// Delete a leave
export const deleteLeave = async (id) => {
  try {
    await api.delete(`/api/leaves/${id}`);
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error.response?.data || 'An error occurred';
  }
};

// Get all leaves for a specific employee
export const getLeavesByEmployeeId = async (employeeId) => {
  try {
    const response = await api.get(`/api/leaves/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leaves for employee:', error);
    throw error.response?.data || 'An error occurred';
  }
};

// Approve or reject a leave
export const updateLeaveStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/leaves/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leave status:', error);
    throw error.response?.data || 'An error occurred';
  }
};

export const addLeaveType = async (id, name, balance, validTill) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Sending payload:", { id, name, balance, validTill });
    const response = await api.post(
      "/api/leaves/addLeaveType",
      { id, name, balance, validTill },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding leave type:", error.response?.data || error);
    throw error.response?.data || "An error occurred";
  }
};

// Fetch all leave types
export const getAllLeaveTypes = async () => {
  try {
    console.log("Fetching leave types...");

    // Retrieve token and userId from localStorage
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Use userId as requestId
    console.log("Retrieved token:", token);
    console.log("Retrieved userId (requestId):", userId);

    if (!token) {
      console.error("No token found in localStorage.");
      throw new Error("No token found. Please log in.");
    }

    if (!userId) {
      console.error("No userId found in localStorage.");
      throw new Error("No userId found. Please log in.");
    }

    // Make the API request
    const response = await api.get('/api/leaves/getAllLeaveType', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { requestId: userId }, // Pass userId as requestId
    });

    // Log the response from the API
    console.log("API response for leave types:", response.data);

    return response.data;
  } catch (error) {
    // Log the error details
    console.error("Error fetching leave types:", error.response?.data || error);

    // Throw the error for further handling
    throw error.response?.data || "An error occurred";
  }
};
// Update Employee faceRegister only (without overwriting other fields)
export const updateEmployee = async (userId, partialData = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    // 1. Fetch full profile first
    const fullProfile = await fetchUserProfile(token);
    if (!fullProfile || !fullProfile.id) {
      throw new Error("Failed to fetch user profile for update");
    }

    // 2. Merge the new data into the full profile
    const updatedProfile = {
      ...fullProfile,
      ...partialData, // e.g., { faceRegister: true }
    };

    // 3. Send the full merged object
    const response = await api.put("/api/employees", updatedProfile, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data) throw new Error("No response data received");
    return response.data;
  } catch (error) {
    console.error("Error in updateEmployee:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update employee. Please try again."
    );
  }
};



/*export const fetchDepartmentDetails = async (token) => {
  const response = await fetch('https://api.shramiks.in/api/employer/fetchDepartment', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  // Ensure response format is correct
  if (!Array.isArray(data.res)) {
    throw new Error('Invalid department data');
  }

  // Normalize department and team names to expected frontend format
  const normalizedDepartments = data.res.map((dept, deptIndex) => ({
    _id: `dept-${deptIndex}`, // fake ID since API doesn't provide one
    departmentName: dept.name,
    teams: (dept.teams || []).map((team, teamIndex) => ({
      _id: `team-${deptIndex}-${teamIndex}`, // fake ID for team
      teamName: team.name
    }))
  }));

  return normalizedDepartments;
};  */

// Save single department with teams and hierarchy
// Save single department with teams and hierarchy
export const saveDepartmentStructure = async (department) => {
  try {
    const token = localStorage.getItem("token");

    console.log("📤 Sending department payload to backend:", department);

    const response = await api.post("/api/departments/single", department, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response from saveDepartmentStructure:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving department structure:", error);
    throw error;
  }
};



// Fetch all department structures
// Fetch all department structures
export const fetchDepartmentDetails = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/departments", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Fetched department data from backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching department data:", error);
    throw error;
  }
};


// Fetch affiliation status from backend
// Fetch all affiliation status
export const fetchAffiliationStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/api/employee", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Fetched all affiliation status:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching all affiliation status:", error);
    throw error;
  }
};

export const fetchAllAffiliations = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get("/api/affiliation-status", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ fetchAllAffiliations:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ fetchAllAffiliations failed:", error);
    throw error;
  }
};

export const fetchByStatus = async (status) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get(`/api/affiliation-status/status/${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ fetchByStatus(${status}):`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ fetchByStatus(${status}) failed:`, error);
    throw error;
  }
};

export const fetchByEmployeeId = async (employeeId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get(`/api/affiliation-status/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ fetchByEmployeeId(${employeeId}):`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ fetchByEmployeeId(${employeeId}) failed:`, error);
    throw error;
  }
};

export const fetchByDepartment = async (department) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get(`/api/affiliation-status/department/${department}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ fetchByDepartment(${department}):`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ fetchByDepartment(${department}) failed:`, error);
    throw error;
  }
};

export const fetchByTeam = async (team) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.get(`/api/affiliation-status/team/${team}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ fetchByTeam(${team}):`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ fetchByTeam(${team}) failed:`, error);
    throw error;
  }
};



export const saveDepartments = async (departments) => {
  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    for (const dept of departments) {
      const payload = {
        id: dept.id || `${dept.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name: dept.name,
        teams: (dept.teams || []).map((team, teamIndex) => {
          const normalizedTeam = {
            id: `${team.name || "team"}-${teamIndex}`,
            teamName: team.name, // ✅ only send teamName
            companyId: userId,
            hierarchyLevels: (team.positions || []).map((pos, i) => ({
              title: pos,
              levelOrder: i,
            })),
          };

          console.log("➡️ Normalized team object:", normalizedTeam);
          return normalizedTeam;
        }),
      };

      console.log("📦 Final payload being sent:", JSON.stringify(payload, null, 2));

      const response = await api.post(`/api/departments/single`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Saved department:", response.data);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to save departments:", error.response?.data || error.message || "Something went wrong");
    throw error.response?.data || error.message || "Something went wrong";
  }
};



export const fetchDepartments = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(`/api/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ Normalize hierarchyLevels -> positions
    const normalized = (response.data || []).map((dept) => ({
      id: dept.id,
      name: dept.name,
      teams: (dept.teams || []).map((team) => ({
        id: team.id,
        name: team.teamName, // For dropdown display
        teamName: team.teamName,
        companyId: team.companyId,
        positions: (team.hierarchyLevels || []).map((lvl) => lvl.title), // Normalize
      })),
    }));

    console.log("📥 Fetched and normalized departments:", normalized);
    return normalized;
  } catch (error) {
    console.error("❌ Failed to fetch departments:", error.response?.data || error.message);
    throw error.response?.data || error.message || "Something went wrong";
  }
};


/*export const createTeam = async (teamData) => {
  try {
    const token = localStorage.getItem('token'); // if your API needs authorization
    const response = await api.post(
      `/api/teams`,
      teamData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error creating team:', error);
    throw error;
  }
}; */

export const fetchTeamsByCompany = async (companyId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/teams/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log('📥 Fetched Teams:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    throw error;
  }
};


export const planShifts = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post("/api/shifts/plan", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while planning shifts:", error);
    throw error;
  }
};
//Employer created profile for their employee
// Create a new profile
// Create a new profile
export const createProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/api/profiles', profileData, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Profile created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create profile error:', error);
    throw error.response ? error.response.data : 'Error creating profile';
  }
};

// Get all profiles
export const fetchAllProfiles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/api/profiles', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Fetched profiles:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch profiles error:', error);
    throw error.response ? error.response.data : 'Error fetching profiles';
  }
};

// Update an existing profile
export const updateProfile = async (id, profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/api/profiles/${id}`, profileData, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response ? error.response.data : 'Error updating profile';
  }
};

// Delete a profile
export const deleteProfile = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/api/profiles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`Profile ${id} deleted successfully`);
    return response.data;
  } catch (error) {
    console.error('Delete profile error:', error);
    throw error.response ? error.response.data : 'Error deleting profile';
  }
};

// APIs for Department 
// GET all departments
export const getAllDepartments = async (token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");

    const response = await api.get('/api/departments', {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error.response ? error.response.data : 'An error occurred while fetching departments';
  }
};

// GET department by ID
export const getDepartmentById = async (id, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");

    const response = await api.get(`/api/departments/${id}`, {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching department with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while fetching the department';
  }
};

// CREATE a new department
export const createDepartment = async (department, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");

    const response = await api.post('/api/departments', department, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error.response ? error.response.data : 'An error occurred while creating the department';
  }
};

// UPDATE department by ID
export const updateDepartment = async (id, updatedDepartment, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");

    const response = await api.put(`/api/departments/${id}`, updatedDepartment, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating department with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while updating the department';
  }
};

// DELETE department by ID
export const deleteDepartment = async (id, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");

    const response = await api.delete(`/api/departments/${id}`, {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting department with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while deleting the department';
  }
};


//APIs for all team finctionality 

// GET all teams
export const getAllTeams = async (token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.get('/api/teams', {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error.response ? error.response.data : 'An error occurred while fetching teams';
  }
};

// GET team by ID
export const getTeamById = async (id, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.get(`/api/teams/${id}`, {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching team with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while fetching the team';
  }
};

// CREATE a new team
export const createTeam = async (team, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.post('/api/teams', team, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error.response ? error.response.data : 'An error occurred while creating the team';
  }
};

// UPDATE team by ID
export const updateTeam = async (id, updatedTeam, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.put(`/api/teams/${id}`, updatedTeam, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating team with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while updating the team';
  }
};

// DELETE team by ID
export const deleteTeam = async (id, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.delete(`/api/teams/${id}`, {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting team with ID ${id}:`, error);
    throw error.response ? error.response.data : 'An error occurred while deleting the team';
  }
};

// GET teams by department ID
export const getTeamsByDepartment = async (departmentId, token) => {
  try {
    if (!token) throw new Error("No token found, please log in.");
    const response = await api.get(`/api/teams/byDepartment/${departmentId}`, {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching teams by department ID ${departmentId}:`, error);
    throw error.response ? error.response.data : 'An error occurred while fetching teams by department';
  }
};

//APIs for all Org functionality 

// Create a new Org Chart View

// Update an existing Org Chart View by ID


// Update an existing Org Chart View by ID
export const updateOrgChartView = async (id, viewData, token) => {
  try {
    console.log('Updating Org Chart View with ID:', id);
    console.log('Payload being sent:', JSON.stringify(viewData, null, 2));

    const response = await api.put(`/api/orgchart/views/${id}`, viewData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating org chart view [${id}]:`, {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    throw error.response?.data || 'Error while updating org chart view';
  }
};


// Delete an Org Chart View by ID
export const deleteOrgChartView = async (id, token) => {
  try {
    const response = await api.delete(`/api/orgchart/views/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting org chart view [${id}]:`, error);
    throw error.response?.data || 'Error while deleting org chart view';
  }
};

// Get Org Chart Node by Node ID
export const getOrgChartNode = async (nodeId, token) => {
  try {
    const response = await api.get(`/api/orgchart/nodes/${nodeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching org chart node [${nodeId}]:`, error);
    throw error.response?.data || 'Error while fetching org chart node';
  }
};

// Update a specific Org Chart Node
export const updateOrgChartNode = async (nodeId, nodeData, token) => {
  try {
    const response = await api.put(`/api/orgchart/nodes/${nodeId}`, nodeData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating org chart node [${nodeId}]:`, error);
    throw error.response?.data || 'Error while updating org chart node';
  }
};

// Delete a specific Org Chart Node
export const deleteOrgChartNode = async (nodeId, token) => {
  try {
    const response = await api.delete(`/api/orgchart/nodes/${nodeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting org chart node [${nodeId}]:`, error);
    throw error.response?.data || 'Error while deleting org chart node';
  }
};

export const createOrgChartNode = async (nodeData, token) => {
  try {
    const response = await api.post('/api/orgchart/nodes', nodeData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating org chart node:', error);
    throw error.response?.data || 'Error while creating org chart node';
  }
};


// Create a new Org Chart View
export const createOrgChartView = async (viewData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Construct payload according to API schema
    const payload = {
      name: viewData.name,
      baseViewType: viewData.baseViewType,
      createdBy: viewData.createdBy || 'current_user_id', // You'll need to get actual user ID
      data: viewData.elements || [], // Map your elements to the 'data' field
      // createdAt will be set by the server
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/api/orgchart/views', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    throw {
      message: error.response?.data?.message || 'Failed to create organization chart',
      details: error.response?.data || error.message,
    };
  }
};
// Get all org chart views for a user
export const getUserOrgChartViews = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.get(`/api/orgchart/views/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user org chart views:', error);
    throw error.response?.data || 'Error while fetching user org chart views';
  }
};

// Get Org Chart View Details
export const getOrgChartViewDetails = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.get(`/api/orgchart/views/detail/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching org chart view details:', error);
    throw error.response?.data || 'Error while fetching org chart view details';
  }
};


//Invitation APIs 
export const sendInvite = async (inviteData) => {
  try {
    const token = localStorage.getItem('token');

    const response = await api.post('/api/invite', inviteData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Invite sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Invite error:', error);
    throw error.response ? error.response.data : 'Error sending invite';
  }
};


export const uploadBulkEmployees = async (file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/users/bulk-create', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      validateStatus: () => true, // accept all status codes
      responseType: 'blob', // we expect a blob or a JSON blob
    });

    if (response.status !== 200) {
      const errorText = await response.data.text(); // Convert blob to text
      const errorJson = JSON.parse(errorText);       // Parse it
      throw errorJson; // throw as JSON object
    }

    return response;
  } catch (error) {
    console.error('Bulk upload error:', error);
    throw error;
  }
};

// GET Bulk Upload Template (Excel)
export const downloadBulkTemplate = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/api/users/bulk-template', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob'
  });
  return response;
};

// GET Bulk Instructions
export const getBulkUploadInstructions = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/api/users/bulk-instructions', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};



export const acceptInvite = async (inviteToken, inviteEmail,password,mobile) => {
  try {
    const authToken = localStorage.getItem('token');
    console.log(localStorage.getItem("token"))


    console.log("📦 Sending API request to /api/invite/accept with:");
    console.log("  ▶️ token:", inviteToken);
    console.log("  ▶️ email:", inviteEmail);
    console.log("password:", password);
    console.log("  ▶️ authToken:", authToken ? '[token exists]' : '[missing token]');
    console.log("authToken:", authToken);

    if (!inviteEmail) {
      console.log("❌ Missing invite email — aborting");
      throw new Error("Invite email not found.");
    }

    const response = await api.post(`/api/invite/accept`, {
      token: inviteToken,
      email: inviteEmail,
      password,
      mobile
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ API response received:", response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("❌ Invite accept failed:", error.response.data);
      throw new Error(error.response.data.message || 'Error accepting invite');
    } else {
      console.error("❌ Unexpected network or system error:", error);
      throw new Error('Network or unexpected error');
    }
  }
};




// 🔐 Request a password reset link (by email or mobile)
export const requestPasswordReset = async (data) => {
  console.log("📤 Sending password reset request with data:", data);
  try {
    const response = await api.post(`/api/password-reset/request`, data);
    console.log("✅ Password reset request success:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Password reset request failed:", error.response?.data || error);
    throw error;
  }
};

// ✅ Validate a password reset token
export const validateResetToken = async (token) => {
  console.log("📤 Validating token:", token);
  try {
    const response = await api.post("/api/password-reset/validate-token", { token });
    console.log("✅ Token is valid:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Token validation failed:", error.response?.data || error);
    throw error;
  }
};

// 🔄 Reset password using token
export const resetPassword = async (token, password) => {
  console.log("📤 Resetting password with token:", token, "and password:", password);
  try {
    const response = await api.post("/api/password-reset/reset", { token, password });
    console.log("✅ Password reset successful:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Password reset failed:", error.response?.data || error);
    throw error;
  }
};


// ✅ NOTIFICATION APIs WITH DEBUG LOGS


export const getUserNotifications = async (page = 0, size = 20) => {
  console.log(`📥 Fetching notifications for page ${page}, size ${size}`);

  try {
    const res = await api.get(`/api/notifications/my?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notifications fetched:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to fetch notifications:", err);
    throw err;
  }
};

export const getUnreadNotificationCount = async () => {
  console.log("🔢 Fetching unread notification count");

  try {
    const res = await api.get(`/api/notifications/my/unread-count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Unread count:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to fetch unread count:", err);
    throw err;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  console.log(`📗 Marking notification as read: ${notificationId}`);

  try {
    const res = await api.put(`/api/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notification marked as read:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to mark as read:", err);
    throw err;
  }
};

export const markAllNotificationsAsRead = async () => {
  console.log("📘 Marking all notifications as read");

  try {
    const res = await api.put(`/api/notifications/my/mark-all-read`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ All notifications marked as read:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to mark all as read:", err);
    throw err;
  }
};

export const deleteNotification = async (notificationId) => {
  console.log(`🗑️ Deleting notification: ${notificationId}`);

  try {
    const res = await api.delete(`/api/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notification deleted:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to delete notification:", err);
    throw err;
  }
};

// ✅ apiService.js — Add missing utility APIs if not already included

export const getNotificationStats = async () => {
  console.log("📊 Fetching notification statistics");

  try {
    const res = await api.get(`/api/notifications/my/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notification stats:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to fetch stats:", err);
    throw err;
  }
};

export const getNotificationTypes = async () => {
  console.log("📋 Fetching notification types");

  try {
    const res = await api.get(`/api/notifications/types`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notification types:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to fetch types:", err);
    throw err;
  }
};

export const getNotificationChannels = async () => {
  console.log("📡 Fetching notification channels");

  try {
    const res = await api.get(`/api/notifications/channels`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Notification channels:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Failed to fetch channels:", err);
    throw err;
  }
};

export const checkNotificationHealth = async () => {
  console.log("🩺 Checking notification service health");

  try {
    const res = await api.get(`/api/notifications/health`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("✅ Health check passed:", res.data);
    return res;
  } catch (err) {
    console.error("❌ Health check failed:", err);
    throw err;
  }
};

// 🔸 Payroll API Functions 

// Update salary structure for an employee
export const updateSalaryStructure = async (employeeId, salaryData) => {
  try {
    console.log(`📝 Updating salary structure for employee ${employeeId}:`, salaryData);
    const token = localStorage.getItem('token');
    
    const response = await api.put(`/api/payroll/salary-structure/${employeeId}`, salaryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Salary structure updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating salary structure:', error.response?.data || error);
    throw error.response?.data || 'Failed to update salary structure';
  }
};

// Submit tax declaration for an employee
export const submitTaxDeclaration = async (employeeId, taxData) => {
  try {
    console.log(`📑 Submitting tax declaration for employee ${employeeId}:`, taxData);
    const token = localStorage.getItem('token');
    
    const response = await api.post(`/api/payroll/tax-declaration/${employeeId}`, taxData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Tax declaration submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting tax declaration:', error.response?.data || error);
    throw error.response?.data || 'Failed to submit tax declaration';
  }
};

// Process monthly payroll
export const processMonthlyPayroll = async (month, employerId) => {
  try {
    console.log(`💰 Processing payroll for month ${month} and employer ${employerId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.post(`/api/payroll/process`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
        employerId,
      },
    });
    
    console.log('✅ Payroll processed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error processing payroll:', error.response?.data || error);
    throw error.response?.data || 'Failed to process payroll';
  }
};

// Get tax summary for an employee
export const getTaxSummary = async (employeeId, financialYear) => {
  try {
    console.log(`📊 Fetching tax summary for employee ${employeeId} (FY: ${financialYear})`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/tax-summary/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        financialYear,
      },
    });
    
    console.log('✅ Tax summary fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching tax summary:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch tax summary';
  }
};

// Calculate income tax for an employee
export const calculateIncomeTax = async (employeeId, financialYear) => {
  try {
    console.log(`🧮 Calculating income tax for employee ${employeeId} (FY: ${financialYear})`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/tax-calculation/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        financialYear,
      },
    });
    
    console.log('✅ Income tax calculated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating income tax:', error.response?.data || error);
    throw error.response?.data || 'Failed to calculate income tax';
  }
};

// Get payroll summary for a period
export const getPayrollSummary = async (startDate, endDate, employerId) => {
  try {
    console.log(`📈 Fetching payroll summary from ${startDate} to ${endDate}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
        employerId,
      },
    });
    
    console.log('✅ Payroll summary fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching payroll summary:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch payroll summary';
  }
};

// Generate salary slip for an employee
export const generateSalarySlip = async (employeeId, month) => {
  try {
    console.log(`📄 Generating salary slip for employee ${employeeId} (Month: ${month})`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/salary-slip/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
      },
    });
    
    console.log('✅ Salary slip generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating salary slip:', error.response?.data || error);
    throw error.response?.data || 'Failed to generate salary slip';
  }
};

// Generate ESI report
export const generateESIReport = async (month, employerId) => {
  try {
    console.log(`📊 Generating ESI report for month ${month}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/reports/esi`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
        employerId,
      },
    });
    
    console.log('✅ ESI report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating ESI report:', error.response?.data || error);
    throw error.response?.data || 'Failed to generate ESI report';
  }
};

// Generate EPF report
export const generateEPFReport = async (month, employerId) => {
  try {
    console.log(`📊 Generating EPF report for month ${month}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/reports/epf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
        employerId,
      },
    });
    
    console.log('✅ EPF report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating EPF report:', error.response?.data || error);
    throw error.response?.data || 'Failed to generate EPF report';
  }
};

// Generate Form 16
export const generateForm16 = async (employeeId, financialYear) => {
  try {
    console.log(`📑 Generating Form 16 for employee ${employeeId} (FY: ${financialYear})`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/form16/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        financialYear,
      },
    });
    
    console.log('✅ Form 16 generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating Form 16:', error.response?.data || error);
    throw error.response?.data || 'Failed to generate Form 16';
  }
};

// Get employee payslips
export const getEmployeePayslips = async (employeeId, startDate, endDate) => {
  try {
    console.log(`📑 Fetching payslips for employee ${employeeId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/employee/${employeeId}/payslips`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
      },
    });
    
    console.log('✅ Payslips fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching payslips:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch payslips';
  }
};

// Get compliance dashboard data
export const getComplianceDashboard = async (month, employerId) => {
  try {
    console.log(`📊 Fetching compliance dashboard for month ${month}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/compliance/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
        employerId,
      },
    });
    
    console.log('✅ Compliance dashboard fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching compliance dashboard:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch compliance dashboard';
  }
};

// Calculate employee salary
export const calculateEmployeeSalary = async (employeeId, startDate, endDate) => {
  try {
    console.log(`🧮 Calculating salary for employee ${employeeId} (${startDate} to ${endDate})`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/api/payroll/calculate/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
      },
    });
    
    console.log('✅ Salary calculated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating salary:', error.response?.data || error);
    throw error.response?.data || 'Failed to calculate salary';
  }
};

// 🔸 Live Monitoring API Functions

// Get monitoring warnings
export const getMonitoringWarnings = async (date, location) => {
  try {
    console.log(`📊 Fetching monitoring warnings for date: ${date}, location: ${location}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/warnings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
      },
    });
    
    console.log('✅ Monitoring warnings fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching monitoring warnings:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch monitoring warnings';
  }
};

// Get monitoring summary
export const getMonitoringSummary = async (date, location, shift) => {
  try {
    console.log(`📊 Fetching monitoring summary for date: ${date}, location: ${location}, shift: ${shift}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/summary', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
        shift,
      },
    });
    
    console.log('✅ Monitoring summary fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching monitoring summary:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch monitoring summary';
  }
};

// Get last update timestamp
export const getLastUpdate = async () => {
  try {
    console.log('🕒 Fetching last update timestamp');
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/last-update', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Last update timestamp fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching last update:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch last update';
  }
};

// Get geofence violations
export const getGeofenceViolations = async (date, location) => {
  try {
    console.log(`🌍 Fetching geofence violations for date: ${date}, location: ${location}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/geofence-violations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
      },
    });
    
    console.log('✅ Geofence violations fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching geofence violations:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch geofence violations';
  }
};

// Export monitoring data
export const exportMonitoringData = async (date, location, shift, format) => {
  try {
    console.log(`📥 Exporting monitoring data for date: ${date}, format: ${format}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/export', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
        shift,
        format,
      },
      responseType: 'blob', // Important for file downloads
    });
    
    console.log('✅ Monitoring data exported');
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting monitoring data:', error.response?.data || error);
    throw error.response?.data || 'Failed to export monitoring data';
  }
};

// Get employee locations
export const getEmployeeLocations = async (date, siteId, shiftId) => {
  try {
    console.log(`📍 Fetching employee locations for date: ${date}, site: ${siteId}, shift: ${shiftId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/employee-locations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        siteId,
        shiftId,
      },
    });
    
    console.log('✅ Employee locations fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching employee locations:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch employee locations';
  }
};

// Get break violations
export const getBreakViolations = async (date, location) => {
  try {
    console.log(`⚠️ Fetching break violations for date: ${date}, location: ${location}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/break-violations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
      },
    });
    
    console.log('✅ Break violations fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching break violations:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch break violations';
  }
};

// Get attendance trend
export const getAttendanceTrend = async (startDate, endDate, location, shift) => {
  try {
    console.log(`📈 Fetching attendance trend from ${startDate} to ${endDate}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/attendance-trend', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
        location,
        shift,
      },
    });
    
    console.log('✅ Attendance trend fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching attendance trend:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch attendance trend';
  }
};

// Get attendance status
export const getAttendanceStatus = async (date, location, shift) => {
  try {
    console.log(`👥 Fetching attendance status for date: ${date}, location: ${location}, shift: ${shift}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/attendance-status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
        shift,
      },
    });
    
    console.log('✅ Attendance status fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching attendance status:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch attendance status';
  }
};

// Get active shifts
export const getActiveShifts = async (date, location) => {
  try {
    console.log(`⏰ Fetching active shifts for date: ${date}, location: ${location}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get('/api/monitoring/active-shifts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        location,
      },
    });
    
    console.log('✅ Active shifts fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching active shifts:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch active shifts';
  }
};

// 🔸 Task Management API Functions

// Create a new task
export const createTask = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    console.log("Preparing task request data:", Object.fromEntries(formData));

    const response = await api.post("/api/leaves", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Update an existing task
export const updateTask = async (taskData) => {
  try {
    console.log('📝 Updating task:', taskData);
    const token = localStorage.getItem('token');
    
    const response = await api.put('/tasks/update', taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Task updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating task:', error.response?.data || error);
    throw error.response?.data || 'Failed to update task';
  }
};

// Mark a task as complete
export const completeTask = async (taskId) => {
  try {
    console.log(`📝 Marking task ${taskId} as complete`);
    const token = localStorage.getItem('token');
    
    const response = await api.put(`/tasks/complete/${taskId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Task marked as complete:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error completing task:', error.response?.data || error);
    throw error.response?.data || 'Failed to complete task';
  }
};

// Approve a task
export const approveTask = async (taskId, approverId) => {
  try {
    console.log(`📝 Approving task ${taskId} by approver ${approverId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.put(`/tasks/approve/${taskId}/${approverId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Task approved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error approving task:', error.response?.data || error);
    throw error.response?.data || 'Failed to approve task';
  }
};

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    console.log(`📥 Fetching task ${taskId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Task fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching task:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch task';
  }
};

// Get all tasks for a company
export const getCompanyTasks = async (companyId) => {
  try {
    console.log(`📥 Fetching tasks for company ${companyId}`);
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/tasks/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ Company tasks fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching company tasks:', error.response?.data || error);
    throw error.response?.data || 'Failed to fetch company tasks';
  }
};

export const raisePayrollIssue = async (issueData) => {
  const token = localStorage.getItem("token");
  console.log("🚨 Raising payroll issue:", issueData);

  try {
    const response = await api.post("/api/payroll/issues", issueData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Payroll issue submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting payroll issue:", error);
    throw error.response?.data || error;
  }
};

export const requestSalaryAdvance = async (advanceData) => {
  const token = localStorage.getItem("token");
  console.log("💰 Requesting salary advance:", advanceData);

  try {
    const response = await api.post("/api/advance-requests", advanceData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Salary advance request submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting salary advance request:", error);
    throw error.response?.data || error;
  }
};

export const generateTeamBasedShiftPlan = async (planData) => {
  const token = localStorage.getItem("token");
  console.log("📅 Generating team-based shift plan:", planData);

  try {
    const response = await api.post("/api/shifts/team-plan", planData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Team shift plan generated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error generating team shift plan:", error);
    throw error.response?.data || error;
  }
};

export const getAvailableEmployees = async (params) => {
  const token = localStorage.getItem("token");
  console.log("👥 Fetching available employees with params:", params);

  try {
    const response = await api.get("/api/shifts/employees/available", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        teamId: params.teamId,
        employerId: params.employerId,
        startDate: params.startDate,
        endDate: params.endDate,
        shiftType: params.shiftType,
        location: params.location
      }
    });

    console.log("✅ Available employees fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching available employees:", error);
    throw error.response?.data || error;
  }
};

export const getShiftPlans = async (filters) => {
  const token = localStorage.getItem("token");
  console.log("📅 Fetching shift plans with filters:", filters);

  try {
    const response = await api.get("/api/shifts/plans", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        teamId: filters.teamId,
        employerId: filters.employerId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        shiftType: filters.shiftType,
        location: filters.location,
        status: filters.status,
        page: filters.page || 0,
        size: filters.size || 20
      }
    });

    console.log("✅ Shift plans fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching shift plans:", error);
    throw error.response?.data || error;
  }
};

export const getTeamShiftStatistics = async (params) => {
  const token = localStorage.getItem("token");
  console.log("📊 Fetching team shift statistics:", params);

  try {
    const response = await api.get(`/api/shifts/teams/${params.teamId}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        employerId: params.employerId,
        location: params.location
      }
    });

    console.log("✅ Team shift statistics fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching team shift statistics:", error);
    throw error.response?.data || error;
  }
};

export const swapShift = async (swapData) => {
  const token = localStorage.getItem("token");
  console.log("🔄 Processing shift swap request:", swapData);

  try {
    const response = await api.post("/api/shifts/swap", swapData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    console.log("✅ Shift swap processed:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error processing shift swap:", error);
    throw error.response?.data || error;
  }
};

export const getAdvanceRequests = async (employerId) => {
  const token = localStorage.getItem("token");
  console.log("💰 Fetching salary advance requests for employer:", employerId);

  try {
    const response = await api.get(`/api/advance-requests/employee/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    console.log("✅ Advance requests fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching advance requests:", error);
    throw error.response?.data || error;
  }
};

export const updateAdvanceRequest = async (requestId, status) => {
  const token = localStorage.getItem("token");
  console.log(`💰 Updating salary advance request ${requestId} to ${status}`);

  try {
    const response = await api.put(`/api/advance-requests/${requestId}/${status.toLowerCase()}`, 
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      }
    );

    console.log("✅ Advance request updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating advance request:", error);
    throw error.response?.data || error;
  }
};

// Payroll Issue APIs
export const createPayrollIssue = async (issueData) => {
  const token = localStorage.getItem("token");
  console.log("📝 Creating payroll issue:", issueData);

  try {
    const response = await api.post("/api/payroll/issues", issueData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Payroll issue created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating payroll issue:", error);
    throw error.response?.data || error;
  }
};

export const updatePayrollIssue = async (id, issueData) => {
  const token = localStorage.getItem("token");
  console.log(`📝 Updating payroll issue ${id}:`, issueData);

  try {
    const response = await api.put(`/api/payroll/issues/${id}`, issueData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Payroll issue updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating payroll issue:", error);
    throw error.response?.data || error;
  }
};

export const getEmployeePayrollIssues = async (employeeId) => {
  const token = localStorage.getItem("token");
  console.log("📝 Fetching employee payroll issues:", employeeId);

  try {
    const response = await api.get(`/api/payroll/issues/employee/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Employee payroll issues fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching employee payroll issues:", error);
    throw error.response?.data || error;
  }
};

export const getEmployerPayrollIssues = async (employerId) => {
  const token = localStorage.getItem("token");
  console.log("📝 Fetching employer payroll issues:", employerId);

  try {
    const response = await api.get(`/api/payroll/issues/employer/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Employer payroll issues fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching employer payroll issues:", error);
    throw error.response?.data || error;
  }
};

export const getTeamPayrollIssues = async (teamId) => {
  const token = localStorage.getItem("token");
  console.log("📝 Fetching team payroll issues:", teamId);

  try {
    const response = await api.get(`/api/payroll/issues/team/${teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Team payroll issues fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching team payroll issues:", error);
    throw error.response?.data || error;
  }
};

export const resolvePayrollIssue = async (id, resolution) => {
  const token = localStorage.getItem("token");
  console.log(`📝 Resolving payroll issue ${id}:`, resolution);

  try {
    const response = await api.post(`/api/payroll/issues/${id}/resolve`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { resolution },
    });

    console.log("✅ Payroll issue resolved:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error resolving payroll issue:", error);
    throw error.response?.data || error;
  }
};

export const deletePayrollIssue = async (id) => {
  const token = localStorage.getItem("token");
  console.log(`📝 Deleting payroll issue ${id}`);

  try {
    const response = await api.delete(`/api/payroll/issues/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Payroll issue deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting payroll issue:", error);
    throw error.response?.data || error;
  }
};

// Employee Management APIs
export const getAllAffiliatedEmployees = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Using the correct backend endpoint
    const response = await api.get('/api/employer/employees', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Check if the response is wrapped in a data property
    const employees = response.data?.data || response.data;
    
    if (!Array.isArray(employees)) {
      console.error('Expected array of employees but got:', employees);
      return [];
    }
    
    return employees;
  } catch (error) {
    console.error('Error fetching affiliated employees:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please login again.');
    }
    if (error.response?.status === 404) {
      console.error('API endpoint not found. Please check the URL:', error.config?.url);
    }
    throw error.response?.data || error;
  }
};

export const updateEmployeeStatus = async (employeeId, isActive) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Updated endpoint to match backend structure
    const response = await api.patch(`/api/v1/employer/employees/${employeeId}/status`, 
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating employee status:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please login again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Employee not found');
    }
    throw error.response?.data || error;
  }
};

export const updateEmployeeDetails = async (employeeId, details) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Updated endpoint to match backend structure
    const response = await api.put(`/api/v1/employer/employees/${employeeId}`, 
      details,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating employee details:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please login again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Employee not found');
    }
    throw error.response?.data || error;
  }
};

// Work Schedule API Functions
export const createWorkSchedule = async (scheduleData) => {
  const token = localStorage.getItem('token');
  console.log("📝 Creating work schedule:", scheduleData);

  try {
    const response = await api.post('/api/work-schedules', scheduleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Work schedule created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating work schedule:", error);
    throw error.response?.data || error;
  }
};

export const updateWorkSchedule = async (id, scheduleData) => {
  const token = localStorage.getItem('token');
  console.log(`📝 Updating work schedule ${id}:`, scheduleData);

  try {
    const response = await api.put(`/api/work-schedules/${id}`, scheduleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Work schedule updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating work schedule:", error);
    throw error.response?.data || error;
  }
};

export const deleteWorkSchedule = async (id) => {
  const token = localStorage.getItem('token');
  console.log(`📝 Deleting work schedule ${id}`);

  try {
    const response = await api.delete(`/api/work-schedules/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Work schedule deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting work schedule:", error);
    throw error.response?.data || error;
  }
};

export const getAllWorkSchedules = async (employerId) => {
  const token = localStorage.getItem('token');
  console.log("📝 Fetching all work schedules for employer:", employerId);

  try {
    const response = await api.get(`/api/work-schedules/employer/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Work schedules fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching work schedules:", error);
    throw error.response?.data || error;
  }
};

export const getWorkScheduleById = async (id) => {
  const token = localStorage.getItem('token');
  console.log(`📝 Fetching work schedule ${id}`);

  try {
    const response = await api.get(`/api/work-schedules/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Work schedule fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching work schedule:", error);
    throw error.response?.data || error;
  }
};

export const getWorkSchedulesByEntity = async (entityId) => {
  const token = localStorage.getItem('token');
  console.log(`📝 Fetching work schedules for entity ${entityId}`);

  try {
    const response = await api.get(`/api/work-schedules/entity/${entityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Entity work schedules fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching entity work schedules:", error);
    throw error.response?.data || error;
  }
};

export const getDefaultWorkSchedule = async () => {
  const token = localStorage.getItem('token');
  console.log("📝 Fetching default work schedule");

  try {
    const response = await api.get('/api/work-schedules/default', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Default work schedule fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching default work schedule:", error);
    throw error.response?.data || error;
  }
};


// Public Holiday API Functions
export const createPublicHoliday = async (holidayData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('📅 Creating public holiday:', holidayData);

    const response = await api.post('/api/holidays', holidayData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Public holiday created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating public holiday:', error);
    throw error.response?.data || error;
  }
};

export const updatePublicHoliday = async (id, holidayData) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Updating public holiday ${id}:`, holidayData);

    const response = await api.put(`/api/holidays/${id}`, holidayData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Public holiday updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating public holiday:', error);
    throw error.response?.data || error;
  }
};

export const deletePublicHoliday = async (id) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Deleting public holiday ${id}`);

    const response = await api.delete(`/api/holidays/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Public holiday deleted');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting public holiday:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByCompany = async (companyId) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays for company ${companyId}`);

    const response = await api.get(`/api/holidays/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Company holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching company holidays:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByOffice = async (officeId) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays for office ${officeId}`);

    const response = await api.get(`/api/holidays/office/${officeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Office holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching office holidays:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByLocation = async (location, year) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays for location ${location} and year ${year}`);

    const response = await api.get(`/api/holidays/location/${location}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { year }
    });

    console.log('✅ Location holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching location holidays:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByDateRange = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays between ${startDate} and ${endDate}`);

    const response = await api.get('/api/holidays/range', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { startDate, endDate }
    });

    console.log('✅ Date range holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching date range holidays:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByCompanyAndDateRange = async (companyId, startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays for company ${companyId} between ${startDate} and ${endDate}`);

    const response = await api.get(`/api/holidays/company/${companyId}/range`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { startDate, endDate }
    });

    console.log('✅ Company date range holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching company date range holidays:', error);
    throw error.response?.data || error;
  }
};

export const getHolidaysByOfficeAndDateRange = async (officeId, startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    console.log(`📅 Fetching holidays for office ${officeId} between ${startDate} and ${endDate}`);

    const response = await api.get(`/api/holidays/office/${officeId}/range`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { startDate, endDate }
    });

    console.log('✅ Office date range holidays fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching office date range holidays:', error);
    throw error.response?.data || error;
  }
};

// GPS & Travel Tracking APIs

export const trackLocation = async (locationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/api/travel/track-location', locationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error tracking location:', error);
    throw error.response?.data || error;
  }
};

export const checkLocationBoundaries = async (employeeId, latitude, longitude) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/api/travel/check-location', null, {
      headers: { Authorization: `Bearer ${token}` },
      params: { employeeId, latitude, longitude }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error checking location boundaries:', error);
    throw error.response?.data || error;
  }
};

export const getTravelHistory = async (employeeId, startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    
    // Validate parameters
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    
    // Format dates if provided
    const formattedStartDate = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : undefined;
    const formattedEndDate = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : undefined;
    
    const response = await api.get(`/api/travel/history/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
    
    if (response.data?.status === 200) {
      return {
        status: 200,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch travel history');
    }
  } catch (error) {
    console.error('❌ Error fetching travel history:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch travel history';
    throw {
      status: error.response?.status || 400,
      message: errorMessage,
      data: null
    };
  }
};

export const startTrip = async (travelData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/api/travel/start-trip', travelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error starting trip:', error);
    throw error.response?.data || error;
  }
};

export const endTrip = async (tripId, endLocation) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/api/travel/end-trip/${tripId}`, endLocation, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error ending trip:', error);
    throw error.response?.data || error;
  }
};

export const getActiveTrips = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/travel/active-trips/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching active trips:', error);
    throw error.response?.data || error;
  }
};

export const getTravelExpenseSummary = async (employeeId, startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    
    // Validate parameters
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    
    // Format dates if provided
    const formattedStartDate = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : undefined;
    const formattedEndDate = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : undefined;
    
    const response = await api.get(`/api/travel/expense-summary/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
    
    if (response.data?.status === 200) {
      return {
        status: 200,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch expense summary');
    }
  } catch (error) {
    console.error('❌ Error fetching expense summary:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch expense summary';
    throw {
      status: error.response?.status || 400,
      message: errorMessage,
      data: null
    };
  }
};

import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, CircularProgress, Snackbar, Alert,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ArrowBack, Search as SearchIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchEmployeeDetails, 
  sendAffiliationRequest,
  fetchPendingAffiliationRequests,
  approveAffiliationRequest,
  fetchDepartmentDetails ,
} from '../API/apiService';
import styles from '../EmoStyles/Team.module.css';

const Team = () => {
  const { deptIndex, teamIndex } = useParams();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [affiliationRequests, setAffiliationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const teamName = `Team ${parseInt(teamIndex) + 1}`;

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const requests = await fetchPendingAffiliationRequests(token);
        setAffiliationRequests(requests);
        
        // Initialize with empty member if no requests exist
        setTeamMembers(requests.length > 0 ? 
          requests.map(req => ({
            employeeId: req.employeeId,
            name: req.employeeName,
            position: req.position,
            photo: req.employeePhoto,
            status: req.status || 'pending',
            requestId: req.id,
            department: req.department,
            team: req.team
          })) : 
          [{ 
            employeeId: '', 
            name: '', 
            position: '', 
            photo: '', 
            status: 'new',
            department: '',
            team: ''
          }]
        );

        // Load departments
        const depts = await fetchDepartmentDetails(token);
        setDepartments(depts);
      } catch (error) {
        showSnackbar('Failed to load team data', 'error');
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [teamIndex]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { 
      employeeId: '', 
      name: '', 
      position: '', 
      photo: '', 
      status: 'new',
      department: '',
      team: ''
    }]);
  };

  const handleRemoveMember = async (index) => {
    const member = teamMembers[index];
    if (member.status === 'pending' || member.status === 'approved') {
      try {
        const updatedMembers = teamMembers.filter((_, i) => i !== index);
        setTeamMembers(updatedMembers);
        showSnackbar('Member removed successfully');
      } catch (error) {
        showSnackbar('Failed to remove member', 'error');
        console.error('Error removing member:', error);
      }
    } else {
      const updatedMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updatedMembers);
    }
  };

  const handleDepartmentChange = (index, deptId) => {
    const selectedDept = departments.find(dept => dept._id === deptId);
    const teams = selectedDept ? selectedDept.teams : [];
    
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      department: deptId,
      team: '',
      availableTeams: teams
    };
    
    setTeamMembers(updatedMembers);
  };

  const handleTeamChange = (index, teamId) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      team: teamId
    };
    setTeamMembers(updatedMembers);
  };

  const handleSearchEmployee = async (index) => {
    const employeeId = teamMembers[index].employeeId.trim();
    if (!employeeId) {
      showSnackbar('Please enter an Employee ID', 'warning');
      return;
    }

    try {
      const { firstName, profilePhoto } = await fetchEmployeeDetails(employeeId);
      const updatedMembers = [...teamMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        name: firstName,
        photo: profilePhoto
      };
      setTeamMembers(updatedMembers);
    } catch (error) {
      showSnackbar('Employee not found', 'error');
      console.error('Error fetching employee details:', error);
    }
  };

  const handleSendAffiliationRequest = async (index) => {
    const member = teamMembers[index];
    
    // Debug: Log current member state
    console.log('Current member data:', member);
  
    if (!member.employeeId || !member.position || !member.department || !member.team) {
      showSnackbar('Please fill all fields (Employee ID, Position, Department and Team)', 'warning');
      return;
    }
  
    try {
      // Debug: Log all departments and the selected department ID
      console.log('All departments:', departments);
      console.log('Looking for department ID:', member.department);
  
      const selectedDept = departments.find(dept => dept._id === member.department);
      
      // Debug: Log the found department and its teams
      console.log('Found department:', selectedDept);
      console.log('Teams in department:', selectedDept?.teams);
      console.log('Looking for team ID:', member.team);
  
      const selectedTeamObj = selectedDept?.teams?.find(team => String(team._id) === String(member.team));

      // Debug: Log the found team object
      console.log('Found team object:', selectedTeamObj);

      console.log("Selected teamId:", member.team);
console.log("Available teams in selected department:", selectedDept?.teams);
console.log("Matched team object:", selectedTeamObj);

  
      if (!selectedDept || !selectedTeamObj) {
        showSnackbar('Invalid department or team selection', 'error');
        return;
      }
  
      const data = {
        employeeId: member.employeeId,
        employeeName: member.name,
        employeePhoto: member.photo,
        position: member.position,
        department: selectedDept.departmentName,
        departmentId: member.department,
        teamName: selectedTeamObj?.teamName?.trim() || '', // ✅ This is the key change
        teamId: member.team,
        status: 'pending'
      };
      
  
      console.log('Sending affiliation request with data:', data);
      const response = await sendAffiliationRequest(data);
      console.log('Affiliation request response:', response);
  
      const updatedMembers = [...teamMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        requestId: response.id,
        status: 'pending'
      };
      setTeamMembers(updatedMembers);
      setAffiliationRequests([...affiliationRequests, response]);
  
      showSnackbar('Affiliation request sent successfully!');
    } catch (error) {
      showSnackbar('Failed to send affiliation request', 'error');
      console.error('Error sending affiliation request:', error);
    }
  };
  

  const handleApproveRequest = async (requestId) => {
    try {
      await approveAffiliationRequest(requestId);
      
      // Update the status in both team members and affiliation requests
      setTeamMembers(teamMembers.map(member => 
        member.requestId === requestId ? { ...member, status: 'approved' } : member
      ));
      
      setAffiliationRequests(affiliationRequests.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
      
      showSnackbar('Affiliation request approved successfully!');
    } catch (error) {
      showSnackbar('Failed to approve affiliation request', 'error');
      console.error('Error approving affiliation request:', error);
    }
  };

  if (loading) {
    return (
      <Container className={styles.container}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <IconButton color="primary" onClick={() => navigate('/admin')} className={styles.backButton}>
        <ArrowBack />
      </IconButton>
      
      <Typography variant="h4" className="mb-4 text-center">
        Manage Team {parseInt(teamIndex) + 1}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Select Department</TableCell>
              <TableCell>Select Team</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Member Name</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.map((member, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    value={member.employeeId}
                    onChange={(e) => handleMemberChange(index, 'employeeId', e.target.value)}
                    placeholder="Enter Employee ID"
                    disabled={member.status === 'pending' || member.status === 'approved'}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={() => handleSearchEmployee(index)}
                    disabled={member.status === 'pending' || member.status === 'approved'}
                  >
                    <SearchIcon />
                  </IconButton>
                </TableCell>
                
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={member.department || ''}
                      onChange={(e) => handleDepartmentChange(index, e.target.value)}
                      disabled={member.status === 'pending' || member.status === 'approved'}
                      label="Department"
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.departmentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Team</InputLabel>
                    <Select
                      value={member.team || ''}
                      onChange={(e) => handleTeamChange(index, e.target.value)}
                      disabled={!member.department || member.status === 'pending' || member.status === 'approved'}
                      label="Team"
                    >
                      {member.department && departments.find(d => d._id === member.department)?.teams.map((team) => (
                        <MenuItem key={team._id} value={team._id}>
                          {team.teamName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                
                <TableCell>
                  <TextField
                    fullWidth
                    value={member.position}
                    onChange={(e) => handleMemberChange(index, 'position', e.target.value)}
                    placeholder="Enter position"
                    disabled={member.status === 'approved'}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    value={member.name}
                    placeholder="Member name"
                    disabled
                  />
                </TableCell>
                <TableCell>
                  {member.photo && (
                    <img src={member.photo} alt={`Member ${index + 1}`} className={styles.photo} />
                  )}
                </TableCell>
                <TableCell>
                  <span className={`${styles.status} ${styles[member.status]}`}>
                    {member.status === 'approved' ? 'Approved' : 
                     member.status === 'pending' ? 'Pending' : 'New'}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="secondary" 
                    onClick={() => handleRemoveMember(index)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  {member.status === 'new' && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleSendAffiliationRequest(index)}
                      disabled={!member.employeeId || !member.position || !member.department || !member.team}
                    >
                      Send Request
                    </Button>
                  )}
                  
                  {member.status === 'pending' && (
                    <Button 
                      variant="contained" 
                      color="success"
                      onClick={() => handleApproveRequest(member.requestId)}
                    >
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={handleAddMember} 
        className={styles.addButton}
      >
        Add Member
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Team;
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { Users, Network } from 'lucide-react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { getAllAffiliatedEmployees, updateEmployeeStatus, updateEmployeeDetails } from '../API/apiService';
import { toast } from 'sonner';

const AffiliatedEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    workLocation: '',
    teamAllocated: '',
    epfDeduction: '',
    insurance: '',
    tdsDeduction: '',
    insuranceDetails: '',
    bonus: '',
    otherStatutory: '',
    shiftAllocated: '',
    breakTime: '',
    gpsLocation: '',
    salaryType: 'monthly',
    salaryAmount: '',
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    additionalOffDay: '',
    leaveTypes: {
      casual: { monthly: 0, yearly: 0, balance: 0 },
      sick: { monthly: 0, yearly: 0, balance: 0 },
      earned: { monthly: 0, yearly: 0, balance: 0 },
      maternity: { yearly: 0, balance: 0 },
      paternity: { yearly: 0, balance: 0 }
    }
  });

  // Dummy data for testing
  const dummyData = [
    {
      id: '1',
      firstName: 'John Smith',
      designation: 'CEO',
      department: 'Executive',
      isActive: true,
      email: 'john@example.com',
      mobile: '+1234567890',
      employeeId: 'EMP001',
      workLocation: 'Head Office',
      teamAllocated: 'Leadership',
      joiningDate: '2023-01-01',
      salaryType: 'monthly',
      salaryAmount: '150000',
      workingDaysPerWeek: 5,
      children: [
        {
          id: '2',
          firstName: 'Sarah Johnson',
          designation: 'CTO',
          department: 'Technology',
          isActive: true,
          email: 'sarah@example.com',
          mobile: '+1234567891',
          employeeId: 'EMP002',
          workLocation: 'Tech Hub',
          teamAllocated: 'Engineering',
          joiningDate: '2023-02-01',
          salaryType: 'monthly',
          salaryAmount: '140000',
          workingDaysPerWeek: 5,
          children: [
            {
              id: '4',
              firstName: 'Mike Wilson',
              designation: 'Lead Developer',
              department: 'Technology',
              isActive: true,
              email: 'mike@example.com',
              mobile: '+1234567893',
              employeeId: 'EMP004',
              workLocation: 'Tech Hub',
              teamAllocated: 'Development',
              joiningDate: '2023-03-15',
              salaryType: 'monthly',
              salaryAmount: '120000',
              workingDaysPerWeek: 5,
              children: []
            }
          ]
        },
        {
          id: '3',
          firstName: 'Emily Davis',
          designation: 'CFO',
          department: 'Finance',
          isActive: true,
          email: 'emily@example.com',
          mobile: '+1234567892',
          employeeId: 'EMP003',
          workLocation: 'Head Office',
          teamAllocated: 'Finance',
          joiningDate: '2023-02-15',
          salaryType: 'monthly',
          salaryAmount: '135000',
          workingDaysPerWeek: 5,
          children: [
            {
              id: '5',
              firstName: 'David Brown',
              designation: 'Financial Analyst',
              department: 'Finance',
              isActive: true,
              email: 'david@example.com',
              mobile: '+1234567894',
              employeeId: 'EMP005',
              workLocation: 'Head Office',
              teamAllocated: 'Finance',
              joiningDate: '2023-04-01',
              salaryType: 'monthly',
              salaryAmount: '90000',
              workingDaysPerWeek: 5,
              children: []
            }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getAllAffiliatedEmployees();
      // Check if response is a GenericResponse or direct data
      const employeeData = response?.data || response;
      
      // If no data is returned from API, use dummy data
      if (!employeeData || employeeData.length === 0) {
        console.log('No data from API, using dummy data for testing');
        setEmployees(dummyData);
      } else {
        setEmployees(organizeEmployeesHierarchy(employeeData));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      console.log('Using dummy data due to API error');
      setEmployees(dummyData);
      toast.error('Failed to fetch employees from API, using test data');
    } finally {
      setLoading(false);
    }
  };

  const organizeEmployeesHierarchy = (employeeList) => {
    if (!Array.isArray(employeeList)) {
      console.error('Expected array of employees but got:', employeeList);
      return [];
    }

    const employeeMap = {};
    const rootEmployees = [];

    // First pass: Create map of all employees
    employeeList.forEach(emp => {
      if (emp && emp.id) {
        employeeMap[emp.id] = { ...emp, children: [] };
      }
    });

    // Second pass: Organize into hierarchy
    employeeList.forEach(emp => {
      if (emp && emp.id) {
        if (emp.parentId && employeeMap[emp.parentId]) {
          employeeMap[emp.parentId].children.push(employeeMap[emp.id]);
        } else {
          rootEmployees.push(employeeMap[emp.id]);
        }
      }
    });

    return rootEmployees;
  };

  const handleStatusChange = async (employeeId, isActive) => {
    try {
      await updateEmployeeStatus(employeeId, isActive);
      toast.success('Employee status updated successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update employee status');
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetails({
      ...employeeDetails,
      ...employee
    });
    setIsDetailsOpen(true);
  };

  const handleDetailsSubmit = async () => {
    try {
      await updateEmployeeDetails(selectedEmployee.id, employeeDetails);
      toast.success('Employee details updated successfully');
      setIsDetailsOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating details:', error);
      toast.error('Failed to update employee details');
    }
  };

  const renderEmployeeNode = (employee) => (
    <TreeNode
      key={employee.id}
      label={
        <Card 
          sx={{ 
            p: 2, 
            minWidth: 200, 
            cursor: 'pointer',
            '&:hover': { boxShadow: 3 }
          }}
          onClick={() => handleEmployeeSelect(employee)}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">{employee.firstName}</Typography>
            <Chip 
              label={employee.isActive ? 'Active' : 'Inactive'}
              color={employee.isActive ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {employee.designation || 'No Designation'}
          </Typography>
        </Card>
      }
    >
      {employee.children?.map(child => renderEmployeeNode(child))}
    </TreeNode>
  );

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1">
          Affiliated Employees
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => fetchEmployees()}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Tree
            lineWidth={'2px'}
            lineColor={'#bbb'}
            lineBorderRadius={'10px'}
          >
            {employees.map(employee => renderEmployeeNode(employee))}
          </Tree>
        </Box>
      )}

      <Dialog 
        open={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Employee Details
          {selectedEmployee?.firstName && ` - ${selectedEmployee.firstName}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Details Card */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={employeeDetails.employeeId}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        employeeId: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={employeeDetails.designation}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        designation: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={employeeDetails.department}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        department: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Joining Date"
                      value={employeeDetails.joiningDate}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        joiningDate: e.target.value
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Work Location Card */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Work Location & Team</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Work Location/Office Address"
                      value={employeeDetails.workLocation}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        workLocation: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Team Allocated"
                      value={employeeDetails.teamAllocated}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        teamAllocated: e.target.value
                      })}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Salary & Working Details Card */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Salary & Working Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Salary Type</InputLabel>
                      <Select
                        value={employeeDetails.salaryType}
                        onChange={(e) => setEmployeeDetails({
                          ...employeeDetails,
                          salaryType: e.target.value
                        })}
                      >
                        <MenuItem value="monthly">Per Month</MenuItem>
                        <MenuItem value="daily">Per Day</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={`Salary Amount (${employeeDetails.salaryType === 'monthly' ? 'per month' : 'per day'})`}
                      value={employeeDetails.salaryAmount}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        salaryAmount: e.target.value
                      })}
                    />
                  </Grid>
                  
                  {/* Working Days Selection */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Working Days</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(employeeDetails.workingDays).map(([day, checked]) => (
                        <Grid item xs={6} sm={3} key={day}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={checked}
                                onChange={(e) => setEmployeeDetails({
                                  ...employeeDetails,
                                  workingDays: {
                                    ...employeeDetails.workingDays,
                                    [day]: e.target.checked
                                  }
                                })}
                              />
                            }
                            label={day.charAt(0).toUpperCase() + day.slice(1)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Additional Off Day */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Additional Off Day (if any)"
                      value={employeeDetails.additionalOffDay}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        additionalOffDay: e.target.value
                      })}
                      placeholder="e.g., First Saturday"
                    />
                  </Grid>

                  {/* Leave Management Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Leave Management</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(employeeDetails.leaveTypes).map(([leaveType, values]) => (
                        <React.Fragment key={leaveType}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                              {leaveType} Leave
                            </Typography>
                          </Grid>
                          {leaveType !== 'maternity' && leaveType !== 'paternity' && (
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Monthly Leaves"
                                value={values.monthly}
                                onChange={(e) => setEmployeeDetails({
                                  ...employeeDetails,
                                  leaveTypes: {
                                    ...employeeDetails.leaveTypes,
                                    [leaveType]: {
                                      ...values,
                                      monthly: Number(e.target.value) || 0
                                    }
                                  }
                                })}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Yearly Leaves"
                              value={values.yearly}
                              onChange={(e) => setEmployeeDetails({
                                ...employeeDetails,
                                leaveTypes: {
                                  ...employeeDetails.leaveTypes,
                                  [leaveType]: {
                                    ...values,
                                    yearly: Number(e.target.value) || 0
                                  }
                                }
                              })}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Leave Balance"
                              value={values.balance}
                              onChange={(e) => setEmployeeDetails({
                                ...employeeDetails,
                                leaveTypes: {
                                  ...employeeDetails.leaveTypes,
                                  [leaveType]: {
                                    ...values,
                                    balance: Number(e.target.value) || 0
                                  }
                                }
                              })}
                            />
                          </Grid>
                        </React.Fragment>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Deductions & Benefits Card */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Deductions & Benefits</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="EPF Deduction"
                      value={employeeDetails.epfDeduction}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        epfDeduction: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Insurance"
                      value={employeeDetails.insurance}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        insurance: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="TDS Deduction"
                      value={employeeDetails.tdsDeduction}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        tdsDeduction: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Insurance Details"
                      value={employeeDetails.insuranceDetails}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        insuranceDetails: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bonus"
                      value={employeeDetails.bonus}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        bonus: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Other Statutory"
                      value={employeeDetails.otherStatutory}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        otherStatutory: e.target.value
                      })}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Work Schedule Card */}
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Work Schedule</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Shift Allocated"
                      value={employeeDetails.shiftAllocated}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        shiftAllocated: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Break Time"
                      value={employeeDetails.breakTime}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        breakTime: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="GPS Location"
                      value={employeeDetails.gpsLocation}
                      onChange={(e) => setEmployeeDetails({
                        ...employeeDetails,
                        gpsLocation: e.target.value
                      })}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDetailsSubmit} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliatedEmployees; 
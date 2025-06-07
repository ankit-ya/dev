import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { addLeaveType } from "../../API/apiService"; // Import the API function
import styles from "../../styles/LeaveAndAttendance.module.css";

const LeaveApplied = () => {
  const userId = localStorage.getItem("userId"); // Get user ID from local storage

  const [leaveTypeData, setLeaveTypeData] = useState({
    id: userId || "", // Set the user ID
    name: "",
    balance: "",
    validTill: "",
  });

  const handleInputChange = (field, value) => {
    setLeaveTypeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log("Payload being sent:", leaveTypeData);
      const response = await addLeaveType(
        leaveTypeData.id,
        leaveTypeData.name,
        parseFloat(leaveTypeData.balance),
        leaveTypeData.validTill
      );
      console.log("Leave Type Added Successfully:", response);
      alert("Leave type added successfully!");
      setLeaveTypeData({ id: userId, name: "", balance: "", validTill: "" });
    } catch (error) {
      console.error("Error adding leave type:", error.response?.data || error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Failed to add leave type. Please try again.");
      }
    }
  };

  return (
    <Box className={styles.container} sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        Add Leave Type
      </Typography>
      <TextField
        fullWidth
        label="Name"
        value={leaveTypeData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Balance"
        type="number"
        value={leaveTypeData.balance}
        onChange={(e) => handleInputChange("balance", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Valid Till"
        type="date"
        value={leaveTypeData.validTill}
        onChange={(e) => handleInputChange("validTill", e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default LeaveApplied;
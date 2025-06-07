import React from "react";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { updateLeaveStatus } from "../API/apiService";

const RequestPage = () => {
  const navigate = useNavigate(); // Initialize navigation

  const requestData = {
    leaveId: 10,
    employeeId: "emp123",
    username: "John Doe",
    fromDate: "2025-06-01",
    toDate: "2025-06-05",
    leaveTypeId: 1,
    reason: "Medical",
    attachment: "medical-report.pdf",
    profileImage: "https://via.placeholder.com/150",
  };

  const handleApprove = async (leaveId) => {
    try {
      const response = await updateLeaveStatus(leaveId, "APPROVED");
      console.log("Leave approved successfully:", response);
      alert("Leave approved successfully!");
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave.");
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const response = await updateLeaveStatus(leaveId, "REJECTED");
      console.log("Leave rejected successfully:", response);
      alert("Leave rejected successfully!");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave.");
    }
  };

  const calculateDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaveDays = calculateDays(requestData.fromDate, requestData.toDate);

  return (
    <Container style={{ padding: "16px" }}>
      <Button variant="outlined" color="primary" onClick={() => navigate("/time-off")} style={{ marginBottom: "16px" }}>
        Back
      </Button>
      <Typography variant="h4" style={{ marginBottom: "16px" }}>
        Leave Request
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>S.No</strong></TableCell>
              <TableCell><strong>Photo</strong></TableCell>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>From Date</strong></TableCell>
              <TableCell><strong>To Date</strong></TableCell>
              <TableCell><strong>Days</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Attachment</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>
                <Avatar src={requestData.profileImage} alt={requestData.username} />
              </TableCell>
              <TableCell>{requestData.employeeId}</TableCell>
              <TableCell>{requestData.username}</TableCell>
              <TableCell>{requestData.fromDate}</TableCell>
              <TableCell>{requestData.toDate}</TableCell>
              <TableCell>{leaveDays}</TableCell>
              <TableCell>{requestData.leaveTypeId === 1 ? "Medical" : "Other"}</TableCell>
              <TableCell>{requestData.reason}</TableCell>
              <TableCell>
                <a href={`/${requestData.attachment}`} target="_blank" rel="noopener noreferrer">
                  {requestData.attachment}
                </a>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="primary" onClick={() => handleApprove(requestData.leaveId)}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => handleReject(requestData.leaveId)}>
                    Reject
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RequestPage;
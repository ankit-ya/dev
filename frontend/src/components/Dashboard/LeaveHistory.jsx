import React, { useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Link } from "@mui/material";
import styles from "../../styles/LeaveHistory.module.css"; // Correct path to the CSS file

const LeaveHistory = () => {
  const [activeTab, setActiveTab] = useState("Leave"); // State to track the active tab

  const leaveData = [
    {
      leaveType: "Casual Leave",
      appliedDate: "2023-09-01",
      fromDate: "2023-09-05",
      toDate: "2023-09-07",
      days: 3,
      status: "Approved",
      approvedOn: "2023-09-03",
      attachment: "Document.pdf",
    },
    {
      leaveType: "Sick Leave",
      appliedDate: "2023-08-15",
      fromDate: "2023-08-16",
      toDate: "2023-08-18",
      days: 3,
      status: "Rejected",
      approvedOn: "2023-08-17",
      attachment: "MedicalReport.pdf",
    },
  ];

  return (
    <Box className={styles.container}>
      {/* Title */}
      <Typography variant="h6" mb={2} className={styles.title}>
        Leave & Regularization History
      </Typography>

      {/* Header with Links */}
      <Box display="flex" alignItems="center" mb={4}>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          onClick={() => setActiveTab("Leave")}
          style={{ fontWeight: activeTab === "Leave" ? "bold" : "normal" }}
        >
          Leave
        </Link>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          onClick={() => setActiveTab("Regularization")}
          style={{ fontWeight: activeTab === "Regularization" ? "bold" : "normal" }}
        >
          Regularization
        </Link>
      </Box>

      {/* Table for Leave */}
      {activeTab === "Leave" && (
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableHeader}>Leave Type</TableCell>
                <TableCell className={styles.tableHeader}>Applied Date</TableCell>
                <TableCell className={styles.tableHeader}>From Date</TableCell>
                <TableCell className={styles.tableHeader}>To Date</TableCell>
                <TableCell className={styles.tableHeader}>Days</TableCell>
                <TableCell className={styles.tableHeader}>Status</TableCell>
                <TableCell className={styles.tableHeader}>Approved/Rejected On</TableCell>
                <TableCell className={styles.tableHeader}>Delete</TableCell>
                <TableCell className={styles.tableHeader}>Attachment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveData.map((leave, index) => (
                <TableRow key={index} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>{leave.leaveType}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.appliedDate}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.fromDate}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.toDate}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.days}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.status}</TableCell>
                  <TableCell className={styles.tableCell}>{leave.approvedOn}</TableCell>
                  <TableCell className={styles.tableCell}>
                    <Button variant="outlined" color="error" size="small">
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <Button variant="contained" color="primary" size="small">
                      <a
                        href={`/${leave.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Placeholder for Regularization */}
      {activeTab === "Regularization" && (
        <Typography variant="body1" mt={2}>
          Regularization data will be displayed here.
        </Typography>
      )}
    </Box>
  );
};

export default LeaveHistory;
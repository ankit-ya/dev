import React, { useState } from "react";
import { Box, Typography, Button, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../../styles/LeaveAndAttendance.module.css";

const DateDetailsPopup = ({ open, onClose, initialDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [attendanceDetails, setAttendanceDetails] = useState({
    status: "Present",
    shift: "Morning",
    punchInTime: "09:00 AM",
    punchOutTime: "06:00 PM",
    hoursCompleted: "9",
  });

  const handlePreviousDate = () => {
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setSelectedDate(previousDate);
    // Update attendance details for the new date (mock data for now)
    setAttendanceDetails({
      status: "Absent",
      shift: "N/A",
      punchInTime: "N/A",
      punchOutTime: "N/A",
      hoursCompleted: "0",
    });
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
    // Update attendance details for the new date (mock data for now)
    setAttendanceDetails({
      status: "Present",
      shift: "Evening",
      punchInTime: "02:00 PM",
      punchOutTime: "10:00 PM",
      hoursCompleted: "8",
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className={styles.dateDetailsPopup}>
        <Box className={styles.dateDetailsHeader}>
          <Button onClick={handlePreviousDate} className={styles.navButton}>
            {"<"}
          </Button>
          <Typography variant="h6" className={styles.dateDetailsTitle}>
            {selectedDate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <Button onClick={handleNextDate} className={styles.navButton}>
            {">"}
          </Button>
        </Box>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Box className={styles.dateDetailsContent}>
          <Typography variant="body1">
            <strong>Attendance Status:</strong> {attendanceDetails.status}
          </Typography>
          <Typography variant="body1">
            <strong>Shift:</strong> {attendanceDetails.shift}
          </Typography>
          <Typography variant="body1">
            <strong>Punch In Time:</strong> {attendanceDetails.punchInTime}
          </Typography>
          <Typography variant="body1">
            <strong>Punch Out Time:</strong> {attendanceDetails.punchOutTime}
          </Typography>
          <Typography variant="body1">
            <strong>Hours Completed:</strong> {attendanceDetails.hoursCompleted}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DateDetailsPopup;
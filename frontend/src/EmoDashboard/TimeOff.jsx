import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const TimeOff = () => {
  const navigate = useNavigate();

  const handleRequestClick = () => {
    navigate("/time-off/request");
  };

  return (
    <div style={{ padding: "16px" }}>
      <Typography variant="h4" style={{ marginBottom: "16px" }}>
        Time Off
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(120px, 1fr))" },
          gap: 2,
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Button variant="contained" color="primary" onClick={handleRequestClick}>
          Request
        </Button>
        <Button variant="outlined" color="secondary">
          Approve
        </Button>
        <Button variant="outlined" color="secondary">
          History
        </Button>
      </Box>
      <Typography variant="body1">
        This is the Time Off section. Add your content here.
      </Typography>
    </div>
  );
};

export default TimeOff;
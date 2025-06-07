import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "10px",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    height: "80vh", // Set a fixed height
    overflowY: "auto", // Enable vertical scrolling
    
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  formControl: {
    marginBottom: "20px",
  },
  textField: {
    marginBottom: "15px",
  },
  card: {
    marginBottom: "20px",
    padding: "20px",
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  sectionHeading: {
    marginBottom: "15px",
    fontWeight: "bold",
    color: "#007bff",
  },
}));

export default useStyles;
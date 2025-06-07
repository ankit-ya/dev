import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  navbar: {
    backgroundColor: "#333",
    padding: "10px 20px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  logo: {
    width: "40px",
    marginRight: "10px",
  },
  logoText: {
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    ["@media (max-width: 768px)"]: {
      display: "none",
    },
  },
  navItem: {
    cursor: "pointer",
    "&:hover": {
      color: "#f0a500",
    },
  },
  menuIcon: {
    display: "none",
    ["@media (max-width: 768px)"]: {
      display: "block",
    },
  },
  mobileMenu: {
    ["@media (min-width: 769px)"]: {
      display: "none",
    },
  },
}));

export default useStyles;

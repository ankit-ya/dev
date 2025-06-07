import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import logo from "../assets/logo.png";
import useStyles from "./NavbarStyles"; // Import styles

const Navbar = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [menuOpen, setMenuOpen] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuOpen(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuOpen(null);
  };

  return (
    <AppBar position="sticky" className={classes.navbar}>
      <Toolbar className={classes.toolbar}>
        {/* Logo Section */}
        <Box className={classes.logoContainer} onClick={() => navigate("/")}>
          <img src={logo} alt="Kenjo Logo" className={classes.logo} />
          <Typography variant="h6" className={classes.logoText}>
            Shramik
          </Typography>
        </Box>

        {/* Desktop Menu */}
        <Box className={classes.navLinks}>
          <Typography className={classes.navItem} onClick={() => navigate("/sign-up")}>
            Register
          </Typography>
          <Typography className={classes.navItem} onClick={() => navigate("/login")}>
            Sign In
          </Typography>
        </Box>

        {/* Mobile Menu */}
        <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMenuOpen} className={classes.menuIcon}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>

        <Menu anchorEl={menuOpen} open={Boolean(menuOpen)} onClose={handleMenuClose} className={classes.mobileMenu}>
          <MenuItem onClick={() => { navigate("/sign-up"); handleMenuClose(); }}>Register</MenuItem>
          <MenuItem onClick={() => { navigate("/login"); handleMenuClose(); }}>Sign In</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import Cookies from "js-cookie";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Button } from "@mui/material";

export default function PrimarySearchAppBar() {
  let navigate = new useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const settings = [
    { name: "Profile", link: "/profile" },
    { name: "Orders", link: "/orders" },
    { name: "Logout", link: "/logout" },
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (setting) => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (setting) => {
    if (setting.name === "Logout") {
      Cookies.remove("token"); // Delete the 'token' cookie
      Cookies.remove("email"); // Delete the 'email' cookie
      Cookies.remove("userId"); // Delete the 'userId' cookie
      Cookies.remove("firstname"); // Delete the 'firstname' cookie
      Cookies.remove("lastname"); // Delete the 'lastname' cookie
      navigate("/"); // Navigate to the login page
    }
    setAnchorElUser(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ marginLeft: "100px", marginRight: "100px" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: { xs: "block", sm: "block" },
              cursor: "pointer",
              "&:hover": {
                cursor: "pointer",
              },
              flexGrow: 1,
            }}
            onClick={() => {
              navigate("/");
            }}
          >
            MERNSTORE
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ ml: 2, paddingRight: 2 }}
          >
            Hello,{" "}
            {Cookies.get("firstname") ? Cookies.get("firstname") : "User"}{" "}
            {Cookies.get("lastname")}
          </Typography>

          <Box sx={{ flexGrow: 0 }}>
            {Cookies.get("firstname") ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenUserMenu}
                    sx={{ p: 0 }}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
                <IconButton
                  size="large"
                  aria-label="show 17 new notifications"
                  color="inherit"
                  onClick={() => {
                    navigate("/cart");
                  }}
                >
                  <Badge color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  padding="10px"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  padding="10px"
                  onClick={() => {
                    navigate("/sellerSignup");
                  }}
                >
                  Be a Seller
                </Button>
              </>
            )}

            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  onClick={() => handleCloseUserMenu(setting)}
                >
                  <Typography
                    textAlign="center"
                    onClick={() => navigate(setting.link)}
                  >
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

export default function PrimarySearchAppBar() {
  let navigate = new useNavigate();

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
          {/* <Box sx={{ flexGrow: 1 }}/> */}
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
        </Toolbar>
      </AppBar>
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import urls from "../apis/urls";
import apiClient from "../apis/api-client";
import Cookies from "js-cookie";

const isAuthorized = async () => {
  const token = Cookies.get("token");
  console.log(token);
  try {
    let response = await apiClient.get(urls.checkauth.get, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200; // Assuming a 200 status means the user is authenticated
  } catch {
    return false;
  }
};

export default function Layout({ component: Component }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await isAuthorized();
      setAuthenticated(isAuthenticated);
    };

    checkAuthentication();
  }, []);

  if (authenticated === null) {
    // Waiting for the authentication check to complete
    return null;
  }

  return (
    <Box >
      {authenticated ? <Component /> : <Navigate to="/login" replace={true} />}
      <ToastContainer />
    </Box>
  );
}

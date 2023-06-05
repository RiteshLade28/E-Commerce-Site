import { Typography } from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Newslettersignup from "./newslettersignup";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";

const footer = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        marginLeft: "100px",
        marginRight: "100px",
        marginTop: "50px",
        marginBottom: "10px",
        padding: "24px",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Stack spacing={1}>
            <Typography variant="h5">Customer Service</Typography>
            <Typography paragraph>Contact Us</Typography>
            <Typography paragraph>Sell With Us</Typography>
            <Typography paragraph>Shipping</Typography>
          </Stack>
        </Grid>
        <hr />
        <Grid item xs={3}>
          <Stack spacing={1}>
            <Typography variant="h5">Links</Typography>
            <Typography paragraph>Contact Us</Typography>
            <Typography paragraph>Sell With Us</Typography>
            <Typography paragraph>Shipping</Typography>
          </Stack>
        </Grid>
        <hr />
        <Grid item xs={3}>
          <Stack spacing={1}>
            <Typography variant="h5">Newsletter</Typography>
            <Typography paragraph>Sign Up for out Newsletter!!!</Typography>
            <Newslettersignup />
          </Stack>
        </Grid>
      </Grid>
      <Typography sx={{ marginTop: "50px" }} align="center">
        © The Mern Store 2023
      </Typography>
      <Grid align="center" sx={{ marginTop: "10px" }}>
        <FacebookIcon fontSize="large" sx={{ marginRight: "10px" }} />
        <InstagramIcon fontSize="large" sx={{ marginRight: "10px" }} />
        <PinterestIcon fontSize="large" sx={{ marginRight: "10px" }} />
        <TwitterIcon fontSize="large" />
      </Grid>
    </Box>
  );
};

export default footer;

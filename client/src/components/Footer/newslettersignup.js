import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";

const newslettersignup = () => {
  return (
    <Grid container spacing={0}>
      <Grid item xs={6}>
        <TextField
          sx={{
            position: "absolute",
            display: "inline",
            backgroundColor: "white",
            // width: "200px",
          }}
          className="inputRounded"
          label="fullWidth"
          variant="outlined"
        />
      </Grid>

      <Grid item xs={6}>
        <Button
          sx={{
            backgroundColor: "red",
            display: "inline",
            width: "100px",
            height: "56px",
            borderRadius: "0px 5px 5px 0px",
            boxShadow: 0,
          }}
          variant="contained"
          elevation={0}
        >
          Send
        </Button>
      </Grid>
    </Grid>
  );
};

export default newslettersignup;

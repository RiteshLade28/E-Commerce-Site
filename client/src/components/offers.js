import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import offer6 from "../images/offer-6.jpg";
import offer1 from "../images/offer-1.jpg";
import offer2 from "../images/offer-2.jpg";
import offer3 from "../images/offer-3.jpg";
import offer4 from "../images/offer-4.jpg";
import { Image } from "react-native";

const offers = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={3}>
          <Stack spacing={1}>
            <Image
              style={{
                resizeMode: "stretch",
                height: "225px",
                width: "100%",
              }}
              source={offer1}
            />
            <Image
              style={{
                resizeMode: "stretch",
                height: "170px",
                width: "100%",
              }}
              source={offer2}
            />
          </Stack>
        </Grid>
        <Grid item xs={10} md={6}>
          <Image
            style={{
              resizeMode: "stretch",
              height: "100%",
              width: "100%",
            }}
            source={offer6}
          />
        </Grid>
        <Grid item md={3}>
          <Stack spacing={1}>
            <Image
              style={{
                resizeMode: "stretch",
                height: "225px",
                width: "100%",
              }}
              source={offer3}
            />
            <Image
              style={{
                resizeMode: "stretch",
                height: "170px",
                width: "100%",
              }}
              source={offer4}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default offers;

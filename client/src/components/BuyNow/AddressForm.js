import React, { useState, useContext, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Cookies from "js-cookie";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Store, { OrderAddressContext, NextStepContext } from "./Store.js";

export default function AddressForm({ handleNextStep }) {
  const token = Cookies.get("token");
  const userId = Cookies.get("userId");
  const { orderAddress, setOrderAddress } = useContext(OrderAddressContext);
  const { nextStep, setNextStep } = useContext(NextStepContext);

  const [firstName, setFirstName] = useState(orderAddress.firstName);
  const [lastName, setLastName] = useState(orderAddress.lastName);
  const [address, setAddress] = useState(orderAddress.address);
  const [landmark, setLandmark] = useState(orderAddress.landmark);
  const [city, setCity] = useState(orderAddress.city);
  const [state, setState] = useState(orderAddress.state);
  const [pinCode, setPinCode] = useState(orderAddress.pinCode);
  const [country, setCountry] = useState(orderAddress.country);

  useEffect(() => {
    setOrderAddress({
      firstName,
      lastName,
      address,
      landmark,
      city,
      state,
      pinCode,
      country,
    });

    console.log(orderAddress);

    setNextStep(false);
  }, [
    nextStep,
    firstName,
    lastName,
    address,
    landmark,
    city,
    state,
    pinCode,
    country,
  ]);

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Shipping address
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="firstName"
            name="firstName"
            label="First name"
            value={firstName} // Set the defaultValue to the desired value of firstName
            fullWidth
            autoComplete="given-name"
            variant="standard"
            onChange={(e) => {
              setFirstName(e.target.value);
            }} // Update the value of firstName when it changes
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="lastName"
            name="lastName"
            label="Last name"
            value={lastName}
            fullWidth
            autoComplete="family-name"
            variant="standard"
            onChange={(e) => setLastName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="address"
            name="address"
            label="Address"
            fullWidth
            autoComplete="shipping address"
            variant="standard"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="landmark"
            name="landmark"
            label="Landmark"
            fullWidth
            autoComplete="landmark"
            variant="standard"
            value={landmark}
            onChange={(e) => {
              setLandmark(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label="City"
            fullWidth
            autoComplete="shipping address-level2"
            variant="standard"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="state"
            name="state"
            label="State/Province/Region"
            fullWidth
            variant="standard"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="pinCode"
            name="pinCode"
            label="Zip / Pin code"
            fullWidth
            autoComplete="shipping pincode"
            variant="standard"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="country"
            name="country"
            label="Country"
            fullWidth
            autoComplete="shipping country"
            variant="standard"
            value={country}
            onChange={(e) => {
              console.log(e.target.value);
              setCountry(e.target.value);
            }}
            onBlur={(e) => {
              console.log(e.target.value);
              setCountry(e.target.value);
            }}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox color="secondary" name="saveAddress" value="yes" />
            }
            label="Use this address for payment details"
          />
        </Grid> */}
      </Grid>
    </React.Fragment>
  );
}

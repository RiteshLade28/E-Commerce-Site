import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { useNavigate } from "react-router-dom";
import wallpaper from "../../images/wallpaper.jpg";
import bcrypt from "bcryptjs";
import Cookies from "js-cookie";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const theme = createTheme();

export default function SellerProfile() {
  const navigate = new useNavigate();

  const [categories, setCategories] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [sellItem, setSellItem] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    console.log(token);

    apiClient
      .get(urls.auth.sellerUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        setFirstname(response.data.seller.firstName);
        setLastname(response.data.seller.lastName);
        setPhoneNumber(response.data.seller.phoneNumber);
        setAddress(response.data.seller.address);
        setCity(response.data.seller.city);
        setPincode(response.data.seller.pinCode);
        setState(response.data.seller.state);
        setCountry(response.data.seller.country);
        setAccountNumber(response.data.seller.accountNumber);
        setAccountHolderName(response.data.seller.accountHolderName);
        setBankName(response.data.seller.bankName);
        setBranchName(response.data.seller.branchName);
        setIfscCode(response.data.seller.ifscCode);
        setEmail(response.data.seller.email);
        setSellItem(response.data.seller.category);
      })
      .catch((error) => {
        console.log(error);
      });

    apiClient
      .get(urls.category.get)
      .then((response) => {
        console.log(response.data.categories);
        setCategories(response.data.categories);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = Cookies.get("token");

    const selectedCategories = sellItem.filter(
      (categoryId) => categoryId !== "other"
    );
    const allCategories = selectedCategories.map(
      (categoryId) =>
        categories.find((category) => category.id === categoryId)?.name
    );
    allCategories.push(...otherCategories);

    apiClient.patch(
      urls.auth.sellerUpdate,
      {
        firstName: firstName,
        lastName: lastName,
        category: allCategories,
        phoneNumber: phoneNumber,
        address: address,
        city: city,
        pinCode: pincode,
        state: state,
        country: country,
        accountNumber: accountNumber,
        accountHolderName: accountHolderName,
        bankName: bankName,
        branchName: branchName,
        ifscCode: ifscCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          marginTop: "50px",
          paddingTop: "30px",
          paddingBottom: "30px",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
        }}
      >
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              width: "1300px",
              marginTop: "20px",
              mx: -55,
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              backgroundColor: "white",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4">
              Update Profile
            </Typography>
            <Grid container spacing={5}>
              <Grid item lg={6}>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 3 }}
                >
                  <Grid container spacing={2}>
                    <Grid item lg={12}>
                      <Typography align="center" component="div" variant="h6">
                        Personal Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        autoFocus
                        value={firstName}
                        onChange={(e) => setFirstname(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastname(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <InputLabel id="sellItem">
                            What Categories do you deal with?
                          </InputLabel>
                          <Select
                            labelId="sellItem"
                            id="sellItem"
                            multiple
                            value={sellItem}
                            label="What Categories do you deal with?"
                            onChange={(e) => {
                              const selectedValues = Array.isArray(
                                e.target.value
                              )
                                ? e.target.value
                                : [];
                              if (selectedValues.includes("other")) {
                                setOtherCategories([]);
                              }
                              setSellItem(selectedValues);
                            }}
                          >
                            {categories?.map((category) => (
                              <MenuItem value={category.id} key={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    {sellItem.includes("other") && (
                      <Grid item xs={12}>
                        <Box sx={{ minWidth: 120 }}>
                          <TextField
                            fullWidth
                            label="Other Categories"
                            value={otherCategories.join(",")}
                            onChange={(e) =>
                              setOtherCategories(e.target.value.split(","))
                            }
                          />
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="phonenumber"
                        label="Phone Number"
                        type="phonenumber"
                        id="phonenumber"
                        autoComplete="phonenumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="address"
                        label="Address"
                        type="address"
                        id="address"
                        autoComplete="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="city"
                        label="City"
                        type="city"
                        id="city"
                        autoComplete="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="pincode"
                        label="Pincode"
                        type="pincode"
                        id="pincode"
                        autoComplete="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="state"
                        label="State"
                        type="state"
                        id="state"
                        autoComplete="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="country"
                        label="Country"
                        type="country"
                        id="country"
                        autoComplete="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item lg={6}>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 3 }}
                >
                  <Grid container spacing={2}>
                    <Grid item lg={12}>
                      <Typography align="center" component="div" variant="h6">
                        Bank Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="accountNumber"
                        label="Account Number"
                        type="accountNumber"
                        id="accountNumber"
                        autoComplete="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="accountHolderName"
                        label="Account Holder Name"
                        type="accountHolderName"
                        id="accountHolderName"
                        autoComplete="accountHolderName"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="bankName"
                        label="Bank Name"
                        type="bankName"
                        id="bankName"
                        autoComplete="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="branchName"
                        label="Branch Name"
                        type="branchName"
                        id="branchName"
                        autoComplete="branchName"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        name="ifscCode"
                        label="IFSC Code"
                        type="ifscCode"
                        id="ifscCode"
                        autoComplete="ifscCode"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item lg={12} container justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, mb: 2, width: "200px" }}
                  onClick={handleSubmit}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

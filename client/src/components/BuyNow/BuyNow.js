import React, { useContext, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import Review from "./Review";
import Cookies from "js-cookie";
import Store, {
  NextStepContext,
  IdContext,
  PlaceOrder,
  OrderAddressContext,
  OrderPaymentContext,
} from "./Store.js";
import { useParams } from "react-router-dom";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";

const steps = ["Shipping address", "Payment details", "Review your order"];

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);
  const { nextStep, setNextStep } = useContext(NextStepContext);
  const { id, setId } = useContext(IdContext);
  const { placeOrder, setPlaceOrder } = useContext(PlaceOrder);
  const { orderPayment, setOrderPayment } = useContext(OrderPaymentContext);
  const { orderAddress, setOrderAddress } = useContext(OrderAddressContext);
  const [orderId, setOrderId] = useState("");

  // const handleNextStep = async () => {
  //   console.log(id);
  //   await setActiveStep(activeStep + 1);
  //   await setNextStep(true);
  // };

  const handleNextStep = async () => {
    if (activeStep === steps.length - 1) {
      // Logic for sending the order request
      const token = Cookies.get("token");
      const userId = Cookies.get("userId");
      const requestBody = {
        orderPayment,
        orderAddress,
      };
      apiClient
        .post(urls.order.create.replace("{id}", id), requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        })
        .then((response) => {
          console.log(response.data);
          setOrderId(response.data);
          // Additional logic after successfully adding the order
        })
        .catch((error) => {
          console.log(error);
          // Handle error if needed
        });
    } else {
      console.log(id);
      await setNextStep(true);
    }
    await setActiveStep(activeStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePlaceOrder = async () => {};

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <AddressForm handleNextStep={handleNextStep} />;
      case 1:
        return <PaymentForm handleNextStep={handleNextStep} />;
      case 2:
        return <Review handlePlaceOrder={handlePlaceOrder} />;
      default:
        throw new Error("Unknown step");
    }
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                Thank you for your order.
              </Typography>
              <Typography variant="subtitle1">
                Your order number is #{orderId["orderId"]}. We have emailed your order
                confirmation, and will send you an update when your order has
                shipped.
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBackStep} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={handleNextStep}
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? "Place order" : "Next"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

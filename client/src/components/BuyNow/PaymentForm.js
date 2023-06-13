import React, {useEffect, useState, useContext} from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Store, { OrderPaymentContext, NextStepContext, OrderAddressContext } from "./Store.js";

export default function PaymentForm() {
  const { orderPayment, setOrderPayment } = useContext(OrderPaymentContext);
  const  { orderAddress, setOrderAddress } = useContext(OrderAddressContext);
  const { nextStep, setNextStep } = useContext(NextStepContext);

  const [cardName, setCardName] = useState(orderPayment.cardName);
  const [cardNumber, setCardNumber] = useState(orderPayment.cardNumber);
  const [expDate, setExpDate] = useState(orderPayment.expDate);
  const [cvv, setCvv] = useState(orderPayment.cvv);
  

  useEffect(() => {
    console.log(orderAddress);
    setOrderPayment({
      cardName,
      cardNumber,
      expDate,
      cvv,
    });
    console.log(orderPayment);
  }, [nextStep, cardName, cardNumber, expDate, cvv]);

  

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Payment method
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="cardName"
            label="Name on card"
            fullWidth
            autoComplete="cc-name"
            variant="standard"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}

          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="cardNumber"
            label="Card number"
            fullWidth
            autoComplete="cc-number"
            variant="standard"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}

          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="expDate"
            label="Expiry date"
            fullWidth
            autoComplete="cc-exp"
            variant="standard"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="cvv"
            label="CVV"
            helperText="Last three digits on signature strip"
            fullWidth
            autoComplete="cc-csc"
            variant="standard"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}

          />
        </Grid>
        {/* <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox color="secondary" name="saveCard" value="yes" />}
            label="Remember credit card details for next time"
          />
        </Grid> */}
      </Grid>
    </React.Fragment>
  );
}

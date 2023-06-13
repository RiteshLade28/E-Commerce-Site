import React, { useEffect, useContext, useState } from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Grid from "@mui/material/Grid";
import Store, {
  OrderAddressContext,
  OrderPaymentContext,
  NextStepContext,
  IdContext,
  PlaceOrder,
} from "./Store";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";
import { ListItemAvatar, Avatar } from "@material-ui/core";

const addresses = ["1 MUI Drive", "Reactville", "Anytown", "99999", "USA"];

export default function Review() {
  const { orderPayment, setOrderPayment } = useContext(OrderPaymentContext);
  const { orderAddress, setOrderAddress } = useContext(OrderAddressContext);
  const { nextStep, setNextStep } = useContext(NextStepContext);
  const { placeOrder, setPlaceOrder } = useContext(PlaceOrder);
  const { id, setId } = useContext(IdContext);
  const [product, setProduct] = useState({});
  const [category, setCategory] = useState("");

  const payments = [
    { name: "Card type", detail: "Visa" },
    { name: "Card holder", detail: orderPayment.cardName },
    { name: "Card number", detail: orderPayment.cardNumber },
    { name: "Expiry date", detail: orderPayment.expDate },
    { name: "CVV", detail: orderPayment.cvv },
  ];

  useEffect(() => {
    console.log(id);
    console.log(placeOrder);
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    apiClient
      .get(urls.product.get.replace("{id}", id), {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId,
        },
      })
      .then((response) => {
        setProduct(response.data[0]);
        setCategory(response.data[1]);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [nextStep, placeOrder]);

  
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Category" secondary={product.desc} />
          <Typography variant="body2">{category}</Typography>
        </ListItem>
        <ListItemAvatar>
          <img
            src={product.image}
            alt="Product"
            style={{ width: "300px", height: "300px", objectFit: "contain" }}
          />
        </ListItemAvatar>
        <ListItem key={product.name} sx={{ py: 1, px: 0 }}>
          <ListItemText
            primary={product.name + " Price"}
            secondary={product.desc}
          />
          <Typography variant="body2">₹{product.price}</Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Shipping charges" />
          <Typography variant="body2">Free</Typography>
        </ListItem>
        {/* ))} */}

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ₹{product.price}
          </Typography>
        </ListItem>
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Shipping
          </Typography>
          <Typography gutterBottom>
            {orderAddress.firstName} {orderAddress.lastName}{" "}
          </Typography>
          <Typography gutterBottom>
            {orderAddress.address} {orderAddress.landmark}
          </Typography>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Payment details
          </Typography>
          <Grid container>
            {payments.map((payment) => (
              <React.Fragment key={payment.name}>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.detail}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
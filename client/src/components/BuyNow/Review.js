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
  PlaceOrder,
  IdContext,
} from "./Store";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";
import { ListItemAvatar, Avatar } from "@material-ui/core";
import { useParams } from "react-router-dom";

const addresses = ["1 MUI Drive", "Reactville", "Anytown", "99999", "USA"];

export default function Review() {
  const { orderPayment, setOrderPayment } = useContext(OrderPaymentContext);
  const { orderAddress, setOrderAddress } = useContext(OrderAddressContext);
  const { nextStep, setNextStep } = useContext(NextStepContext);
  const { placeOrder, setPlaceOrder } = useContext(PlaceOrder);
  const { id, setId } = useContext(IdContext);

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const payments = [
    { name: "Card type", detail: "Visa" },
    { name: "Card holder", detail: orderPayment.cardName },
    { name: "Card number", detail: orderPayment.cardNumber },
    { name: "Expiry date", detail: orderPayment.expDate },
    { name: "CVV", detail: orderPayment.cvv },
  ];

  const url = new URL(window.location.href).pathname.split("/")[2];
  console.log(url);

  useEffect(() => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    if (url !== "cart") {
      apiClient
        .get(urls.product.get.replace("{id}", id), {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        })
        .then((response) => {
          setProducts([response.data[0]]);
          setCategory(response.data[1]);
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      apiClient
        .get(urls.cart.get, {
          headers: {
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        })
        .then((response) => {
          setProducts(response.data.formattedData);
          setTotalPrice(response.data.totalPrice);
          setTotalItems(response.data.totalItems);
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [nextStep, placeOrder]);

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>
      <List disablePadding>
        {products?.map((product) => (
          <React.Fragment key={product.name}>
            <ListItem sx={{ py: 1, px: 0 }}>
              <ListItemText primary="Category" secondary={product.desc} />
              <Typography variant="body2">{product.category}</Typography>
            </ListItem>
            <ListItemAvatar>
              <img
                src={product.image}
                alt="Product"
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "contain",
                }}
              />
            </ListItemAvatar>
            <ListItem sx={{ py: 1, px: 0 }}>
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
          </React.Fragment>
        ))}

        {url && url === "cart" ? (
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Total Items" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {totalItems}
            </Typography>
          </ListItem>
        ) : null}
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total Price" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {url && url !== "cart"
              ? products && products[0]
                ? `₹${products[0].price}`
                : ""
              : `₹${totalPrice}`}
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

import React, { useEffect, useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import OrderSummaryItem from "./OrderSummaryItem";
import ShoppingCartItem from "./ShoppingCartItem";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";

export default function ShoppingCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiClient
      .get(urls.cart.get) // localhost:5000/api/cart
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(items);
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={7} lg={7}>
            {items.map((item, index) => (
              <Grid item key={index}>
                <ShoppingCartItem
                  category={item.category}
                  itemName={item.itemName}
                  quantity={item.quantity}
                  price={item.price}
                  image={item.image}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={5} lg={5}>
            <OrderSummaryItem />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

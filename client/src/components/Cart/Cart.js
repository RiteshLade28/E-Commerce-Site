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

  const updateData = () => {
    apiClient
      .get(urls.cart.get)
      .then((response) => {
        console.log(response.data);
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    updateData();
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container>
        <Grid container spacing={3}>
          <Grid item lg={7}>
            {items &&
              items.formattedData &&
              items.formattedData.map((item, index) => (
                <Grid item key={index}>
                  <ShoppingCartItem
                    productId={item.productId}
                    category={item.category}
                    itemName={item.itemName}
                    quantity={item.quantity}
                    price={item.price}
                    image={item.image}
                    updateData={updateData}
                  />
                </Grid>
              ))}
          </Grid>
          <Grid item lg={5}>
            <OrderSummaryItem
              price={items ? items.totalPrice : 0}
              totalItems={items ? items.totalItems : 0}
            />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

/**
 * This is a React component that displays a shopping cart with items and their details, and an order
 * summary.
 * @returns The ShoppingCart component is being returned, which renders a container with two Grid
 * items. The first Grid item displays a list of ShoppingCartItems, which are mapped from the items
 * state using the formattedData property. The second Grid item displays an OrderSummaryItem, which
 * receives the total price and total items from the items state. The component also makes an API call
 * to update the items state using the updateData function
 */
import React, { useEffect, useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import OrderSummaryItem from "./OrderSummaryItem";
import ShoppingCartItem from "./ShoppingCartItem";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";

export default function ShoppingCart() {
  const [items, setItems] = useState([]);

  const updateData = () => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");
    apiClient
      .get(urls.cart.get, {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId,
        },
      })
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
            {items ?.formattedData &&
              items.formattedData.map((item) => (
                <Grid item key={item.number}>
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

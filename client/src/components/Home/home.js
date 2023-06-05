import React, { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import Offers from "../offers";
import ProductCard from "../Product/ProductCard";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiClient
      .get(urls.product.get) // localhost:5000/api/cart
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(items);
  }, []);

  return (
    <Box
      marginLeft={"100px"}
      marginRight={"100px"}
      marginTop={"50px"}
      padding={"24px"}
    >
      <Grid container>
        <Offers />
      </Grid>
      <Grid container spacing={3} marginTop={"20px"}>
        {products.map((item, index) => (
          <Grid item key={index}>
            <ProductCard
              category={item.category}
              itemName={item.itemName}
              price={item.price}
              image={item.image}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

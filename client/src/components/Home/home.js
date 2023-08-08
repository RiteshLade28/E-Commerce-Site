import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import Offers from "../offers";
import ProductCard from "../Product/ProductCard";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";

export default function Home() {
  const [categoryProducts, setcategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    console.log(token);

    apiClient
      .get(urls.product.get)
      .then((response) => {
        console.log(response);
        setcategoryProducts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  return (
    <Box
      marginLeft={"100px"}
      marginRight={"100px"}
      marginTop={"10px"}
      padding={"24px"}
    >
      <Grid container>
        <Offers />
      </Grid>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "30px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} marginTop={"20px"}>
          {categoryProducts?.map((category) => (
            <React.Fragment key={category.number}>
              <Grid item lg={12}>
                <Typography
                  variant="h5"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    padding: "10px",
                  }}
                >
                  {" "}
                  {category.categoryName}
                </Typography>
              </Grid>
              {category.products.map((item) => (
                <Grid item key={item.number}>
                  <ProductCard
                    productId={item.productId}
                    category={item.category}
                    itemName={item.name}
                    newPrice={item.newPrice}
                    oldPrice={item.oldPrice}
                    image={item.image}
                  />
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      )}
    </Box>
  );
}

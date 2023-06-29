import { Box, IconButton, Paper } from "@mui/material";
import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@material-ui/core/Grid";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");

    apiClient
      .get(urls.sellerProducts.get, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        await setAllProducts(response.data.sellerProducts.products);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <Paper style={{ margin: "85px 20px 100px 85px", padding: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" component={"h2"} gutterBottom>
          Products
        </Typography>
        <Button
          sx={{ height: "40px" }}
          variant="contained"
          href="/seller/addProduct"
        >
          Add Product
        </Button>
      </Box>
      <Grid container spacing={2}>
        {allProducts?.map((product) => (
          <Grid item key={product.productId}>
            <Card sx={{ width: 215, height: 300, padding: "6px" }}>
              <CardMedia
                sx={{
                  width: 200,
                  height: 150,
                  display: "flex",
                  backgroundSize: "contain",
                }}
                image={product.image}
                title="green iguana"
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body1" component="div">
                  Stock: {product.stock}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between" }}>
                <IconButton aria-label="edit" onClick={() => navigate(`/seller/editProduct/${product.productId}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ProductsPage;

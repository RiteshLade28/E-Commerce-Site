import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MediaCard({ productId, itemName, category, price, image }) {

  const addToCart = (id) => {
    apiClient
      .post(urls.cart.create.replace("{id}", id))
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log(response);
          toast("Item Added to Cart Successfully", { type: "success" });
        } else {
          toast("Failed to Add Item to Cart", { type: "success" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
    <Card sx={{ width: 235 }}>
      <CardMedia
        sx={{
          height: 150,
          // paddingTop: "100%", // 1:1 Aspect Ratio
          backgroundSize: "contain",
        }}
        image={image}
        title="Charger"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {itemName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ₹{price}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button size="small">Buy Now</Button>
        <Button onClick={() => {addToCart(productId)}} size="small">Add to Cart</Button>
      </CardActions>
    </Card>
    <ToastContainer />
    </>
  );
}

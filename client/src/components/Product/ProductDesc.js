/* The above code is a React component that displays the details of a product and allows the user to
add the product to their cart or buy it. It fetches the product details and related products from an
API using Axios, and displays them in a responsive grid layout using Material-UI components. It also
includes functionality to add the product to the cart and display a success or failure message using
the react-toastify library. The component also allows the user to navigate to related products by
clicking on them. */
import React, { useEffect, useState } from "react";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Grid from "@material-ui/core/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { makeStyles } from "@mui/styles";
import { Button } from "@material-ui/core";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ProductCard from "./ProductCard";
import { ToastContainer, toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: 15,
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  image: {
    height: 150,
    width: 150,
    objectFit: "contain",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
  },
}));

const ProductDesc = () => {
  const { productId } = useParams();
  const [id, setId] = useState(productId);
  const [product, setProduct] = useState([]);
  const [categoryProducts, setcategoryProducts] = useState([]);
  const classes = useStyles();
  const navigate = useNavigate();

  function addToCart(id) {
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

  useEffect(() => {
    apiClient
      .get(urls.product.get.replace("{id}", id))
      .then((response) => {
        console.log(response);
        setProduct(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    apiClient
      .get(urls.product.get)
      .then((response) => {
        console.log(response);
        setcategoryProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  useEffect(() => {
    const handlePopstate = () => {
      const previousProductId = localStorage.getItem("previousProductId");
      if (previousProductId) {
        setId(previousProductId); // Set the previous product ID
        localStorage.removeItem("previousProductId");
      }
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("previousProductId", productId); // Store the current product ID
  }, [productId]);

  return (
    <Grid container>
      <Grid
        item
        lg={12}
        container
        style={{ marginTop: "50px", marginBottom: "50px" }}
      >
        <Grid
          item
          lg={5}
          spacing={2}
          display={"flex"}
          justifyContent="center"
          style={{ margin: "16px", flexWrap: "wrap" }}
        >
          <Grid item lg={12} style={{ marginBottom: "20px" }}>
            <CardMedia
              component={"img"}
              image={product["image"]}
              title="Product Image"
              style={{
                objectFit: "contain",
                height: "500px",
                width: "600px",
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              color="secondary"
              style={{ width: 180, marginLeft: "78px", marginRight: "50px" }}
              onClick={() => {
                addToCart(id);
              }}
            >
              Add To Cart
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              color="secondary"
              style={{ width: 180, marginLeft: "30px" }}
            >
              Buy Now
            </Button>
          </Grid>
        </Grid>
        <Grid item container lg={2} direction="column" spacing={2}>
          <Grid item>
            <CardMedia
              component={"img"}
              className={classes.image}
              image={product["image"]}
              title="Product Image"
              style={{ objectFit: "contain", height: "150px", width: "150px" }}
            />
          </Grid>
          <Grid item>
            <CardMedia
              component={"img"}
              className={classes.image}
              image={product["image"]}
              title="Product Image"
              style={{ objectFit: "contain", height: "150px", width: "150px" }}
            />
          </Grid>
          <Grid item>
            <CardMedia
              component={"img"}
              className={classes.image}
              image={product["image"]}
              title="Product Image"
              style={{ objectFit: "contain", height: "150px", width: "150px" }}
            />
          </Grid>
        </Grid>
        <Grid item lg={4} className={classes.details}>
          <Typography variant="h3" style={{ marginBottom: "20px" }}>
            {product["name"]}
          </Typography>
          <Typography variant="h5" style={{ marginBottom: "5px" }}>
            ₹ {product["price"]}
          </Typography>
          <Typography
            variant="body1"
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Cash on Delivery Available{" "}
            <CheckCircleIcon style={{ marginLeft: "5px" }} color="success" />
          </Typography>
          <Typography
            variant="body1"
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {Array.from({ length: product.ratings }, (value, index) => (
              <StarIcon key={index} style={{ color: "orange" }} />
            ))}
            {product.ratings % 1 !== 0 && (
              <StarHalfIcon style={{ color: "orange", marginRight: "5px" }} />
            )}
            {product["ratings"]}
          </Typography>
          <Typography variant="h6" style={{ marginBottom: "10px" }}>
            Description
          </Typography>
          <Typography variant="body1">{product["description"]}</Typography>
        </Grid>
      </Grid>
      <Grid
        item
        lg={12}
        container
        spacing={3}
        marginTop={"20px"}
        style={{
          marginLeft: "75px",
          marginRight: "100px",
          marginTop: "10px",
          padding: "24px",
        }}
      >
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
                {category.categoryName}
              </Typography>
            </Grid>
            {category.products.map((item) => (
              <Grid
                item
                key={item.number}
                onClick={() => {
                  setId(item.productId);
                }}
              >
                <ProductCard
                  productId={item.productId}
                  category={item.category}
                  itemName={item.name}
                  price={item.price}
                  image={item.image}
                />
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
};

export default ProductDesc;

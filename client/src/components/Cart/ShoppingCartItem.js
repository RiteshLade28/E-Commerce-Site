import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
  cover: {
    width: 200,
    height: 200, // Add this line
    backgroundSize: "contain"
  },
}));

export default function ShoppingCartItem({
  productId,
  category,
  itemName,
  quantity,
  price,
  image,
  updateData,
}) {
  const classes = useStyles();
  const [itemQuantity, setItemQuantity] = useState(quantity);
  const removeFromCart = async (id) => {
    await apiClient
      .delete(urls.cart.delete.replace("{id}", id)) // localhost:5000/api/cart
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          updateData();
          toast("Item Deleted Successfully", { type: "success" });
        } else {
          toast("Failed to Delete Item", { type: "success" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateQuantity = (productId, quantity) => {
    return new Promise((resolve, reject) => {
      apiClient
        .patch(urls.cart.update.replace("{id}", productId), null, {
          headers: {
            quantity: quantity,
          },
        })
        .then((response) => {
          console.log(response.data);
          resolve(response.data);  // Resolve the promise with the response data
        })
        .catch((error) => {
          console.log(error);
          reject(error); // Reject the promise with the error
        });
    });
  };

  useEffect(() => {
    if (itemQuantity < 1) {
      setItemQuantity(1);
    } else {
      updateQuantity(productId, itemQuantity)
        .then(() => updateData())
        .catch((error) => {
          // Handle error during updateQuantity
          console.error(error);
        });
    }
  }, [itemQuantity]);

  return (
    <>
      <Card className={classes.root}>
        <Grid container>
          <Grid
            item
            lg={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <CardMedia
              className={classes.cover}
              image={image}
              component={"img"}
              title="Live from space album cover"
              style={{
                objectFit: "contain",
                height: "200px",
                width: "200px",
              }}
            />
          </Grid>
          <Grid item lg={8}>
            <CardContent className={classes.content}>
              <Grid container>
                <Grid item lg={10}>
                  <Typography
                    variant="body1"
                    component="div"
                    style={{ fontWeight: "bold" }}
                  >
                    Category
                  </Typography>
                </Grid>
                <Grid item lg={2}>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                    sx={{
                      display: "flex",
                      justifyContent: "right",
                    }}
                  >
                    {category}
                  </Typography>
                </Grid>
                <Grid item lg={12}>
                  <Typography variant="div" component="h2">
                    {itemName}
                  </Typography>
                </Grid>

                <Grid item lg={10}>
                  <Typography variant="body1" component="div">
                    Quantity
                  </Typography>
                </Grid>
                <Grid
                  item
                  lg={2}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                    onClick={() => setItemQuantity(itemQuantity - 1)}
                  >
                    <Badge color="error">
                      <RemoveIcon />
                    </Badge>
                  </IconButton>
                  <Typography variant="h6" component="div" sx={{ mx: 1 }}>
                    {itemQuantity}
                  </Typography>
                  <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                  >
                    <Badge color="error">
                      <AddIcon />
                    </Badge>
                  </IconButton>
                </Grid>
                <Grid item lg={10}>
                  <Typography
                    variant="body1"
                    component="div"
                    style={{ fontWeight: "bold", marginLeft: "auto" }}
                  >
                    Price
                  </Typography>
                </Grid>
                <Grid
                  item
                  lg={2}
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <Typography variant="h6" component="div" color="secondary">
                    ₹{price}
                  </Typography>
                </Grid>
                <Grid
                  item
                  lg={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginLeft: "auto",
                  }}
                >
                  <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                    onClick={() => removeFromCart(productId)}
                  >
                    <Badge color="error">
                      <DeleteIcon />
                    </Badge>
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
      <ToastContainer />
    </>
  );
}

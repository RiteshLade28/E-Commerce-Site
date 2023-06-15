import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import OrderItem from "./OrderItem";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";
import Typography from "@mui/material/Typography";
import { Card, CardContent, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "0px",
    margin: "10px 128px",
  },
  title: {
    marginBottom: "10px",
  },
  orderItem: {
    marginBottom: "10px",
  },
  image: {
    width: 150,
    height: 150,
    marginRight: "10px",
    objectFit: "contain",
  },
}));

export default function Orders() {
  //   const [items, setItems] = useState([]);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");
    console.log(token);
    apiClient
      .get(urls.order.get, {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId,
        },
      })
      .then((response) => {
        console.log(response);
        setOrderedProducts(response.data.orderedProducts);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Grid container>
        <Grid
          item
          lg={12}
          style={{ padding: "10px", margin: "30px 128px 0px 128px" }}
        >
          <Typography variant="h5" component="h1">
            My Orders
          </Typography>
        </Grid>
        {orderedProducts?.length !== 0 ? (
          <Grid item lg={12}>
            {orderedProducts?.map((item) => (
              <Paper
                className={classes.container}
                style={{ padding: "20px 50px" }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  className={classes.title}
                >
                  Order Id: {item.id}
                </Typography>
                <OrderItem orders={item.orders} />
                <Typography variant="h6" component="h2" textAlign={"right"}>
                  Total Price: {item.totalPrice}
                </Typography>
              </Paper>
            ))}
          </Grid>
        ) : (
          <Grid item lg={12}>
            <Card
              className={classes.container}
              style={{
                padding: "0px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CardContent>
                <CardMedia
                  style={{
                    width: "150px",
                    height: "150px",
                    margin: "auto",
                    marginBottom: "20px",
                  }}
                  gutterBottom
                  image="https://cdn.pixabay.com/photo/2020/12/19/02/50/emoji-5843434_640.png"
                />
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  textAlign={"center"}
                >
                  You have not order anything yet !!!
                </Typography>
                <Typography variant="h6" component="h2" textAlign={"center"}>
                  Go to <Link to="/">Home Page</Link> and Shop Now !!!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
}

import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Button } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "10px",
    margin: "30px 128px",
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

const MyOrdersPage = ({ orders }) => {
  const classes = useStyles();

  return (
    <>
      {orders.map((order) => (
        <Card key={order.id} className={classes.orderItem}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item lg={2}>
                <CardMedia>
                  <img
                    src={order.image}
                    alt={order.title}
                    className={classes.image}
                  />
                </CardMedia>
              </Grid>
              <Grid item lg={2}>
                <Typography fontWeight="bold" variant="h6">
                  {order.title}
                </Typography>
                <Typography variant="body1" component="div">
                  {order.description}
                </Typography>
                <Typography
                  marginTop="30px"
                  fontWeight="bold"
                  variant="body1"
                  component="div"
                >
                  Quantity: {order.quantity}
                </Typography>
                <Typography fontWeight="bold" variant="body1" component="div">
                  Price: ${order.price}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography fontWeight="bold" variant="h6" component="div">
                  Payment
                </Typography>
                <Typography variant="h6">{order.payment}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography fontWeight="bold" variant="h6" component="div">
                  Delivery Date
                </Typography>
                <Typography variant="h6" component="div">
                  {order.deliveryDate}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography fontWeight="bold" variant="h6" component="div">
                  Status
                </Typography>
                <Typography variant="h6">{order.status}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Button
                  style={{ marginBottom: "20px", width: "150px" }}
                  variant="contained"
                  color="primary"
                >
                  Track Order
                </Button>
                <Button
                  style={{ marginBottom: "20px", width: "150px" }}
                  variant="contained"
                  color="primary"
                >
                  Return Order
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default MyOrdersPage;

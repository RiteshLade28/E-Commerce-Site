import React, { useContext } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Store, { BuyFromCartContext } from "../BuyNow/Store";

const useStyles = makeStyles({
  root: {
    position: "sticky",
    top: "1rem",
    minWidth: "275",
    zIndex: 1,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  cardActions: {
    marginTop: "auto",
  },
});

export default function MediaCard({ price, totalItems }) {
  const navigate = useNavigate();

  const classes = useStyles();
  const shippingPrice = totalItems ? 100 : 0;
  const clickable = totalItems ? true : false;
  return (
    <Card className={classes.root} elevation={15}>
      <Grid container>
        <Grid item lg={12}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Shopping Cart
            </Typography>
            <Typography variant="div" component="h1">
              Order Summary
            </Typography>
            <Typography variant="subtitle2">
              <hr />
            </Typography>
            <Grid container>
              <Grid item lg={10}>
                <Typography variant="body1" component="div">
                  Shipping
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="h6" component="div">
                  ₹{shippingPrice}
                </Typography>
              </Grid>
              <Grid item lg={10}>
                <Typography variant="body1" component="div">
                  Total
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="h6" component="div">
                  ₹{price + shippingPrice}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
        <Grid item lg={12}>
          <CardActions className={classes.cardActions}>
            <Button
              size="large"
              color="secondary"
              onClick={() => {
                if (clickable) navigate("/buyNow/cart");
              }}
            >
              BUY NOW ({totalItems})
            </Button>
          </CardActions>
        </Grid>
      </Grid>
    </Card>
  );
}

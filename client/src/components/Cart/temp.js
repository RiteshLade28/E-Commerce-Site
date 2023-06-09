import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Mobile from "../../images/mobile.jpg";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

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
    width: 220,
    backgroundSize: "contain",
  },
}));

export default function ShoppingCartItem({
  category,
  itemName,
  quantity,
  price,
  image,
}) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardMedia
        className={classes.cover}
        image={image}
        title="Live from space album cover"
      />
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
              // lg={12}
              color="textSecondary"
              gutterBottom
            >
              {category}
            </Typography>
          </Grid>
          <Grid item lg={12}>
            <Typography variant="div" component="h2">
              {itemName}{" "}
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
              marginLeft: "auto",
            }}
          >
            <Typography variant="h6" component="div">
              {quantity}
            </Typography>
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
          <Grid item lg={2}>
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
            >
              <Badge color="error">
                <DeleteIcon />
              </Badge>
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

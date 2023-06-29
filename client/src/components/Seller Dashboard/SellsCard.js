import React from "react";
import { Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@mui/styles";
import { Card, CardContent, CardHeader, Avatar } from "@mui/material";
import { red } from "@mui/material/colors";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import PendingIcon from "@mui/icons-material/Pending";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const useStyles = makeStyles((theme) => ({
  root: {
    // margin: "80px 100px",
    padding: "20px 0px",
  },
  summaryItem: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    height: "130px",
  },

  avatar: {
    backgroundColor: red[500],
  },
}));

export default function DataTable({
  totalOrders,
  pendingOrders,
  totalCustomers,
  newOrders,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom>
        Seller Fulfilled Orders
      </Typography>
      <Grid container spacing={4} style={{ marginBottom: "30px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <AllInclusiveIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">{totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  ₹
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                New Orders
              </Typography>
              <Typography variant="h4">{newOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <PendingIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h4">{pendingOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <PeopleAltIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4">{totalCustomers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* <Typography variant="h5" gutterBottom>
        Returns and Stock
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <AllInclusiveIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Returns
              </Typography>
              <Typography variant="h4">100</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  ₹
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">30</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <PendingIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h4">50</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryItem}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  <PeopleAltIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock
              </Typography>
              <Typography variant="h4">10</Typography>
            </CardContent>
          </Card> 
        </Grid>
      </Grid>*/}
    </div>
  );
}

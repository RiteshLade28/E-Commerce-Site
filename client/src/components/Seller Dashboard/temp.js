import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import PendingIcon from "@mui/icons-material/Pending";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const StatusButton = ({ status, orderId, updateStatus }) => {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusSelect = (status) => {
    updateStatus(status);
    handleStatusMenuClose();
  };

  return (
    <>
      <Button
        aria-controls={`status-menu-${orderId}`}
        aria-haspopup="true"
        onClick={handleStatusMenuOpen}
        variant="contained"
        color="primary"
        style={{ width: "100px" }}
      >
        {status}
      </Button>
      <Menu
        id={`status-menu-${orderId}`}
        anchorEl={statusMenuAnchor}
        keepMounted
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => handleStatusSelect("Ordered")}>
          Ordered
        </MenuItem>
        <MenuItem onClick={() => handleStatusSelect("Shipped")}>
          Shipped
        </MenuItem>
        <MenuItem onClick={() => handleStatusSelect("Delivered")}>
          Delivered
        </MenuItem>
      </Menu>
    </>
  );
};

const initialRows = [
  {
    id: 1,
    custName: "Snow Jon",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 2,
    custName: "Lannister Cersei",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 3,
    custName: "Lannister Jaime",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 4,
    custName: "Stark Arya",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 5,
    custName: "Targaryen Daenerys",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Delievered",
  },
  {
    id: 6,
    custName: "Melisandre John",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Delivered",
  },
  {
    id: 7,
    custName: "Clifford Ferrara",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 8,
    custName: "Frances Rossini",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
  {
    id: 9,
    custName: "Roxie Harvey",
    orderDate: "20/06/23",
    amount: 5000,
    status: "Pending",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    // margin: "80px 100px",
    padding: "20px",
  },
  summaryItem: {
    border: "1px solid #ccc",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    height: "160px",
  },

  avatar: {
    backgroundColor: red[500],
  },
}));

export default function DataTable() {
  const columns = [
    { field: "id", headerName: "Order Id", width: 70 },
    { field: "custName", headerName: "Customer Name", width: 200 },
    { field: "orderDate", headerName: "Order Date", width: 130 },
    { field: "amount", headerName: "Amount", width: 90 },
    {
      field: "status",
      headerName: "Status",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <StatusButton
          status={params.value}
          orderId={params.row.id}
          updateStatus={(newStatus) =>
            handleStatusUpdate(params.row.id, newStatus)
          }
        />
      ),
    },
  ];
  const classes = useStyles();
  const [rows, setRows] = useState(initialRows);

  const handleStatusUpdate = (orderId, newStatus) => {
    const updatedRows = rows.map((row) =>
      row.id === orderId ? { ...row, status: newStatus } : row
    );
    setRows(updatedRows);
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center" gutterBottom>
            Orders
          </Typography>
        </Grid>
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
                New Orders
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
                Pending Orders
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
                Total Customers
              </Typography>
              <Typography variant="h4">10</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            style={{
              width: "750px",
              margin: "auto",
              padding: "10px",
            }}
          >
            <Typography variant="h4" style={{ margin: "20px" }}>
              Orders
            </Typography>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 20]}
              autoPageSize
              hideFooterPagination
              //   checkboxSelection
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

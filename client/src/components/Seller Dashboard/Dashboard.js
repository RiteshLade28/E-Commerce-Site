import React, { useCallback, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Sector,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Paper,
} from "@mui/material";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import PendingIcon from "@mui/icons-material/Pending";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "80px 100px",
    padding: "20px",
  },
  summaryItem: {
    border: "1px solid #ccc",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(1),
  },
  chartContainer: {
    marginTop: theme.spacing(1),
  },
  summaryItem: {
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


// const productData = [
//   { name: "Product 1", value: 500 },
//   { name: "Product 2", value: 800 },
//   { name: "Product 3", value: 1200 },
//   // Add more products
// ];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF99E6",
  "#AF19FF",
  "#FFA919",
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`Sales ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const Dashboard = () => {
  const classes = useStyles();
  const [totalOrders, setTotalOrders] = useState();
  const [totalRevenue, setTotalRevenue] = useState();
  const [totalCustomers, setTotalCustomers] = useState();
  const [pendingOrders, setPendingOrders] = useState();
  const [latestProducts, setLatestProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const token = Cookies.get("token");
    console.log(token);

    apiClient
      .get(urls.getDashboardData.get, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        setTotalOrders(response.data.dashboard.totalOrders);
        setTotalRevenue(response.data.dashboard.totalRevenue);
        setTotalCustomers(response.data.dashboard.totalCustomers);
        setPendingOrders(response.data.dashboard.pendingOrders);
        setLatestProducts(response.data.dashboard.latestProducts);
        setOrders(response.data.dashboard.orders);
        setSalesData(response.data.dashboard.salesData);
        setProductData(response.data.dashboard.productCounts);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const topProducts = productData.slice(0, 4); // Get the top 4 products
  const otherProducts = productData.slice(4); // Get the remaining products

  // Calculate the total value of the other products
  const otherProductsValue = otherProducts.reduce(
    (total, product) => total + product.value,
    0
  );

  // Create a new data array with top products and the other category
  const chartData = [
    ...topProducts,
    { name: "Other", value: otherProductsValue },
  ];

  const formatDate = (date) => {
    console.log(date);
    const originalDate = new Date(date);
    const day = originalDate.getDate();
    const month = originalDate.getMonth() + 1; // Months are zero-indexed
    const year = originalDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center" gutterBottom>
            Seller's Dashboard
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
                Total Revenue
              </Typography>
              <Typography variant="h4">₹{totalRevenue}</Typography>
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

        <Grid item xs={6} className={classes.chartContainer}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ marginTop: "20px" }}
                  >
                    Monthly Sales
                  </Typography>
                  <BarChart width={600} height={300} data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid stroke="#ccc" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#0080ff" barSize={40} />
                  </BarChart>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} className={classes.chartContainer}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ marginTop: "20px" }}
                  >
                    Top Products by value
                  </Typography>
                  <PieChart width={600} height={300}>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
                      cx={280}
                      cy={140}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} className={classes.tableContainer}>
          <Paper style={{ padding: "20px" }}>
            <Typography variant="h6" className={classes.tableTitle}>
              Latest Products
            </Typography>
            {latestProducts?.map((product) => (
              <Card sx={{ fullWidth: 400, marginBottom: "10px" }}>
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{ bgcolor: red[500] }}
                      aria-label={product[0]}
                      src={product[1]}
                    />
                  }
                  action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={product[0]}
                  subheader="September 14, 2016"
                />
              </Card>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8} className={classes.tableContainer}>
          <TableContainer component={Card} style={{ padding: "20px" }}>
            <Typography variant="h6" className={classes.tableTitle}>
              Recent Orders
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow>
                    <TableCell>{order[0]}</TableCell>
                    <TableCell>
                      {order[1]} {order[2]}
                    </TableCell>
                    <TableCell>{order[3]}</TableCell>
                    <TableCell>{formatDate(order[4])}</TableCell>
                    <TableCell>₹{order[5]}</TableCell>
                    <TableCell>{order[6]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;

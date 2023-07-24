import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import SellsCard from "./SellsCard";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import Cookies from "js-cookie";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "id",
    numeric: true,
    disablePadding: true,
    label: "Order Id",
  },
  {
    id: "custName",
    numeric: false,
    disablePadding: false,
    label: "Customer Name",
  },
  {
    id: "productName",
    numeric: false,
    disablePadding: false,
    label: "Product Name",
  },
  {
    id: "orderDate",
    numeric: false,
    disablePadding: false,
    label: "Order Date",
  },
  {
    id: "amount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
  },
  {
    id: "address",
    numeric: false,
    disablePadding: false,
    label: "Address",
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "Email",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Status",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "Select all orders",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"left"}
            padding={"normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const {
    numSelected,
    handleStatusMenuItemClick,
    anchorEl,
    setAnchorEl,
    handleStatusButtonClick,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          All Orders
        </Typography>
      )}

      {numSelected > 0 ? (
        <>
          <Tooltip title="Update the status of selected">
            <IconButton
              aria-controls="status-menu"
              aria-haspopup="true"
              onClick={handleStatusButtonClick}
              color="primary"
              sx={{ marginRight: "20px" }}
            >
              <DoneAllIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="status-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => handleStatusMenuItemClick("Order Placed")}>
              Order Placed
            </MenuItem>
            <MenuItem onClick={() => handleStatusMenuItemClick("Shipped")}>
              Shipped
            </MenuItem>
            <MenuItem onClick={() => handleStatusMenuItemClick("Delivered")}>
              Delivered
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  handleStatusMenuItemClick: PropTypes.func.isRequired,
  anchorEl: PropTypes.bool.isRequired,
  setAnchorEl: PropTypes.func.isRequired,
  handleStatusButtonClick: PropTypes.func.isRequired,
};

export default function EnhancedTable() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("orderId");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedStatus, setSelectedStatus] = React.useState("");

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newOrders, setNewOrders] = useState(0);

  const [rows, setRows] = useState([]);
  useEffect(() => {
    const token = Cookies.get("token");

    apiClient
      .get(urls.sellerOrders.get, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        await setRows(response.data.sellerOrders.orders);
        setTotalOrders(response.data.sellerOrders.totalOrders);
        setPendingOrders(response.data.sellerOrders.pendingOrders);
        setTotalCustomers(response.data.sellerOrders.totalCustomers);
        setNewOrders(response.data.sellerOrders.newOrders);
        console.log(rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleStatusButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenuItemClick = (status) => {
    const updatedRows = rows?.map((row) => {
      if (selected.includes(row.orderDetailsId)) {
        const token = Cookies.get("token");
        const body = {
          orderDetailsId: row.orderDetailsId,
          orderStatus: status,
        };
        apiClient
          .patch(urls.sellerOrders.patch, body, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(async (response) => {
            setRows(response.data.sellerOrders.orders);
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      return row;
    });

    setAnchorEl(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows?.map((n) => n.orderDetailsId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const clickedElement = event.target;
    console.log(clickedElement.tagName);

    // Exclude the status column from selection behavior
    if (
      clickedElement.tagName === "BUTTON" ||
      clickedElement.tagName === "LI"
    ) {
      return;
    }

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows?.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [rows, order, orderBy, page, rowsPerPage]
  );

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
    <Box sx={{ width: "1390px", margin: "100px" }}>
      <Typography align="center" variant="h3" id="tableTitle" gutterBottom>
        Orders
      </Typography>
      <SellsCard
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        totalCustomers={totalCustomers}
        newOrders={newOrders}
      />
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          handleStatusMenuItemClick={handleStatusMenuItemClick}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          handleStatusButtonClick={handleStatusButtonClick}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows?.map((row, index) => {
                const isItemSelected = isSelected(row.orderDetailsId);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.orderDetailsId)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{
                      cursor: "pointer",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding={"normal"}
                    >
                      {row.id}
                    </TableCell>
                    <TableCell align="left">{row.custName}</TableCell>
                    <TableCell align="left">{row.productName}</TableCell>
                    <TableCell align="left">
                      {formatDate(row.orderDate)}
                    </TableCell>
                    <TableCell align="left">{row.amount}</TableCell>
                    <TableCell align="left">{row.address}</TableCell>
                    <TableCell align="left">{row.email}</TableCell>

                    <TableCell
                      align="left"
                      width={"150px"}
                      sx={{
                        fontWeight: "bold",
                        color:
                          row.status === "Delivered"
                            ? "green"
                            : row.status === "Shipped"
                            ? "orange"
                            : "red",
                      }}
                    >
                      {row.status}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
}

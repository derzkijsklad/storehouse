/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Modal,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchOrders, createOrder, closeOrder, Order } from "../../api/orders";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import "./Orders.css";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState<string>("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false); 
  const [newOrderData, setNewOrderData] = useState({
    spot_id: "",
    value: "",
  });
  const [orderToClose, setOrderToClose] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null); 

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders({});
        setOrders(fetchedOrders);
      } catch {
        setError("Failed to fetch orders");
      }
    };

    loadOrders();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateOrder = async () => {
    try {
      const token = sessionStorage.getItem("authToken"); 
      if (!token) {
        setError("User is not authenticated");
        return;
      }
  
      const { spot_id, value } = newOrderData;
      if (!spot_id || !value) {
        setError("All fields are required.");
        return;
      }
  
      const newOrder = await createOrder(
        {
          spot_id: parseInt(spot_id, 10),
          value: parseFloat(value),
        },
        token
      );
  
      setOrders([newOrder, ...orders]);
      setOpenCreateModal(false);
      setNewOrderData({ spot_id: "", value: "" });
    } catch (error) {
      setError("Failed to create order");
    }
  };
  
  const handleCloseOrder = async () => {
    try {
      const token = sessionStorage.getItem("authToken"); 
      if (!token) {
        setError("User is not authenticated");
        return;
      }
  
      if (orderToClose !== null) {
        await closeOrder({ id: orderToClose }, token);
        setOrders(orders.filter((order) => order.id !== orderToClose));
        setOpenCloseModal(false);
      }
    } catch (error) {
      setError("Failed to close order");
    }
  };

  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleOpenCloseModal = () => {
    setOpenCloseModal(true);
  };

  const handleCloseCloseModal = () => {
    setOpenCloseModal(false);
    setOrderToClose(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewOrderData({ ...newOrderData, [name]: value });
  };

  const handleOpenDetailsModal = (order: Order) => {
    setOrderDetails(order);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setOrderDetails(null);
  };

  return (
    <Box className="app-container">
      <AppBar position="sticky" sx={{ backgroundColor: "#acc7eb" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Orders Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenCreateModal}
              startIcon={<AddIcon />}
            >
              Create Order
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenCloseModal}
              startIcon={<CloseIcon />}
            >
              Close Order
            </Button>
            <Link to="/statistics">
              <Button
                variant="contained"
                color="success"
                startIcon={<BarChartIcon />}
              >
                View Stats
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}

      <Paper className="paper-container" sx={{ mt: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.value}</TableCell>
                    <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{order.is_closed ? "Closed" : "Open"}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDetailsModal(order)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      <Modal open={openCreateModal} onClose={handleCloseCreateModal}>
        <Box
          className="modal-container"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: "400px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Order
          </Typography>
          <TextField
            label="Spot ID"
            name="spot_id"
            value={newOrderData.spot_id}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Value"
            name="value"
            value={newOrderData.value}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleCreateOrder} fullWidth sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Modal>

      <Modal open={openCloseModal} onClose={handleCloseCloseModal}>
        <Box
          className="modal-container"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: "400px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Close Order
          </Typography>
          <TextField
            label="Order ID to Close"
            type="number"
            onChange={(e) => setOrderToClose(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="secondary" onClick={handleCloseOrder} sx={{ width: "48%" }}>
              Close Order
            </Button>
            <Button variant="outlined" color="error" onClick={handleCloseCloseModal} sx={{ width: "48%" }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
        <Box
          className="modal-container"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: "400px",
          }}
        >
          {orderDetails && (
            <>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Typography variant="body1"><strong>ID:</strong> {orderDetails.id}</Typography>
              <Typography variant="body1"><strong>Value:</strong> {orderDetails.value}</Typography>
              <Typography variant="body1"><strong>Status:</strong> {orderDetails.is_closed ? "Closed" : "Open"}</Typography>
              <Typography variant="body1">
                <strong>Timestamp:</strong> {new Date(orderDetails.timestamp).toLocaleString()}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderList;

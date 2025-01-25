/* eslint-disable no-empty */
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
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchOrders, createOrder, closeOrder, checkProductExists, addProduct, Order } from "../../api/orders";
import "./Orders.css";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState<string>("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    container_id: "",
    product_name: "",
    quantity: "",
  });
  const [orderToClose, setOrderToClose] = useState<number | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch {
        setError("Failed to fetch orders");
      }
    };

    loadOrders();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated");
        return;
      }

      const { container_id, product_name, quantity } = newOrderData;
      if (!container_id || !product_name || !quantity) {
        setError("All fields are required.");
        return;
      }

      const productExists = await checkProductExists(product_name, token);
      if (productExists) {
      } else {
        await addProduct(product_name, token);
      }

      const newOrder = await createOrder(
        {
          container_id: parseInt(container_id, 10),
          product_name,
          quantity: parseInt(quantity, 10),
        },
        token
      );

      setOrders([newOrder, ...orders]);
      setOpenCreateModal(false);
      setNewOrderData({ container_id: "", product_name: "", quantity: "" });
    } catch (error) {
      setError("Failed to create order");
    }
  };

  const handleCloseOrder = async () => {
    try {
      const token = sessionStorage.getItem("token");
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

  const handleSelectOrderToClose = (id: number) => {
    setOrderToClose(id);
  };

  return (
    <Box className="app-container">
      <Paper className="paper-container">
        <Typography variant="h3" align="center" gutterBottom>
          Orders
        </Typography>
        <Box className="order-buttons">
          <Button variant="contained" color="primary" onClick={handleOpenCreateModal} sx={{ width: "150px" }}>
            Create Order
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenCloseModal}
            sx={{ width: "150px" }}
          >
            Close Order
          </Button>
          <Link to="/statistics">
            <Button variant="contained" color="success" sx={{ width: "200px" }}>
              View Statistics
            </Button>
          </Link>
        </Box>
      </Paper>

      {error && <Typography color="error">{error}</Typography>}

      <Box className="table-container">
        <Paper className="table-paper">
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                      <TableCell>{order.order_status}</TableCell>
                      <TableCell>
                        <Link to={`/orders/${order.id}`}>View Details</Link>
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
      </Box>

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
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Order
          </Typography>
          <TextField
            label="Container ID"
            name="container_id"
            value={newOrderData.container_id}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Product Name"
            name="product_name"
            value={newOrderData.product_name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            name="quantity"
            value={newOrderData.quantity}
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
          }}
        >
          <Typography variant="h6" gutterBottom>
            Close Order
          </Typography>
          <TextField
            label="Order ID"
            name="order_id"
            value={orderToClose || ""}
            onChange={(e) => handleSelectOrderToClose(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleCloseOrder} fullWidth sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderList;

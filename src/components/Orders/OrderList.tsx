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
  const [openDetailsModal, setOpenDetailsModal] = useState(false); // Добавлено состояние для модального окна деталей
  const [newOrderData, setNewOrderData] = useState({
    spot_id: "",
    value: "",
  });
  const [orderToClose, setOrderToClose] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null); // Для хранения информации о выбранном заказе

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
      const token = sessionStorage.getItem("token");
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
          value: parseFloat(value)
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
      <Paper className="paper-container">
        <Typography variant="h3" align="center" gutterBottom>
          Orders
        </Typography>
        <Box
          className="order-buttons"
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            mt: 5, // отступ сверху
            mb: 2, // отступ снизу
          }}
        >
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
                  <TableCell>Value</TableCell>
                  <TableCell>Timestamp</TableCell>
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
          }}
        >
          <Typography variant="h6" gutterBottom>
            Close Order
          </Typography>
          <TextField
            label="Order ID to Close"
            value={orderToClose || ""}
            onChange={(e) => setOrderToClose(parseInt(e.target.value, 10))}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="secondary" onClick={handleCloseOrder} fullWidth sx={{ mt: 2 }}>
            Confirm Close
          </Button>
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
          }}
        >
          {orderDetails && (
            <>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Typography variant="body1">ID: {orderDetails.id}</Typography>
              <Typography variant="body1">Value: {orderDetails.value}</Typography>
              <Typography variant="body1">
                Timestamp: {new Date(orderDetails.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1">Status: {orderDetails.is_closed ? "Closed" : "Open"}</Typography>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDetailsModal}
            fullWidth
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderList;

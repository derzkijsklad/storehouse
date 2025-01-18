/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { fetchOrders, createOrder, closeOrder, Order } from "../../api/orders"; 
import "./Orders.css";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState<string>("");

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
      const newOrder = await createOrder({ container_id: 1, product_name: "New Product", quantity: 10 });
      setOrders([newOrder, ...orders]);
    } catch (error) {
      setError("Failed to create order");
    }
  };

  const handleCloseOrder = async (orderId: number) => {
    try {
      await closeOrder({ id: orderId });
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      setError("Failed to close order");
    }
  };

  return (
    <Box className="app-container">
      <Paper className="paper-container">
        <Typography variant="h3" align="center" gutterBottom>
          Orders
        </Typography>
        <Box className="order-buttons">
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateOrder}
            sx={{ width: "150px" }}
          >
            Create Order
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleCloseOrder(orders[0]?.id)}
            sx={{ width: "150px" }}
          >
            Close Order
          </Button>
          <Link to="/statistics">
            <Button
              variant="contained"
              color="success"
              sx={{ width: "200px" }}
            >
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
    </Box>
  );
};

export default OrderList;

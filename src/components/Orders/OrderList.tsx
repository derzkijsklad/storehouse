/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import "./Orders.css";

type Order = {
  id: number;
  product_name: string;
  created_at: string;
};

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      product_name: "Product A",
      created_at: "2023-11-01T12:34:56Z",
    },
    {
      id: 2,
      product_name: "Product b",
      created_at: "2023-12-01T12:34:56Z",
    },
    {
      id: 3,
      product_name: "Product c",
      created_at: "2023-10-01T12:34:56Z",
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            onClick={() => console.log("Create Order")}
            sx={{ width: "150px" }}
          >
            Create Order
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => console.log("Close Order")}
            sx={{ width: "150px" }}
          >
            Close Order
          </Button>
        </Box>
      </Paper>

      <Box className="table-container">
        <Paper className="table-paper">
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Created At</TableCell>
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

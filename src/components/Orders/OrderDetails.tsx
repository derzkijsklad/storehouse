/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { fetchOrders, Order } from "../../api/orders"; 

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        if (!id) {
          setError("Order ID is missing");
          return;
        }
        const orders = await fetchOrders({}); 
        const foundOrder = orders.find((order) => order.id === parseInt(id, 10)); 

        if (!foundOrder) {
          setError(`Order with ID ${id} not found`);
          return;
        }

        setOrder(foundOrder); 
      } catch (err) {
        setError("Failed to load order details");
      }
    };

    loadOrderDetails();
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!order) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4">Order #{order.id}</Typography>
      <Typography>Spot ID: {order.spot_id}</Typography>
      <Typography>Value: {order.value}</Typography>
      <Typography>Status: {order.is_closed ? "Closed" : "Open"}</Typography>
      <Typography>
        Created At: {new Date(order.timestamp).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default OrderDetails;
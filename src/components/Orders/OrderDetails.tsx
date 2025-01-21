import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { fetchOrderDetails } from "../../api/orders";
import type { OrderDetails as OrderDetailsType } from "../../api/orders"; 

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailsType | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        if (!id) {
          setError("Order ID is missing");
          return;
        }
        const data = await fetchOrderDetails(id);
        setOrder(data);
      } catch {
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
      <Typography>Status: {order.order_status}</Typography>
      <Typography>Created At: {new Date(order.created_at).toLocaleString()}</Typography>
      <Typography>
        Closed At: {order.closed_at ? new Date(order.closed_at).toLocaleString() : "Not Closed"}
      </Typography>
      <Typography variant="h5">Items</Typography>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name}: {item.quantity}
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default OrderDetails;

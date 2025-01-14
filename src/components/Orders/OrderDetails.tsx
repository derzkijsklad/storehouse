import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, CircularProgress, Box } from "@mui/material";

interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderDetailsProps {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const fetchOrderDetails = async (id: string): Promise<OrderDetailsProps> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        status: "Shipped",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          { name: "Product A", quantity: 2 },
          { name: "Product B", quantity: 1 },
        ],
      });
    }, 1000);
  });
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailsProps | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(id!);
        setOrder(data);
      } catch {
        setError("Failed to load order details");
      }
    };

    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!order) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4">Order #{order.id}</Typography>
      <Typography>Status: {order.status}</Typography>
      <Typography>Created At: {new Date(order.createdAt).toLocaleString()}</Typography>
      <Typography>Updated At: {new Date(order.updatedAt).toLocaleString()}</Typography>
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

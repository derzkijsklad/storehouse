/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, CircularProgress, Grid, Box } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrderList = () => {
  const { isDarkMode } = useTheme(); 
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const ordersData: Order[] = [
          { id: "1", status: "Pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "2", status: "Shipped", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "3", status: "Delivered", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];

        const sortedOrders = ordersData.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(sortedOrders);
      } catch (err) {
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <div className="error-message">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#121212' : '#ffffff', 
    }}>
      <Box sx={{
        textAlign: 'center',
        width: '100%',
        paddingTop: '50px',
        color: isDarkMode ? 'white' : 'black', 
      }}>
        <Typography variant="h3" gutterBottom>
          Orders
        </Typography>
        {orders.length === 0 ? (
          <Typography>No orders available.</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      Order #{order.id} - {order.status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Created: {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                    <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" color="primary">
                        View Details
                      </Typography>
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default OrderList;

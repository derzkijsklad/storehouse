/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrderDetails } from "../../services/api";

interface OrderDetailsProps {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: { name: string; quantity: number }[];
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailsProps | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(id!);
        setOrder(data as OrderDetailsProps); 
      } catch (err) {
        setError("Failed to load order details");
      }
    };
    loadOrderDetails();
  }, [id]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!order) {
    return <p>Loading order details...</p>;
  }

  return (
    <div className="order-details">
      <h2>Order #{order.id}</h2>
      <p>Status: {order.status}</p>
      <p>Created At: {order.createdAt}</p>
      <p>Updated At: {order.updatedAt}</p>
      <h3>Items</h3>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name}: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;

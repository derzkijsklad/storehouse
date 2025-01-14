import { Routes, Route } from "react-router-dom";
import OrderList from "./OrderList";
import OrderDetails from "./OrderDetails";

const Orders = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path=":id" element={<OrderDetails />} />
      </Routes>
    </div>
  );
};

export default Orders;

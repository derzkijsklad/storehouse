import { Routes, Route } from "react-router-dom";
import { Box, Button } from "@mui/material";
import OrderList from "../OrderList";
import OrderDetails from "../OrderDetails";
import { useTheme } from "../../../context/ThemeContext";

const Orders = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        paddingTop: "20px",
        position: "relative",
        backgroundColor: isDarkMode ? "#121212" : "#fff",
      }}
    >
      <Button
        onClick={toggleTheme}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          padding: "10px 20px",
          backgroundColor: "#444",
          color: "white",
          borderRadius: "5px",
          zIndex: 1000,
        }}
        variant="contained"
        size="small"
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </Button>

      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path=":id" element={<OrderDetails />} />
      </Routes>
    </Box>
  );
};

export default Orders;

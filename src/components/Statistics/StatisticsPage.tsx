/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getStatistics } from "../../api/statistics";
import './StatisticsPage.css';

interface Order {
  id: number;
  spot_id: string;
  value: number;
  is_closed: boolean;
  timestamp: string; // Ожидаем timestamp в формате ISO 8601
}

interface StatisticsItem {
  date: string;
  totalOrders: number;
  closedOrders: number;
  openOrders: number;
  totalAmount: number;
  avgProcessingTime: number;
}

const StatisticsPage: React.FC = () => {
  const [data, setData] = useState<StatisticsItem[]>([]);
  const [error, setError] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStatistics();
        const orders = result as unknown as Order[];
        const processedData = processOrdersData(orders);
        setData(processedData);
        setLoading(false);
      } catch (error) {
        setError("Error fetching statistics data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processOrdersData = (orders: Order[]): StatisticsItem[] => {
    const groupedByDate: Record<string, StatisticsItem> = {};

    orders.forEach(order => {
      const orderDate = new Date(order.timestamp);
      const dateString = orderDate.toLocaleDateString(); 
      
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = {
          date: dateString,
          totalOrders: 0,
          closedOrders: 0,
          openOrders: 0,
          totalAmount: 0,
          avgProcessingTime: 0
        };
      }

      const stats = groupedByDate[dateString];
      stats.totalOrders += 1;
      stats.totalAmount += order.value;

      if (order.is_closed) {
        stats.closedOrders += 1;
        const createdAt = new Date(order.timestamp).getTime();
        const currentTime = new Date().getTime();
        const processingTime = currentTime - createdAt;
        stats.avgProcessingTime += processingTime;
      } else {
        stats.openOrders += 1;
      }
    });

    Object.values(groupedByDate).forEach(item => {
      if (item.closedOrders > 0) {
        item.avgProcessingTime = item.avgProcessingTime / item.closedOrders;
      } else {
        item.avgProcessingTime = 0;  
      }
    });

    return Object.values(groupedByDate);
  };

  const formatTime = (timeInMillis: number): string => {
    const hours = Math.floor(timeInMillis / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMillis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMillis % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const totalOrders = data.reduce((acc, item) => acc + item.totalOrders, 0);
  const closedOrders = data.reduce((acc, item) => acc + item.closedOrders, 0);
  const openOrders = data.reduce((acc, item) => acc + item.openOrders, 0);

  const pieData = [
    { name: "Open Orders", value: openOrders },
    { name: "Closed Orders", value: closedOrders }
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <Box className="statistics-page">
      <Typography variant="h4" className="statistics-title">Orders Statistics</Typography>

      {error && <Typography color="error">{error}</Typography>}

      {loading ? (
        <Typography>Loading data...</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Orders by Date</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Total Orders</TableCell>
                        <TableCell>Closed Orders</TableCell>
                        <TableCell>Open Orders</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Avg Processing Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((item) => (
                        <TableRow key={item.date}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.totalOrders}</TableCell>
                          <TableCell>{item.closedOrders}</TableCell>
                          <TableCell>{item.openOrders}</TableCell>
                          <TableCell>{item.totalAmount}</TableCell>
                          <TableCell>{formatTime(item.avgProcessingTime)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Order Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openOrders" fill="#8884d8" />
                  <Bar dataKey="closedOrders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Orders by Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Orders Average Processing Time</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgProcessingTime" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatisticsPage;

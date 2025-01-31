/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getStatistics } from "../../api/statistics";
import './StatisticsPage.css';

interface Order {
  id: number;
  spot_id: number;
  value: number;
  is_closed: boolean;
  created_at: string;
  timestamp: string;
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
        
        // Преобразуем данные в нужный формат
        const statisticsData = processOrdersData(result as unknown as Order[]);
        setData(statisticsData);  
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
      const date = new Date(order.created_at).toLocaleDateString(); // Группировка по дате

      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date: date,
          totalOrders: 0,
          closedOrders: 0,
          openOrders: 0,
          totalAmount: 0,
          avgProcessingTime: 0
        };
      }

      const stats = groupedByDate[date];
      stats.totalOrders += 1;
      stats.totalAmount += order.value;

      if (order.is_closed) {
        stats.closedOrders += 1;
        // Вычисление среднего времени обработки только для закрытых ордеров
        const processingTime = new Date(order.timestamp).getTime() - new Date(order.created_at).getTime();
        stats.avgProcessingTime += processingTime;
      } else {
        stats.openOrders += 1;
      }
    });

    // Рассчитываем среднее время обработки
    Object.values(groupedByDate).forEach(item => {
      if (item.closedOrders > 0) {
        item.avgProcessingTime = item.avgProcessingTime / item.closedOrders;
      }
    });

    return Object.values(groupedByDate);
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
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalOrders" stroke="#8884d8" />
                  <Line type="monotone" dataKey="closedOrders" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="openOrders" stroke="#ff8042" />
                </LineChart>
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

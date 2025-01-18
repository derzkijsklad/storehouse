/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getStatistics } from "../../api/statistics";
import './StatisticsPage.css';

const StatisticsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStatistics();
        setData(result as any[]);  
        setLoading(false);
      } catch (error) {
        setError("Error fetching statistics data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { name: "New Orders", value: data.reduce((acc, item) => acc + item.new, 0) },
    { name: "Processed Orders", value: data.reduce((acc, item) => acc + item.processed, 0) }
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
              <Typography variant="h6" className="chart-title">Orders by Month</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Orders Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" fill="#8884d8" />
                  <Bar dataKey="processed" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="chart-paper">
              <Typography variant="h6" className="chart-title">Order Types</Typography>
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
              <Typography variant="h6" className="chart-title">Average Processing Time by Month</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
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

// StockChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const apiKey = 'C8WRDELIXK9M3WFT'; // Your Alpha Vantage API Key

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'TIME_SERIES_DAILY_ADJUSTED',
            symbol: symbol,
            apikey: apiKey,
          },
        });

        const data = response.data['Time Series (Daily)'];
        const dates = Object.keys(data).slice(0, 30); // Get the last 30 days of data
        const prices = dates.map((date) => parseFloat(data[date]['4. close']));

        setChartData({
          labels: dates.reverse(),
          datasets: [
            {
              label: `${symbol} Price`,
              data: prices.reverse(),
              fill: false,
              backgroundColor: 'rgba(0, 223, 154, 0.5)',
              borderColor: 'rgba(0, 223, 154, 1)',
              tension: 0.1,
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [symbol]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-[#00df9a] mb-4">{symbol} Stock Price Chart</h2>
      <Line data={chartData} options={{
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
              color: '#00df9a',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Price (USD)',
              color: '#00df9a',
            },
          },
        },
      }} />
    </div>
  );
};

export default StockChart;

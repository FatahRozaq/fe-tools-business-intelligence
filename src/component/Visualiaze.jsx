import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config";

const VisualisasiChart = ({ requestPayload, selectedColors }) => {
  const [chartData, setChartData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!requestPayload?.query) {
        setStatus({ loading: false, error: "Query tidak boleh kosong." });
        return;
      }

      setStatus({ loading: true, error: null });

      try {
        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;

        if (!Array.isArray(data) || data.length === 0)
          throw new Error("Data kosong atau format tidak sesuai.");

        const [firstRow] = data;
        const keys = Object.keys(firstRow);

        if (keys.length < 2) throw new Error("Data harus memiliki minimal dua kolom.");

        const [labelKey, ...valueKeys] = keys;
        const categories = data.map(item => item[labelKey]);
        const chartType = requestPayload.chartType || "bar";

        const parseValue = val => (typeof val === "number" ? val : parseFloat(val)) || 0;

        const series = (chartType === "pie" || chartType === "donut")
          ? data.map(item => parseValue(item[valueKeys[0]]))
          : valueKeys.map(key => ({
              name: key,
              data: data.map(item => parseValue(item[key])),
            }));

            const options = {
              chart: { id: "visualisasi-chart" },
              colors: selectedColors || ["#4CAF50", "#FF9800", "#2196F3"],
              ...(chartType === "pie" || chartType === "donut"
                ? { labels: categories }
                : { xaxis: { categories } }),
            };

        setChartData({ series: Array.isArray(series) ? series : [series], options });
        setStatus({ loading: false, error: null });
      } catch (err) {
        console.error("Error:", err);
        setStatus({
          loading: false,
          error: err.response?.data?.message || err.message || "Terjadi kesalahan.",
        });
      }
    };

    fetchData();
  }, [requestPayload, selectedColors]);

  if (status.loading) return <div className="p-4">Loading...</div>;
  if (status.error) return <div className="p-4 text-danger">Error: {status.error}</div>;
  if (!chartData?.series?.length) return <div className="p-4 text-warning">Data tidak cukup untuk ditampilkan.</div>;

  return (
    <div className="p-4">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type={requestPayload.chartType || "bar"}
        height={350}
      />
    </div>
  );
};

export default VisualisasiChart;

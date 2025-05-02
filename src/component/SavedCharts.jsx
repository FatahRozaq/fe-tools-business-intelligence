import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import VisualisasiChart from "./Visualiaze";
import DataTableComponent from "./DataTableComponent";

const SavedCharts = ({ onCanvasUpdate }) => {
  const [savedCharts, setSavedCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedCharts();
  }, []);

  const fetchSavedCharts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/charts`);
      
      if (response.data && response.data.data) {
        setSavedCharts(response.data.data);
      } else {
        setSavedCharts([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching saved charts:", err);
      setError("Failed to load saved charts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading saved charts...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;
  if (savedCharts.length === 0) return <div className="p-4">No saved charts found.</div>;

  return (
    <div>
      {savedCharts.map((chart) => (
        <div key={chart.id_chart}>
          {/* You could add additional UI or functionality here if needed */}
        </div>
      ))}
    </div>
  );
};

export default SavedCharts;
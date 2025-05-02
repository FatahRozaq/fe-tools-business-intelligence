import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config";

const Visualisasi = ({ requestPayload, visualizationType, visualizationConfig }) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [savedVisualizationId, setSavedVisualizationId] = useState(null);

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
        const currentVisualizationType = visualizationType || requestPayload.visualizationType || "bar";

        const parseValue = val => {
          const parsed = typeof val === "number" ? val : parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Get colors from visualizationConfig or use defaults
        const colors = visualizationConfig?.colors || ["#4CAF50", "#FF9800", "#2196F3"];

        let series;
        if (currentVisualizationType === "pie" || currentVisualizationType === "donut") {
          // For pie/donut: each category gets one value
          // Use the first value column only
          series = data.map(item => parseValue(item[valueKeys[0]]));
        } else {
          // For other charts: each value column gets a series
          series = valueKeys.map(key => ({
            name: key,
            data: data.map(item => parseValue(item[key])),
            color: colors[valueKeys.indexOf(key) % colors.length]
          }));
        }

        const visualizationOptions = {
          visualization: {
            id: "visualisasi",
            background: visualizationConfig?.backgroundColor || "#ffffff",
            fontFamily: visualizationConfig?.fontFamily || "Arial",
            foreColor: visualizationConfig?.fontColor || "#333",
          },
          colors: colors,
          title: {
            text: visualizationConfig?.title || "Visualisasi Data",
            align: "center",
            style: {
              fontSize: `${visualizationConfig?.titleFontSize || 16}px`,
              fontFamily: visualizationConfig?.titleFontFamily || "Arial",
              color: visualizationConfig?.fontColor || "#333",
            },
          },
          grid: {
            borderColor: visualizationConfig?.gridColor || "#E0E0E0",
          },
          fill: {
            type: visualizationConfig?.pattern === "striped" ? "pattern" : "solid",
            pattern: {
              style: visualizationConfig?.pattern === "dotted" ? "circles" : 
                    visualizationConfig?.pattern === "striped" ? "horizontalLines" : undefined,
            }
          },
          legend: {
            fontSize: `${visualizationConfig?.fontSize || 14}px`,
            fontFamily: visualizationConfig?.fontFamily || "Arial",
          }
        };

        // visualization type specific options
        if (currentVisualizationType === "pie" || currentVisualizationType === "donut") {
          // For pie/donut visualizations
          visualizationOptions.labels = categories;
          visualizationOptions.plotOptions = {
            [currentVisualizationType]: {
              colors: colors,
              dataLabels: {
                style: {
                  fontSize: `${visualizationConfig?.fontSize || 14}px`,
                  fontFamily: visualizationConfig?.fontFamily || "Arial",
                  colors: [visualizationConfig?.fontColor || "#333"]
                }
              }
            }
          };
        } else {
          // For bar/line visualizations
          visualizationOptions.xaxis = {
            categories,
            labels: {
              style: {
                fontSize: `${visualizationConfig?.xAxisFontSize || 12}px`,
                fontFamily: visualizationConfig?.xAxisFontFamily || "Arial",
              }
            }
          };
          
          visualizationOptions.yaxis = {
            labels: {
              style: {
                fontSize: `${visualizationConfig?.yAxisFontSize || 12}px`,
                fontFamily: visualizationConfig?.yAxisFontFamily || "Arial",
              }
            }
          };
        }

        const visualizationPayload = {
          series: currentVisualizationType === "pie" || currentVisualizationType === "donut" ? series : series,
          options: visualizationOptions,
        };

        setVisualizationData(visualizationPayload);
        setStatus({ loading: false, error: null });

        // Prepare visualization config for saving
        const visualizationConfigToSave = {
          colors: colors,
          background: visualizationConfig?.backgroundColor,
          title: visualizationConfig?.title,
          fontSize: visualizationConfig?.fontSize,
          fontFamily: visualizationConfig?.fontFamily,
          visualizationOptions: visualizationOptions,
        };

        // Initial save of visualization data
        // Position and size will be updated by the Canvas component
        const saveResponse = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, {
          id_canvas: 1,
          id_datasource: requestPayload.id_datasource || 1,
          name: requestPayload.name || visualizationConfig?.title || "Visual",
          visualization_type: currentVisualizationType,
          query: requestPayload.query,
          config: visualizationConfigToSave,
          // No position or size here, as Canvas component will handle these
        });

        // Store Visualization ID for possible future updates
        if (saveResponse.data?.data?.id) {
          setSavedVisualizationId(saveResponse.data.data.id);
        }

      } catch (err) {
        console.error("Error:", err);
        setStatus({
          loading: false,
          error: err.response?.data?.message || err.message || "Terjadi kesalahan.",
        });
      }
    };

    fetchData();
  }, [requestPayload, visualizationType, visualizationConfig]);

  if (status.loading) return <div className="p-4">Loading...</div>;
  if (status.error) return <div className="p-4 text-danger">Error: {status.error}</div>;
  if (!visualizationData) return <div className="p-4 text-warning">Data tidak cukup untuk ditampilkan.</div>;

  // Format data for the visualization component based on visualization type
  const visualizationProps = {
    options: visualizationData.options,
    height: 350
  };

  // Different series format for different visualization types
  if (visualizationType === "pie" || visualizationType === "donut") {
    // For pie/donut visualizations
    visualizationProps.series = visualizationData.series;
    visualizationProps.type = visualizationType;
  } else {
    // For bar/line visualizations
    visualizationProps.series = visualizationData.series;
    visualizationProps.type = visualizationType || requestPayload.visualizationType || "bar";
  }

  return (
    <div className="p-4">
      <Chart {...visualizationProps} />
    </div>
  );
};

export default Visualisasi;
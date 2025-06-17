import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarDiagram from "./SidebarDiagram/SidebarDiagram";
import SidebarData from "./SidebarData";
import config from "../config";
import SidebarDatasource from "./SidebarDatasource";
import AddDatasource from "./AddDataSource";
import Canvas from "./Canvas";
import SidebarQuery from "./SidebarQuery";
import { AiOutlineDatabase } from "react-icons/ai";
import { GrDatabase } from "react-icons/gr";

const Sidebar = ({}) => {
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddDatasource, setShowAddDatasource] = useState(false);
  const [canvasData, setCanvasData] = useState([]);
  const [canvasQuery, setCanvasQuery] = useState("");
  const [visualizationType, setVisualizationType] = useState("");

  // console.log(visualizationType);
  
  // Default configuration for new visualizations
  const defaultVisualizationConfig = {
    colors: ["#4CAF50", "#FF9800", "#2196F3"],
    
    // Title settings
    title: "Visualisasi Data",
    titleFontSize: 18,
    titleFontFamily: "Arial",
    titlePosition: "center",
    titleBackgroundColor: "#ffffff",
    
    // Font settings
    fontSize: 14,
    fontFamily: "Arial",
    fontColor: "#000000",
    
    // Grid settings
    gridColor: "#E0E0E0",
    gridType: "solid",
    
    // Background settings
    backgroundColor: "#ffffff",
    
    // Axis settings
    xAxisFontSize: 12,
    xAxisFontFamily: "Arial",
    xAxisFontColor: "#000000",
    
    yAxisFontSize: 12,
    yAxisFontFamily: "Arial",
    yAxisFontColor: "#000000",
    
    // Pattern settings
    pattern: "solid",
    
    // Category title settings
    categoryTitle: "Kategori",
    categoryTitleFontSize: 14,
    categoryTitleFontFamily: "Arial",
    categoryTitleFontColor: "#000000",
    categoryTitlePosition: "center",
    
    // Value display settings
    valuePosition: "top",
    valueFontColor: "#000000"
  };

  const [visualizationConfig, setVisualizationConfig] = useState(defaultVisualizationConfig);

  // Add a state to track the selected visualization for configuration
  const [selectedVisualization, setSelectedVisualization] = useState(null);

  // Add a new state to track whether we should add a new visualization
  const [addNewVisualization, setAddNewVisualization] = useState(false);

  useEffect(() => {
    const sidebarData = document.getElementById("sidebar-data");
    const sidebarDiagram = document.getElementById("sidebar-diagram");
    const sidebarQuery = document.getElementById("sidebar-query");

    if (sidebarData && sidebarDiagram && sidebarQuery) {
      sidebarData.style.display = "block";
      sidebarDiagram.style.display = "none";
      sidebarQuery.style.display = "none";
    }

    const pilihDataBtn = document.getElementById("menu-data");
    const pilihVisualisasiBtn = document.getElementById("menu-visualisasi");
    const pilihQueryBtn = document.getElementById("menu-query");

    if (pilihDataBtn && pilihVisualisasiBtn && pilihQueryBtn) {
      pilihDataBtn.addEventListener("click", () => {
        sidebarData.style.display = "block";
        sidebarDiagram.style.display = "none";
        sidebarQuery.style.display = "none";
      });

      pilihVisualisasiBtn.addEventListener("click", () => {
        sidebarDiagram.style.display = "block";
        sidebarQuery.style.display = "none";
        sidebarData.style.display = "none";
      });

      pilihQueryBtn.addEventListener("click", () => {
        sidebarQuery.style.display = "block";
        sidebarData.style.display = "none";
        sidebarDiagram.style.display = "none";
      });
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-table/1`)
      .then((response) => {
        setTables(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data tabel:", error);
        setLoading(false);
      });
  }, []);

  const fetchColumns = (table) => {
    if (columns[table]) return;

    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-column/${table}`)
      .then((response) => {
        setColumns((prev) => ({ ...prev, [table]: response.data.data }));
      })
      .catch((error) => {
        console.error(`Gagal mengambil kolom untuk tabel ${table}:`, error);
      });
  };

  const handleQuerySubmit = (query) => {
    setCanvasQuery(query);
    // Reset configuration to default for new visualizations
    setVisualizationConfig({...defaultVisualizationConfig});
    // Set the flag to true to indicate that a new visualization should be created
    setAddNewVisualization(true);
    // Clear selected visualization when creating a new one
    setSelectedVisualization(null);
  };

  // Reset the visualization type and query after a new visualization is added
  useEffect(() => {
    if (addNewVisualization && canvasQuery && visualizationType) {
      // Reset the flag after the visualization has been created
      setTimeout(() => {
        setAddNewVisualization(false);
        // Clear the inputs to prepare for a new visualization
        setCanvasQuery("");
        setVisualizationType("");
      }, 500);
    }
  }, [addNewVisualization, canvasQuery, visualizationType]);

  const handleVisualizationTypeChange = (type) => {
    setVisualizationType(type);
    // If we already have a query, this means we should create a new visualization
    if (canvasQuery) {
      setAddNewVisualization(true);
    }
  };

  // Handle visualization selection for configuration
  const handleVisualizationSelect = (visualization) => {
    setSelectedVisualization(visualization);
    if (visualization) {
      // Update the configuration panel with the selected visualization's config
      // Use the visualization's existing config or default if not available
      setVisualizationConfig(visualization.config || {...defaultVisualizationConfig});
    } else {
      // If no visualization is selected, reset to default config
      setVisualizationConfig({...defaultVisualizationConfig});
    }
  };

  // Handle updating configuration for the selected visualization
  const handleConfigUpdate = (config) => {
    setVisualizationConfig(config);
    
    // If a visualization is selected, update its configuration
    if (selectedVisualization) {
      // This will pass the updated config to the Canvas component
      selectedVisualization.config = config;
    }
  };

  return (
    <>
      
      {loading ? (
        <div className="alert alert-info">Loading...</div>
      ) : showAddDatasource ? (
        <AddDatasource />
      ) : tables.length === 0 ? (
        <SidebarDatasource
          onTambahDatasource={() => setShowAddDatasource(true)}
        />
      ) : (
        <div id="sidebar" className="sidebar">
          <div className="sub-title">
            <GrDatabase size={48} className="text-muted"/>
            <span className="sub-text">Datasources</span>
          </div>
          <hr className="full-line" />

          <div className="accordion" id="tableAccordion">
            {tables.map((table, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading-${index}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${index}`}
                    onClick={() => {
                      setSelectedTable(table);
                      fetchColumns(table);
                    }}
                  >
                    {table}
                  </button>
                </h2>
                <div
                  id={`collapse-${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${index}`}
                  data-bs-parent="#tableAccordion"
                >
                  <div className="column-container">
                    {columns[table] ? (
                      columns[table].map((col, colIndex) => (
                        <div
                          key={colIndex}
                          className="column-card"
                          draggable={true}
                          onDragStart={(event) => {
                            const columnData = {
                              columnName: col.name,
                              tableName: table,
                            };
                            event.dataTransfer.setData(
                              "text/plain",
                              JSON.stringify(columnData)
                            );
                          }}
                        >
                          <span className="column-icons">
                            {col.type.includes("int") ||
                            col.type.includes("numeric") ||
                            col.type.includes("float") ||
                            col.type.includes("double") ||
                            col.type.includes("decimal")
                              ? "123"
                              : col.type.includes("char") ||
                                col.type.includes("text") ||
                                col.type.includes("string")
                              ? "ABC"
                              : col.type.includes("date") ||
                                col.type.includes("time") ||
                                col.type.includes("timestamp")
                              ? "DATE"
                              : "🔗"}
                          </span>
                          {col.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Loading...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SidebarData
        setCanvasData={setCanvasData}
        selectedTable={selectedTable}
        setCanvasQuery={handleQuerySubmit}
        onVisualizationTypeChange={handleVisualizationTypeChange}
      />
      <SidebarDiagram 
        onVisualizationTypeChange={handleVisualizationTypeChange}
        onVisualizationConfigChange={handleConfigUpdate}
        selectedVisualization={selectedVisualization}
        visualizationConfig={visualizationConfig}
      />
      <SidebarQuery 
        onQuerySubmit={handleQuerySubmit} 
        onVisualizationTypeChange={handleVisualizationTypeChange}/>
      <Canvas 
        data={canvasData} 
        query={addNewVisualization ? canvasQuery : ""} 
        visualizationType={addNewVisualization ? visualizationType : ""} 
        visualizationConfig={visualizationConfig}
        onVisualizationSelect={handleVisualizationSelect}
        selectedVisualization={selectedVisualization}
      />
    </>
  );
};

export default Sidebar;
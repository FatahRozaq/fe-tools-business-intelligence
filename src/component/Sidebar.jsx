import React, { useState, useEffect, useRef } from "react";
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
import { DEFAULT_CONFIG } from "./SidebarDiagram/ConfigConstants"; 
import Header from "./Header";
import SidebarCanvas from "./SidebarCanvas";
import Visualiaze from "./Visualiaze";

const Sidebar = ({userAccessLevel}) => {
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddDatasource, setShowAddDatasource] = useState(false);
  const [canvasData, setCanvasData] = useState([]);
  const [canvasQuery, setCanvasQuery] = useState("");
  const [visualizationType, setVisualizationType] = useState("");
  const visualizationTypeRef = useRef(visualizationType);
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);
  const [canvases, setCanvases] = useState([]);
  const [currentCanvasId, setCurrentCanvasId] = useState(0);
  const [totalCanvasCount, setTotalCanvasCount] = useState(0);
  const [visualizationConfig, setVisualizationConfig] = useState({ ...DEFAULT_CONFIG });
  // Add a state to track the selected visualization for configuration
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  // Add a new state to track whether we should add a new visualization
  const [addNewVisualization, setAddNewVisualization] = useState(false);
  const canEdit = userAccessLevel === 'admn' || userAccessLevel === 'edit';

  const [activeSidebar, setActiveSidebar] = useState('data');

const handleMenuClick = (menu) => {
    if (canEdit) {
      // 'visualisasi' dari ID tombol di-map ke 'diagram' untuk nama komponen
      const menuMap = {
        'data': 'data',
        'visualisasi': 'diagram',
        'query': 'query',
        'canvas': 'canvas'
      };
      setActiveSidebar(menuMap[menu] || 'data');
    }
  };

  useEffect(() => {
    if (canEdit){
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
    }
  }, [canEdit]);

  const fetchColumns = (table) => {
    if (columns[table] || !canEdit) return;

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
    if (!canEdit) return;
    setCanvasQuery(query);
    setVisualizationConfig({ ...DEFAULT_CONFIG }); 
    setAddNewVisualization(true);
    setSelectedVisualization(null);
  };

  // Reset the visualization type and query after a new visualization is added
  useEffect(() => {
    if (addNewVisualization && canvasQuery && visualizationType) {
      setTimeout(() => {
        setAddNewVisualization(false);
        setCanvasQuery("");
        setVisualizationType("");
      }, 500);
    }
  }, [addNewVisualization, canvasQuery, visualizationType]);

  const handleVisualizationTypeChange = (type) => {
    if (!canEdit) return;
    visualizationTypeRef.current = type;
    setVisualizationType(type);
    
    // Only update if there's a selected visualization
    if (selectedVisualization && canvasQuery) {
        // Update the selected visualization's type
        updateSelectedVisualizationType(type);
    } else if (canvasQuery && !selectedVisualization) {
        // This is for creating a new visualization when none is selected
        setAddNewVisualization(true);
    }
};

// New function to update only the selected visualization
const updateSelectedVisualizationType = (newType) => {
    if (!selectedVisualization) return;

    // Update the canvases state to modify only the selected visualization
    setCanvases(prevCanvases => 
        prevCanvases.map(canvas => 
            canvas.id === currentCanvasId 
                ? {
                    ...canvas,
                    visualizations: canvas.visualizations.map(viz => 
                        viz.id === selectedVisualization.id 
                            ? { ...viz, type: newType }
                            : viz
                    )
                }
                : canvas
        )
    );

    // Update the selectedVisualization state to reflect the change
    setSelectedVisualization(prev => ({
        ...prev,
        type: newType
    }));
};

// Sync ref with state
useEffect(() => {
    visualizationTypeRef.current = visualizationType;
    console.log(`Visualization type updated: ${visualizationType}`);
}, [visualizationType]);

// Handle visualization selection for configuration
const handleVisualizationSelect = (visualization) => {
  if (!canEdit) return;
    setSelectedVisualization(visualization);
    if (visualization) {
        setVisualizationConfig(visualization.config || { ...DEFAULT_CONFIG });
        // Set the visualization type to match the selected visualization
        setVisualizationType(visualization.type || "");
    } else {
        setVisualizationConfig({ ...DEFAULT_CONFIG });
        setVisualizationType("");
    }
};

  // Handle updating configuration for the selected visualization
  const handleConfigUpdate = (config) => {
    if (!canEdit) return;
    setVisualizationConfig(config);

    // If a visualization is selected, update its configuration
    if (selectedVisualization) {
      setSelectedVisualization(prev => ({
        ...prev,
        config: { ...config }
      }));
    }
  };

   useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases); // Update canvases state
          setTotalCanvasCount(activeCanvases.length);
        } else {
          console.error("Failed to fetch canvases:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching canvases:", error);
      });
  }, []);

  return (
    <>
    {canEdit && (
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
            <GrDatabase size={48} className="text-muted" />
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

      <Header
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex} // Pass setter to Header
        canvases={canvases}  // Pass canvases as a prop
        setCanvases={setCanvases}  // Pass setCanvases to Header component
        setCurrentCanvasId={setCurrentCanvasId}
        totalCanvasCount={totalCanvasCount}
        userAccessLevel={userAccessLevel}
        onMenuClick={handleMenuClick}
      />
      
      <SidebarCanvas
      style={{ display: activeSidebar === 'canvas' ? 'block' : 'none' }}
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        currentCanvasId={currentCanvasId}
        setCurrentCanvasId={setCurrentCanvasId}
        totalCanvasCount={totalCanvasCount}  // Pass the total canvas count
        setTotalCanvasCount={setTotalCanvasCount} // Pass setter to update the count
        userAccessLevel={userAccessLevel}
/>


      <SidebarData
      style={{ display: activeSidebar === 'data' ? 'block' : 'none' }}
        setCanvasData={setCanvasData}
        selectedTable={selectedTable}
        setCanvasQuery={handleQuerySubmit}
        onVisualizationTypeChange={handleVisualizationTypeChange}
      />
      <SidebarDiagram
      style={{ display: activeSidebar === 'diagram' ? 'block' : 'none' }}
        onVisualizationTypeChange={handleVisualizationTypeChange}
        onVisualizationConfigChange={handleConfigUpdate}
        selectedVisualization={selectedVisualization}
        visualizationConfig={visualizationConfig}
      />
      <SidebarQuery
      style={{ display: activeSidebar === 'query' ? 'block' : 'none' }}
        onQuerySubmit={handleQuerySubmit}
        onVisualizationTypeChange={handleVisualizationTypeChange} />
      </>
    )}
        
      <Canvas
        data={canvasData}
        query={addNewVisualization ? canvasQuery : ""}
        visualizationType={addNewVisualization ? visualizationType : ""}
        visualizationConfig={visualizationConfig}
        onVisualizationSelect={handleVisualizationSelect}
        selectedVisualization={selectedVisualization}
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        canvases={canvases}  // Pass canvases to Canvas
        setCanvases={setCanvases}  // Pass setCanvases to Canvas
        currentCanvasId={currentCanvasId}
        setCurrentCanvasId={setCurrentCanvasId}
        onUpdateVisualizationType={updateSelectedVisualizationType}
        userAccessLevel={userAccessLevel}
      />
    </>
  );
};

export default Sidebar;
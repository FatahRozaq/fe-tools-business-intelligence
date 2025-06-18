import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaSync, FaTrash, FaCogs } from "react-icons/fa";
import { InputText } from "primereact/inputtext";
import SidebarDiagram from "./SidebarDiagram/SidebarDiagram";
import SidebarData from "./SidebarData";
import config from "../config";
import SidebarDatasource from "./SidebarDatasource";
import AddDatasource from "./AddDataSource";
import Canvas from "./Canvas";
import SidebarQuery from "./SidebarQuery";
import { GrDatabase } from "react-icons/gr";
import { DEFAULT_CONFIG } from "./SidebarDiagram/ConfigConstants";
import Header from "./Header";
import SidebarCanvas from "./SidebarCanvas";

const Sidebar = () => {
  const [tables, setTables] = useState([]);
  const [groupedTables, setGroupedTables] = useState({});
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
  const [searchQuery, setSearchQuery] = useState("");
  const [processingConnections, setProcessingConnections] = useState({});
  const [currentCanvasId, setCurrentCanvasId] = useState(null);
  const [totalCanvasCount, setTotalCanvasCount] = useState(0);

  const [visualizationConfig, setVisualizationConfig] = useState({
    ...DEFAULT_CONFIG,
  });

  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [addNewVisualization, setAddNewVisualization] = useState(false);

  const [newVisualizationPayload, setNewVisualizationPayload] = useState(null);

  const fetchAllTables = () => {
    setLoading(true);
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-table/1`)
      .then((response) => {
        if (response.data.success && response.data.data) {
          setTables(response.data.data.tables || []);
          setGroupedTables(response.data.data.grouped_tables || {});
        } else {
          setTables([]);
          setGroupedTables({});
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data tabel:", error);
        setLoading(false);
        setTables([]);
        setGroupedTables({});
      });
  };

  useEffect(() => {
    const sidebarData = document.getElementById("sidebar-data");
    const sidebarDiagram = document.getElementById("sidebar-diagram");
    const sidebarQuery = document.getElementById("sidebar-query");
    const sidebarCanvas = document.getElementById("sidebar-canvas");

    const menuData = document.getElementById("menu-data");
    const menuVisualisasi = document.getElementById("menu-visualisasi");

    if (sidebarData && sidebarDiagram && sidebarQuery && sidebarCanvas && menuData && menuVisualisasi) {
      if (selectedVisualization) {
        sidebarData.style.display = "none";
        sidebarDiagram.style.display = "block";
        menuData.classList.remove('active');
        menuVisualisasi.classList.add('active');
      } else {
        sidebarData.style.display = "block";
        sidebarDiagram.style.display = "none";
        menuData.classList.add('active');
        menuVisualisasi.classList.remove('active');
      }
      sidebarQuery.style.display = "none";
      sidebarCanvas.style.display = "none";
    }

    const pilihDataBtn = document.getElementById("menu-data");
    const pilihVisualisasiBtn = document.getElementById("menu-visualisasi");
    const pilihQueryBtn = document.getElementById("menu-query");
    const pilihCanvasBtn = document.getElementById("menu-canvas");
    const tambahDatasourceBtn = document.getElementById("menu-tambah-datasource");

    const menuClickHandler = (showSidebar) => {
      sidebarData.style.display = showSidebar === "data" ? "block" : "none";
      sidebarDiagram.style.display = showSidebar === "diagram" ? "block" : "none";
      sidebarQuery.style.display = showSidebar === "query" ? "block" : "none";
      sidebarCanvas.style.display = showSidebar === "canvas" ? "block" : "none";
    };

    if (pilihDataBtn) pilihDataBtn.addEventListener("click", () => menuClickHandler("data"));
    if (pilihVisualisasiBtn) pilihVisualisasiBtn.addEventListener("click", () => menuClickHandler("diagram"));
    if (pilihQueryBtn) pilihQueryBtn.addEventListener("click", () => menuClickHandler("query"));
    if (pilihCanvasBtn) pilihCanvasBtn.addEventListener("click", () => menuClickHandler("canvas"));
    if (tambahDatasourceBtn) tambahDatasourceBtn.addEventListener("click", () => setShowAddDatasource(true));

  }, [selectedVisualization]);

  useEffect(() => {
    fetchAllTables();
  }, []);

  const handleBuildVisualization = (payload, query, data) => {
    setNewVisualizationPayload(payload);
    setCanvasData(data);
    setCanvasQuery(query);
    setVisualizationConfig({ ...DEFAULT_CONFIG });
    setAddNewVisualization(true);
    setSelectedVisualization(null);
  };

  useEffect(() => {
  if (canvases.length > 0) {
    const savedIndex = parseInt(localStorage.getItem("currentCanvasIndex"));
    const savedId = parseInt(localStorage.getItem("currentCanvasId"));

    const indexMatch = canvases.findIndex(c => c.id === savedId);
    if (!isNaN(savedIndex) && !isNaN(savedId) && indexMatch !== -1) {
      setCurrentCanvasIndex(indexMatch); // gunakan index yang valid dari daftar baru
      setCurrentCanvasId(savedId);
    } else {
      // fallback jika index tidak valid
      setCurrentCanvasIndex(0);
      setCurrentCanvasId(canvases[0].id);
    }
  }
}, [canvases]);

  const handleSaveSuccess = () => {
    setShowAddDatasource(false);
    fetchAllTables();
  };

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
    setVisualizationConfig({ ...DEFAULT_CONFIG });
    setAddNewVisualization(true);
    setSelectedVisualization(null);
  };

  useEffect(() => {
    if (addNewVisualization && canvasQuery && visualizationType) {
      setTimeout(() => {
        setAddNewVisualization(false);
        setCanvasQuery("");
        setVisualizationType("");
        setNewVisualizationPayload(null);
      }, 500);
    }
  }, [addNewVisualization, canvasQuery, visualizationType]);

  const handleVisualizationTypeChange = (type) => {
    visualizationTypeRef.current = type;
    setVisualizationType(type);

    if (selectedVisualization && canvasQuery) {
      updateSelectedVisualizationType(type);
    } else if (canvasQuery && !selectedVisualization) {
      setAddNewVisualization(true);
    }
  };

  const updateSelectedVisualizationType = (newType) => {
    if (!selectedVisualization) return;

    setCanvases((prevCanvases) =>
      prevCanvases.map((canvas) =>
        canvas.id === currentCanvasId
          ? {
              ...canvas,
              visualizations: canvas.visualizations.map((viz) =>
                viz.id === selectedVisualization.id ? { ...viz, type: newType } : viz
              ),
            }
          : canvas
      )
    );
    setSelectedVisualization((prev) => ({ ...prev, type: newType }));
  };

  useEffect(() => {
    visualizationTypeRef.current = visualizationType;
  }, [visualizationType]);

  const handleVisualizationSelect = (visualization) => {
    setSelectedVisualization(visualization);
    if (visualization) {
      setVisualizationConfig(visualization.config || { ...DEFAULT_CONFIG });
      setVisualizationType(visualization.type || "");
    } else {
      setVisualizationConfig({ ...DEFAULT_CONFIG });
      setVisualizationType("");
    }
  };

  const handleConfigUpdate = (config) => {
    setVisualizationConfig(config);
    if (selectedVisualization) {
      setSelectedVisualization((prev) => ({ ...prev, config: { ...config } }));
    }
  };

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases);
          setTotalCanvasCount(activeCanvases.length);
        } else {
          console.error("Failed to fetch canvases:", response.data.message);
        }
      })
      .catch((error) => console.error("Error fetching canvases:", error));
  }, []);

  const handleEtlAction = async (action, connectionName, connectionDetails) => {
    setProcessingConnections(prev => ({ ...prev, [connectionName]: action }));
    try {
      const payload = { ...connectionDetails, connection_name: connectionName };
      await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/etl/${action}`, payload);
      alert(`Datasource '${connectionName}' ${action} successful!`);
      fetchAllTables();
    } catch (error) {
      console.error(`Error during ${action} for ${connectionName}:`, error);
      alert(`Failed to ${action} datasource '${connectionName}'. See console for details.`);
    } finally {
      setProcessingConnections(prev => {
        const newState = { ...prev };
        delete newState[connectionName];
        return newState;
      });
    }
  };

  const handleDelete = async (connectionName) => {
    if (window.confirm(`Are you sure you want to delete the datasource '${connectionName}' and all its data from the warehouse? This action cannot be undone.`)) {
      setProcessingConnections(prev => ({ ...prev, [connectionName]: 'delete' }));
      try {
        await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/etl/delete`, { connection_name: connectionName });
        alert(`Datasource '${connectionName}' deleted successfully!`);
        fetchAllTables();
      } catch (error) {
        console.error(`Error deleting ${connectionName}:`, error);
        alert(`Failed to delete datasource '${connectionName}'. See console for details.`);
      } finally {
        setProcessingConnections(prev => {
          const newState = { ...prev };
          delete newState[connectionName];
          return newState;
        });
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (!window.confirm(`Are you sure you want to run '${action}' for ALL datasources? This may take a long time.`)) {
      return;
    }

    const allConnections = Object.entries(groupedTables);
    for (const [name, data] of allConnections) {
      // Assuming 'data.connection_details' holds the necessary credentials
      if (data.connection_details) {
        await handleEtlAction(action, name, data.connection_details);
      } else {
        alert(`Skipping ${name}: Connection details not found.`);
      }
    }
    alert(`Bulk ${action} process completed for all datasources.`);
  };

  const renderSidebarContent = () => {
    if (loading) {
      return <div className="alert alert-info">Loading...</div>;
    }
    if (showAddDatasource) {
      return (
        <AddDatasource
          onCancel={() => setShowAddDatasource(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      );
    }
    if (Object.keys(groupedTables).length === 0) {
      return <SidebarDatasource onTambahDatasource={() => setShowAddDatasource(true)} />;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filteredGroupedEntries = Object.entries(groupedTables)
      .map(([prefix, groupData]) => {
        const groupNameMatches = prefix.toLowerCase().includes(lowerCaseQuery);
        const matchingTables = groupData.tables.filter(table =>
          table.table_name.toLowerCase().includes(lowerCaseQuery)
        );

        if (groupNameMatches || matchingTables.length > 0) {
          return [prefix, {
            ...groupData,
            tables: groupNameMatches ? groupData.tables : matchingTables
          }];
        }
        return null;
      })
      .filter(Boolean);

    return (
      <div id="sidebar" className="sidebar">
        <div className="sub-title d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <GrDatabase size={48} className="text-muted" />
            <span className="sub-text">Datasources</span>
          </div>
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={() => setShowAddDatasource(true)}
            title="Tambah Datasource Baru"
          >
            <FaPlus />
          </button>
        </div>
        <hr className="full-line" />
        <div className="px-2 my-2 d-flex flex-column gap-2">
            <div className="d-flex justify-content-around gap-2">
              <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  style={{ height: '50px' }}
                  onClick={() => handleBulkAction('refresh')}
              >
                  <FaSync /> Refresh All
              </button>
              <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  style={{ height: '50px' }}
                  onClick={() => handleBulkAction('full-refresh')}
              >
                  <FaSync /> Full Refresh
              </button>
          </div>

            <span className="p-input-icon-left w-100 pl-2">
                <InputText
                className="w-100"
                placeholder="Search datasource/table/column..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </span>
        </div>

        <hr className="full-line" />
        <div className="accordion" id="groupAccordion">
          {filteredGroupedEntries.map(([prefix, groupData], groupIndex) => (
            <div className="accordion-item" key={prefix}>
              <h2 className="accordion-header d-flex align-items-center" id={`group-heading-${groupIndex}`}>
                <button
                  className="accordion-button collapsed flex-grow-1"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#group-collapse-${groupIndex}`}
                  aria-expanded="false"
                  aria-controls={`group-collapse-${groupIndex}`}
                >
                  {prefix} ({groupData.table_count})
                   {processingConnections[prefix] && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                </button>
                <div className="dropdown">
                    <button className="btn btn-sm btn-light me-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled={!!processingConnections[prefix]}>
                        <FaCogs/>
                    </button>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEtlAction('refresh', prefix, groupData.connection_details); }}>Refresh</a></li>
                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEtlAction('full-refresh', prefix, groupData.connection_details); }}>Full Refresh</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(prefix); }}>Delete</a></li>
                    </ul>
                </div>
              </h2>
              <div
                id={`group-collapse-${groupIndex}`}
                className="accordion-collapse collapse"
                aria-labelledby={`group-heading-${groupIndex}`}
                data-bs-parent="#groupAccordion"
              >
                <div className="accordion-body p-2">
                  <div className="accordion" id={`table-accordion-${groupIndex}`}>
                    {groupData.tables.map((table, tableIndex) => (
                      <div className="accordion-item" key={table.full_name}>
                        <h2 className="accordion-header" id={`table-heading-${groupIndex}-${tableIndex}`}>
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#table-collapse-${groupIndex}-${tableIndex}`}
                            aria-expanded="false"
                            aria-controls={`table-collapse-${groupIndex}-${tableIndex}`}
                            onClick={() => {
                              setSelectedTable(table.full_name);
                              fetchColumns(table.full_name);
                            }}
                          >
                            {table.table_name}
                          </button>
                        </h2>
                        <div
                          id={`table-collapse-${groupIndex}-${tableIndex}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`table-heading-${groupIndex}-${tableIndex}`}
                          data-bs-parent={`#table-accordion-${groupIndex}`}
                        >
                          <div className="column-container">
                            {columns[table.full_name] ? (
                              columns[table.full_name]
                                .filter(col => col.name.toLowerCase().includes(lowerCaseQuery))
                                .map((col, colIndex) => (
                                <div
                                  key={colIndex}
                                  className="column-card"
                                  draggable={true}
                                  onDragStart={(event) => {
                                    const columnData = {
                                      columnName: col.name,
                                      tableName: table.full_name,
                                    };
                                    event.dataTransfer.setData("text/plain", JSON.stringify(columnData));
                                  }}
                                >
                                  <span className="column-icons">
                                    {col.is_numeric_type ? "123" : col.is_text_type ? "ABC" : col.is_date_type ? "DATE" : "🔗"}
                                  </span>
                                  {col.name}
                                </div>
                              ))
                            ) : (
                              <p className="text-muted p-2">Loading...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSidebarContent()}

      {/* <Header
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        canvases={canvases}
        setCanvases={setCanvases}
        setCurrentCanvasId={setCurrentCanvasId}
      /> */}

      <Header
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex} // Pass setter to Header
         canvases={canvases}  // Pass canvases as a prop
        setCanvases={setCanvases}  // Pass setCanvases to Header component
        setCurrentCanvasId={setCurrentCanvasId}
        totalCanvasCount={totalCanvasCount}
      />

      <SidebarCanvas
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        currentCanvasId={currentCanvasId}
        setCurrentCanvasId={setCurrentCanvasId}
        totalCanvasCount={totalCanvasCount}  // Pass the total canvas count
        setTotalCanvasCount={setTotalCanvasCount} // Pass setter to update the count
        canvases={canvases}
        setCanvases={setCanvases}
      />
      {/* <SidebarData
        setCanvasData={setCanvasData}
        selectedTable={selectedTable}
        onBuildVisualization={handleBuildVisualization}
        totalCanvasCount={totalCanvasCount}  // Pass the total canvas count
        setTotalCanvasCount={setTotalCanvasCount} // Pass setter to update the count
        canvases={canvases}
        setCanvases={setCanvases}
      /> */}

      {/* <SidebarData
        setCanvasData={setCanvasData}
        selectedTable={selectedTable}
        setCanvasQuery={handleQuerySubmit}
        onVisualizationTypeChange={handleVisualizationTypeChange}
      /> */}

      <SidebarData
        setCanvasData={setCanvasData}
        selectedTable={selectedTable}
        onBuildVisualization={handleBuildVisualization} // Prop baru
        onVisualizationTypeChange={handleVisualizationTypeChange}
        editingPayload={selectedVisualization ? selectedVisualization.builderPayload : null}
      />
      <SidebarDiagram
        onVisualizationTypeChange={handleVisualizationTypeChange}
        onVisualizationConfigChange={handleConfigUpdate}
        selectedVisualization={selectedVisualization}
        visualizationConfig={visualizationConfig}
      />
      <SidebarQuery
        onQuerySubmit={handleQuerySubmit}
        onVisualizationTypeChange={handleVisualizationTypeChange}
      />

      <Canvas
        data={canvasData}
        query={addNewVisualization ? canvasQuery : ""}
        visualizationType={addNewVisualization ? visualizationType : ""}
        visualizationConfig={visualizationConfig}
        onVisualizationSelect={handleVisualizationSelect}
        selectedVisualization={selectedVisualization}
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        canvases={canvases}
        setCanvases={setCanvases}
        currentCanvasId={currentCanvasId}
        setCurrentCanvasId={setCurrentCanvasId}
        onUpdateVisualizationType={updateSelectedVisualizationType}
        newVisualizationPayload={newVisualizationPayload}
      />
      <style jsx>{`
        .sidebar {
          margin-top: 0px;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sidebar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
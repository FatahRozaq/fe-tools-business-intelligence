import React, { useState, useEffect, useRef } from "react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
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
  const [currentCanvasId, setCurrentCanvasId] = useState(0);

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

    if (sidebarData && sidebarDiagram && sidebarQuery && sidebarCanvas) {
      if (selectedVisualization) {
        // Jika ada visualisasi yg dipilih, tunjukkan sidebar diagram/style
        sidebarData.style.display = "none";
        sidebarDiagram.style.display = "block";
        menuData.classList.remove('active');
        menuVisualisasi.classList.add('active');
      } else {
        // Jika tidak, tunjukkan sidebar data untuk buat baru
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
    setNewVisualizationPayload(payload); // Simpan payload
    setCanvasData(data);
    setCanvasQuery(query);
    setVisualizationConfig({ ...DEFAULT_CONFIG });
    setAddNewVisualization(true);
    setSelectedVisualization(null); // Deselect apapun yang sedang dipilih
  };

  const handleSaveSuccess = () => {
    setShowAddDatasource(false);
    fetchAllTables();
  };

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

  useEffect(() => {
    if (addNewVisualization && canvasQuery && visualizationType) {
      setTimeout(() => {
        setAddNewVisualization(false);
        setCanvasQuery("");
        setVisualizationType("");
        setNewVisualizationPayload(null); // Reset payload setelah digunakan
      }, 500);
    }
  }, [addNewVisualization, canvasQuery, visualizationType]);

  const handleVisualizationTypeChange = (type) => {
    if (!canEdit) return;
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

    setSelectedVisualization((prev) => ({
      ...prev,
      type: newType,
    }));
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
    if (!canEdit) return;
    setVisualizationConfig(config);

    if (selectedVisualization) {
      setSelectedVisualization((prev) => ({
        ...prev,
        config: { ...config },
      }));
    }
  };

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases);
        } else {
          console.error("Failed to fetch canvases:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching canvases:", error);
      });
  }, []);

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
    return (
      <div id="sidebar" className="sidebar">
        <div className="sub-title d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <GrDatabase size={48} className="text-muted" />
            <span className="sub-text">Datasources</span>
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowAddDatasource(true)}
            title="Tambah Datasource Baru"
          >
            <FaPlus />
          </button>
        </div>
        <hr className="full-line" />
        <div className="accordion" id="groupAccordion">
          {Object.entries(groupedTables).map(([prefix, groupData], groupIndex) => (
            <div className="accordion-item" key={prefix}>
              <h2 className="accordion-header" id={`group-heading-${groupIndex}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#group-collapse-${groupIndex}`}
                  aria-expanded="false"
                  aria-controls={`group-collapse-${groupIndex}`}
                >
                  {prefix} ({groupData.table_count})
                </button>
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
                              columns[table.full_name].map((col, colIndex) => (
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

      <Header
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        canvases={canvases}
        setCanvases={setCanvases}
        setCurrentCanvasId={setCurrentCanvasId}
        totalCanvasCount={totalCanvasCount}
        userAccessLevel={userAccessLevel}
        onMenuClick={handleMenuClick}
      />

      <SidebarCanvas
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex}
        currentCanvasId={currentCanvasId}
        setCurrentCanvasId={setCurrentCanvasId}
      />

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
      style={{ display: activeSidebar === 'diagram' ? 'block' : 'none' }}
        onVisualizationTypeChange={handleVisualizationTypeChange}
        onVisualizationConfigChange={handleConfigUpdate}
        selectedVisualization={selectedVisualization}
        visualizationConfig={visualizationConfig}
      />
      <SidebarQuery
      style={{ display: activeSidebar === 'query' ? 'block' : 'none' }}
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
          max-height: 100vh;
          overflow-y: auto;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .sidebar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
      `}</style>
    </>
  );
};

export default Sidebar;
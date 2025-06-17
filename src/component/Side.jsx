import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarDiagram from "./SidebarDiagram/SidebarDiagram";
import SidebarData from "./SidebarData";
import config from "../config";
import SidebarDatasource from "./SidebarDatasource";
import AddDatasource from "./AddDataSource";

const Sidebar = ({ setCanvasData, setCanvasQuery }) => {
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddDatasource, setShowAddDatasource] = useState(false); // State untuk menampilkan AddDatasource

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

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading...</div>
      ) : showAddDatasource ? ( 
        // Tampilkan AddDatasource jika tombol ditekan
        <AddDatasource />
      ) : tables.length === 0 ? (
        <SidebarDatasource onTambahDatasource={() => setShowAddDatasource(true)} />
      ) : (
        <div id="sidebar" className="sidebar">
          <div className="sub-title">
            <img src="/assets/img/icons/Storage.png" alt="" />
            <span className="sub-text">Data</span>
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
                          onDragStart={(event) =>
                            event.dataTransfer.setData("text/plain", col.name)
                          }
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

      <SidebarData setCanvasData={setCanvasData} selectedTable={selectedTable} setCanvasQuery={setCanvasQuery} />
      <SidebarDiagram />
    </>
  );
};

export default Sidebar;

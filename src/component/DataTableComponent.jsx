import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import axios from "axios";
import config from "../config";

const DataTableComponent = ({ 
  data, 
  query, 
  visualizationType,
  onVisualizationTypeChange // TAMBAHKAN PROP INI
}) => {
  const [filters, setFilters] = React.useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [queryResult, setQueryResult] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  
  // SYNC dengan prop dari parent
  const activeVisualizationType = visualizationType || "table";

  useEffect(() => {
    if (query) {
      axios
        .post(`${config.API_BASE_URL}/api/kelola-dashboard/execute-query`, {
          query,
        })
        .then((response) => {
          if (response.data.success) {
            setQueryResult(response.data.data);
            axios
              .post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, {
                id_canvas: 1,
                id_datasource: 1,
                name: "Query Table",
                visualization_type: "table",
                query: query,
                config: {},
                width: 600,
                height: 300,
                position_x: 0,
                position_y: 0,
              })
              .then((res) => {
                console.log("Tabel berhasil disimpan:", res.data);
              })
              .catch((err) => {
                console.error("Gagal menyimpan data visualisasi tabel:", err);
              });
          } else {
            console.error("Query failed:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error executing query:", error);
        });
    }
  }, [query]);

  const handleVisualizationTypeChange = (newType) => {
    // PANGGIL callback ke parent component
    if (onVisualizationTypeChange) {
      onVisualizationTypeChange(newType);
    }
  };

  const renderChartControls = () => {
    const chartOptionsList = [
      { type: "bar", label: "Batang" }, 
      { type: "line", label: "Line" },
      { type: "pie", label: "Pie" }, 
      { type: "donut", label: "Donut" },
      { type: "", label: "Tabel" }, // UBAH dari "" ke "table"
      { type: "card", label: "Card" }
    ];
    return (
      <div className="chart-controls flex mb-4 gap-2">
        {chartOptionsList.map((option) => (
          <button
            key={option.type}
            className={`px-3 py-1 rounded text-sm ${
              activeVisualizationType === option.type 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => handleVisualizationTypeChange(option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  // TAMBAHKAN KONDISI RENDER BERDASARKAN TYPE
  if (activeVisualizationType !== "table") {
    return (
      <div className="p-4 text-center">
        {renderChartControls()}
        <div className="text-gray-500">
          Silakan pilih "Tabel" untuk melihat data dalam bentuk tabel, 
          atau gunakan komponen Visualisasi untuk chart lainnya.
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    return (
      <div className="table-header-container">
        <InputText
          value={filters.global.value}
          onChange={onGlobalFilterChange}
          placeholder="Global Search"
          size="small"
          className="compact-search"
        />
      </div>
    );
  };

  const onGlobalFilterChange = (event) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handleDoubleClick = (value) => {
    setSelectedText(value);
    setShowPreview(true);
  };

  const columns = queryResult
    ? Object.keys(queryResult[0] || {}).map((key, index) => (
        <Column
          key={index}
          field={key}
          header={key.charAt(0).toUpperCase() + key.slice(1)}
          sortable
          style={{ minWidth: "150px" }}
          headerStyle={{ padding: "0.5rem", fontSize: "0.85rem" }}
          bodyStyle={{
            maxWidth: "150px",
            whiteSpace: "nowrap",
            overflowX: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            padding: "0.3rem",
            fontSize: "0.8rem",
          }}
          body={(rowData) => (
            <div onDoubleClick={() => handleDoubleClick(rowData[key])}>
              {rowData[key]}
            </div>
          )}
        />
      ))
    : [];

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="card compact-table-container" style={{ height: "100%", display: "flex", flexDirection: "column", border: "none", boxShadow: "none" }}>
      {renderChartControls()}
      <DataTable
        value={queryResult || data}
        paginator
        rows={6}
        header={renderHeader()}
        filters={filters}
        onFilter={(e) => setFilters(e.filters)}
        emptyMessage="No data found."
        tableStyle={{ width: "100%" }}
        size="small"
        scrollable
        scrollHeight="flex"
        className="compact-data-table"
        rowHover
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorClassName="compact-paginator"
        currentPageReportTemplate="{first} - {last} of {totalRecords}"
      >
        {columns}
      </DataTable>

      {showPreview && (
        <div className="preview-modal" style={modalStyles}>
          <div className="modal-content" style={modalContentStyles}>
            <span onClick={closePreview} style={closeButtonStyles}>
              ✕
            </span>
            <p style={{ margin: "10px 0" }}>{selectedText}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .compact-data-table .p-datatable-wrapper {
          font-size: 0.8rem;
          border: none;
        }
        
        .compact-data-table .p-paginator {
          font-size: 0.8rem;
          padding: 0.25rem;
        }
        
        .compact-paginator .p-paginator-page {
          min-width: 2rem;
          height: 2rem;
        }
        
        .compact-search {
          height: 2rem;
          font-size: 0.8rem;
        }
        
        .table-header-container {
          padding: 0.5rem;
        }
        
        .compact-table-container {
          overflow: hidden;
          border: none;
          box-shadow: none;
        }
        
        .p-datatable .p-datatable-tbody > tr > td:focus,
        .p-datatable .p-datatable-thead > tr > th:focus,
        .p-inputtext:focus,
        .p-paginator .p-paginator-page:focus,
        .p-paginator .p-paginator-first:focus,
        .p-paginator .p-paginator-prev:focus,
        .p-paginator .p-paginator-next:focus,
        .p-paginator .p-paginator-last:focus {
          box-shadow: none !important;
          outline: none !important;
          border-color: transparent !important;
        }
        
        .p-component:focus,
        .p-component-overlay-enter,
        .p-datatable:focus,
        .p-datatable-wrapper:focus,
        .p-datatable-table:focus,
        .p-paginator .p-paginator-pages .p-paginator-page,
        .p-paginator button,
        .p-inputtext {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
        
        .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background-color: #f0f0f0 !important;
          color: #333 !important;
          border-color: transparent !important;
        }
        
        .p-datatable .p-datatable-tbody > tr:hover,
        .p-paginator button:hover,
        .p-paginator .p-paginator-pages .p-paginator-page:hover {
          background-color: inherit !important;
          color: inherit !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th,
        .p-datatable .p-datatable-tbody > tr > td {
          border: none !important;
          border-width: 0 !important;
        }
        
        .p-datatable table {
          border-collapse: collapse !important;
        }
      `}</style>
    </div>
  );
};

// Modal styles (unchanged)
const modalStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyles = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "5px",
  width: "80%",
  maxHeight: "80%",
  overflowY: "auto",
  position: "relative",
};

const closeButtonStyles = {
  position: "absolute",
  top: "10px",
  right: "10px",
  fontSize: "16px",
  cursor: "pointer",
  background: "#f0f0f0",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default React.memo(DataTableComponent);
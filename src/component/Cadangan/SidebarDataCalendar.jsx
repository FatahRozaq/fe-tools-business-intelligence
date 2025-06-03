import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { GrDatabase } from "react-icons/gr";
import { FaPlus, FaFilter, FaTableColumns } from "react-icons/fa6";
import { MdPublish } from "react-icons/md";
import { Calendar } from 'primereact/calendar';
import AddButton from "./Button/AddButton";
import SubmitButton from "./Button/SubmitButton";
import { Toast } from "primereact/toast";

const SidebarData = ({
  fetchData,
  addDimensi,
  setCanvasData,
  setCanvasQuery,
  selectedTable,
  onVisualizationTypeChange
}) => {
  // Reference for toast notifications
  const toast = React.useRef(null);

  // Form state
  const [dimensiInputs, setDimensiInputs] = useState([""]);
  const [metrikInputs, setMetrikInputs] = useState([]);
  const [metrikAggregation, setMetrikAggregation] = useState([]);
  const [filters, setFilters] = useState([
    { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" },
  ]);
  const [showFooter, setShowFooter] = useState(false);

  // Date range state
  const [showPopupDate, setShowpopupDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateColumnsData, setDateColumnsData] = useState(null);

  // Join state
  const [joinDimensiIndexes, setJoinDimensiIndexes] = useState([]);
  const [joinDimensiData, setJoinDimensiData] = useState([]); // For dimension joins
  const [joinMetrikData, setJoinMetrikData] = useState([]); // For metric joins

  // Dialog state
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupMetrik, setShowPopupMetrik] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  // Selected options
  const [tables, setTables] = useState([]);
  const [selectedJoinTable, setSelectedJoinTable] = useState("");
  const [selectedJoinTableMetrik, setSelectedJoinTableMetrik] = useState("");
  const [selectedJoinType, setSelectedJoinType] = useState("INNER");
  const [selectedJoinTypeMetrik, setSelectedJoinTypeMetrik] = useState("INNER");

  // Flag for visualization creation
  const [readyToCreateVisualization, setReadyToCreateVisualization] =
    useState(false);

  // New state for drag and drop
  const [dragOver, setDragOver] = useState({
    dimensi: Array(dimensiInputs.length).fill(false),
    metrik: Array(metrikInputs.length).fill(false),
  });

  // Fetch available tables on component mount
  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-table/1`)
      .then((response) => {
        if (response.data.success) {
          setTables(response.data.data);
        } else {
          console.log("Failed to fetch tables", response.data.message);
          showToast("error", "Error", "Failed to fetch tables");
        }
      })
      .catch((error) => {
        console.error("Error occurred while fetching tables", error);
        showToast("error", "Error", "Failed to load tables");
      });
  }, []);

  // Update drag over state when dimensiInputs or metrikInputs change
  useEffect(() => {
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  }, [dimensiInputs.length, metrikInputs.length]);

  // Format column name from JSON or object
  const formatColumnName = (data, type) => {
    try {
      // Check if data is a JSON string, parse if yes
      if (typeof data === "string" && data.trim().startsWith("{")) {
        const parsedData = JSON.parse(data);
        return parsedData.columnName || "";
      }

      // If data is already an object, get columnName directly
      return data && data.columnName ? data.columnName : "";
    } catch (error) {
      return ""; // Return empty string if there's an error
    }
  };

  // Toast notification helper
  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  };

  // Handle dimension input addition
  const handleAddDimensi = () => {
    const lastDimensi = dimensiInputs[dimensiInputs.length - 1];
    if (lastDimensi.trim() === "") {
      showToast(
        "warn",
        "Warning",
        "Please fill the current dimension before adding a new one"
      );
    } else {
      setShowPopup(true);
    }
  };

  // Handle metric input addition
  const handleAddMetrik = () => {
    setShowPopupMetrik(true);
    setWaitingForConfirmation(true);
  };

  // Handle dimension input change
  const handleDimensiChange = (index, event) => {
    const newDimensiInputs = [...dimensiInputs];
    newDimensiInputs[index] = event.target.value;
    setDimensiInputs(newDimensiInputs);
  };

  // Handle metric input change
  const handleMetrikChange = (index, event) => {
    const newMetrikInputs = [...metrikInputs];
    newMetrikInputs[index] = event.target.value;
    setMetrikInputs(newMetrikInputs);
  };

  // Handle aggregation type change for metrics
  const handleAggregationChange = (index, event) => {
    const newAggregation = [...metrikAggregation];
    newAggregation[index] = event.target.value;
    setMetrikAggregation(newAggregation);

    // Combine metric value with selected aggregation
    const newMetrikInputs = [...metrikInputs];
    if (
      newMetrikInputs[index] &&
      typeof newMetrikInputs[index] === "string" &&
      newMetrikInputs[index].includes("|")
    ) {
      // Update existing aggregation
      newMetrikInputs[index] =
        newMetrikInputs[index].split("|")[0] + "|" + event.target.value;
    } else {
      // Add new aggregation
      newMetrikInputs[
        index
      ] = `${newMetrikInputs[index]}|${event.target.value}`;
    }
    setMetrikInputs(newMetrikInputs);
  };

  // Toggle filter footer
  const handleToggleFooter = () => {
    setShowFooter(!showFooter);
  };

  // Handle applied filters
  const handleApplyFilters = (newFilters, appliedFilters) => {
    console.log("Filters applied:", appliedFilters);
    setFilters(newFilters);
    showToast("success", "Success", "Filters applied successfully");
  };

  // Handle dimension join selection
  const handleJoinSelection = (type) => {
    // Add join type and table when user confirms
    const newJoinDimensiIndexes = [...joinDimensiIndexes];
    const lastDimensiIndex = dimensiInputs.length - 1;

    const newJoinData = [...joinDimensiData];

    // Update join data with selected table and join type
    newJoinData[lastDimensiIndex] = {
      tabel: selectedJoinTable,
      join_type: type,
    };

    if (type !== "tanpa join") {
      newJoinDimensiIndexes.push(lastDimensiIndex);
    } else {
      const updatedIndexes = newJoinDimensiIndexes.filter(
        (index) => index !== lastDimensiIndex
      );
      newJoinDimensiIndexes.splice(
        0,
        newJoinDimensiIndexes.length,
        ...updatedIndexes
      );
      newJoinData[lastDimensiIndex] = { tabel: "", join_type: "tanpa join" };
    }

    // Set join data and update join indexes
    setJoinDimensiData(newJoinData);
    setJoinDimensiIndexes(newJoinDimensiIndexes);

    // Add a new empty dimension input
    setDimensiInputs([...dimensiInputs, ""]);

    setShowPopup(false);
    showToast("success", "Success", "Dimension join added");
  };

  // Handle metric join selection
  const handleJoinSelectionMetrik = (type) => {
    if (waitingForConfirmation) {
      const newJoinData = [...joinMetrikData];
      const lastMetrikIndex = metrikInputs.length;

      if (type !== "tanpa join") {
        newJoinData[lastMetrikIndex] = {
          tabel: selectedJoinTableMetrik,
          join_type: type,
        };
      } else {
        newJoinData[lastMetrikIndex] = {
          tabel: "",
          join_type: "tanpa join",
        };
      }

      setJoinMetrikData(newJoinData);
      setMetrikInputs([...metrikInputs, ""]);
      setMetrikAggregation([...metrikAggregation, "COUNT"]); // Default aggregation

      setShowPopupMetrik(false);
      setWaitingForConfirmation(false);
      showToast("success", "Success", "Metric join added");
    }
  };

  // Extract date columns from table
  // DataParser utility (dari kode sebelumnya)
const DataParser = {
  parseDimensi: (dimensi) => {
    try {
      return typeof dimensi === "string" && dimensi.trim().startsWith("{")
        ? JSON.parse(dimensi)
        : dimensi;
    } catch (e) {
      console.error("Failed to parse dimension:", e);
      return null;
    }
  },

  parseMetrik: (metrik) => {
    try {
      if (typeof metrik === "string" && metrik.includes("|")) {
        const [metrikValue] = metrik.split("|");
        return metrikValue.trim().startsWith("{")
          ? JSON.parse(metrikValue)
          : metrikValue;
      } else {
        return typeof metrik === "string" && metrik.trim().startsWith("{")
          ? JSON.parse(metrik)
          : metrik;
      }
    } catch (e) {
      console.error("Failed to parse metric:", e);
      return null;
    }
  },

  getTableAndColumn: (dimensiInputs, metrikInputs, selectedTable) => {
    let table = "";
    let column = "";

    if (dimensiInputs[0] && dimensiInputs[0].trim() !== "") {
      const parsed = DataParser.parseDimensi(dimensiInputs[0]);
      if (parsed) {
        table = parsed.tableName || "";
        column = parsed.columnName || "";
      }
    }

    if ((!table || !column) && metrikInputs[0]) {
      const parsed = DataParser.parseMetrik(metrikInputs[0]);
      if (parsed) {
        table = parsed.tableName || "";
        column = parsed.columnName || "";
      }
    }

    if (!table && selectedTable) {
      table = selectedTable;
    }

    return { table, column };
  }
};

// Fungsi extract date columns
const extractDateColumns = async () => {
  try {
    setLoadingDateColumns(true);
    
    const { table, column } = DataParser.getTableAndColumn(
      dimensiInputs, 
      metrikInputs, 
      selectedTable
    );

    if (!table || !column) {
      showToast(
        "error",
        "Error",
        "Please select at least one dimension or metric first"
      );
      return null;
    }

    const payload = { tabel: table, kolom: column };
    
    const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/check-date`,payload);

    if (response.data.success) {
      const result = {
        table,
        excludedColumn: column,
        hasDateColumns: response.data.has_date_column,
        dateColumns: response.data.date_columns || []
      };

      setDateColumnsData(result);
      
      if (result.dateColumns.length > 0) {
        showToast(
          "success",
          "Success",
          `Found ${result.dateColumns.length} date column(s)`
        );
      } else {
        showToast(
          "info",
          "Info",
          `No date columns available in table ${table}`
        );
      }
      
      return result;
    } else {
      showToast("error", "Error", response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error checking date columns:", error);
    showToast("error", "Error", "Failed to check date columns");
    return null;
  } finally {
    setLoadingDateColumns(false);
  }
};

// 4. Modified handleDateRange function
const handleDateRange = async () => {
  // Extract date columns first
  const result = await extractDateColumns();
  
  if (result && result.dateColumns.length > 0) {
    // Open dialog if date columns found
    setShowpopupDate(true);
  } else if (result && result.dateColumns.length === 0) {
    // No date columns available
    showToast(
      "warning",
      "Warning", 
      "No date columns available for filtering"
    );
  }
  // Error cases already handled in extractDateColumns
};

  const applyDateRange = () => {
    if (!selectedDate || !startDate || !endDate) {
      // Tambahkan validasi jika diperlukan
      return;
    }
    
    // Format tanggal untuk filter
    const formattedStartDate = startDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const formattedEndDate = endDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    // Buat filter baru dengan operator between
    const newFilter = {
      mode: 'include',
      column: selectedDate,
      operator: 'between',
      value1: formattedStartDate,
      value2: formattedEndDate,
      logic: filters.length > 0 ? filters[0].logic : 'and'
    };
    addDateRangeFilter(newFilter);
    sendDataToAPI();
    
    setShowpopupDate(false);
  };

  // Fungsi untuk menambahkan filter rentang tanggal
  const addDateRangeFilter = (newFilter) => {
    // Jika ingin menggunakan fungsi addFilter yang sudah ada
    addFilter();
    
    // Update filter terakhir dengan nilai rentang tanggal
    const lastIndex = filters.length;
    handleFilterChange(lastIndex, 'column', newFilter.column);
    handleFilterChange(lastIndex, 'operator', newFilter.operator);
    handleFilterChange(lastIndex, 'value1', newFilter.value1);
    handleFilterChange(lastIndex, 'value2', newFilter.value2);
  };

  // Reset form to create a new visualization
  const resetForm = () => {
    setDimensiInputs([""]);
    setMetrikInputs([]);
    setMetrikAggregation([]);
    setFilters([
      { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" },
    ]);
    setJoinDimensiIndexes([]);
    setJoinDimensiData([]);
    setJoinMetrikData([]);
    setReadyToCreateVisualization(false);
    showToast("info", "Info", "Form reset for new visualization");
  };

  // Send data to API to create visualization
  const sendDataToAPI = () => {
    // Validation
    if (
      dimensiInputs.length === 1 &&
      dimensiInputs[0].trim() === "" &&
      metrikInputs.length === 0
    ) {
      showToast(
        "error",
        "Error",
        "Please add at least one dimension or metric"
      );
      return;
    }

    // Get table from first dimension or metric
    let table = "";

    if (dimensiInputs[0] && dimensiInputs[0].trim() !== "") {
      try {
        const parsedDimensi =
          typeof dimensiInputs[0] === "string" &&
          dimensiInputs[0].trim().startsWith("{")
            ? JSON.parse(dimensiInputs[0])
            : dimensiInputs[0];
        table = parsedDimensi.tableName || "";
      } catch (e) {
        console.error("Failed to parse first dimension:", e);
      }
    } else if (metrikInputs[0]) {
      try {
        const parsedMetrik =
          typeof metrikInputs[0] === "string" &&
          metrikInputs[0].trim().startsWith("{")
            ? JSON.parse(metrikInputs[0].split("|")[0])
            : metrikInputs[0];
        table = parsedMetrik.tableName || "";
      } catch (e) {
        console.error("Failed to parse first metric:", e);
      }
    }

    // If still no table, use selected table
    if (!table && selectedTable) {
      table = selectedTable;
    }

    // Format dimensions
    const dimensi = dimensiInputs
      .map((dimensi) => {
        try {
          if (!dimensi || dimensi.trim() === "") return "";

          const parsedDimensi =
            typeof dimensi === "string" && dimensi.trim().startsWith("{")
              ? JSON.parse(dimensi)
              : dimensi;

          return parsedDimensi.tableName && parsedDimensi.columnName
            ? `${parsedDimensi.tableName}.${parsedDimensi.columnName}`
            : "";
        } catch (e) {
          console.error("Failed to parse dimension item:", e);
          return "";
        }
      })
      .filter((input) => input && input.trim() !== "");

    // Format metrics
    const metriks = metrikInputs
      .map((metrik, index) => {
        try {
          if (!metrik) return "";

          let parsedMetrik, aggregation;

          if (typeof metrik === "string" && metrik.includes("|")) {
            // If metrik already includes aggregation
            const [metrikValue, agg] = metrik.split("|");
            parsedMetrik = metrikValue.trim().startsWith("{")
              ? JSON.parse(metrikValue)
              : metrikValue;
            aggregation = agg;
          } else {
            // If metrik doesn't include aggregation
            parsedMetrik =
              typeof metrik === "string" && metrik.trim().startsWith("{")
                ? JSON.parse(metrik)
                : metrik;
            aggregation = metrikAggregation[index] || "COUNT";
          }

          return parsedMetrik.tableName && parsedMetrik.columnName
            ? `${parsedMetrik.tableName}.${parsedMetrik.columnName}|${aggregation}`
            : "";
        } catch (e) {
          console.error("Failed to parse metric item:", e);
          return "";
        }
      })
      .filter((input) => input && input.trim() !== "");

    // Combine joins
    const tabelJoin = [
      ...joinDimensiData.filter(
        (dimensiJoin) =>
          dimensiJoin &&
          dimensiJoin.tabel &&
          dimensiJoin.join_type !== "tanpa join"
      ),
      ...joinMetrikData.filter(
        (metrikJoin) =>
          metrikJoin &&
          metrikJoin.tabel &&
          metrikJoin.join_type !== "tanpa join"
      ),
    ];

    // Format filters
    const parsedFilters = filters
      .filter((filter) => filter.column && filter.operator)
      .map((filter) => {
        const column = filter.column.includes(".")
          ? filter.column
          : `${table || selectedTable}.${filter.column}`;
        return {
          column,
          operator: filter.operator,
          value: filter.value,
          mode: filter.mode?.toLowerCase() || "include",
          logic: filter.logic?.toLowerCase() || "and",
        };
      });

    // Request payload
    const payload = {
      tabel: table,
      dimensi,
      metriks,
      tabel_join: tabelJoin,
      filters: parsedFilters,
    };

    console.log("Sending data to API:", payload);

    // Send to API
    axios
      .post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data`, payload)
      .then((response) => {
        if (response.data.success) {
          console.log("Data sent successfully", response.data.data);
          setCanvasData(response.data.data);
          setCanvasQuery(response.data.query);
          setReadyToCreateVisualization(true);
          showToast(
            "success",
            "Success",
            "Data fetched successfully. Select a visualization type to display."
          );
          onVisualizationTypeChange("bar");
        } else {
          console.log("Failed to send data", response.data.message);
          showToast(
            "error",
            "Error",
            `Failed to fetch data: ${response.data.message}`
          );
        }
      })
      .catch((error) => {
        console.error("Error occurred while sending data", error);
        showToast("error", "Error", "Failed to fetch data");
      });
  };

  // New drag and drop handler functions
  const handleDragOver = (e, type, index) => {
    e.preventDefault();

    // Update dragOver state based on type and index
    const newDragOver = { ...dragOver };
    if (type === "dimensi") {
      newDragOver.dimensi = dragOver.dimensi.map((item, i) => i === index);
    } else {
      newDragOver.metrik = dragOver.metrik.map((item, i) => i === index);
    }
    setDragOver(newDragOver);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();

    // Reset dragOver state
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  };

  const handleDrop = (e, type, index) => {
    e.preventDefault();

    try {
      // Get data from drag operation - FIXED to match the MIME type used in Sidebar.jsx
      const data = e.dataTransfer.getData("text/plain");
      if (!data) {
        console.error("No data received from drag operation");
        showToast("error", "Error", "Invalid data format");
        return;
      }

      const columnData = JSON.parse(data);

      // Update dimensions or metrics based on drop target
      if (type === "dimensi") {
        const newDimensiInputs = [...dimensiInputs];
        newDimensiInputs[index] = JSON.stringify(columnData);
        setDimensiInputs(newDimensiInputs);
      } else {
        const newMetrikInputs = [...metrikInputs];
        newMetrikInputs[index] = JSON.stringify(columnData);
        setMetrikInputs(newMetrikInputs);
      }

      showToast("success", "Success", `Column added to ${type}`);
    } catch (error) {
      console.error("Error processing dropped data:", error);
      showToast("error", "Error", "Failed to process dragged data");
    }

    // Reset dragOver state
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  };

  return (
    <div id="sidebar-data" className="sidebar-2">
      <Toast ref={toast} />

      <div className="sub-title">
        <GrDatabase size={48} className="text-muted" />
        <span className="sub-text">Data</span>
      </div>
      <hr className="full-line" />

      <div className="form-diagram">
        {readyToCreateVisualization && (
          <div className="alert alert-success mb-3">
            <p>
              Data is ready! Select visualization type from the visualization
              menu.
            </p>
            <Button
              icon="pi pi-plus"
              label="Create New Visualization"
              className="p-button-sm mt-2"
              onClick={resetForm}
            />
          </div>
        )}

        <div className="form-group">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">
              <FaTableColumns className="me-2" />
              Dimensions
            </span>
            {/* <small className="text-muted">Drag columns from datasource panel</small> */}
          </div>

          <div id="dimensi-container">
            {dimensiInputs.map((dimensi, index) => (
              <div
                key={index}
                className={`dimensi-row mb-2 drop-target ${
                  dragOver.dimensi[index] ? "drag-over" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "dimensi", index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "dimensi", index)}
              >
                <input
                  style={{ width: "100%" }}
                  type="text"
                  className="dimensi-input form-control"
                  value={formatColumnName(dimensi, "dimensi")}
                  onChange={(e) => handleDimensiChange(index, e)}
                  placeholder="Drag a column here"
                  readOnly
                />
                {joinDimensiIndexes.includes(index) &&
                  joinDimensiData[index] && (
                    <span className="join-badge">
                      {joinDimensiData[index].join_type}{" "}
                      {joinDimensiData[index].tabel}
                    </span>
                  )}
              </div>
            ))}
          </div>

          <AddButton
            text="Add Dimension"
            onClick={handleAddDimensi}
            className="mt-2"
            icon={<FaPlus size={12} />}
          />
        </div>

        {/* Dialog PopUp Join Dimension */}
        <Dialog
          header="Select Join Type"
          visible={showPopup}
          style={{ width: "50vw" }}
          onHide={() => setShowPopup(false)}
          draggable={false}
          resizable={false}
        >
          <div className="row">
            <div className="col-md-6">
              <h6>Join With Table</h6>
              <select
                className="form-select"
                onChange={(e) => setSelectedJoinTable(e.target.value)}
              >
                <option value="">Select a table</option>
                {tables.map((table, idx) => (
                  <option key={idx} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <h6>Join Type</h6>
              <select
                className="form-select"
                onChange={(e) => setSelectedJoinType(e.target.value)}
              >
                <option value="">select join type</option>
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
                <option value="CROSS">CROSS JOIN</option>
                <option value="FULL">FULL JOIN</option>
                <option value="tanpa join">No Join</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-end">
            <Button
              label="Apply"
              icon="pi pi-check"
              onClick={() => handleJoinSelection(selectedJoinType)}
              className="p-button-success me-2"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowPopup(false)}
              className="p-button-secondary"
            />
          </div>
        </Dialog>

        <div className="form-group mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Metrics</span>
            {/* <small className="text-muted">Add calculations for your data</small> */}
          </div>

          <div id="metrik-container">
            {metrikInputs.map((metrik, index) => (
              <div
                key={index}
                className={`metrik-row mb-2 d-flex drop-target ${
                  dragOver.metrik[index] ? "drag-over" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "metrik", index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "metrik", index)}
              >
                <input
                  style={{ width: "75%" }}
                  type="text"
                  className="metrik-input form-control"
                  value={formatColumnName(metrik, "metrik")}
                  onChange={(e) => handleMetrikChange(index, e)}
                  placeholder="Drag a column here"
                  readOnly
                />
                <select
                  style={{ width: "25%" }}
                  className="form-select metrik-aggregation-dropdown"
                  value={metrikAggregation[index] || "COUNT"}
                  onChange={(e) => handleAggregationChange(index, e)}
                >
                  <option value="COUNT">COUNT</option>
                  <option value="SUM">SUM</option>
                  <option value="AVERAGE">AVG</option>
                  <option value="MIN">MIN</option>
                  <option value="MAX">MAX</option>
                </select>

                {joinMetrikData[index] &&
                  joinMetrikData[index].join_type !== "tanpa join" && (
                    <span className="join-badge ms-2">
                      {joinMetrikData[index].join_type}{" "}
                      {joinMetrikData[index].tabel}
                    </span>
                  )}
              </div>
            ))}
          </div>

          <AddButton
            text="Add Metric"
            onClick={handleAddMetrik}
            className="mt-2"
            icon={<FaPlus size={12} />}
          />
        </div>

        {/* Dialog PopUp Join Metric */}
        <Dialog
          header="Select Metric Join"
          visible={showPopupMetrik}
          style={{ width: "50vw" }}
          onHide={() => setShowPopupMetrik(false)}
          draggable={false}
          resizable={false}
        >
          <div className="row">
            <div className="col-md-6">
              <h6>Join With Table</h6>
              <select
                className="form-select"
                onChange={(e) => setSelectedJoinTableMetrik(e.target.value)}
              >
                <option value="">Select a table</option>
                {tables.map((table, idx) => (
                  <option key={idx} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <h6>Join Type</h6>
              <select
                className="form-select"
                onChange={(e) => setSelectedJoinTypeMetrik(e.target.value)}
              >
                <option value="">select join type</option>
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
                <option value="CROSS">CROSS JOIN</option>
                <option value="FULL">FULL JOIN</option>
                <option value="tanpa join">No Join</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-end">
            <Button
              label="Apply"
              icon="pi pi-check"
              onClick={() => handleJoinSelectionMetrik(selectedJoinTypeMetrik)}
              className="p-button-success me-2"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowPopupMetrik(false)}
              className="p-button-secondary"
            />
          </div>
        </Dialog>

        <div className="form-group">
          <AddButton
            text="Rentang Tanggal"
            onClick={handleDateRange}
            className="mt-2"
          />
        </div>

        {/* Dialog PopUp Join Date */}
        <Dialog
          header="Pilih Kolom Tanggal"
          visible={showPopupDate}
          style={{ width: "60vw" }}
          onHide={() => {
          setShowpopupDate(false);
          setSelectedDate('');
          setStartDate(null);
          setEndDate(null);
        }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            <div style={{ width: "45%" }}>
              <h6>Pilih Kolom Tanggal</h6>
              <select
                onChange={(e) => setSelectedDate(e.target.value)}
                value={selectedDate}
                style={{ width: "100%",padding: "8px" }}
              >
                <option value="">Pilih Kolom</option>
                {dateColumnsData?.dateColumns.map((column, idx) => (
                  <option key={idx} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: "45%" }}>
              <h6>Tanggal Awal</h6>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                style={{ width: "100%" }}
                />
            </div>
            <div style={{ width: "45%" }}>
              <h6>Tanggal Akhir</h6>
              <Calendar
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                style={{ width: "100%" }}
                />
            </div>

          </div>
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <Button
              label="Terapkan"
              icon="pi pi-check"
              onClick={applyDateRange}
              style={{ marginRight: "10px"}}
              disabled={!selectedDate || !startDate || !endDate}
            />
            <Button
              label="Batal"
              icon="pi pi-check"
              onClick={() => setShowpopupDate(false)}
            />
          </div>
        </Dialog>

        <div className="form-group mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">
              <FaFilter className="me-2" />
              Filters
            </span>
          </div>

          <AddButton
            text="Add Filter"
            onClick={handleToggleFooter}
            className="mt-2"
            icon={<FaFilter size={12} />}
          />
        </div>

        <div className="d-flex flex-column gap-2 mt-4">
          <Button
            label="Reset"
            // icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={resetForm}
          />

          <SubmitButton
            onClick={sendDataToAPI}
            text="Create"
            // icon={<MdPublish size={16} />}
          />
        </div>
      </div>

      {showFooter && (
        <FooterBar
          filters={filters}
          setFilters={setFilters}
          handleApplyFilters={handleApplyFilters}
          handleToggleFooter={handleToggleFooter}
          dimensiInputs={dimensiInputs}
        />
      )}

      <style jsx>{`
        .join-badge {
          background-color: #e3f2fd;
          color: #1565c0;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
          display: inline-block;
        }

        .sidebar-2 {
          max-height: 100vh;
          overflow-y: auto;
          padding-bottom: 60px;
        }

        .drop-target {
          border: 2px dashed transparent;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .drag-over {
          border: 2px dashed #2196f3;
          background-color: rgba(33, 150, 243, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SidebarData;

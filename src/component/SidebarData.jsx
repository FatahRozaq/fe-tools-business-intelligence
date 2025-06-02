import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { GrDatabase } from "react-icons/gr";
import { FaPlus, FaFilter, FaTableColumns, FaCalendarDays } from "react-icons/fa6"; // Added FaCalendarDays
import { MdPublish } from "react-icons/md";
import AddButton from "./Button/AddButton";
import SubmitButton from "./Button/SubmitButton";
import { Toast } from "primereact/toast";
import DateRangeSelector from "./DateRangeSelector"; // Import the new component

const SidebarData = ({
  fetchData,
  addDimensi,
  setCanvasData,
  setCanvasQuery,
  selectedTable,
  onVisualizationTypeChange,
}) => {
  const toast = useRef(null);

  const [dimensiInputs, setDimensiInputs] = useState([""]);
  const [metrikInputs, setMetrikInputs] = useState([]);
  const [metrikAggregation, setMetrikAggregation] = useState([]);
  const [filters, setFilters] = useState([
    { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" },
  ]);
  const [showFooter, setShowFooter] = useState(false);

  const [joinDimensiIndexes, setJoinDimensiIndexes] = useState([]);
  const [joinDimensiData, setJoinDimensiData] = useState([]);
  const [joinMetrikData, setJoinMetrikData] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [showPopupMetrik, setShowPopupMetrik] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const [tables, setTables] = useState([]);
  const [selectedJoinTable, setSelectedJoinTable] = useState("");
  const [selectedJoinTableMetrik, setSelectedJoinTableMetrik] = useState("");
  const [selectedJoinType, setSelectedJoinType] = useState("INNER");
  const [selectedJoinTypeMetrik, setSelectedJoinTypeMetrik] = useState("INNER");

  const [readyToCreateVisualization, setReadyToCreateVisualization] =
    useState(false);

  const [dragOver, setDragOver] = useState({
    dimensi: Array(dimensiInputs.length).fill(false),
    metrik: Array(metrikInputs.length).fill(false),
  });

  // New state for DateRangeSelector
  const [showDateRangePopup, setShowDateRangePopup] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

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

  useEffect(() => {
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  }, [dimensiInputs.length, metrikInputs.length]);

  const formatColumnName = (data, type) => {
    try {
      if (typeof data === "string" && data.trim().startsWith("{")) {
        const parsedData = JSON.parse(data);
        return parsedData.columnName || "";
      }
      return data && data.columnName ? data.columnName : "";
    } catch (error) {
      return "";
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  };

  const handleAddDimensi = () => {
    const lastDimensi = dimensiInputs[dimensiInputs.length - 1];
    if (lastDimensi && typeof lastDimensi === 'string' && lastDimensi.trim() === "") {
      showToast(
        "warn",
        "Warning",
        "Please fill the current dimension before adding a new one"
      );
    } else {
      setShowPopup(true);
    }
  };

  const handleAddMetrik = () => {
    setShowPopupMetrik(true);
    setWaitingForConfirmation(true);
  };

  const handleDimensiChange = (index, event) => {
    const newDimensiInputs = [...dimensiInputs];
    newDimensiInputs[index] = event.target.value;
    setDimensiInputs(newDimensiInputs);
  };

  const handleMetrikChange = (index, event) => {
    const newMetrikInputs = [...metrikInputs];
    newMetrikInputs[index] = event.target.value;
    setMetrikInputs(newMetrikInputs);
  };

  const handleAggregationChange = (index, event) => {
    const newAggregation = [...metrikAggregation];
    newAggregation[index] = event.target.value;
    setMetrikAggregation(newAggregation);

    const newMetrikInputs = [...metrikInputs];
    if (
      newMetrikInputs[index] &&
      typeof newMetrikInputs[index] === "string" &&
      newMetrikInputs[index].includes("|")
    ) {
      newMetrikInputs[index] =
        newMetrikInputs[index].split("|")[0] + "|" + event.target.value;
    } else {
      newMetrikInputs[
        index
      ] = `${newMetrikInputs[index]}|${event.target.value}`;
    }
    setMetrikInputs(newMetrikInputs);
  };

  const handleToggleFooter = () => {
    setShowFooter(!showFooter);
  };

  const handleApplyFilters = (newFilters, appliedFilters) => {
    console.log("Filters applied:", appliedFilters);
    setFilters(newFilters);
    showToast("success", "Success", "Filters applied successfully");
  };

  const handleJoinSelection = (type) => {
    const newJoinDimensiIndexes = [...joinDimensiIndexes];
    const lastDimensiIndex = dimensiInputs.length - 1;
    const newJoinData = [...joinDimensiData];

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

    setJoinDimensiData(newJoinData);
    setJoinDimensiIndexes(newJoinDimensiIndexes);
    setDimensiInputs([...dimensiInputs, ""]);
    setShowPopup(false);
    showToast("success", "Success", "Dimension join added");
  };

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
      setMetrikAggregation([...metrikAggregation, "COUNT"]);
      setShowPopupMetrik(false);
      setWaitingForConfirmation(false);
      showToast("success", "Success", "Metric join added");
    }
  };

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
    setDateFilter(null); // Reset date filter
    setShowDateRangePopup(false); // Close date range popup
    showToast("info", "Info", "Form reset for new visualization");
  };

  const sendDataToAPI = () => {
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

    if (!table && selectedTable) {
      table = selectedTable;
    }

    const dimensi = dimensiInputs
      .map((dimensi) => {
        try {
          if (!dimensi || (typeof dimensi === 'string' && dimensi.trim() === "")) return "";
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

    const metriks = metrikInputs
      .map((metrik, index) => {
        try {
          if (!metrik) return "";
          let parsedMetrik, aggregation;
          if (typeof metrik === "string" && metrik.includes("|")) {
            const [metrikValue, agg] = metrik.split("|");
            parsedMetrik = metrikValue.trim().startsWith("{")
              ? JSON.parse(metrikValue)
              : metrikValue;
            aggregation = agg;
          } else {
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

    const userDefinedFilters = filters
      .filter((filter) => filter.column && filter.operator && filter.value !== "") // Ensure value is also present
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
    
    let finalFilters = [...userDefinedFilters];

    if (dateFilter && dateFilter.column && dateFilter.operator && dateFilter.value) {
        const formattedDateFilter = {
            column: dateFilter.column, // Already in table.column format
            operator: dateFilter.operator,
            value: dateFilter.value,
            mode: dateFilter.mode?.toLowerCase() || "include",
            logic: dateFilter.logic?.toLowerCase() || "and",
        };
        finalFilters.unshift(formattedDateFilter); // Add date filter to the beginning
    }


    const payload = {
      tabel: table,
      dimensi,
      metriks,
      tabel_join: tabelJoin,
      filters: finalFilters,
    };

    console.log("Sending data to API:", payload);

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
            "Data fetched successfully"
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

  const handleDragOver = (e, type, index) => {
    e.preventDefault();
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
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  };

  const handleDrop = (e, type, index) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("text/plain");
      if (!data) {
        console.error("No data received from drag operation");
        showToast("error", "Error", "Invalid data format");
        return;
      }
      const columnData = JSON.parse(data);
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
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  };

  // Handlers for DateRangeSelector
  const handleToggleDateRangePopup = () => {
    setShowDateRangePopup(!showDateRangePopup);
  };

  const handleDateRangeChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    if (newDateFilter) {
      showToast("success", "Success", "Date range filter applied.");
    } else {
      showToast("info", "Info", "Date range filter cleared.");
      // If clearing, we might want to immediately refetch data or prompt user
    }
    setShowDateRangePopup(false); // Close the dialog after applying/clearing
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
                value={selectedJoinTable}
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
                value={selectedJoinType}
                onChange={(e) => setSelectedJoinType(e.target.value)}
              >
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
              disabled={!selectedJoinTable && selectedJoinType !== 'tanpa join'}
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
                value={selectedJoinTableMetrik}
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
                value={selectedJoinTypeMetrik}
                onChange={(e) => setSelectedJoinTypeMetrik(e.target.value)}
              >
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
              disabled={!selectedJoinTableMetrik && selectedJoinTypeMetrik !== 'tanpa join'}
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowPopupMetrik(false)}
              className="p-button-secondary"
            />
          </div>
        </Dialog>

        <div className="form-group mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">
              Filters
            </span>
          </div>
          <AddButton
            text="Add Date Range"
            onClick={handleToggleDateRangePopup}
            className="mt-2 me-2" // Added me-2 for spacing if needed
            icon={<FaCalendarDays size={12} />}
          />
          <AddButton
            text="Add Filter"
            onClick={handleToggleFooter}
            className="mt-2"
            icon={<FaFilter size={12} />}
          />
           {dateFilter && (
            <div className="mt-2 p-2 border rounded bg-light">
              <small className="d-block text-muted">Active Date Range:</small>
              <span>{`${dateFilter.column} BETWEEN ${dateFilter.value[0]} AND ${dateFilter.value[1]}`}</span>
            </div>
          )}
        </div>
        
        {/* Dialog for DateRangeSelector */}
        <Dialog
          header="Select Primary Date Range"
          visible={showDateRangePopup}
          style={{ width: "70vw", maxWidth: "800px" }} // Adjusted width
          onHide={() => setShowDateRangePopup(false)}
          draggable={false}
          resizable={false}
          footer={null} // DateRangeSelector has its own apply/clear buttons
        >
          <DateRangeSelector
            availableTables={tables}
            onDateRangeChange={handleDateRangeChange}
            initialDateFilter={dateFilter}
          />
        </Dialog>


        <div className="d-flex flex-column gap-2 mt-4">
          <Button
            label="Reset"
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
          availableTables={tables} // Pass tables to FooterBar if needed for column suggestions
          currentTable={selectedTable || (dimensiInputs[0] && dimensiInputs[0].tableName) || ''} // Pass current primary table
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
          padding-bottom: 60px; /* Ensure space for footer or last elements */
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
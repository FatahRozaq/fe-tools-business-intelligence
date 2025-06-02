// src/components/DateRangeSelector.jsx
import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../config'; // Adjust path as needed
import { format, subDays, subMonths, subYears } from 'date-fns';

const DateRangeSelector = ({ availableTables, onDateRangeChange, initialDateFilter }) => {
  const [selectedTable, setSelectedTable] = useState(initialDateFilter?.selectedTable || '');
  const [dateColumns, setDateColumns] = useState([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState(initialDateFilter?.columnName || '');
  const [dateRangeType, setDateRangeType] = useState(initialDateFilter?.dateRangeType || 'custom');
  const [customStartDate, setCustomStartDate] = useState(
    initialDateFilter?.value?.[0] ? new Date(initialDateFilter.value[0]) : null
  );
  const [customEndDate, setCustomEndDate] = useState(
    initialDateFilter?.value?.[1] ? new Date(initialDateFilter.value[1]) : null
  );

  const dateRangeTypeOptions = [
    { label: "Custom Range", value: "custom" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
    { label: "Last 1 Year", value: "last1year" },
    // { label: "No Date Filter", value: "none" }, // Option to clear
  ];

  const tableOptions = availableTables.map(t => ({ label: t, value: t }));

  // Function to check if a column type is a date type
  const isDateType = (columnType) => {
    const dateTypes = [
      'date', 'datetime', 'timestamp', 'time',
      'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
      'datetime2', 'smalldatetime', 'datetimeoffset', // SQL Server
      'DATETIME2', 'SMALLDATETIME', 'DATETIMEOFFSET',
      'timestamptz', 'timetz', // PostgreSQL
      'TIMESTAMPTZ', 'TIMETZ'
    ];
    
    return dateTypes.some(type => 
      columnType.toLowerCase().includes(type.toLowerCase())
    );
  };

  useEffect(() => {
    if (initialDateFilter) {
        const tableName = initialDateFilter.column?.split('.')[0];
        const columnName = initialDateFilter.column?.split('.')[1];
        if (tableName) setSelectedTable(tableName);
        // We need to handle how dateRangeType, customStartDate, customEndDate are derived
        // This simple example assumes initialDateFilter has these fields if they were set
        if (initialDateFilter.dateRangeType) setDateRangeType(initialDateFilter.dateRangeType);

        if (initialDateFilter.value && Array.isArray(initialDateFilter.value) && initialDateFilter.value.length === 2) {
            setCustomStartDate(new Date(initialDateFilter.value[0]));
            setCustomEndDate(new Date(initialDateFilter.value[1]));
        }
         if (columnName) {
            // If table is also set, fetch columns and then set selectedDateColumn
            if (tableName) {
                 fetchDateColumns(tableName, columnName); // Pass columnName to set it after fetch
            } else {
                setSelectedDateColumn(columnName);
            }
        }

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDateFilter, availableTables]); // Rerun if initialDateFilter changes


  useEffect(() => {
    if (selectedTable) {
      fetchDateColumns(selectedTable);
    } else {
      setDateColumns([]);
      setSelectedDateColumn('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);


  const fetchDateColumns = async (tableName, preselectColumnName = null) => {
    if (!tableName) return;
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/kelola-dashboard/fetch-column/${tableName}`
      );
      
      if (response.data.success) {
        const columns = response.data.data;
        
        // First, let's see what properties are available in each column object
        if (columns.length > 0) {
          console.log('Sample column object:', columns[0]);
          console.log('Available properties:', Object.keys(columns[0]));
        }
        
        // Create options from all columns first (for debugging)
        const allOptions = columns.map(col => {
          // Try to find the column name property
          const columnName = col.column_name || col.COLUMN_NAME || col.name || col.NAME || col.Field || col.field || '';
          const dataType = col.data_type || col.column_type || col.type || col.DATA_TYPE || col.COLUMN_TYPE || col.TYPE || col.Type || '';
          
          return {
            label: columnName,
            value: columnName,
            dataType: dataType
          };
        });
        
        console.log('All columns mapped:', allOptions);
        
        // Filter only date type columns
        const dateOnlyColumns = allOptions.filter(opt => 
          opt.dataType && isDateType(opt.dataType)
        );
        
        console.log('Date columns filtered:', dateOnlyColumns);
        
        // If no date columns found, show all columns for now (temporary debugging)
        const finalOptions = dateOnlyColumns.length > 0 ? 
          dateOnlyColumns.map(col => ({
            label: col.dataType ? `${col.label} (${col.dataType})` : col.label,
            value: col.value
          })) :
          allOptions.map(col => ({
            label: col.label || 'Unknown Column',
            value: col.value || ''
          }));
        
        setDateColumns(finalOptions);
        
        if (preselectColumnName && finalOptions.some(opt => opt.value === preselectColumnName)) {
            setSelectedDateColumn(preselectColumnName);
        } else {
            setSelectedDateColumn('');
        }
        
        // Show message if no date columns found
        if (dateOnlyColumns.length === 0) {
          console.warn(`No date columns found in table: ${tableName}. Showing all columns for debugging.`);
        }
      } else {
        console.error("Failed to fetch date columns:", response.data.message);
        setDateColumns([]);
        setSelectedDateColumn('');
      }
    } catch (error) {
      console.error("Error fetching date columns:", error);
      setDateColumns([]);
      setSelectedDateColumn('');
    }
  };

  const handleApplyDateRange = () => {
    if (!selectedTable || !selectedDateColumn) {
      onDateRangeChange(null); // Clear filter if essential parts are missing
      // alert("Please select a table and a date column.");
      return;
    }

    if (dateRangeType === "none") {
        onDateRangeChange(null);
        return;
    }

    let startDate, endDate;
    const today = new Date();

    if (dateRangeType === 'custom') {
      if (!customStartDate || !customEndDate) {
        alert("Please select a start and end date for custom range.");
        return;
      }
      startDate = format(customStartDate, 'yyyy-MM-dd');
      endDate = format(customEndDate, 'yyyy-MM-dd');
    } else {
      endDate = format(today, 'yyyy-MM-dd'); // Default end date is today for predefined
      switch (dateRangeType) {
        case 'last7days':
          startDate = format(subDays(today, 6), 'yyyy-MM-dd');
          break;
        case 'last30days':
          startDate = format(subDays(today, 29), 'yyyy-MM-dd');
          break;
        case 'last1year':
          startDate = format(subYears(today, 1), 'yyyy-MM-dd');
          break;
        default:
          // Should not happen if 'none' is handled
          onDateRangeChange(null);
          return;
      }
    }

    onDateRangeChange({
      column: `${selectedTable}.${selectedDateColumn}`,
      operator: 'BETWEEN',
      value: [startDate, endDate],
      mode: 'INCLUDE', // Default mode
      logic: 'AND',    // Default logic (though less relevant for a single primary filter)
      // Store these for potentially repopulating the selector:
      selectedTable,
      columnName: selectedDateColumn,
      dateRangeType,
      // customStartDate and customEndDate are already in state
    });
  };
  
  const handleClearDateRange = () => {
    setSelectedTable('');
    setSelectedDateColumn('');
    setDateRangeType('custom');
    setCustomStartDate(null);
    setCustomEndDate(null);
    setDateColumns([]);
    onDateRangeChange(null); // Notify parent to clear the filter
  };


  // Update custom dates if predefined range is selected, for visual consistency if needed
  useEffect(() => {
    if (dateRangeType !== 'custom') {
        const today = new Date();
        let sDate, eDate = today;
         switch (dateRangeType) {
            case 'last7days': sDate = subDays(today, 6); break;
            case 'last30days': sDate = subDays(today, 29); break;
            case 'last1year': sDate = subYears(today, 1); break;
            default: sDate = null; eDate = null; break;
        }
        if (sDate && eDate) {
            setCustomStartDate(sDate); // Update for potential switch back to custom
            setCustomEndDate(eDate);
        }
    }
  }, [dateRangeType]);


  return (
    <div className="p-card p-3 mb-3">
      <h6 className="mb-2">Primary Date Range</h6>
      <div className="p-fluid grid formgrid">
        <div className="field col-12 md:col-3">
          <label htmlFor="tableSelect">Table</label>
          <Dropdown
            inputId="tableSelect"
            value={selectedTable}
            options={tableOptions}
            onChange={(e) => {
              setSelectedTable(e.value);
              setSelectedDateColumn(''); // Reset column when table changes
            }}
            placeholder="Select Table"
            filter
          />
        </div>
        <div className="field col-12 md:col-3">
          <label htmlFor="dateColumnSelect">Date Column</label>
          <Dropdown
            inputId="dateColumnSelect"
            value={selectedDateColumn}
            options={dateColumns}
            onChange={(e) => setSelectedDateColumn(e.value)}
            placeholder="Select Date Column"
            disabled={!selectedTable || dateColumns.length === 0}
            emptyMessage="No date columns found"
          />
        </div>
        <div className="field col-12 md:col-3">
          <label htmlFor="dateRangeTypeSelect">Range Type</label>
          <Dropdown
            inputId="dateRangeTypeSelect"
            value={dateRangeType}
            options={dateRangeTypeOptions}
            onChange={(e) => setDateRangeType(e.value)}
          />
        </div>
        {dateRangeType === 'custom' && (
          <>
            <div className="field col-12 md:col-3">
              <label htmlFor="startDate">Start Date</label>
              <Calendar
                inputId="startDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                placeholder="Start Date"
              />
            </div>
            <div className="field col-12 md:col-3">
              <label htmlFor="endDate">End Date</label>
              <Calendar
                inputId="endDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.value)}
                dateFormat="yy-mm-dd"
                minDate={customStartDate}
                showIcon
                placeholder="End Date"
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-2 text-end">
        <Button 
          label="Apply Date Range" 
          icon="pi pi-check" 
          onClick={handleApplyDateRange} 
          className="p-button-sm me-2" 
          disabled={!selectedTable || !selectedDateColumn}
        />
        <Button 
          label="Clear Date Range" 
          icon="pi pi-times" 
          onClick={handleClearDateRange} 
          className="p-button-sm p-button-secondary" 
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
// FILE: src/components/DateRangeSelector.jsx

import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../config';
import { format, subDays, subYears } from 'date-fns';

const DateRangeSelector = ({ availableTables, onDateRangeChange, initialDateFilter }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [dateColumns, setDateColumns] = useState([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState('');
  const [dateRangeType, setDateRangeType] = useState('custom');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [dataGranularity, setDataGranularity] = useState('asis');
  const [displayFormat, setDisplayFormat] = useState('auto');

  const displayFormatOptions = [
    { label: "Auto (Smart Detection)", value: "auto" },
    { label: "Week-1, Week-2, etc.", value: "week_number" },
    { label: "May, June, July, etc.", value: "month_name" },
    { label: "2024, 2025, etc.", value: "year" },
    { label: "Original Date Format", value: "original" }
  ];

  const dateRangeTypeOptions = [
    { label: "Custom Range", value: "custom" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
    { label: "Last 3 Months", value: "last3months" },
    { label: "Last 4 Months", value: "last4months" },
    { label: "Last 6 Months", value: "last6months" },
    { label: "Last 1 Year", value: "last1year" },
  ];

  const granularityOptions = [
    { label: "As Is (Original Data)", value: "asis" },
    { label: "Group by Day", value: "daily" },
    { label: "Group by Week", value: "weekly" },
    { label: "Group by Month", value: "monthly" },
  ];

  const formatDisplayName = (tableName) => {
    if (!tableName) return "";
    const parts = tableName.split('__');
    return parts.length > 1 ? parts[1].replace(/_/g, ' ') : tableName.replace(/_/g, ' ');
  };
  
  const tableOptions = availableTables.map(t => ({ label: formatDisplayName(t), value: t }));

  const isDateType = (columnType) => {
    const dateTypes = [ 'date', 'datetime', 'timestamp', 'time', 'datetime2', 'smalldatetime', 'datetimeoffset', 'timestamptz', 'timetz' ];
    const lowerCaseType = columnType.toLowerCase();
    return dateTypes.some(type => lowerCaseType.includes(type));
  };

  useEffect(() => {
    if (initialDateFilter) {
        const tableName = initialDateFilter.column?.split('.')[0];
        const columnName = initialDateFilter.column?.split('.')[1];
        
        if (tableName && availableTables.includes(tableName)) {
            setSelectedTable(tableName);
            fetchDateColumns(tableName, columnName);
        }
        
        setDateRangeType(initialDateFilter.dateRangeType || 'custom');
        setDataGranularity(initialDateFilter.granularity || 'asis');
        setDisplayFormat(initialDateFilter.displayFormat || 'auto');

        if (initialDateFilter.value && Array.isArray(initialDateFilter.value) && initialDateFilter.value.length === 2) {
            setCustomStartDate(new Date(initialDateFilter.value[0]));
            setCustomEndDate(new Date(initialDateFilter.value[1]));
        }
    } else {
      resetLocalState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDateFilter, availableTables]); 


  useEffect(() => {
    if (selectedTable) {
      fetchDateColumns(selectedTable);
    } else {
      setDateColumns([]);
      setSelectedDateColumn('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);
  
  const resetLocalState = () => {
    setSelectedTable('');
    setSelectedDateColumn('');
    setDateRangeType('custom');
    setCustomStartDate(null);
    setCustomEndDate(null);
    setDataGranularity('asis');
    setDisplayFormat('auto');
    setDateColumns([]);
  };


  const fetchDateColumns = async (tableName, preselectColumnName = null) => {
    if (!tableName) return;
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-column/${tableName}`);
      if (response.data.success) {
        const columns = response.data.data;
        const dateOnlyColumns = columns
          .map(col => ({
              label: col.name || col.column_name,
              value: col.name || col.column_name,
              dataType: col.type || col.data_type,
          }))
          .filter(opt => opt.dataType && isDateType(opt.dataType));
        
        const finalOptions = dateOnlyColumns.map(col => ({
            label: `${col.label} (${col.dataType})`,
            value: col.value
        }));
        
        setDateColumns(finalOptions);
        
        if (preselectColumnName && finalOptions.some(opt => opt.value === preselectColumnName)) {
            setSelectedDateColumn(preselectColumnName);
        } else {
            setSelectedDateColumn('');
        }
        
        if (dateOnlyColumns.length === 0) {
          console.warn(`No date columns found in table: ${tableName}.`);
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
      startDate = format(customStartDate, 'yyyy-MM-dd HH:mm:ss');
      endDate = format(customEndDate, 'yyyy-MM-dd HH:mm:ss');
    } else {
      endDate = format(today, 'yyyy-MM-dd HH:mm:ss'); 
      switch (dateRangeType) {
        case 'last7days': startDate = format(subDays(today, 6), 'yyyy-MM-dd HH:mm:ss'); break;
        case 'last30days': startDate = format(subDays(today, 29), 'yyyy-MM-dd HH:mm:ss'); break;
        case 'last3months': startDate = format(subDays(today, 89), 'yyyy-MM-dd HH:mm:ss'); break;
        case 'last4months': startDate = format(subDays(today, 119), 'yyyy-MM-dd HH:mm:ss'); break;
        case 'last6months': startDate = format(subDays(today, 179), 'yyyy-MM-dd HH:mm:ss'); break;
        case 'last1year': startDate = format(subYears(today, 1), 'yyyy-MM-dd HH:mm:ss'); break;
        default: onDateRangeChange(null); return;
      }
    }

    onDateRangeChange({
      column: `${selectedTable}.${selectedDateColumn}`,
      operator: 'BETWEEN',
      value: [startDate, endDate],
      mode: 'INCLUDE', 
      logic: 'AND',    
      selectedTable,
      columnName: selectedDateColumn,
      dateRangeType,
      granularity: dataGranularity,
      displayFormat: displayFormat,
    });
  };
  
  const handleClearDateRange = () => {
    resetLocalState();
    onDateRangeChange(null); 
  };


  useEffect(() => {
    if (dateRangeType !== 'custom') {
        const today = new Date();
        let sDate, eDate = today;
         switch (dateRangeType) {
            case 'last7days': sDate = subDays(today, 6); break;
            case 'last30days': sDate = subDays(today, 29); break;
            case 'last3months': sDate = subDays(today, 89); break;
            case 'last4months': sDate = subDays(today, 119); break;
            case 'last6months': sDate = subDays(today, 179); break;
            case 'last1year': sDate = subYears(today, 1); break;
            default: sDate = null; eDate = null; break;
        }
        if (sDate && eDate) {
            setCustomStartDate(sDate); 
            setCustomEndDate(eDate);
        }
    }
  }, [dateRangeType]);

  return (
    <div className="p-card p-3 mb-3">
      <h6 className="mb-2">Primary Date Range & Grouping</h6>
      <div className="p-fluid grid formgrid">
        <div className="field col-12 md:col-4 lg:col-3">
          <label htmlFor="tableSelect">Table</label>
          <Dropdown
            inputId="tableSelect"
            value={selectedTable}
            options={tableOptions}
            onChange={(e) => setSelectedTable(e.value)}
            placeholder="Select Table"
            filter
            disabled={tableOptions.length === 0}
            emptyMessage={availableTables.length > 0 ? "No active tables" : "Add dimension/metric first"}
          />
        </div>
        <div className="field col-12 md:col-4 lg:col-3">
          <label htmlFor="dateColumnSelect">Date Column</label>
          <Dropdown
            inputId="dateColumnSelect"
            value={selectedDateColumn}
            options={dateColumns}
            onChange={(e) => setSelectedDateColumn(e.value)}
            placeholder="Select Date Column"
            disabled={!selectedTable || dateColumns.length === 0}
            emptyMessage={selectedTable ? "No date columns" : "Select table first"}
          />
        </div>
        <div className="field col-12 md:col-4 lg:col-3">
          <label htmlFor="dateRangeTypeSelect">Range Type</label>
          <Dropdown
            inputId="dateRangeTypeSelect"
            value={dateRangeType}
            options={dateRangeTypeOptions}
            onChange={(e) => setDateRangeType(e.value)}
            disabled={!selectedDateColumn}
          />
        </div>
         <div className="field col-12 md:col-4 lg:col-3">
          <label htmlFor="granularitySelect">Group By</label>
          <Dropdown
            inputId="granularitySelect"
            value={dataGranularity}
            options={granularityOptions}
            onChange={(e) => setDataGranularity(e.value)}
            disabled={!selectedDateColumn}
          />
        </div>
        <div className="field col-12 md:col-4 lg:col-3">
          <label htmlFor="displayFormatSelect">Display Format</label>
          <Dropdown
            inputId="displayFormatSelect"
            value={displayFormat}
            options={displayFormatOptions}
            onChange={(e) => setDisplayFormat(e.value)}
            disabled={!selectedDateColumn || dataGranularity === 'asis'}
          />
        </div>
        {dateRangeType === 'custom' && (
          <>
            <div className="field col-12 md:col-6">
              <label htmlFor="startDate">Start Date</label>
              <Calendar
                inputId="startDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                placeholder="Start Date"
                disabled={!selectedDateColumn}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="endDate">End Date</label>
              <Calendar
                inputId="endDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.value)}
                dateFormat="yy-mm-dd"
                minDate={customStartDate}
                showIcon
                placeholder="End Date"
                disabled={!selectedDateColumn}
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-2 text-end">
        <Button 
          label="Apply" 
          icon="pi pi-check" 
          onClick={handleApplyDateRange} 
          className="p-button-sm me-2" 
          disabled={!selectedTable || !selectedDateColumn}
        />
        <Button 
          label="Clear" 
          icon="pi pi-times" 
          onClick={handleClearDateRange} 
          className="p-button-sm p-button-secondary" 
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
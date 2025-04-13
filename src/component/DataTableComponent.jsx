import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import axios from 'axios';
import config from '../config';  // Make sure config is set to access the API

const DataTableComponent = ({ data, query }) => {
    const [filters, setFilters] = React.useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [queryResult, setQueryResult] = useState(null);  // Store the result of the query here
    const [selectedText, setSelectedText] = useState("");  // Store selected full text for preview
    const [showPreview, setShowPreview] = useState(false);  // Show/hide preview modal

    useEffect(() => {
        if (query) {
            // Call the API with the query when it changes
            axios
                .post(`${config.API_BASE_URL}/api/kelola-dashboard/execute-query`, { query })
                .then((response) => {
                    if (response.data.success) {
                        setQueryResult(response.data.data);  // Set the query result in the state
                    } else {
                        console.error('Query failed:', response.data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error executing query:', error);
                });
        }
    }, [query]);  // This hook will run every time the query changes

    const renderHeader = () => {
        return (
            <div>
                <InputText value={filters.global.value} onChange={onGlobalFilterChange} placeholder="Global Search" />
            </div>
        );
    };

    const onGlobalFilterChange = (event) => {
        const value = event.target.value;
        setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } });
    };

    const handleDoubleClick = (value) => {
        setSelectedText(value);
        setShowPreview(true);  // Show preview modal on double click
    };

    // Dynamically create columns based on the keys of the query result data
    const columns = queryResult
        ? Object.keys(queryResult[0] || {}).map((key, index) => (
              <Column
                key={index}
                field={key}
                header={key.charAt(0).toUpperCase() + key.slice(1)}
                sortable
                style={{ minWidth: '200px' }}  // Set a fixed width for columns
                bodyStyle={{
                    maxWidth: '200px',  // Limit the width of the cell content
                    whiteSpace: 'nowrap',  // Prevent content from wrapping
                    overflowX: 'hidden',  // Truncate the content and hide overflow
                    textOverflow: 'ellipsis',  // Add ellipsis for truncated content
                    cursor: 'pointer',  // Make the cell appear clickable
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
        <div className="card" style={{ overflowX: 'auto' }}>
            {/* DataTable Component */}
            <DataTable
                value={queryResult || data}  // Use query result if available, otherwise use the passed data
                paginator
                rows={6}
                header={renderHeader()}
                filters={filters}
                onFilter={(e) => setFilters(e.filters)}
                emptyMessage="No data found."
                tableStyle={{ minWidth: '100%' }}
            >
                {columns}
            </DataTable>

            {/* Modal/Preview for the Full Description */}
            {showPreview && (
                <div className="preview-modal" style={modalStyles}>
                    <div className="modal-content" style={modalContentStyles}>
                        <span onClick={closePreview} style={closeButtonStyles}>X</span>
                        {/* <h2>Full Description</h2> */}
                        <p>{selectedText}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles for the modal preview
const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalContentStyles = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    width: '80%',
    maxHeight: '80%',
    overflowY: 'auto',
};

const closeButtonStyles = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '20px',
    cursor: 'pointer',
};

export default DataTableComponent;

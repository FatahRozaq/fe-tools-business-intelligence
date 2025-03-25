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

    // Dynamically create columns based on the keys of the query result data
    const columns = queryResult
        ? Object.keys(queryResult[0] || {}).map((key, index) => (
              <Column key={index} field={key} header={key.charAt(0).toUpperCase() + key.slice(1)} sortable />
          ))
        : [];

    return (
        <div className="card">
            <DataTable
                value={queryResult || data}  // Use query result if available, otherwise use the passed data
                paginator
                rows={5}
                header={renderHeader()}
                filters={filters}
                onFilter={(e) => setFilters(e.filters)}
                emptyMessage="No data found."
                tableStyle={{ minWidth: '1rem' }}
            >
                {columns}
            </DataTable>

            {/* Optionally, display the query */}
           
        </div>
    );
};

export default DataTableComponent;

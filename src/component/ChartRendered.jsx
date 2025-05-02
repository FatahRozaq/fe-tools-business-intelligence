// --- ChartRenderer.jsx ---
import React, { useMemo } from 'react';
import DataTableComponent from "./DataTableComponent"; // Adjust path
import VisualisasiChart from "./Visualiaze";       // Adjust path

// Use React.memo to prevent re-renders if the chart prop itself hasn't changed shallowly.
// For deeper changes (like config), the useMemo inside will handle memoization.
const ChartRenderer = React.memo(({ chart }) => {

    // Now useMemo is called at the top level of this component, which is correct.
    const chartComponent = useMemo(() => {
        console.log(`Rendering ChartRenderer for chart ID: ${chart.id_chart}, Type: ${chart.chart_type}`);

        const requestPayload = {
            id_datasource: chart.id_datasource || 1,
            query: chart.query,
        };

        if (chart.chart_type === 'table') {
             // Ensure DataTableComponent receives necessary props
            return (
                <DataTableComponent
                    query={chart.query}
                    id_datasource={chart.id_datasource}
                    // Pass config if DataTableComponent uses it for styling/options
                    config={chart.config || {}}
                    // Add other props DataTableComponent might need
                />
            );
        } else {
            // Render the chart component
            return (
                <VisualisasiChart
                    requestPayload={requestPayload}
                    chartType={chart.chart_type}
                    chartConfig={chart.config || {}}
                />
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chart.id_datasource, chart.query, chart.chart_type, JSON.stringify(chart.config)]); // Dependencies based on the chart prop

    // The component just returns the memoized chart/table element
    return chartComponent;
});

export default ChartRenderer;
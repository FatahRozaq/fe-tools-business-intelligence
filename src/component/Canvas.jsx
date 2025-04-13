import { useState, useRef, useEffect, useMemo } from "react";
import DataTableComponent from "./DataTableComponent";
import VisualisasiChart from "./Visualiaze";

const Canvas = ({ data, query, chartType, selectedColors }) => {
  const [scale, setScale] = useState(1);
  const zoomSpeed = 0.005;
  const containerRef = useRef(null);

  const requestPayload = useMemo(() => {
    return {
      query: query,
      chartType: chartType,
    };
  }, [query, chartType]);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        let newScale = scale + event.deltaY * -zoomSpeed;
        newScale = Math.min(Math.max(0.5, newScale), 3);
        setScale(newScale);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [scale]);

  if (!query || query.length === 0) {
    return (
      <main className="canvas-container" ref={containerRef}>
        <div
          className="canvas"
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        >
          <div
            id="tableContainer"
            style={{ padding: 20, margin: 10, border: "1px solid #ffffff" }}
          >
            <p>No data available</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="canvas-container" ref={containerRef}>
      <div
        className="canvas"
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        <div
          id="tableContainer"
          style={{ padding: 20, margin: 10, border: "1px solid #ffffff" }}
        >
          {chartType ? (
            <VisualisasiChart requestPayload={requestPayload} selectedColors={selectedColors}/>
          ) : (
            <DataTableComponent data={data} query={query} />
          )}
        </div>
      </div>
    </main>
  );
};

export default Canvas;

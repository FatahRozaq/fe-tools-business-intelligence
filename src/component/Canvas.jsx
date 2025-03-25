import { useState, useRef, useEffect } from "react";
import DataTableComponent from "./DataTableComponent";


const Canvas = ({ data, query }) => {
  const [scale, setScale] = useState(1);
  const zoomSpeed = 0.005;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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
      container.addEventListener("wheel", handleWheel, { passive: false }); // Add passive: false to prevent default scroll behavior
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
        <div className="canvas" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          <div id="tableContainer" style={{ padding: 20, margin: 10, border: "1px solid #ffffff" }}>
            <p>No data available</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="canvas-container"  ref={containerRef}>
      <div className="canvas" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <div id="tableContainer" style={{ padding: 20, margin: 10, border: "1px solid #ffffff" }}>
        <DataTableComponent data={data} query={query} />
        </div>
        
      </div>
    </main>
  );
};

export default Canvas;
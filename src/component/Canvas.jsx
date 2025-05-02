import React, { useState, useRef, useEffect, useMemo } from "react";
import interact from 'interactjs';
import axios from 'axios';
import config from "../config";
import DataTableComponent from "./DataTableComponent";
import Visualisasi from "./Visualiaze";

// Debounce function to limit API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const Canvas = ({ data, query, visualizationType, visualizationConfig }) => {
  const [scale, setScale] = useState(1);
  const [visualizationPosition, setVisualizationPosition] = useState({ x: 20, y: 20 });
  const [visualizationSize, setVisualizationSize] = useState({ width: 800, height: 400 });
  const zoomSpeed = 0.005;
  const containerRef = useRef(null);
  const visualizationContainerRef = useRef(null);
  
  // Memoize visualization component to prevent reloading on zoom
  const visualizationComponent = useMemo(() => {
    const requestPayload = {
      id_datasource: data?.id_datasource || 1,
      query: query,
      visualizationType: visualizationType,
      name: visualizationConfig?.title || "Visualisasi Data"
    };
    
    return visualizationType ? (
      <Visualisasi
        requestPayload={requestPayload}
        visualizationType={visualizationType}
        visualizationConfig={visualizationConfig}
      />
    ) : (
      <DataTableComponent data={data} query={query} />
    );
  }, [data, query, visualizationType, visualizationConfig]);

  // Create a debounced save function
  const saveVisualizationPosition = useMemo(
    () => debounce((position, size) => {
      if (!query) return;
      
      axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, {
        id_canvas: 1,
        id_datasource: data?.id_datasource || 1,
        name: visualizationConfig?.title || "Visualisasi Data",
        visualization_type: visualizationType || "table",
        query: query,
        config: visualizationConfig || {},
        width: size.width,
        height: size.height,
        position_x: position.x,
        position_y: position.y,
      })
      .then(response => {
        console.log("Position and size saved:", response.data);
      })
      .catch(error => {
        console.error("Error saving position and size:", error);
      });
    }, 500),
    [query, visualizationType, visualizationConfig, data]
  );

  // Handle zoom functionality
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

  // Save visualization position and size on initial load
  useEffect(() => {
    if (query && visualizationType) {
      saveVisualizationPosition(visualizationPosition, visualizationSize);
    }
  }, [query, visualizationType]);

  // Initialize interact.js for dragging and resizing
  useEffect(() => {
    if (!visualizationContainerRef.current || !query) return;

    const element = visualizationContainerRef.current;
    const canvasElement = containerRef.current?.querySelector('.canvas');
    
    // Initialize position
    let { x, y } = visualizationPosition;
    let { width, height } = visualizationSize;

    // Apply initial position and size
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    // Setup interact.js
    interact(element)
      .draggable({
        inertia: {
          resistance: 10,
          minSpeed: 100,
          endSpeed: 10
        },
        autoScroll: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: false
          })
        ],
        listeners: {
          move(event) {
            x += event.dx;
            y += event.dy;

            // Get canvas boundaries
            const canvasRect = canvasElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            // Prevent dragging outside canvas boundaries
            const maxX = canvasRect.width - elementRect.width;
            const maxY = canvasRect.height - elementRect.height;
            
            x = Math.min(Math.max(0, x), maxX);
            y = Math.min(Math.max(0, y), maxY);

            element.style.transform = `translate(${x}px, ${y}px)`;
            
            // Update state and save after drag
            const newPosition = { x, y };
            setVisualizationPosition(newPosition);
            saveVisualizationPosition(newPosition, { width, height });
          }
        }
      })
      .resizable({
        // Enable resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },
        
        // Keep the element's position correct when resizing from top/left edges
        invert: 'reposition',
        
        // Minimum size constraints
        restrictSize: {
          min: { width: 300, height: 200 }
        },
        
        // Restrict to parent boundaries
        modifiers: [
          interact.modifiers.restrictEdges({
            outer: 'parent'
          })
        ],
        
        inertia: true,
        
        listeners: {
          move: function (event) {
            // Update width and height based on resize
            width = event.rect.width;
            height = event.rect.height;
            
            // Update position when resizing from top or left edges
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            
            Object.assign(element.style, {
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate(${x}px, ${y}px)`
            });
          },
          end: function() {
            // Update state and save after resize ends
            const newPosition = { x, y };
            const newSize = { width, height };
            setVisualizationPosition(newPosition);
            setVisualizationSize(newSize);
            saveVisualizationPosition(newPosition, newSize);
          }
        }
      });

    // Apply resize indicators for all corners
    element.classList.add('resizable');

    return () => {
      interact(element).unset();
    };
  }, [visualizationContainerRef.current, query, saveVisualizationPosition]);

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
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: "center",
          position: "relative"
        }}
      >
        <div
          ref={visualizationContainerRef}
          className="visualization-container resizable"
          style={{
            width: `${visualizationSize.width}px`,
            height: `${visualizationSize.height}px`,
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
            position: "absolute",
            top: "20px",
            left: "20px",
            cursor: "move",
            touchAction: "none"
          }}
        >
          <div 
            style={{ 
              padding: "10px", 
              height: "100%",
              position: "relative",
              boxSizing: "border-box"
            }}
          >
            {visualizationComponent}
            
            {/* Resize handles at corners */}
            <div className="resize-handle nw" style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              top: '0',
              left: '0',
              cursor: 'nw-resize'
            }}></div>
            <div className="resize-handle ne" style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              top: '0',
              right: '0',
              cursor: 'ne-resize'
            }}></div>
            <div className="resize-handle sw" style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              bottom: '0',
              left: '0',
              cursor: 'sw-resize'
            }}></div>
            <div className="resize-handle se" style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              bottom: '0',
              right: '0',
              cursor: 'se-resize'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* CSS for resize handles */}
      <style jsx>{`
        .visualization-container {
          transition: none; /* Remove transitions for smoother dragging */
        }
        .resize-handle {
          z-index: 100;
        }
        /* Improve cursor indicators across the entire border */
        .resizable {
          position: relative;
        }
        .resizable::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid transparent;
          pointer-events: none;
          z-index: 10;
        }
        .resizable:hover::before {
          border-color: #2196F3;
        }
      `}</style>
    </main>
  );
};

export default Canvas;
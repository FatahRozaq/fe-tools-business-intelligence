// src/components/Canvas/VisualizationItem.js
import React from 'react';
import { useInteractSetup } from './UseInteractSetup';
import DataTableComponent from '../DataTableComponent'; // Adjust path
import Visualisasi from '../Visualiaze'; // Adjust path (and consider renaming Visualiaze)
import { useCallback } from 'react';

const VisualizationItem = React.memo(({
  viz,
  isSelected,
  onSelect,       // (visualizationObject) => void
  onRemove,       // (id) => void
  onUpdate        // (id, {x,y,width,height}) => void
}) => {
  const handleSelect = useCallback(() => onSelect(viz), [onSelect, viz]);
  
  const elementRef = useInteractSetup(
    viz.id,
    viz.x,
    viz.y,
    viz.width,
    viz.height,
    handleSelect, // Pass the memoized version
    onUpdate // Assuming onUpdate from useVisualizations is stable
  );

  const handleItemClick = (e) => {
    // Avoid selection if the remove button or its children are clicked
    if (e.target.classList.contains('remove-button') || e.target.closest('.remove-button')) {
      return;
    }
    handleSelect();
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(viz.id);
  };

  return (
    <div
      ref={elementRef}
      id={viz.id}
      className={`visualization-container ${isSelected ? 'selected' : ''}`}
      style={{
        // Base styles, interact.js will manage transform, width, height
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        position: "absolute", // Crucial for interact.js positioning
        cursor: "grab",
        borderColor: isSelected ? "hsl(206, 90%, 55%)" : "transparent",
        borderWidth: "2px",
        borderStyle: "solid",
        zIndex: isSelected ? 10 : 1,
         // width, height, transform are set by useInteractSetup effect initially
         // and then by interact.js during operations
      }}
      onClick={handleItemClick}
      // data-x, data-y are managed by useInteractSetup
    >
      <div className="visualization-header" style={{ userSelect: 'none', cursor: 'inherit' }}>
        <h3>{viz.title || `Visualisasi ${viz.type}`}</h3>
        <button
          className="remove-button"
          onClick={handleRemoveClick}
          aria-label="Remove visualization"
          title="Remove visualization"
        >
          ×
        </button>
      </div>
      <div
        className="visualization-content"
        style={{
          padding: "10px",
          height: `calc(100% - 40px)`, // Adjust if header height changes
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        {viz.type === 'table' ? (
          <DataTableComponent
            data={viz.relatedData} // Assuming `data` prop on Canvas provides this, or viz needs to fetch its own
            query={viz.query}
          />
        ) : viz.type ? (
          <Visualisasi
            requestPayload={viz.requestPayload}
            visualizationType={viz.type}
            visualizationConfig={viz.config}
          />
        ) : (
          <p style={{ color: 'red', padding: '10px' }}>Tipe visualisasi tidak valid.</p>
        )}
      </div>
    </div>
  );
});

export default VisualizationItem;
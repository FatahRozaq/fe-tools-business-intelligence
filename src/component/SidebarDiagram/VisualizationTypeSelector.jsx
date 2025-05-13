import React from "react";

const VisualizationTypeSelector = ({ options, selectedType, onTypeChange }) => {
  return (
    <div className="mb-4">
      <label className="form-label fw-medium mb-2">
        Pilih Jenis Visualisasi:
      </label>
      <div className="row g-2 row-cols-2">
        {options.map((visualization) => (
          <div className="col text-center" key={visualization.label}>
            <div
              onClick={() => onTypeChange(visualization.type)}
              style={{ cursor: 'pointer', width: "85px" }}
              className={`card card-body p-2 ${selectedType === visualization.type ? 'border-primary border-2' : 'border'}`}
            >
              <img
                src={visualization.image}
                alt={`${visualization.label} Visualization`}
                style={{ width: "50px", height: "50px", objectFit: "contain", margin: "0 auto 0.25rem auto" }}
              />
              <small className="text-body-secondary" style={{ fontSize: '0.75rem' }}>
                {visualization.label}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualizationTypeSelector;
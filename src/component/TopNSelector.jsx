import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { FaChartLine } from "react-icons/fa6";

const TopNSelector = ({ onTopNChange, initialTopN = null }) => {
  const [selectedTopN, setSelectedTopN] = useState(initialTopN?.value || 10);
  const [isCustom, setIsCustom] = useState(initialTopN?.isCustom || false);
  const [customValue, setCustomValue] = useState(initialTopN?.customValue || 10);

  const predefinedOptions = [
    { label: "Top 3", value: 3 },
    { label: "Top 5", value: 5 },
    { label: "Top 10", value: 10 },
    { label: "Top 20", value: 20 },
    { label: "Top 50", value: 50 },
    { label: "Custom", value: "custom" }
  ];

  const handleDropdownChange = (e) => {
    const value = e.value;
    if (value === "custom") {
      setIsCustom(true);
      setSelectedTopN(customValue);
    } else {
      setIsCustom(false);
      setSelectedTopN(value);
    }
  };

  const handleCustomValueChange = (value) => {
    setCustomValue(value);
    if (isCustom) {
      setSelectedTopN(value);
    }
  };

  const handleApply = () => {
    if (selectedTopN <= 0) {
      alert("Top N value must be greater than 0");
      return;
    }
    
    const topNConfig = {
      value: selectedTopN,
      isCustom: isCustom,
      customValue: customValue
    };
    onTopNChange(topNConfig);
  };

  const handleClear = () => {
    setSelectedTopN(10);
    setIsCustom(false);
    setCustomValue(10);
    onTopNChange(null);
  };

  return (
    <div className="top-n-selector">
      <div className="d-flex align-items-center mb-3">
        <FaChartLine className="me-2 text-primary" />
        <h6 className="mb-0">Limit Data Records</h6>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Select Top N Records:</label>
        <Dropdown
          value={isCustom ? "custom" : selectedTopN}
          options={predefinedOptions}
          onChange={handleDropdownChange}
          placeholder="Select top records"
          className="w-100"
        />
      </div>

      {isCustom && (
        <div className="mb-3">
          <label className="form-label">Custom Value:</label>
          <InputNumber
            value={customValue}
            onValueChange={(e) => handleCustomValueChange(e.value)}
            min={1}
            max={10000}
            placeholder="Enter number"
            className="w-100"
          />
        </div>
      )}

      <div className="preview-info mb-3 p-2 bg-light rounded">
        <small className="text-muted">
          Preview: Will show top {selectedTopN} records ordered by the first metric (highest values first)
        </small>
      </div>

      <div className="d-flex gap-2">
        <Button
          label="Apply"
          icon="pi pi-check"
          onClick={handleApply}
          className="p-button-success flex-fill"
          size="small"
        />
        <Button
          label="Clear"
          icon="pi pi-times"
          onClick={handleClear}
          className="p-button-secondary flex-fill"
          size="small"
        />
      </div>
    </div>
  );
};

export default TopNSelector;
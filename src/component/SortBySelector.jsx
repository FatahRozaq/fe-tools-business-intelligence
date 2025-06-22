import React from 'react';

const SortBySelector = ({ sortableColumns, sortBy, setSortBy, orderBy, setOrderBy, disabled }) => {
  return (
    <div className="mt-2">
      {/* Bagian Sort By */}
      <div className="mb-2">
        <label htmlFor="sort-by-select" className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Sort by Column</label>
        <select
          id="sort-by-select"
          className="form-select form-select-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          disabled={disabled}
        >
          <option value="">Default (by dimension)</option>
          {sortableColumns.map((col) => (
            <option key={col.value} value={col.value}>
              {col.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bagian Order By */}
      <div>
        <label htmlFor="order-by-select" className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Order</label>
        <select
          id="order-by-select"
          className="form-select form-select-sm"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          disabled={disabled || !sortBy}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
};

export default SortBySelector;
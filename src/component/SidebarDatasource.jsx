import React from "react";
import { FaPlus } from "react-icons/fa";
import { GrDatabase } from "react-icons/gr";

const SidebarDatasource = ({ onTambahDatasource }) => {
  return (
    <div id="sidebar" className="sidebar-2">
      <div className="sub-title">
        <GrDatabase size={48} className="text-muted" />
        <span className="sub-text">Datasource</span>
      </div>
      <hr className="full-line" />
      <div className="alert alert-warning text-center">
        Anda belum memiliki datasource.
      </div>
      <div className="text-center">
        <button
          type="button"
          className="btn d-flex align-items-center justify-content-center py-2 w-100 h-75 mt-3"
          style={{
            backgroundColor: "#000080",
            color: "white",
            borderRadius: "0.375rem",
          }}
          onClick={onTambahDatasource}
          id="btn-tambah-datasource-initial"
        >
          <FaPlus className="me-2" />
          Tambah Datasource
        </button>
      </div>
    </div>
  );
};

export default SidebarDatasource;
import React from "react";

const SidebarDatasource = ({ onTambahDatasource }) => {
  return (
    <div id="sidebar" className="sidebar-2">
      <div className="sub-title">
        <img src="/assets/img/icons/Storage.png" alt="" />
        <span className="sub-text">Data</span>
      </div>
      <hr className="full-line" />
      <div className="alert alert-warning text-center">
        Anda belum memiliki datasource.
      </div>
      <div className="text-center">
        <button className="btn btn-primary" id="menu-tambah-datasource" onClick={onTambahDatasource}>
          Tambah Datasource
        </button>
      </div>
    </div>
  );
};

export default SidebarDatasource;

import React from "react";

const Header = () => {
  return (
    <header className="header fixed-top d-flex align-items-center p-3 bg-white shadow">
      <div className="logo me-3">
        {/* <img src="/assets/img/logo/ArutalaHitam.png" alt="Logo" className="img-fluid" /> */}
      </div>
      <div className="d-flex flex-column">
        <span className="fw-bold">Tools Business Intelligence</span>
        <div className="d-flex text-muted">
          <span>Halaman 1 dari 3</span>
          <span className="mx-2">|</span>
          <span id="menu-data" className="cursor-pointer">Pilih Data</span>
          <span className="mx-2">|</span>
          <span id="menu-visualisasi" className="cursor-pointer">Pilih Visualisasi</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
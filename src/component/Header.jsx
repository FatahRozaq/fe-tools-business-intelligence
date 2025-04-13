import React from "react";
import { AiOutlineDatabase, AiOutlinePieChart } from "react-icons/ai";
import { MdOutlineStorage } from "react-icons/md";
import { TbSql } from "react-icons/tb";
import logo from "../assets/img/Logo TBI.png";

const Header = () => {
  return (
    <header className="header fixed-top d-flex align-items-center p-3 bg-white shadow">
      <div className="logo me-3">
        <img src={logo} alt="Logo" width={10} height={10} />
      </div>
      <div className="d-flex flex-column">
        <span className="fw-bold">Tools Business Intelligence</span>
        <div className="d-flex justify-content-center align-items-center text-muted" style={{ cursor: 'pointer' }}>
          <span>Halaman 1 dari 3</span>
          <span className="mx-2">|</span>

          <span
            id="menu-data"
            className="cursor-pointer d-flex align-items-center"
          >
            <AiOutlineDatabase className="me-1" />
            Pilih Data
          </span>

          <span className="mx-2">|</span>

          <span
            id="menu-visualisasi"
            className="cursor-pointer d-flex align-items-center"
          >
            <AiOutlinePieChart className="me-1" />
            Pilih Visualisasi
          </span>

          <span className="mx-2">|</span>

          <span
            id="menu-query"
            className="cursor-pointer d-flex align-items-center"
          >
            <TbSql className="me-1 mt-1" />
            Query
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

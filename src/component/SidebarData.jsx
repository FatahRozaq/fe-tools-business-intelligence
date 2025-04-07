import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";

const SidebarData = ({ fetchData, addDimensi, setCanvasData, setCanvasQuery, selectedTable }) => {
  const [dimensiInputs, setDimensiInputs] = useState([""]);
  const [metrikInputs, setMetrikInputs] = useState([""]);
  const [showFooter, setShowFooter] = useState(false);
  const [filters, setFilters] = useState([
    { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }
  ]);

  // Fungsi untuk menambahkan input Dimensi
  const handleAddDimensi = () => {
    setDimensiInputs([...dimensiInputs, ""]);
  };

  // Fungsi untuk menambahkan input Metrik
  const handleAddMetrik = () => {
    setMetrikInputs([...metrikInputs, ""]);
  };

  // Fungsi menampilkan FooterBar
  const handleToggleFooter = () => {
    setShowFooter(!showFooter);
  };

  // Fungsi untuk menangani perubahan input Dimensi
  const handleDimensiChange = (index, event) => {
    const newDimensiInputs = [...dimensiInputs];
    newDimensiInputs[index] = event.target.value;
    setDimensiInputs(newDimensiInputs);
  };

  // Fungsi untuk menangani perubahan input Metrik
  const handleMetrikChange = (index, event) => {
    const newMetrikInputs = [...metrikInputs];
    newMetrikInputs[index] = event.target.value;
    setMetrikInputs(newMetrikInputs);
  };

  const handleApplyFilters = (newFilters, appliedFilters) => {
    console.log("Filters applied:", appliedFilters);
    setFilters(newFilters);
    sendDataToAPI(); // Kirim ulang data setelah filter diterapkan
  };

  // Fungsi untuk mengirim data dimensi dan metriks ke API
  const sendDataToAPI = () => {
    const table = selectedTable;  // Menggunakan prop selectedTable
    const dimensi = dimensiInputs.filter((input) => input.trim() !== "");
    const metriks = metrikInputs.length > 0 ? metrikInputs[0] : null; 

    axios
      .post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data/${table}`, {
        dimensi,
        metriks,
        filters,
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Data berhasil dikirim", response.data.data);
          console.log("Data berhasil dikirim", response.data.query);
          setCanvasData(response.data.data)
          setCanvasQuery(response.data.query);

        } else {
          console.log("Gagal mengirim data", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengirim data", error);
      })
  };

  return (
    <div id="sidebar-data" className="sidebar-2">
      <div className="sub-title">
        <img src="/assets/img/icons/ChartPieOutline.png" alt="" />
        <span className="sub-text">Data</span>
      </div>
      <hr className="full-line" />
      <div className="form-diagram">
        <div className="form-group">
          <span>Dimensi</span>
          <div id="dimensi-container">
            {dimensiInputs.map((dimensi, index) => (
              <div key={index} className="dimensi-row">
                <input
                  type="text"
                  className="dimensi-input"
                  value={dimensi}
                  onChange={(e) => handleDimensiChange(index, e)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={handleAddDimensi}
          >
            Tambah Dimensi
          </button>
        </div>

        <div className="form-group">
          <span>Metrik</span>
          <div id="metrik-container">
            {metrikInputs.map((metrik, index) => (
              <div key={index} className="metrik-row">
                <input
                  type="text"
                  className="metrik-input"
                  value={metrik}
                  onChange={(e) => handleMetrikChange(index, e)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={handleAddMetrik}
          >
            Tambah Metrik
          </button>
        </div>

        <div className="form-group">
          <span>Tanggal</span>
          <input type="text" id="tanggal-input" onChange={fetchData} />
        </div>
        <div className="form-group">
          <span>Filter</span>
          <button type="button" className="btn btn-secondary mt-2" onClick={handleToggleFooter}>
            Buat Filter</button>
        </div>

        <button type="button" className="btn btn-primary mt-3" onClick={sendDataToAPI}>
        Kirim Data
      </button>
      </div>
      {showFooter && <FooterBar
      filters={filters}
      setFilters={setFilters}
      handleApplyFilters={handleApplyFilters}
      handleToggleFooter={handleToggleFooter} />}
    </div>
  );
};

export default SidebarData;

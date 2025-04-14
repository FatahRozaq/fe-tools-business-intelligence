import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import { GrDatabase } from "react-icons/gr";
import { FaPlus } from "react-icons/fa";

const AddDatasource = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    host: "",
    port: "",
    database_name: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
  
    axios
      .post(
        `${config.API_BASE_URL}/api/kelola-dashboard/fetch-database`,
        formData
      )
      .then((response) => {
        if (response.data.success) {
          setMessage("Database telah ditambahkan");
          setTimeout(() => {
            window.location.reload(); // refresh halaman setelah submit sukses
          }, 1000); // kasih delay sedikit biar pesan sempat muncul
        } else {
          setMessage("Gagal menyimpan koneksi database");
        }
      })
      .catch((error) => {
        setMessage("Terjadi kesalahan: " + error.message);
      });
  };
  

  return (
    <div className="sidebar-2" id="tambah-datasource">
      <div className="sub-title">
        <GrDatabase size={48} className="text-muted" />
        <span className="sub-text">Datasources</span>
      </div>
      <hr className="full-line" />
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Nama <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Tipe <span className="text-danger">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">-- Pilih Tipe --</option>
            <option value="pgsql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Host <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Port <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Nama Database <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="database_name"
            value={formData.database_name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Username <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <button
          type="submit"
          className="btn d-flex align-items-center justify-content-center py-2 w-100 h-24 mt-3"
          style={{
            backgroundColor: "#000080",
            color: "white",
            borderRadius: "0.375rem",
          }}
        >
          <FaPlus className="me-2" />
          Simpan
        </button>
      </form>
    </div>
  );
};

export default AddDatasource;

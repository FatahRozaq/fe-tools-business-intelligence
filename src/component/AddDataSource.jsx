import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import { GrDatabase } from "react-icons/gr";
import { FaFloppyDisk } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

const AddDatasource = ({ onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    connection_name: "",
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    setIsLoading(true);

    axios
      .post(`${config.API_BASE_URL}/api/kelola-dashboard/etl/run`, formData)
      .then((response) => {
        setIsLoading(false);
        if (response.data.status === 'success') {
          setMessage("Datasource berhasil ditambahkan dan data sedang diproses. Halaman akan dimuat ulang.");
          setTimeout(() => {
            onSaveSuccess();
          }, 2000);
        } else {
          setMessage(response.data.message || "Gagal menyimpan koneksi database.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response && error.response.status === 422) {
          setMessage("Data yang dimasukkan tidak valid. Silakan periksa kembali.");
          setErrors(error.response.data.errors);
        } else if (error.response && error.response.data.message) {
            setMessage(error.response.data.message);
        } else {
          setMessage("Terjadi kesalahan: " + error.message);
        }
      });
  };

  return (
    <div className="sidebar-2" id="tambah-datasource">
      <div className="sub-title">
        <GrDatabase size={48} className="text-muted" />
        <span className="sub-text">Tambah Datasource</span>
      </div>
      <hr className="full-line" />
      {message && <div className={`alert ${errors.length > 0 ? 'alert-danger' : 'alert-info'}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Nama Koneksi <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="connection_name"
            placeholder="e.g., crm_production"
            value={formData.connection_name}
            onChange={handleChange}
            required
            className={`form-control ${errors.connection_name ? 'is-invalid' : ''}`}
          />
          {errors.connection_name && <div className="invalid-feedback">{errors.connection_name[0]}</div>}
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
            className={`form-control ${errors.host ? 'is-invalid' : ''}`}
          />
           {errors.host && <div className="invalid-feedback">{errors.host[0]}</div>}
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
            className={`form-control ${errors.port ? 'is-invalid' : ''}`}
          />
           {errors.port && <div className="invalid-feedback">{errors.port[0]}</div>}
        </div>

        <div className="form-group">
          <label>
            Nama Database <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="database"
            value={formData.database}
            onChange={handleChange}
            required
            className={`form-control ${errors.database ? 'is-invalid' : ''}`}
          />
           {errors.database && <div className="invalid-feedback">{errors.database[0]}</div>}
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
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
          />
           {errors.username && <div className="invalid-feedback">{errors.username[0]}</div>}
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
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          />
           {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>

        <button
          type="submit"
          className="btn d-flex align-items-center justify-content-center py-2 w-100 mt-3"
          style={{
            backgroundColor: "#000080",
            color: "white",
            borderRadius: "0.375rem",
            height: 40
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <>
              <FaFloppyDisk className="me-2" />
              Simpan & Proses
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2 w-100 mt-2"
          style={{ height: 40 }}
          disabled={isLoading}
        >
          <MdCancel className="me-2" />
          Batal
        </button>
      </form>
    </div>
  );
};

export default AddDatasource;
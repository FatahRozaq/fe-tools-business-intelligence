import React, { useState } from "react";
import axios from "axios";
import config from "../config";

const AddDatasource = () => {
  const [formData, setFormData] = useState({
    id_project: "",
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
      .post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-database`, formData)
      .then((response) => {
        if (response.data.success) {
          setMessage("Database telah ditambahkan");
        } else {
          setMessage("Gagal menyimpan koneksi database");
        }
      })
      .catch((error) => {
        setMessage("Terjadi kesalahan: " + error.message);
      });
  };

  return (
    <div className="connect-db-form" id="tambah-datasource">
      <h2>Tambah Koneksi Database</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID Project</label>
          <input type="number" name="id_project" value={formData.id_project} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nama</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Tipe</label>
          <input type="text" name="type" value={formData.type} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Host</label>
          <input type="text" name="host" value={formData.host} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Port</label>
          <input type="number" name="port" value={formData.port} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nama Database</label>
          <input type="text" name="database_name" value={formData.database_name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary">Simpan</button>
      </form>
    </div>
  );
};

export default AddDatasource;

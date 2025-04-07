import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";

const SidebarData = ({ fetchData, addDimensi, setCanvasData, setCanvasQuery, selectedTable }) => {
  const [dimensiInputs, setDimensiInputs] = useState([""]);
  const [metrikInputs, setMetrikInputs] = useState([]);
  const [showFooter, setShowFooter] = useState(false);
  const [filters, setFilters] = useState([
    { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [joinDimensiIndexes, setJoinDimensiIndexes] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedJoinTable, setSelectedJoinTable] = useState([]);

  const [selectedJoinTableMetrik, setSelectedJoinTableMetrik] = useState([]);
  const [showPopupMetrik, setShowPopupMetrik] = useState(false);

  const [joinDimensiData, setJoinDimensiData] = useState([]); // Untuk join dimensi
  const [joinMetrikData, setJoinMetrikData] = useState([]); // Untuk join metrik
  

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-table/1`)
      .then((response) => {
        if (response.data.success) {
          setTables(response.data.data);
        } else {
          console.log("Gagal mengambil tabel", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengambil daftar tabel", error);
      });
  }, []);

  useEffect(() => {
    // Pastikan dimensi hanya berisi nama kolom, tanpa tabel
    console.log("Dimensi yang terkirim:", dimensiInputs);
  }, [dimensiInputs]);

  const handleAddDimensi = () => {
    const lastDimensi = dimensiInputs[dimensiInputs.length - 1];

    // Jika kolom dimensi terakhir masih kosong, langsung tambahkan dimensi baru
    if (lastDimensi.trim() === "") {
      setDimensiInputs([...dimensiInputs, ""]);
    } else {
      // Jika kolom dimensi terakhir sudah terisi, tampilkan popup untuk memilih "Dengan Join" atau "Tanpa Join"
      setShowPopup(true);
    }
  };

  const handleAddMetrik = () => {
    setMetrikInputs([...metrikInputs, ""]); // Menambahkan input metrik baru ke dalam array metriks
    setShowPopupMetrik(true); // Menampilkan popup untuk memilih tabel dan jenis join
  };

  // Fungsi menampilkan FooterBar
  const handleToggleFooter = () => {
    setShowFooter(!showFooter);
  };

  const handleDimensiChange = (index, event) => {
    const newDimensiInputs = [...dimensiInputs];
    newDimensiInputs[index] = event.target.value;  // Memasukkan format tableName.columnName
    setDimensiInputs(newDimensiInputs);
};

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

  const handleJoinSelection = (type) => {
    const newJoinDimensiIndexes = [...joinDimensiIndexes];
    const lastDimensiIndex = dimensiInputs.length - 1;
  
    const newJoinData = [...joinDimensiData];
    const selectedTableForJoin = selectedJoinTable;
    newJoinData[lastDimensiIndex] = { 
      tabel: selectedTableForJoin, 
      join_type: type 
    };
  
    if (type !== "tanpa join") {
      newJoinDimensiIndexes.push(lastDimensiIndex);
    } else {
      const updatedIndexes = newJoinDimensiIndexes.filter((index) => index !== lastDimensiIndex);
      newJoinDimensiIndexes.splice(0, newJoinDimensiIndexes.length, ...updatedIndexes);
      newJoinData[lastDimensiIndex] = { tabel: "", join_type: "tanpa join" };
    }
  
    setJoinDimensiData(newJoinData);
    setJoinDimensiIndexes(newJoinDimensiIndexes);
    setShowPopup(false);
    setDimensiInputs([...dimensiInputs, ""]);
  };
  
  const handleJoinSelectionMetrik = (type) => {
    const newJoinData = [...joinMetrikData];
    const lastMetrikIndex = metrikInputs.length - 1;
  
    if (type !== "tanpa join") {
      // Hanya menambahkan data join jika jenis join bukan "tanpa join"
      newJoinData[lastMetrikIndex] = { 
        tabel: selectedJoinTableMetrik, 
        join_type: type 
      };
    } else {
      // Jika jenis join "tanpa join", hapus data join yang ada di index tersebut
      newJoinData[lastMetrikIndex] = { 
        tabel: "", 
        join_type: "tanpa join" 
      };
    }
  
    setJoinMetrikData(newJoinData);
    setShowPopupMetrik(false);
  };
  
  const sendDataToAPI = () => {
    const firstDimensi = dimensiInputs[0];
    let table = '';
    if (firstDimensi) {
      try {
        const parsedDimensi = JSON.parse(firstDimensi);
        table = parsedDimensi.tableName || '';
      } catch (e) {
        console.error("Failed to parse firstDimensi:", e);
      }
    }
  
    const dimensi = dimensiInputs
      .map((dimensi) => {
        try {
          const parsedDimensi = JSON.parse(dimensi);
          return parsedDimensi.tableName && parsedDimensi.columnName
            ? `${parsedDimensi.tableName}.${parsedDimensi.columnName}`
            : '';
        } catch (e) {
          console.error("Failed to parse dimensi item:", e);
          return '';
        }
      })
      .filter((input) => input && input.trim() !== "");
  
    const metriks = metrikInputs
      .map((metrik) => {
        try {
          const parsedMetrik = JSON.parse(metrik);
          return parsedMetrik.tableName && parsedMetrik.columnName
            ? `${parsedMetrik.tableName}.${parsedMetrik.columnName}`
            : '';
        } catch (e) {
          console.error("Failed to parse metrik item:", e);
          return '';
        }
      })
      .filter((input) => input && input.trim() !== "");
  
    // Gabungkan join dimensi dan join metrik
    const tabelJoin = [
      ...joinDimensiData.filter((dimensiJoin) => dimensiJoin.tabel && dimensiJoin.join_type !== "tanpa join"),
      ...joinMetrikData.filter((metrikJoin) => metrikJoin.tabel && metrikJoin.join_type !== "tanpa join"),
    ];
  
    axios
      .post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data`, {
        tabel: table,
        dimensi,
        metriks,
        tabel_join: tabelJoin,  // Gabungkan join dimensi dan join metrik
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Data berhasil dikirim", response.data.data);
          setCanvasData(response.data.data);
          setCanvasQuery(response.data.query);
        } else {
          console.log("Gagal mengirim data", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengirim data", error);
      });
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
                {joinDimensiIndexes.includes(index) && joinDimensiData[index] && (
                  <span className="join-text">{joinDimensiData[index].join_type} {joinDimensiData[index].tabel}</span>
                )}
              </div>
            ))}
          </div>
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h6>Pilih jenis Dimensi:</h6>
                <select onChange={(e) => setSelectedJoinTable(e.target.value)}>
                  <option value="">Pilih Tabel Join</option>
                  {tables.map((table, idx) => (
                    <option key={idx} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
                <h6>Join Tipe:</h6>
                <button onClick={() => handleJoinSelection("INNER")}>INNER JOIN</button>
                <button onClick={() => handleJoinSelection("LEFT")}>LEFT JOIN</button>
                <button onClick={() => handleJoinSelection("RIGHT")}>RIGHT JOIN</button>
                <button onClick={() => handleJoinSelection("SELF")}>SELF JOIN</button>
                <button onClick={() => handleJoinSelection("CROSS")}>CROSS JOIN</button>
                <button onClick={() => handleJoinSelection("FULL")}>FULL JOIN</button>
                <button onClick={() => handleJoinSelection("tanpa join")}>Tanpa Join</button>
              </div>
            </div>
          )}
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
                {joinMetrikData[index] && (
                  <span className="join-text">{joinMetrikData[index].join_type} {joinMetrikData[index].tabel}</span>
                )}
                <input
                  type="text"
                  className="metrik-input"
                  value={metrik}
                  onChange={(e) => handleMetrikChange(index, e)}
                />
                
              </div>
            ))}
          </div>
          {showPopupMetrik && (
            <div className="popup">
              <div className="popup-content">
                <h6>Pilih jenis Metriks:</h6>
                <select onChange={(e) => setSelectedJoinTableMetrik(e.target.value)}>
                  <option value="">Pilih Tabel Join</option>
                  {tables.map((table, idx) => (
                    <option key={idx} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
                <h6>Join Tipe:</h6>
                <button onClick={() => handleJoinSelectionMetrik("INNER")}>INNER JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("LEFT")}>LEFT JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("RIGHT")}>RIGHT JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("SELF")}>SELF JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("CROSS")}>CROSS JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("FULL")}>FULL JOIN</button>
                <button onClick={() => handleJoinSelectionMetrik("tanpa join")}>Tanpa Join</button>
              </div>
            </div>
          )}
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

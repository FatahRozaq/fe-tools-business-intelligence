import React, { useState, useEffect } from "react";
import { AiOutlineDatabase, AiOutlinePieChart, AiOutlineLogout, AiOutlineUser,
AiOutlineCheck, AiOutlineClose, AiOutlineEdit} from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { TbSql } from "react-icons/tb";
import logo from "../assets/img/Logo TBI.png";
import config from "../config";
import axios from "axios";
import "../assets/css/header.css";

const Header = ({ currentCanvasIndex,
  setCurrentCanvasIndex,
  setCanvases,
  canvases,
  currentCanvasId,
  setCurrentCanvasId,
  onLogout,
  onMenuClick,
  userAccessLevel,
  totalCanvasCount, 
  setTotalCanvasCount
}) => {
  const [totalCanvases, setTotalCanvases] = useState(0);
  const [userName, setUserName] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);
  const [newAccessValue, setNewAccessValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const accessLevels = [
    { value: 'view', label: 'View', color: 'info' },
    { value: 'edit', label: 'Edit', color: 'warning' },
    { value: 'admn', label: 'Admin', color: 'success' },
    { value: 'none', label: 'Tidak Ada Akses', color: 'secondary' }
  ];

  useEffect(() => {
    const savedIndex = localStorage.getItem("currentCanvasIndex");
  const savedCanvasId = localStorage.getItem("currentCanvasId");

  if (savedIndex !== null && typeof setCurrentCanvasIndex === 'function') {
    setCurrentCanvasIndex(parseInt(savedIndex));
  }

  if (savedCanvasId !== null && typeof setCurrentCanvasId === 'function') {
    setCurrentCanvasId(parseInt(savedCanvasId));
  }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserName(userData.name);
    }

    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases);
          setTotalCanvasCount(activeCanvases.length);
        } else {
          console.error("Failed to fetch canvases:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching canvases:", error);
      });
  }, [setCanvases, setCurrentCanvasIndex, setCurrentCanvasId]);

  const goToNextCanvas = () => {
  if (currentCanvasIndex < canvases.length - 1 && canvases.length > 0) {
    const newIndex = currentCanvasIndex + 1;
    const newCanvasId = canvases[newIndex].id;

    setCurrentCanvasIndex(newIndex);
    setCurrentCanvasId(newCanvasId);

    localStorage.setItem("currentCanvasIndex", newIndex);
    localStorage.setItem("currentCanvasId", newCanvasId);

    console.log("Canvas Index: ", newIndex);
    console.log("Canvas ID: ", newCanvasId);
  }
};

const goToPreviousCanvas = () => {
  if (currentCanvasIndex > 0 && canvases.length > 0) {
    const newIndex = currentCanvasIndex - 1;
    const newCanvasId = canvases[newIndex].id;

    setCurrentCanvasIndex(newIndex);
    setCurrentCanvasId(newCanvasId);

    localStorage.setItem("currentCanvasIndex", newIndex);
    localStorage.setItem("currentCanvasId", newCanvasId);

    console.log("Canvas Index: ", newIndex);
    console.log("Canvas ID: ", newCanvasId);
  }
};

const canNavigate = userAccessLevel === 'admn' || userAccessLevel === 'edit';

  return (
    <header className="header fixed-top d-flex align-items-center justify-content-between p-3 bg-white shadow">
      <div className="d-flex align-items-center">
      <div className="logo me-3">
        <img src={logo} alt="Logo" width={10} height={10} />
      </div>
      <div className="d-flex flex-column">
        <span className="fw-bold">Tools Business Intelligence</span>
        <div className="d-flex justify-content-center align-items-center text-muted" style={{ cursor: 'pointer' }}>
          <div className="d-flex align-items-center">
          <span
            className="cursor-pointer"
            onClick={goToPreviousCanvas}
            style={{ padding: "0 10px", fontSize: "20px" }}
          >
            ←
          </span>
          <span id="menu-canvas"
          onClick={() => onMenuClick('canvas')}
          >
            Kanvas {totalCanvases > 0 ? currentCanvasIndex + 1 : 0} dari {totalCanvasCount}
          </span>
          <span
            className="cursor-pointer"
            onClick={goToNextCanvas}
            style={{ padding: "0 10px", fontSize: "20px" }}
          >
            →
          </span>
          </div>

          {(userAccessLevel === 'admn' || userAccessLevel === 'edit') && (
              <>
                <span className="mx-2">|</span>
                <span id="menu-data" className="cursor-pointer d-flex align-items-center"
                onClick={() => onMenuClick('data')}
                >
                  <AiOutlineDatabase className="me-1" />
                  Pilih Data
                </span>
                <span className="mx-2">|</span>
                <span id="menu-visualisasi" className="cursor-pointer d-flex align-items-center"
                onClick={() => onMenuClick('visualisasi')}
                >
                  <AiOutlinePieChart className="me-1" />
                  Pilih Visualisasi
                </span>
                <span className="mx-2">|</span>
                <span id="menu-query" className="cursor-pointer d-flex align-items-center"
                onClick={() => onMenuClick('query')}
                >
                  <TbSql className="me-1 mt-1" />
                  Query
                </span>
              </>
            )}

          {(userAccessLevel === 'admn' || userAccessLevel === 'edit') && (
              <>
              <span className="mx-2">|</span>
                    <div id="user-dropdown-container" className="position-relative">
                      <span 
                        id="menu-user" 
                        className="cursor-pointer d-flex align-items-center" 
                        onClick={handleUserAuthClick}
                      >
                        <AiOutlineUser className="me-1" />
                        Otorisasi Pengguna
                      </span>
                      {showUserDropdown && (
                        <div className="position-absolute bg-white border rounded shadow-lg mt-2 py-2"
                          style={{ 
                            minWidth: '400px', 
                            maxHeight: '500px', 
                            overflowY: 'auto',
                            zIndex: 1000,
                            top: '100%',
                            left: '0'
                          }}
                        >
                          {/* Header */}
                          <div className="px-3 py-2 border-bottom">
                            <strong className="text-secondary">Manajemen Pengguna</strong>
                            <div className="mt-2">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Cari pengguna..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                          </div>
      
                          {loadingEmails ? (
                            <div className="px-3 py-4 text-center">
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Memuat data pengguna...
                            </div>
                          ) : filteredUsers.length > 0 ? (
                            <div>
                              {filteredUsers.map((user) => {
                                const currentAccess = getUserAccess(user);
                                const accessInfo = getAccessInfo(currentAccess);
                                const isEditing = editingAccess === user.id_user;
                                
                                return (
                                  <div 
                                    key={user.id_user} 
                                    className={`px-3 py-3 border-bottom ${isEditing ? 'bg-light' : ''}`}
                                    style={{ backgroundColor: isEditing ? '#f8f9fa' : 'transparent' }}
                                  >
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-1">
                                          <AiOutlineUser className="me-2 text-muted" />
                                          <div>
                                            <div className="text-muted small">{user.email}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="d-flex align-items-center">
                                        {isEditing ? (
                                          <div className="d-flex align-items-center">
                                            <select
                                              className="form-select form-select-sm me-2"
                                              value={newAccessValue}
                                              onChange={(e) => setNewAccessValue(e.target.value)}
                                              style={{ minWidth: '120px' }}
                                            >
                                              {accessLevels.map(level => (
                                                <option key={level.value} value={level.value}>
                                                  {level.label}
                                                </option>
                                              ))}
                                            </select>
                                            <button
                                              className="btn btn-success btn-sm me-1"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateAccess(user.id_user, newAccessValue);
                                              }}
                                            >
                                              <AiOutlineCheck />
                                            </button>
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAccess(null);
                                                setNewAccessValue('');
                                              }}
                                            >
                                              <AiOutlineClose />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="d-flex align-items-center">
                                            <span className={`badge bg-${accessInfo.color} me-2`}>
                                              {accessInfo.label}
                                            </span>
                                            <button
                                              className="btn btn-outline-primary btn-sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (editingAccess && editingAccess !== user.id_user) {
                                                  setEditingAccess(null);
                                                  setNewAccessValue('');
                                                }
                                                setEditingAccess(user.id_user);
                                                setNewAccessValue(currentAccess);
                                              }}
                                              title="Edit akses pengguna"
                                            >
                                              <AiOutlineEdit />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="px-3 py-4 text-muted text-center">
                              {searchQuery ? 
                                `Tidak ada pengguna yang ditemukan untuk "${searchQuery}"` : 
                                'Tidak ada pengguna terdaftar'
                              }
                            </div>
                          )}
      
                          {/* Footer with summary */}
                          {!loadingEmails && filteredUsers.length > 0 && (
                            <div className="px-3 py-2 border-top bg-light">
                              <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                  {searchQuery ? 
                                    `${filteredUsers.length} dari ${usersList.length} pengguna` :
                                    `Total: ${usersList.length} pengguna`
                                  }
                                </span>
                                <div className="d-flex gap-2">
                                  {accessLevels.slice(0, 3).map(level => {
                                    const count = filteredUsers.filter(user => 
                                      getUserAccess(user) === level.value
                                    ).length;
                                    return (
                                      <span key={level.value} className={`badge bg-${level.color}`}>
                                        {level.label}: {count}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
              </>
            )}
          </div>

          <span className="mx-2">|</span>
          
          <span id="menu-tambah-datasource" className="cursor-pointer d-flex align-items-center text-primary">
            <FaPlus className="me-1" />
            Tambah Datasource
          </span>
        </div>
      </div>

      {/* Right Section - Welcome Message and Logout */}
      <div className="d-flex align-items-center">
        {userName && (
          <span className="me-3 text-muted">
            Selamat datang, <strong>{userName}</strong>
          </span>
        )}
        <button 
          className="btn btn-outline-danger btn-sm d-flex align-items-center"
          onClick={handleLogout}
          title="Logout"
        >
          <AiOutlineLogout className="me-1" />
          Keluar
        </button>
      </div>
    </header>
  );
};

export default Header;
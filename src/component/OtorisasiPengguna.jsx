import React, { useState, useEffect, useMemo } from 'react';
import { AiOutlineUser, AiOutlineCheck, AiOutlineClose, AiOutlineEdit } from 'react-icons/ai';
import axios from 'axios';
import config from '../config';

// Styling for the modal, can be moved to a CSS file
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e9ecef',
    textAlign: 'right',
  },
};

const OtorisasiPengguna = ({ isOpen, onClose }) => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null); // Stores user ID being edited
  const [newAccessValue, setNewAccessValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const accessLevels = [
    { value: 'view', label: 'View', color: 'info' },
    { value: 'edit', label: 'Edit', color: 'warning' },
    { value: 'admin', label: 'Admin', color: 'success' },
    { value: 'none', label: 'Tidak Ada Akses', color: 'secondary' }
  ];

  // Fetch users when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchUserEmails();
    } else {
      // Reset state when modal is closed
      setEditingAccess(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchUserEmails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/otentikasi/get-user`);
      if (response.data.success) {
        setUsersList(response.data.data);
      } else {
        console.error("Failed to fetch user emails:", response.data.message);
        setUsersList([]);
      }
    } catch (error) {
      console.error("Error fetching user emails:", error);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccess = async (userId, newAccess) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const modifiedBy = currentUser?.name || 'Unknown';
      
      await axios.post(
        `${config.API_BASE_URL}/api/otentikasi/update-access`,
        {
          id_user: userId,
          id_project: 1, // Assuming project ID 1
          access: newAccess,
          created_by: modifiedBy,
          modified_by: modifiedBy,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Refetch user list to show updated data
      fetchUserEmails();
      setEditingAccess(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating access:', error);
      alert('Gagal memperbarui akses pengguna.');
    }
  };
  
  const getUserAccess = (user) => {
    const projectAccess = user.projects_access?.find(acc => acc.id_project === 1);
    return projectAccess ? projectAccess.access : 'none';
  };
  
  const getAccessInfo = (access) => {
    return accessLevels.find(level => level.value === access) || accessLevels[3];
  };

  const filteredUsers = useMemo(() => 
    usersList.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [usersList, searchQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <header style={modalStyles.header}>
          <h5 className="mb-0">Otorisasi Pengguna Proyek</h5>
          <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        </header>

        <div style={modalStyles.body}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Cari pengguna berdasarkan email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="list-group" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const currentAccess = getUserAccess(user);
                const accessInfo = getAccessInfo(currentAccess);
                const isEditing = editingAccess === user.id_user;

                return (
                  <div key={user.id_user} className="list-group-item d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <AiOutlineUser className="me-3 text-secondary" size={24} />
                      <div>
                        <div className="fw-bold">{user.name}</div>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                    </div>
                    
                    <div>
                      {isEditing ? (
                        <div className="d-flex align-items-center">
                          <select
                            className="form-select form-select-sm me-2"
                            value={newAccessValue}
                            onChange={(e) => setNewAccessValue(e.target.value)}
                          >
                            {accessLevels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                          <button className="btn btn-success btn-sm me-1" onClick={() => handleUpdateAccess(user.id_user, newAccessValue)}>
                            <AiOutlineCheck />
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingAccess(null)}>
                            <AiOutlineClose />
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <span className={`badge bg-${accessInfo.color} me-3`}>{accessInfo.label}</span>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            title="Edit akses pengguna"
                            onClick={() => {
                              setEditingAccess(user.id_user);
                              setNewAccessValue(currentAccess);
                            }}
                          >
                            <AiOutlineEdit />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-5 text-muted">
                {searchQuery ? `Tidak ada pengguna ditemukan untuk "${searchQuery}"` : 'Tidak ada pengguna terdaftar.'}
              </div>
            )}
          </div>
        </div>

        <footer style={modalStyles.footer}>
          <button className="btn btn-primary" onClick={onClose}>Selesai</button>
        </footer>
      </div>
    </div>
  );
};

export default OtorisasiPengguna;
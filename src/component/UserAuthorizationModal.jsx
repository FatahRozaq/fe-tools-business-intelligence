import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineCheck, AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import config from "../config";
import axios from "axios";

const UserAuthorizationModal = ({ isOpen, onClose }) => {
  const [usersList, setUsersList] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);
  const [newAccessValue, setNewAccessValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const accessLevels = [
    { value: 'view', label: 'View', color: 'info' },
    { value: 'edit', label: 'Edit', color: 'warning' },
    { value: 'admin', label: 'Admin', color: 'success' },
    { value: 'none', label: 'Tidak Ada Akses', color: 'secondary' }
  ];

  const fetchUserEmails = async () => {
    setLoadingEmails(true);
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
      setLoadingEmails(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserEmails();
    } else {
      // Reset state when modal closes
      setEditingAccess(null);
      setNewAccessValue('');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (editingAccess) {
          setEditingAccess(null);
          setNewAccessValue('');
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll without affecting layout
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, editingAccess, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUpdateAccess = async (userId, newAccess) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const createdBy = currentUser?.name || 'Unknown';
      
      const response = await axios.post(`${config.API_BASE_URL}/api/otentikasi/update-access`, {
        id_user: userId,
        id_project: 1, // Assuming project ID 1, adjust as needed
        access: newAccess,
        created_by: createdBy,
        modified_by: createdBy
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update local state
        setUsersList(prevUsers => 
          prevUsers.map(user => 
            user.id_user === userId
              ? {
                  ...user,
                  projects_access: newAccess === 'none' 
                    ? user.projects_access.filter(acc => acc.id_project !== 1)
                    : user.projects_access.some(acc => acc.id_project === 1)
                      ? user.projects_access.map(acc => 
                          acc.id_project === 1 ? { ...acc, access: newAccess, modified_by: createdBy } : acc
                        )
                      : [...user.projects_access, { id_project: 1, access: newAccess, modified_by: createdBy }]
                }
              : user
          )
        );
        
        setEditingAccess(null);
        setNewAccessValue('');
        console.log('Access updated successfully');
      } else {
        console.error('Failed to update access:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating access:', error);
    }
  };

  // Get user's current access level for project 1
  const getUserAccess = (user) => {
    const projectAccess = user.projects_access?.find(acc => acc.id_project === 1);
    return projectAccess ? projectAccess.access : 'none';
  };

  // Get access level info
  const getAccessInfo = (access) => {
    return accessLevels.find(level => level.value === access) || accessLevels[3];
  };

  // Filter users based on search query
  const filteredUsers = usersList.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 9999 
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded shadow-lg" 
        style={{ 
          width: '90%', 
          maxWidth: '800px', 
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-bottom">
          <div className="p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <AiOutlineUser className="me-2" />
              Manajemen Otorisasi Pengguna
            </h5>
            <button 
              type="button" 
              className="btn btn-sm btn-light" 
              onClick={onClose}
              aria-label="Close"
              style={{ fontSize: '18px', lineHeight: '1' }}
            >
              ×
            </button>
          </div>
          
          <div className="p-0">
            {/* Search Bar */}
            <div className="p-3 border-bottom">
              <input
                type="text"
                className="form-control"
                placeholder="Cari pengguna berdasarkan email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Users List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loadingEmails ? (
                <div className="p-4 text-center">
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
                        className={`p-3 border-bottom ${isEditing ? 'bg-light' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center">
                              <AiOutlineUser className="me-2 text-muted" />
                              <div>
                                <div className="fw-medium">{user.name || 'Nama tidak tersedia'}</div>
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
                                  style={{ minWidth: '140px' }}
                                >
                                  {accessLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                      {level.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn btn-success btn-sm me-1"
                                  onClick={() => handleUpdateAccess(user.id_user, newAccessValue)}
                                  title="Simpan perubahan"
                                >
                                  <AiOutlineCheck />
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setEditingAccess(null);
                                    setNewAccessValue('');
                                  }}
                                  title="Batal"
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
                                  onClick={() => {
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
                <div className="p-4 text-muted text-center">
                  {searchQuery ? 
                    `Tidak ada pengguna yang ditemukan untuk "${searchQuery}"` : 
                    'Tidak ada pengguna terdaftar'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Footer with summary */}
          {!loadingEmails && filteredUsers.length > 0 && (
            <div className="border-top bg-light p-3">
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
      </div>
    </div>
  );
};

export default UserAuthorizationModal;
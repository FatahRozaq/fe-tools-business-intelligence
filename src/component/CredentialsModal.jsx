import React, { useState, useEffect, useRef } from 'react';

const CredentialsModal = ({ show, onClose, onSubmit, connectionName, actionText, initialUsername = '' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setUsername(initialUsername || '');
      setPassword('');
      setTimeout(() => usernameInputRef.current?.focus(), 100);
    }
  }, [show, initialUsername]);

  if (!show) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onSubmit({ username, password });
    } else {
      alert('Username and Password are required.');
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{actionText} Datasource: {connectionName}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>Please provide the credentials to proceed.</p>
              <div className="mb-3">
                <label htmlFor="ds-username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="ds-username"
                  ref={usernameInputRef}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="ds-password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="ds-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">{actionText}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
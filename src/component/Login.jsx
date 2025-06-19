import React, { useState } from 'react';
import axios from "axios";
import config from "../config";
import { Eye, EyeOff } from 'lucide-react';
import '../assets/css/otentikasi.css';
import otentikasiBg from '../assets/img/Otentikasi.png';

const LoginPage = ({ onAuthSuccess, onSwitchRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/otentikasi/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        // Simpan token dan user data ke localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('token_type', response.data.data.token_type);
        localStorage.setItem('access', response.data.data.access);

        // Set default axios header untuk request selanjutnya
        axios.defaults.headers.common['Authorization'] = `${response.data.data.token_type} ${response.data.data.token}`;

        alert('Login berhasil!');

        if (onAuthSuccess) {
          onAuthSuccess(response.data.data);
        }

        // Reset form
        setFormData({
          email: '',
          password: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const { data, status } = error.response;
        
        if (status === 422 && data.errors) {
          // Handle validation errors from Laravel
          const backendErrors = {};
          Object.keys(data.errors).forEach(key => {
            backendErrors[key] = data.errors[key][0]; // Ambil error pertama
          });
          setErrors(backendErrors);
        } else if (status === 401) {
          // Handle authentication error
          alert(data.message || 'Email atau password salah');
        } else if (data.message) {
          alert(data.message);
        } else {
          alert('Terjadi kesalahan saat login');
        }
      } else if (error.request) {
        alert('Tidak dapat menghubungi server. Periksa koneksi internet Anda.');
      } else {
        alert('Terjadi kesalahan yang tidak terduga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="otentikasi-container">
      {/* Left Side - Form */}
      <div className="otentikasi-form-section">
        <div className="otentikasi-form-wrapper">
          <div className="otentikasi-header">
            <h1 className="otentikasi-title">Login</h1>
            <p className="otentikasi-subtitle">Silahkan lakukan login</p>
          </div>

          <form className="otentikasi-form" onSubmit={handleSubmit}>
            {/* E-mail */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="E-mail Anda"
                className={`form-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
                required
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Masukkan Password Anda"
                  className={`form-input password-input ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            {/* Forgot Password Link */}
            {/* <div className="forgot-password-section">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Lupa Password?
              </button>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`submit-btn ${isLoading ? 'loading' : 'primary'}`}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="login-link-section">
            <p className="login-link-text">
              Belum memiliki akun?{' '}
              <button 
                type="button"
                onClick={onSwitchRegister}
                className="login-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  font: 'inherit'
                }}
              >
                Register Sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* Right Side - Background */}
      <div className="right-background">
        <div className="right-background-container">
          <img 
            src={otentikasiBg} 
            alt="Ilustrasi Registrasi" 
            className="right-background-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
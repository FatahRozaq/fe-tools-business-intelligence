import React, { useState } from 'react';
import axios from "axios";
import config from "../config";
import { Eye, EyeOff } from 'lucide-react';
import '../assets/css/otentikasi.css';
import otentikasiBg from '../assets/img/Otentikasi.png';

const RegisterPage = ({ onAuthSuccess, onSwitchLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Validasi nama
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } 
    // else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    //   newErrors.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    // }

    // Validasi konfirmasi password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/otentikasi/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Registrasi berhasil!');

        // Optional: Simpan token jika ingin login otomatis
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        if (onAuthSuccess) {
          onAuthSuccess(response.data.data);
        }

        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const { data, status } = error.response;
        
        if (status === 422 && data.errors) {
          // Handle validation errors from Laravel
          setErrors(data.errors);
        } else if (data.errors && Array.isArray(data.errors)) {
          alert(data.errors.join('\n'));
        } else if (data.error) {
          alert(data.error);
        } else if (data.message) {
          alert(data.message);
        } else {
          alert('Terjadi kesalahan saat registrasi');
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
            <h1 className="otentikasi-title">Registrasi</h1>
            <p className="otentikasi-subtitle">Silahkan registrasi untuk buat akun baru</p>
          </div>

          <form className="otentikasi-form" onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nama Lengkap Anda"
                className={`form-input ${errors.name ? 'error' : ''}`}
                autoComplete="name"
                required
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

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
                  autoComplete="new-password"
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
              <p className="password-hint">Password harus minimal 8 karakter</p>
            </div>

            {/* Konfirmasi Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Konfirmasi Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Isi Kembali Password Anda"
                  className={`form-input password-input ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle-btn"
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`submit-btn ${isLoading ? 'loading' : 'primary'}`}
            >
              {isLoading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link-section">
            <p className="login-link-text">
              Sudah memiliki akun?{' '}
              <button 
                type="button"
                onClick={onSwitchLogin}
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
                Login Sekarang
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

export default RegisterPage;
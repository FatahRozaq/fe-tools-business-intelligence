// App.jsx
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "font-awesome/css/font-awesome.min.css";
import Header from "./component/Header";
import Sidebar from "./component/Sidebar";
import Register from "./component/Register";
import Login from "./component/Login";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import VisualisasiChart from "./component/Visualiaze";
import Canvas from "./component/Canvas";
import axios from "axios";

function App() {
  const [canvasData, setCanvasData] = useState([]);
  const [canvasQuery, setCanvasQuery] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' atau 'register'

  useEffect(() => {
    // Cek apakah ada token tersimpan di localStorage
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      // Set default header untuk axios
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  // Function untuk handle successful registration/login
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // Function untuk beralih antara login dan register
  const switchAuthView = (view) => {
    setAuthView(view);
  };

  // Jika belum authenticated, tampilkan halaman auth (login/register)
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register 
          onAuthSuccess={handleAuthSuccess}
          onSwitchLogin={() => switchAuthView('login')}
        />
      );
    } else {
      return (
        <Login 
          onAuthSuccess={handleAuthSuccess}
          onSwitchRegister={() => switchAuthView('register')}
        />
      );
    }
  }

  return (
    <>
    
      {/* <Header
        currentCanvasIndex={currentCanvasIndex}
        setCurrentCanvasIndex={setCurrentCanvasIndex} // Pass setter to Header
      /> */}
      <div className="main-container">
        <Sidebar 
          setCanvasData={setCanvasData} 
          setCanvasQuery={setCanvasQuery} 
        />
        {/* <Canvas currentCanvasIndex={currentCanvasIndex}/> */}
        {/* <Canvas 
          data={canvasData} 
          query={canvasQuery} 
        /> */}
      </div>
      {/* <VisualisasiChart requestPayload={requestPayload} /> */}
    </>
  );
}

export default App;

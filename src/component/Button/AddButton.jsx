import { FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddButton({ text, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`d-flex align-items-center ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#000',
        fontSize: '1rem',
        padding: 0,
      }}
    >
      <div
        style={{
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '8px',
          fontSize: '14px',
        }}
      >
        <FaPlus />
      </div>
      {text}
    </button>
  );
}

export default AddButton;

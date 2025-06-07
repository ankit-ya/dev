import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'; // Make sure this file contains Tailwind directives
import "bootstrap/dist/css/bootstrap.min.css";
console.log('VITE_API_URL is:', import.meta.env.VITE_API_URL);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

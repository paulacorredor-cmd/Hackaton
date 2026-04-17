import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClaimLandingPage } from './components/ClaimLanding/ClaimLandingPage';
import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClaimLandingPage />} />
        <Route path="/claims/*" element={<ClaimLandingPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

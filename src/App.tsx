import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SurveyPage from './pages/SurveyPage';
import AdminPage from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

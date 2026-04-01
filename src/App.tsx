import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Agenda } from './pages/Agenda';
import { Doctors } from './pages/Doctors';
import { Specialties } from './pages/Specialties';
import { Patients } from './pages/Patients';
import { ChatBot } from './pages/ChatBot';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for ChatBot without Layout */}
        <Route path="/bot" element={<ChatBot />} />
        
        {/* Main App Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/agenda" element={<Layout><Agenda /></Layout>} />
        <Route path="/doctores" element={<Layout><Doctors /></Layout>} />
        <Route path="/especialidades" element={<Layout><Specialties /></Layout>} />
        <Route path="/pacientes" element={<Layout><Patients /></Layout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

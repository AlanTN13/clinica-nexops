import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserRound, 
  Stethoscope, 
  Users, 
  Menu, 
  X,
  Plus,
  Bell,
  Search,
  Bot
} from 'lucide-react';
import { NewAppointmentModal } from './NewAppointmentModal';
import { DOCTORS, PATIENTS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda' },
  { id: 'doctors', label: 'Doctores', icon: Stethoscope, path: '/doctores' },
  { id: 'specialties', label: 'Especialidades', icon: UserRound, path: '/especialidades' },
  { id: 'patients', label: 'Pacientes', icon: Users, path: '/pacientes' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = navItems.find(item => item.path === location.pathname) || navItems[0];
  const notifications = [
    { id: '1', text: 'Tienes 3 turnos pendientes de confirmar.', target: '/agenda' },
    { id: '2', text: 'Se registró un nuevo paciente esta mañana.', target: '/pacientes' },
    { id: '3', text: 'Cardiología tiene la agenda más cargada hoy.', target: '/doctores?specialty=1' },
  ];

  const handleGlobalSearch = () => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return;
    }

    const matchingPatient = PATIENTS.find((patient) => patient.name.toLowerCase().includes(normalizedTerm));
    if (matchingPatient) {
      navigate(`/pacientes?patient=${matchingPatient.id}`);
      setSearchTerm('');
      return;
    }

    const matchingDoctor = DOCTORS.find((doctor) => doctor.name.toLowerCase().includes(normalizedTerm));
    if (matchingDoctor) {
      navigate(`/doctores?doctor=${matchingDoctor.id}`);
      setSearchTerm('');
      return;
    }

    if (normalizedTerm.includes('agenda') || normalizedTerm.includes('turno')) {
      navigate('/agenda');
    } else if (normalizedTerm.includes('especialidad')) {
      navigate('/especialidades');
    } else if (normalizedTerm.includes('doctor')) {
      navigate('/doctores');
    } else if (normalizedTerm.includes('paciente')) {
      navigate('/pacientes');
    } else if (normalizedTerm.includes('ia') || normalizedTerm.includes('bot') || normalizedTerm.includes('chat')) {
      navigate('/bot');
    } else {
      navigate('/');
    }

    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col md:flex-row">
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-semibold tracking-tight">Nexops</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-50">
            <Link
              to="/bot"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition-all duration-200 font-medium"
            >
              <Bot size={20} />
              <span>Asistente IA</span>
            </Link>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin</span>
              <span className="text-xs text-gray-500">Gestión Clínica</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Stethoscope size={18} />
          </div>
          <span className="font-semibold">Nexops</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-white z-40 p-6 flex flex-col"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-4 rounded-xl ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-500'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-lg">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {activeItem.label}
            </h1>
            <p className="text-gray-500 mt-1">Bienvenido al panel de gestión de Clínica Nexops.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
              />
            </div>
            <div className="relative">
              <button onClick={() => setShowNotifications((current) => !current)} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-14 w-80 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl"
                  >
                    <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Notificaciones</p>
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            navigate(notification.target);
                            setShowNotifications(false);
                          }}
                          className="w-full rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          {notification.text}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
            >
              <Plus size={20} />
              <span className="font-medium">Nuevo Turno</span>
            </button>
          </div>
        </header>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

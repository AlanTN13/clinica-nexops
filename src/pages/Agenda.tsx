import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { PATIENTS, DOCTORS, SPECIALTIES } from '../constants';
import { AppointmentDetailsModal } from '../components/AppointmentDetailsModal';
import { useAppointments } from '../hooks/useAppointments';
import { useSearchParams } from 'react-router-dom';

type ViewType = 'day' | 'week' | 'month';

export const Agenda: React.FC = () => {
  const appointments = useAppointments();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view');
  const initialDoctor = searchParams.get('doctor') ?? '';
  const [viewType, setViewType] = useState<ViewType>(
    initialView === 'day' || initialView === 'week' || initialView === 'month' ? initialView : 'month'
  );
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 1st, 2026
  const [filterDoctorId, setFilterDoctorId] = useState<string>(initialDoctor);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAppointmentClick = (apt: any) => {
    const patient = PATIENTS.find(p => p.id === apt.patientId);
    const doctor = DOCTORS.find(d => d.id === apt.doctorId);
    const specialty = SPECIALTIES.find(s => s.id === doctor?.specialtyId);

    setSelectedAppointment({
      id: apt.id,
      patientId: apt.patientId,
      patient: patient?.name || 'Desconocido',
      time: apt.time,
      date: apt.date,
      doctor: doctor?.name || 'Desconocido',
      specialty: specialty?.name || 'General',
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes,
    });
    setIsDetailsOpen(true);
  };

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => !filterDoctorId || apt.doctorId === filterDoctorId);
  }, [appointments, filterDoctorId]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevDays = Array.from({ length: firstDay }, (_, i) => ({
      day: prevMonthDays - firstDay + i + 1,
      month: month - 1,
      year,
      isCurrentMonth: false
    }));

    const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      month,
      year,
      isCurrentMonth: true
    }));

    const totalDays = [...prevDays, ...currentDays];
    const remaining = 42 - totalDays.length;
    const nextDays = Array.from({ length: remaining }, (_, i) => ({
      day: i + 1,
      month: month + 1,
      year,
      isCurrentMonth: false
    }));

    return [...totalDays, ...nextDays];
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getAppointmentsForDate = (date: Date | string) => {
    const dateStr = typeof date === 'string' ? date : formatDate(date);
    return filteredAppointments.filter(apt => apt.date === dateStr);
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {days.map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthDays.map((d, i) => {
            const dateObj = new Date(d.year, d.month, d.day);
            const dateStr = formatDate(dateObj);
            const apts = getAppointmentsForDate(dateStr);

            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 border-r border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${
                  !d.isCurrentMonth ? 'bg-gray-50/30' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${d.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                    {d.day}
                  </span>
                  {apts.length > 0 && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  {apts.slice(0, 3).map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                      className="p-1.5 bg-indigo-50 border-l-2 border-indigo-500 rounded text-[10px] leading-tight cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      <div className="font-bold text-indigo-900">{apt.time} hs</div>
                      <div className="text-indigo-700 truncate">{PATIENTS.find(p => p.id === apt.patientId)?.name}</div>
                    </div>
                  ))}
                  {apts.length > 3 && (
                    <div className="text-[10px] text-gray-400 font-medium pl-1">
                      + {apts.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 8pm

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-100">
            <div className="p-4 border-r border-gray-100"></div>
            {weekDays.map((d, i) => (
              <div key={i} className="p-4 text-center border-r border-gray-100 last:border-r-0">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{days[d.getDay()]}</div>
                <div className="text-lg font-bold text-gray-900">{d.getDate()}</div>
              </div>
            ))}
          </div>
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-50 h-20">
                <div className="p-2 text-right text-xs font-bold text-gray-400 border-r border-gray-100">
                  {hour}:00
                </div>
                {weekDays.map((d, i) => {
                  const dateStr = formatDate(d);
                  const hourStr = String(hour).padStart(2, '0');
                  const apts = getAppointmentsForDate(dateStr).filter(a => a.time.startsWith(hourStr));
                  
                  return (
                    <div key={i} className="p-1 border-r border-gray-50 last:border-r-0 relative group hover:bg-gray-50/50 transition-colors">
                      {apts.map(apt => (
                        <div 
                          key={apt.id} 
                          onClick={() => handleAppointmentClick(apt)}
                          className="p-2 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg text-xs shadow-sm mb-1 cursor-pointer hover:bg-indigo-100 transition-colors"
                        >
                          <div className="font-bold text-indigo-900">{apt.time} hs</div>
                          <div className="text-indigo-700 font-medium truncate">{PATIENTS.find(p => p.id === apt.patientId)?.name}</div>
                          <div className="text-[10px] text-indigo-400 truncate">{DOCTORS.find(doc => doc.id === apt.doctorId)?.name}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 8pm
    const dateStr = formatDate(currentDate);
    const apts = getAppointmentsForDate(dateStr);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900">
            {days[currentDate.getDay()]}, {currentDate.getDate()} de {currentDate.toLocaleString('es-ES', { month: 'long' })}
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {hours.map(hour => {
            const hourStr = String(hour).padStart(2, '0');
            const hourApts = apts.filter(a => a.time.startsWith(hourStr));
            
            return (
              <div key={hour} className="grid grid-cols-[100px_1fr] min-h-[80px]">
                <div className="p-6 text-right text-sm font-bold text-gray-400 border-r border-gray-100">
                  {hour}:00
                </div>
                <div className="p-4 space-y-2">
                  {hourApts.length > 0 ? (
                    hourApts.map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => handleAppointmentClick(apt)}
                        className="flex items-center justify-between p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-xl shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                            {PATIENTS.find(p => p.id === apt.patientId)?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-indigo-900">{PATIENTS.find(p => p.id === apt.patientId)?.name}</div>
                            <div className="text-xs text-indigo-600 flex items-center gap-1">
                              <Stethoscope size={12} />
                              {DOCTORS.find(doc => doc.id === apt.doctorId)?.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm font-bold text-indigo-900">{apt.time} hs</div>
                          <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">{apt.status}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center text-gray-300 text-sm italic">Sin turnos agendados</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-200"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 font-semibold text-sm min-w-[140px] text-center">
              {viewType === 'month' 
                ? currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
                : viewType === 'week'
                  ? `Semana ${currentDate.getDate()}`
                  : currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
              }
            </div>
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-50 transition-colors border-l border-gray-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <CalendarIcon size={18} className="text-gray-400" />
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border ${
                showFilters || filterDoctorId 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} className={showFilters || filterDoctorId ? 'text-white' : 'text-gray-400'} />
              {filterDoctorId ? DOCTORS.find(d => d.id === filterDoctorId)?.name : 'Filtrar'}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Filtrar por Doctor</h4>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setFilterDoctorId(''); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filterDoctorId ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Todos los doctores
                  </button>
                  {DOCTORS.map(doc => (
                    <button 
                      key={doc.id}
                      onClick={() => { setFilterDoctorId(doc.id); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterDoctorId === doc.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-gray-50'}`}
                    >
                      {doc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['day', 'week', 'month'] as ViewType[]).map((type) => (
              <button 
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  viewType === type 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="transition-all duration-300">
        {viewType === 'month' && renderMonthView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
      </div>

      <AppointmentDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        appointment={selectedAppointment} 
      />
    </div>
  );
};

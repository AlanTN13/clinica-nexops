import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, Calendar, X, MapPin, Droplet, AlertTriangle, ClipboardList, Stethoscope } from 'lucide-react';
import { PATIENTS, DOCTORS } from '../constants';
import { Patient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAppointments } from '../hooks/useAppointments';
import { useSearchParams } from 'react-router-dom';

export const Patients: React.FC = () => {
  const appointments = useAppointments();
  const [searchParams] = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyWithAllergies, setOnlyWithAllergies] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredPatients = useMemo(
    () =>
      PATIENTS.filter((patient) => {
        const matchesSearch =
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.dni.includes(searchTerm) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = !onlyWithAllergies || Boolean(patient.allergies?.length);
        return matchesSearch && matchesFilter;
      }),
    [onlyWithAllergies, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const paginatedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, onlyWithAllergies]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (!patientId) {
      return;
    }

    const patient = PATIENTS.find((item) => item.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  }, [searchParams]);

  const getPatientHistory = (patientId: string) => {
    return appointments
      .filter(apt => apt.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleExport = () => {
    const rows = [
      ['Nombre', 'DNI', 'Email', 'Telefono', 'UltimaVisita', 'Alergias'].join(','),
      ...filteredPatients.map((patient) =>
        [
          patient.name,
          patient.dni,
          patient.email,
          patient.phone,
          patient.lastVisit || '',
          (patient.allergies || []).join(' | '),
        ]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pacientes-nexops.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyWithAllergies((current) => !current)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
              onlyWithAllergies ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="text-gray-400" />
            {onlyWithAllergies ? 'Con alergias' : 'Filtros'}
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Paciente</th>
              <th className="px-6 py-4 font-semibold">DNI</th>
              <th className="px-6 py-4 font-semibold">Contacto</th>
              <th className="px-6 py-4 font-semibold">Última Visita</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedPatients.map((patient) => (
              <tr 
                key={patient.id} 
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{patient.name}</div>
                      <div className="text-xs text-gray-400">ID: #{patient.id.padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{patient.dni}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} />
                      {patient.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={12} />
                      {patient.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    {patient.lastVisit}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>Mostrando {filteredPatients.length} de {PATIENTS.length} pacientes</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={page === 1}>Anterior</button>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={page === totalPages}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-100">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-gray-500 text-sm">DNI: {selectedPatient.dni} • ID: #{selectedPatient.id.padStart(4, '0')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Información Personal</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        {selectedPatient.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        {selectedPatient.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        Nacimiento: {selectedPatient.birthDate || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        {selectedPatient.address || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos Médicos</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Droplet size={16} className="text-red-500" />
                        Grupo Sanguíneo: <span className="font-bold text-gray-900">{selectedPatient.bloodType || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                        <div>
                          <p>Alergias:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                              selectedPatient.allergies.map((a, i) => (
                                <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                  {a}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">Ninguna registrada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Resumen</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-600">Total Turnos</span>
                        <span className="font-bold text-indigo-900">{getPatientHistory(selectedPatient.id).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-600">Última Visita</span>
                        <span className="font-bold text-indigo-900">{selectedPatient.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Timeline */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={16} />
                    Historia Clínica / Turnos Pasados
                  </h3>
                  <div className="space-y-4">
                    {getPatientHistory(selectedPatient.id).map((apt, i) => (
                      <div key={apt.id} className="relative pl-8 pb-4 last:pb-0">
                        {/* Timeline Line */}
                        {i !== getPatientHistory(selectedPatient.id).length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-100"></div>
                        )}
                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                          apt.status === 'completed' ? 'bg-emerald-500' : 
                          apt.status === 'confirmed' ? 'bg-indigo-500' : 
                          apt.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-900">{apt.date}</span>
                              <span className="text-xs text-gray-400">{apt.time} hs</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 
                                apt.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700' : 
                                apt.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Stethoscope size={14} className="text-gray-400" />
                              {DOCTORS.find(d => d.id === apt.doctorId)?.name}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Motivo / Notas</p>
                              <p className="text-sm text-gray-700">{apt.reason || 'Sin motivo'}</p>
                              {apt.notes && <p className="text-sm text-gray-500 mt-1 italic">"{apt.notes}"</p>}
                            </div>
                            {(apt.diagnosis || apt.treatment) && (
                              <div className="bg-gray-50 p-3 rounded-xl">
                                {apt.diagnosis && (
                                  <div className="mb-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Diagnóstico</p>
                                    <p className="text-sm font-medium text-gray-900">{apt.diagnosis}</p>
                                  </div>
                                )}
                                {apt.treatment && (
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tratamiento</p>
                                    <p className="text-sm text-gray-700">{apt.treatment}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cerrar
                </button>
                <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                  Imprimir Historia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

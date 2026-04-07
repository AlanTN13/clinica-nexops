import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Clock, Stethoscope, FileText, ArrowRight, History, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../types';
import { updateAppointment } from '../lib/appointmentsStorage';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    patientId: string;
    patient: string;
    time: string;
    doctor: string;
    specialty: string;
    status: Appointment['status'];
    date?: string;
    reason?: string;
    notes?: string;
  } | null;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ isOpen, onClose, appointment }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Appointment['status']>('pending');
  const [draftNotes, setDraftNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!appointment) {
      return;
    }

    setDraftStatus(appointment.status);
    setDraftNotes(appointment.notes || '');
    setIsEditing(false);
    setIsSaved(false);
  }, [appointment, isOpen]);

  const formatStatus = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  const handleGoToPatient = () => {
    if (!appointment) {
      return;
    }

    navigate(`/pacientes?patient=${appointment.patientId}`);
    onClose();
  };

  const handleSave = () => {
    if (!appointment) {
      return;
    }

    updateAppointment(appointment.id, {
      status: draftStatus,
      notes: draftNotes.trim(),
    });

    setIsSaved(true);
    setIsEditing(false);

    window.setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  if (!appointment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Minuta del Turno</h2>
                  <p className="text-indigo-100 text-sm">ID: #{appointment.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Patient Info Section */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Paciente</p>
                  <h3 className="text-lg font-bold text-gray-900">{appointment.patient}</h3>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={handleGoToPatient}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Ver Ficha <ArrowRight size={14} />
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      onClick={handleGoToPatient}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Últimas Citas <History size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Fecha</span>
                  </div>
                  <p className="font-semibold text-gray-900">{appointment.date || 'Hoy, 1 de Abril'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Hora</span>
                  </div>
                  <p className="font-semibold text-gray-900">{appointment.time}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Stethoscope size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Especialidad</span>
                  </div>
                  <p className="font-semibold text-gray-900">{appointment.specialty}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Doctor</span>
                  </div>
                  <p className="font-semibold text-gray-900">{appointment.doctor}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo</p>
                  <p className="font-medium text-gray-900">{appointment.reason || 'Sin motivo cargado'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notas</p>
                  {isEditing ? (
                    <textarea
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      className="w-full min-h-[96px] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      placeholder="Agrega observaciones clínicas o administrativas..."
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{draftNotes || 'Todavía no hay notas registradas.'}</p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado del turno:</span>
                {isEditing ? (
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value as Appointment['status'])}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                ) : (
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  draftStatus === 'confirmed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : draftStatus === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : draftStatus === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                }`}>
                    {formatStatus(draftStatus)}
                  </span>
                )}
              </div>

              {isSaved && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <Check size={16} />
                  La minuta se actualizó correctamente.
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
              <button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                {isEditing ? 'Guardar Cambios' : 'Editar Minuta'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

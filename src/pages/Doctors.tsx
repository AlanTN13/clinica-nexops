import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, MoreVertical, X } from 'lucide-react';
import { DOCTORS, SPECIALTIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Doctor } from '../types';

export const Doctors: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const specialtyId = searchParams.get('specialty');
  const doctorId = searchParams.get('doctor');

  const visibleDoctors = useMemo(
    () => DOCTORS.filter((doctor) => !specialtyId || doctor.specialtyId === specialtyId),
    [specialtyId]
  );

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    const matchingDoctor = DOCTORS.find((doctor) => doctor.id === doctorId);
    if (matchingDoctor) {
      setSelectedDoctor(matchingDoctor);
    }
  }, [doctorId]);

  return (
    <>
    <div className="space-y-4">
      {specialtyId && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Mostrando doctores de {SPECIALTIES.find((specialty) => specialty.id === specialtyId)?.name || 'la especialidad seleccionada'}.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleDoctors.map((doctor) => {
        const specialty = SPECIALTIES.find(s => s.id === doctor.specialtyId);
        return (
          <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/doc${doctor.id}/200/200`} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <button onClick={() => setSelectedDoctor(doctor)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
              <p className="text-indigo-600 text-sm font-medium">{specialty?.name}</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail size={16} />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Phone size={16} />
                <span>{doctor.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Disponibilidad</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.availability.map((day, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg uppercase">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedDoctor(doctor)} className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
              Ver Perfil Completo
            </button>
          </div>
        );
      })}
      </div>
    </div>
    <AnimatePresence>
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoctor(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  {SPECIALTIES.find((specialty) => specialty.id === selectedDoctor.specialtyId)?.name}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600 md:grid-cols-2">
              <a href={`mailto:${selectedDoctor.email}`} className="rounded-xl bg-white px-4 py-3 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
                Email: {selectedDoctor.email}
              </a>
              <a href={`tel:${selectedDoctor.phone.replace(/\s/g, '')}`} className="rounded-xl bg-white px-4 py-3 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
                Teléfono: {selectedDoctor.phone}
              </a>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Disponibilidad</p>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor.availability.map((day) => (
                  <span key={day} className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <a href={`mailto:${selectedDoctor.email}`} className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-center font-bold text-gray-700 transition-colors hover:bg-gray-50">
                Enviar Email
              </a>
              <a href={`tel:${selectedDoctor.phone.replace(/\s/g, '')}`} className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-center font-bold text-white transition-colors hover:bg-gray-800">
                Llamar
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

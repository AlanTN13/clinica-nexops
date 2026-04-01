import React from 'react';
import { Mail, Phone, MoreVertical, Star } from 'lucide-react';
import { DOCTORS, SPECIALTIES } from '../constants';

export const Doctors: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DOCTORS.map((doctor) => {
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
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
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

            <button className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
              Ver Perfil Completo
            </button>
          </div>
        );
      })}
    </div>
  );
};

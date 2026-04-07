import React from 'react';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { SPECIALTIES, DOCTORS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Specialties: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SPECIALTIES.map((specialty) => {
        const doctorCount = DOCTORS.filter(d => d.specialtyId === specialty.id).length;
        return (
          <div key={specialty.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:border-indigo-200 transition-all group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{specialty.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {specialty.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">{doctorCount}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Doctores</span>
              </div>
              <button onClick={() => navigate(`/doctores?specialty=${specialty.id}`)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

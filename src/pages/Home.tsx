import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { APPOINTMENTS, PATIENTS, DOCTORS, SPECIALTIES } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { AppointmentDetailsModal } from '../components/AppointmentDetailsModal';

export const Home: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const stats = [
    { label: 'Pacientes Totales', value: PATIENTS.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Turnos Hoy', value: '12', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Doctores Activos', value: DOCTORS.length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pendientes', value: '4', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleAppointmentClick = (apt: any) => {
    const patient = PATIENTS.find(p => p.id === apt.patientId);
    const doctor = DOCTORS.find(d => d.id === apt.doctorId);
    const specialty = SPECIALTIES.find(s => s.id === doctor?.specialtyId);

    setSelectedAppointment({
      id: apt.id,
      patient: patient?.name || 'Desconocido',
      time: apt.time,
      date: apt.date,
      doctor: doctor?.name || 'Desconocido',
      specialty: specialty?.name || 'General',
      status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
    });
    setIsDetailsOpen(true);
  };

  // Data for Bar Chart: Appointments per Month (Mocked for visualization)
  const monthlyData = [
    { name: 'Ene', turnos: 45 },
    { name: 'Feb', turnos: 52 },
    { name: 'Mar', turnos: 61 },
    { name: 'Abr', turnos: 48 },
    { name: 'May', turnos: 70 },
    { name: 'Jun', turnos: 65 },
  ];

  // Data for Pie Chart: Appointments per Specialty
  const specialtyData = SPECIALTIES.map((s, i) => {
    const count = APPOINTMENTS.filter(apt => {
      const doc = DOCTORS.find(d => d.id === apt.doctorId);
      return doc?.specialtyId === s.id;
    }).length;
    return { name: s.name, value: count || Math.floor(Math.random() * 10) + 5 }; // Fallback to random for better viz
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} className="mr-1" />
                +12%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Appointments Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <h2 className="font-bold text-lg text-gray-900">Turnos por Mes</h2>
            </div>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="turnos" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <PieChartIcon size={20} />
            </div>
            <h2 className="font-bold text-lg text-gray-900">Demanda por Especialidad</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-lg">Próximos Turnos</h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Paciente</th>
                  <th className="px-6 py-4 font-semibold">Doctor</th>
                  <th className="px-6 py-4 font-semibold">Fecha/Hora</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {APPOINTMENTS.slice(0, 6).map((apt) => {
                  const patient = PATIENTS.find(p => p.id === apt.patientId);
                  const doctor = DOCTORS.find(d => d.id === apt.doctorId);
                  return (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleAppointmentClick(apt)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {patient?.name.charAt(0)}
                          </div>
                          <span className="font-medium text-sm">{patient?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{doctor?.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{apt.date}</span>
                          <span className="text-xs text-gray-400">{apt.time} hs</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 
                          apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                          apt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status === 'confirmed' ? <CheckCircle2 size={12} /> : 
                           apt.status === 'completed' ? <CheckCircle2 size={12} /> :
                           apt.status === 'cancelled' ? <AlertCircle size={12} /> :
                           <Clock size={12} />}
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Actividad Reciente</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600">
                      <AlertCircle size={20} />
                    </div>
                    {i !== 3 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-100"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nuevo paciente registrado</p>
                    <p className="text-xs text-gray-400 mt-0.5">Hace 15 minutos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-lg">Capacidad de Hoy</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4">La clínica está operando al 85% de su capacidad hoy.</p>
            <div className="w-full bg-indigo-500/50 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[85%]"></div>
            </div>
            <button className="mt-6 w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Optimizar Agenda
            </button>
          </div>
        </div>
      </div>

      <AppointmentDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        appointment={selectedAppointment} 
      />
    </div>
  );
};

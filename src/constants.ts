import { Patient, Doctor, Specialty, Appointment } from './types';

export const SPECIALTIES: Specialty[] = [
  { id: '1', name: 'Cardiología', description: 'Cuidado del corazón y sistema circulatorio.' },
  { id: '2', name: 'Pediatría', description: 'Atención médica para niños y adolescentes.' },
  { id: '3', name: 'Dermatología', description: 'Tratamiento de afecciones de la piel.' },
  { id: '4', name: 'Ginecología', description: 'Salud del sistema reproductivo femenino.' },
  { id: '5', name: 'Traumatología', description: 'Lesiones del sistema locomotor.' },
];

export const DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Alejandro Sosa', specialtyId: '1', email: 'a.sosa@nexops.com', phone: '11 4567-8901', availability: ['Lunes', 'Miércoles', 'Viernes'] },
  { id: '2', name: 'Dra. Elena Martínez', specialtyId: '2', email: 'e.martinez@nexops.com', phone: '11 4567-8902', availability: ['Martes', 'Jueves'] },
  { id: '3', name: 'Dr. Carlos Ruiz', specialtyId: '3', email: 'c.ruiz@nexops.com', phone: '11 4567-8903', availability: ['Lunes', 'Martes', 'Jueves'] },
  { id: '4', name: 'Dra. Lucía Fernández', specialtyId: '4', email: 'l.fernandez@nexops.com', phone: '11 4567-8904', availability: ['Miércoles', 'Viernes'] },
  { id: '5', name: 'Dr. Roberto Gómez', specialtyId: '5', email: 'r.gomez@nexops.com', phone: '11 4567-8905', availability: ['Lunes', 'Viernes'] },
];

export const PATIENTS: Patient[] = [
  { 
    id: '1', 
    name: 'Juan Pérez', 
    email: 'juan.perez@email.com', 
    phone: '11 2345-6789', 
    dni: '30.123.456', 
    lastVisit: '2026-03-15',
    birthDate: '1985-05-12',
    address: 'Av. Corrientes 1234, CABA',
    bloodType: 'A+',
    allergies: ['Penicilina']
  },
  { 
    id: '2', 
    name: 'María García', 
    email: 'm.garcia@email.com', 
    phone: '11 3456-7890', 
    dni: '28.456.789', 
    lastVisit: '2026-03-10',
    birthDate: '1992-08-24',
    address: 'Calle Falsa 123, CABA',
    bloodType: 'O-',
    allergies: []
  },
  { 
    id: '3', 
    name: 'Ricardo López', 
    email: 'r.lopez@email.com', 
    phone: '11 4567-8901', 
    dni: '32.789.012', 
    lastVisit: '2026-03-20',
    birthDate: '1978-11-02',
    address: 'Belgrano 456, CABA',
    bloodType: 'B+',
    allergies: ['Polen', 'Ácaros']
  },
  { 
    id: '4', 
    name: 'Ana Torres', 
    email: 'a.torres@email.com', 
    phone: '11 5678-9012', 
    dni: '35.123.987', 
    lastVisit: '2026-03-25',
    birthDate: '1990-02-15',
    address: 'Santa Fe 2345, CABA',
    bloodType: 'AB+',
    allergies: ['Lactosa']
  },
  { 
    id: '5', 
    name: 'Sergio Méndez', 
    email: 's.mendez@email.com', 
    phone: '11 6789-0123', 
    dni: '25.654.321', 
    lastVisit: '2026-03-28',
    birthDate: '1982-07-10',
    address: 'Pueyrredón 789, CABA',
    bloodType: 'O+',
    allergies: []
  },
  { 
    id: '6', 
    name: 'Laura Bianchi', 
    email: 'l.bianchi@email.com', 
    phone: '11 7890-1234', 
    dni: '38.987.654', 
    lastVisit: '2026-03-22',
    birthDate: '1995-12-05',
    address: 'Libertador 3456, CABA',
    bloodType: 'A-',
    allergies: ['Frutos secos']
  },
  { 
    id: '7', 
    name: 'Diego Rossi', 
    email: 'd.rossi@email.com', 
    phone: '11 8901-2345', 
    dni: '31.456.123', 
    lastVisit: '2026-03-18',
    birthDate: '1988-04-30',
    address: 'Callao 567, CABA',
    bloodType: 'B-',
    allergies: []
  },
  { 
    id: '8', 
    name: 'Sofía Castro', 
    email: 's.castro@email.com', 
    phone: '11 9012-3456', 
    dni: '40.321.789', 
    lastVisit: '2026-03-29',
    birthDate: '2000-09-18',
    address: 'Juramento 1234, CABA',
    bloodType: 'O+',
    allergies: ['Aspirina']
  },
  { 
    id: '9', 
    name: 'Martín Palermo', 
    email: 'm.palermo@email.com', 
    phone: '11 0123-4567', 
    dni: '22.111.222', 
    lastVisit: '2026-03-12',
    birthDate: '1973-11-07',
    address: 'Bombonera 9, CABA',
    bloodType: 'AB-',
    allergies: []
  },
  { 
    id: '10', 
    name: 'Valentina Solís', 
    email: 'v.solis@email.com', 
    phone: '11 1234-5678', 
    dni: '42.555.666', 
    lastVisit: '2026-03-27',
    birthDate: '2002-01-22',
    address: 'Rivadavia 8900, CABA',
    bloodType: 'A+',
    allergies: ['Gatos']
  },
];

export const APPOINTMENTS: Appointment[] = [
  { 
    id: '1', 
    patientId: '1', 
    doctorId: '1', 
    date: '2026-04-01', 
    time: '09:00', 
    status: 'confirmed', 
    reason: 'Control anual',
    notes: 'Paciente refiere fatiga leve.',
    diagnosis: 'En observación',
    treatment: 'Análisis de sangre completo'
  },
  { 
    id: '2', 
    patientId: '2', 
    doctorId: '2', 
    date: '2026-04-01', 
    time: '10:30', 
    status: 'pending', 
    reason: 'Consulta pediátrica' 
  },
  { 
    id: '3', 
    patientId: '3', 
    doctorId: '3', 
    date: '2026-04-02', 
    time: '15:00', 
    status: 'confirmed', 
    reason: 'Mancha en la piel' 
  },
  { 
    id: '4', 
    patientId: '4', 
    doctorId: '4', 
    date: '2026-04-03', 
    time: '11:00', 
    status: 'confirmed', 
    reason: 'Control ginecológico' 
  },
  { 
    id: '5', 
    patientId: '5', 
    doctorId: '5', 
    date: '2026-04-04', 
    time: '09:30', 
    status: 'completed', 
    reason: 'Dolor de rodilla',
    notes: 'Dolor post-entrenamiento.',
    diagnosis: 'Tendinitis leve',
    treatment: 'Kinesiología y reposo'
  },
  { id: '6', patientId: '6', doctorId: '1', date: '2026-04-05', time: '16:00', status: 'confirmed', reason: 'Presión alta' },
  { id: '7', patientId: '7', doctorId: '2', date: '2026-04-08', time: '08:00', status: 'pending', reason: 'Fiebre' },
  { id: '8', patientId: '8', doctorId: '3', date: '2026-04-09', time: '14:00', status: 'cancelled', reason: 'Consulta dermatológica' },
  { id: '9', patientId: '9', doctorId: '4', date: '2026-04-10', time: '10:00', status: 'confirmed', reason: 'Rutina' },
  { id: '10', patientId: '10', doctorId: '5', date: '2026-04-11', time: '12:30', status: 'pending', reason: 'Esguince' },
  { id: '11', patientId: '1', doctorId: '1', date: '2026-04-12', time: '11:00', status: 'confirmed', reason: 'Chequeo' },
  { id: '12', patientId: '2', doctorId: '2', date: '2026-04-15', time: '09:00', status: 'confirmed', reason: 'Vacunación' },
  { id: '15', patientId: '4', doctorId: '1', date: '2026-04-01', time: '14:00', status: 'confirmed', reason: 'Arritmia' },
  { id: '16', patientId: '5', doctorId: '3', date: '2026-04-02', time: '10:00', status: 'confirmed', reason: 'Alergia estacional' },
  { id: '17', patientId: '6', doctorId: '4', date: '2026-04-03', time: '16:30', status: 'pending', reason: 'Ecografía' },
  { id: '18', patientId: '7', doctorId: '5', date: '2026-04-04', time: '11:30', status: 'confirmed', reason: 'Fractura dedo' },
  { id: '19', patientId: '8', doctorId: '2', date: '2026-04-05', time: '09:00', status: 'confirmed', reason: 'Control niño sano' },
  // Past appointments for history
  { 
    id: '13', 
    patientId: '1', 
    doctorId: '1', 
    date: '2026-03-15', 
    time: '10:00', 
    status: 'completed', 
    reason: 'Gripe fuerte',
    notes: 'Mucha tos y congestión.',
    diagnosis: 'Gripe estacional',
    treatment: 'Paracetamol y reposo'
  },
  { 
    id: '14', 
    patientId: '2', 
    doctorId: '2', 
    date: '2026-03-10', 
    time: '11:30', 
    status: 'completed', 
    reason: 'Control de crecimiento',
    notes: 'Todo normal.',
    diagnosis: 'Sano',
    treatment: 'Ninguno'
  },
  { 
    id: '20', 
    patientId: '4', 
    doctorId: '4', 
    date: '2026-03-25', 
    time: '15:00', 
    status: 'completed', 
    reason: 'Control mensual',
    diagnosis: 'Normal',
    treatment: 'Continuar vitaminas'
  },
  { 
    id: '21', 
    patientId: '5', 
    doctorId: '5', 
    date: '2026-03-28', 
    time: '08:30', 
    status: 'completed', 
    reason: 'Dolor lumbar',
    diagnosis: 'Contractura muscular',
    treatment: 'Calor local y masajes'
  },
];

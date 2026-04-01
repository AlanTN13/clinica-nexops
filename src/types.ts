export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  lastVisit?: string;
  birthDate?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  email: string;
  phone: string;
  availability: string[]; // Days of week
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
}

import { APPOINTMENTS } from '../constants';
import { Appointment } from '../types';

const STORAGE_KEY = 'nexops_appointments';
export const APPOINTMENTS_UPDATED_EVENT = 'nexops:appointments-updated';

const sortAppointments = (appointments: Appointment[]) =>
  [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return a.time.localeCompare(b.time);
  });

export const loadAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') {
    return sortAppointments(APPOINTMENTS);
  }

  const savedAppointments = window.localStorage.getItem(STORAGE_KEY);

  if (!savedAppointments) {
    return sortAppointments(APPOINTMENTS);
  }

  try {
    const parsed = JSON.parse(savedAppointments) as Appointment[];
    return Array.isArray(parsed) ? sortAppointments(parsed) : sortAppointments(APPOINTMENTS);
  } catch {
    return sortAppointments(APPOINTMENTS);
  }
};

export const saveAppointments = (appointments: Appointment[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const nextAppointments = sortAppointments(appointments);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAppointments));
  window.dispatchEvent(new CustomEvent(APPOINTMENTS_UPDATED_EVENT));
};

export const createAppointment = (appointment: Omit<Appointment, 'id' | 'status'> & { status?: Appointment['status'] }) => {
  const appointments = loadAppointments();
  const maxId = appointments.reduce((currentMax, currentAppointment) => {
    const numericId = Number(currentAppointment.id);
    return Number.isFinite(numericId) ? Math.max(currentMax, numericId) : currentMax;
  }, 0);

  const newAppointment: Appointment = {
    id: String(maxId + 1),
    status: appointment.status ?? 'pending',
    ...appointment,
  };

  saveAppointments([...appointments, newAppointment]);
  return newAppointment;
};

export const updateAppointment = (appointmentId: string, updates: Partial<Appointment>) => {
  const appointments = loadAppointments();
  const nextAppointments = appointments.map((appointment) =>
    appointment.id === appointmentId ? { ...appointment, ...updates } : appointment
  );

  saveAppointments(nextAppointments);
  return nextAppointments.find((appointment) => appointment.id === appointmentId) ?? null;
};

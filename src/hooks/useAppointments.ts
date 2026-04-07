import { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { APPOINTMENTS_UPDATED_EVENT, loadAppointments } from '../lib/appointmentsStorage';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());

  useEffect(() => {
    const syncAppointments = () => {
      setAppointments(loadAppointments());
    };

    window.addEventListener(APPOINTMENTS_UPDATED_EVENT, syncAppointments);
    window.addEventListener('storage', syncAppointments);

    return () => {
      window.removeEventListener(APPOINTMENTS_UPDATED_EVENT, syncAppointments);
      window.removeEventListener('storage', syncAppointments);
    };
  }, []);

  return appointments;
};

import { FunctionDeclaration, GoogleGenAI, Type } from '@google/genai';
import { DOCTORS, SPECIALTIES } from '../constants';
import { createAppointment } from '../lib/appointmentsStorage';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const getSpecialties: FunctionDeclaration = {
  name: 'getSpecialties',
  description: 'Obtiene la lista de especialidades medicas disponibles en la clinica.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getDoctorsBySpecialty: FunctionDeclaration = {
  name: 'getDoctorsBySpecialty',
  description: 'Obtiene la lista de doctores para una especialidad especifica.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      specialtyId: {
        type: Type.STRING,
        description: 'El ID de la especialidad.',
      },
    },
    required: ['specialtyId'],
  },
};

const bookAppointment: FunctionDeclaration = {
  name: 'bookAppointment',
  description: 'Reserva un turno para un paciente con un doctor en una fecha y hora especifica.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      doctorId: { type: Type.STRING },
      patientName: { type: Type.STRING },
      date: { type: Type.STRING, description: 'Fecha en formato YYYY-MM-DD' },
      time: { type: Type.STRING, description: 'Hora en formato HH:MM' },
      reason: { type: Type.STRING },
    },
    required: ['doctorId', 'patientName', 'date', 'time'],
  },
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const listSpecialtiesText = () =>
  `Estas son las especialidades disponibles:\n- ${SPECIALTIES.map((specialty) => specialty.name).join('\n- ')}`;

const listDoctorsBySpecialtyText = (specialtyId: string) => {
  const doctors = DOCTORS.filter((doctor) => doctor.specialtyId === specialtyId);
  const specialty = SPECIALTIES.find((item) => item.id === specialtyId);

  if (!specialty || doctors.length === 0) {
    return 'No encontre doctores para esa especialidad todavia.';
  }

  return `Estos profesionales atienden ${specialty.name}:\n- ${doctors
    .map((doctor) => `${doctor.name} (${doctor.availability.join(', ')})`)
    .join('\n- ')}\n\nSi quieres, dime fecha, hora y doctor y te ayudo a dejar el turno cargado.`;
};

const tryBookFromMessage = (message: string) => {
  const normalized = normalizeText(message);
  const matchingDoctor = DOCTORS.find((doctor) => normalizeText(doctor.name).includes(normalized) || normalized.includes(normalizeText(doctor.name)));
  const dateMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  const timeMatch = message.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);

  if (!matchingDoctor || !dateMatch || !timeMatch) {
    return null;
  }

  const newAppointment = createAppointment({
    patientId: '1',
    doctorId: matchingDoctor.id,
    date: dateMatch[1],
    time: `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`,
    reason: 'Agendado desde el chat',
  });

  const specialty = SPECIALTIES.find((item) => item.id === matchingDoctor.specialtyId);

  return `Listo, deje un turno pendiente para **${matchingDoctor.name}** el **${newAppointment.date}** a las **${newAppointment.time} hs**.\n\nEspecialidad: **${specialty?.name || 'General'}**.\nSi quieres, puedo ayudarte a revisar otra fecha o profesional.`;
};

const buildLocalReply = (message: string) => {
  const normalized = normalizeText(message);
  const matchedSpecialty = SPECIALTIES.find((specialty) => normalized.includes(normalizeText(specialty.name)));
  const bookedReply = tryBookFromMessage(message);

  if (bookedReply) {
    return bookedReply;
  }

  if (normalized.includes('hola') || normalized.includes('buenas') || normalized.includes('buen dia')) {
    return 'Hola. Puedo ayudarte a consultar especialidades, ver doctores disponibles o dejar un turno pendiente si me indicas **doctor**, **fecha** (`YYYY-MM-DD`) y **hora** (`HH:MM`).';
  }

  if (normalized.includes('especialidad')) {
    return listSpecialtiesText();
  }

  if (matchedSpecialty) {
    return listDoctorsBySpecialtyText(matchedSpecialty.id);
  }

  if (normalized.includes('doctor') || normalized.includes('medico')) {
    return `Estos son algunos doctores disponibles:\n- ${DOCTORS.map((doctor) => doctor.name).join('\n- ')}`;
  }

  if (normalized.includes('turno') || normalized.includes('agendar') || normalized.includes('reservar')) {
    return 'Puedo dejarte un turno pendiente desde el chat. Enviame un mensaje con este formato:\n\n`Quiero turno con Dr. Alejandro Sosa el 2026-04-12 a las 11:00`';
  }

  return 'Ahora mismo el chat esta funcionando en modo local porque falta configurar `GEMINI_API_KEY`. Aun asi puedo ayudarte con especialidades, doctores y carga basica de turnos si me das doctor, fecha y hora.';
};

const buildSystemInstruction = () => `Eres el asistente virtual de Clinica Nexops. Tu objetivo es ayudar a los pacientes a agendar turnos de manera clara y amigable.

REGLAS DE FORMATO:
- Usa **negrita** para nombres de doctores, especialidades, fechas y horas.
- Usa listas con vietas para enumerar opciones o pasos.
- Manten los parrafos cortos y usa saltos de linea para mejorar la legibilidad.
- Se empatico y profesional.

INFORMACION DE LA CLINICA:
- Especialidades: ${SPECIALTIES.map((specialty) => specialty.name).join(', ')}.
- Doctores: ${JSON.stringify(
    DOCTORS.map((doctor) => ({
      nombre: doctor.name,
      especialidad: SPECIALTIES.find((specialty) => specialty.id === doctor.specialtyId)?.name,
      disponibilidad: doctor.availability.join(', '),
    }))
  )}.

FLUJO DE CONVERSACION:
1. Saludo inicial y preguntar especialidad o sintoma.
2. Presentar doctores de la especialidad elegida con sus dias de atencion.
3. Solicitar: Nombre completo, Fecha deseada, Hora y Motivo.
4. Al confirmar, usa la funcion bookAppointment.

IMPORTANTE: Si el doctor no atiende el dia solicitado, informa amablemente sus dias de atencion y ofrece alternativas.`;

export const chatWithAI = async (history: Array<{ role: 'user' | 'model'; content: string }>, message: string) => {
  if (!ai) {
    return { text: buildLocalReply(message), source: 'local-fallback' as const };
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: buildSystemInstruction(),
        tools: [{ functionDeclarations: [getSpecialties, getDoctorsBySpecialty, bookAppointment] }],
      },
      history: history.map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.content }],
      })),
    });

    const result = await chat.sendMessage({ message });

    if (result.functionCalls) {
      for (const call of result.functionCalls) {
        if (call.name === 'getSpecialties') {
          return {
            text: listSpecialtiesText(),
            functionResult: SPECIALTIES,
          };
        }

        if (call.name === 'getDoctorsBySpecialty') {
          const specialtyId = String((call.args as { specialtyId?: string }).specialtyId || '');
          const doctors = DOCTORS.filter((doctor) => doctor.specialtyId === specialtyId);

          return {
            text: listDoctorsBySpecialtyText(specialtyId),
            functionResult: doctors,
          };
        }

        if (call.name === 'bookAppointment') {
          const args = call.args as {
            doctorId: string;
            patientName?: string;
            date: string;
            time: string;
            reason?: string;
          };

          const bookedAppointment = createAppointment({
            patientId: '1',
            doctorId: args.doctorId,
            date: args.date,
            time: args.time,
            reason: args.reason || `Turno solicitado por ${args.patientName || 'paciente'}`,
          });

          const doctor = DOCTORS.find((item) => item.id === args.doctorId);

          return {
            text: `Perfecto. Deje el turno pendiente con **${doctor?.name || 'el profesional seleccionado'}** para el **${bookedAppointment.date}** a las **${bookedAppointment.time} hs**.`,
            functionResult: bookedAppointment,
          };
        }
      }
    }

    return { text: result.text || buildLocalReply(message), source: 'gemini' as const };
  } catch (error) {
    console.error('Gemini chat failed, using local fallback:', error);
    return { text: buildLocalReply(message), source: 'local-fallback' as const };
  }
};

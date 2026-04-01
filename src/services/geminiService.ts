import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SPECIALTIES, DOCTORS, APPOINTMENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const getSpecialties: FunctionDeclaration = {
  name: "getSpecialties",
  description: "Obtiene la lista de especialidades médicas disponibles en la clínica.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getDoctorsBySpecialty: FunctionDeclaration = {
  name: "getDoctorsBySpecialty",
  description: "Obtiene la lista de doctores para una especialidad específica.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      specialtyId: {
        type: Type.STRING,
        description: "El ID de la especialidad.",
      },
    },
    required: ["specialtyId"],
  },
};

const bookAppointment: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Reserva un turno para un paciente con un doctor en una fecha y hora específica.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      doctorId: { type: Type.STRING },
      patientName: { type: Type.STRING },
      date: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" },
      time: { type: Type.STRING, description: "Hora en formato HH:MM" },
      reason: { type: Type.STRING },
    },
    required: ["doctorId", "patientName", "date", "time"],
  },
};

export const chatWithAI = async (history: any[], message: string) => {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `Eres el asistente virtual de Clínica Nexops. Tu objetivo es ayudar a los pacientes a agendar turnos de manera clara y amigable.
      
      REGLAS DE FORMATO:
      - Usa **negrita** para nombres de doctores, especialidades, fechas y horas.
      - Usa listas con viñetas para enumerar opciones o pasos.
      - Mantén los párrafos cortos y usa saltos de línea para mejorar la legibilidad.
      - Sé empático y profesional.
      
      INFORMACIÓN DE LA CLÍNICA:
      - Especialidades: ${SPECIALTIES.map(s => s.name).join(", ")}.
      - Doctores: ${JSON.stringify(DOCTORS.map(d => ({ nombre: d.name, especialidad: SPECIALTIES.find(s => s.id === d.specialtyId)?.name, disponibilidad: d.availability.join(", ") })))}.
      
      FLUJO DE CONVERSACIÓN:
      1. Saludo inicial y preguntar especialidad o síntoma.
      2. Presentar doctores de la especialidad elegida con sus días de atención.
      3. Solicitar: Nombre completo, Fecha deseada (validar contra disponibilidad del doctor), Hora y Motivo.
      4. Al confirmar, usa la función bookAppointment.
      
      IMPORTANTE: Si el doctor no atiende el día solicitado, informa amablemente sus días de atención y ofrece alternativas.`,
      tools: [{ functionDeclarations: [getSpecialties, getDoctorsBySpecialty, bookAppointment] }],
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
  });

  const result = await chat.sendMessage({ message });
  
  const functionCalls = result.functionCalls;
  if (functionCalls) {
    for (const call of functionCalls) {
      if (call.name === "getSpecialties") {
        return { 
          text: "Aquí tienes nuestras especialidades: " + SPECIALTIES.map(s => s.name).join(", "),
          functionResult: SPECIALTIES 
        };
      }
      if (call.name === "getDoctorsBySpecialty") {
        const docs = DOCTORS.filter(d => d.specialtyId === (call.args as any).specialtyId);
        return { 
          text: `Los doctores disponibles para esa especialidad son: ${docs.map(d => d.name).join(", ")}. ¿Con quién te gustaría agendar?`,
          functionResult: docs 
        };
      }
      if (call.name === "bookAppointment") {
        const args = call.args as any;
        return { 
          text: `¡Perfecto! He agendado tu turno con el ${DOCTORS.find(d => d.id === args.doctorId)?.name} para el día ${args.date} a las ${args.time} hs. ¿Necesitas algo más?`,
          functionResult: { success: true, appointment: args }
        };
      }
    }
  }

  return { text: result.text };
};

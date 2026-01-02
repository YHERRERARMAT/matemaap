
import { GoogleGenAI, Type } from "@google/genai";
import { Student, PlanningUnit } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Utiliza IA para extraer datos estructurados de un texto pegado (nómina)
 */
export const parseStudentRoster = async (rawText: string): Promise<Partial<Student>[]> => {
  if (!apiKey) return [];

  const prompt = `
    Analiza la siguiente lista de alumnos y extrae la información en formato JSON.
    LISTA: "${rawText}"
    
    Debes identificar: 
    1. Nombre completo
    2. RUT (formato 12.345.678-9)
    3. Curso (ej: "5° Básico")
    
    Si falta el curso, asume "5° Básico" por defecto.
    Retorna un array JSON de objetos con las llaves: name, rut, grade.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rut: { type: Type.STRING },
              grade: { type: Type.STRING }
            },
            required: ["name", "rut", "grade"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error parsing roster:", error);
    return [];
  }
};

export const getTeacherCopilotReply = async (
  conversationHistory: string[], 
  student: Student, 
  currentUnit?: PlanningUnit
): Promise<string> => {
  if (!apiKey) return "Servicio de asistencia no disponible.";

  const prompt = `
    Eres "QueZadin Copilot", el asistente de IA del Profesor Yonathan Herrera en la Escuela Las Quezadas.
    CONTEXTO DEL ALUMNO: ${student.name} (${student.grade}).
    HISTORIAL: ${conversationHistory.join('\n')}
    TAREA: Redacta una respuesta profesional para el apoderado. Firma como Yonathan Herrera.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "Error al generar borrador.";
  }
};

export const getAiTutorResponse = async (course: string, context: string, question: string): Promise<string> => {
  if (!apiKey) return "El sistema de tutoría no está disponible.";
  
  const isFifthGrade = course.includes('5');
  const curriculumLink = "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/matematica/5-basico?priorizacion=0";

  const systemInstruction = `
    Eres "QueZadin", el tutor virtual experto en Matemáticas de la Escuela Las Quezadas. 
    Tu misión es ayudar a los alumnos a estudiar y preparar sus evaluaciones de forma didáctica.
    CURSO ACTUAL: ${course}.
    SUPERVISOR: Profesor Yonathan Herrera.
    
    REGLAS DE COMPORTAMIENTO:
    1. Ajusta tu complejidad al nivel ${course} de la educación chilena.
    2. Si el alumno quiere "preparar una evaluación", genera 3 ejercicios prácticos de menor a mayor dificultad relacionados al tema.
    3. INTEGRACIÓN KHAN ACADEMY: Es MANDATORIO sugerir una actividad o lección de Khan Academy cuando el alumno necesite practicar o profundizar.
       - URL BASE: Debes usar SIEMPRE es.khanacademy.org (versión en español).
       - RELEVANCIA TEMÁTICA: El enlace proporcionado debe ser específico al tema tratado. 
         * Ejemplos de slugs: /math/aritmetica, /math/algebra, /math/geometry, /math/basic-geo, /math/probability.
         * Si el tema es Fracciones en 5° Básico, busca el enlace más cercano como "es.khanacademy.org/math/aritmetica/fractions".
       - BÚSQUEDA ESPECÍFICA: Si no conoces la URL exacta de la lección, proporciona SIEMPRE una URL de búsqueda con el tema específico: "https://es.khanacademy.org/search?page_search_query=[TEMA_ESPECIFICO_TRATADO]".
    4. Usa un lenguaje motivador y claro.
    5. No des las respuestas de inmediato; guía al alumno con pistas (Método Socrático).
    ${isFifthGrade ? `6. Para dudas conceptuales profundas en 5° Básico, recomienda consultar este enlace oficial del MINEDUC: ${curriculumLink}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contexto: ${context}\nPregunta del alumno: ${question}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "Lo siento, tuve un problema al procesar tu duda. ¿Podrías repetirla?";
  } catch (error) {
    console.error("Tutor Error:", error);
    return "No pude conectar con mi cerebro matemático en este momento. ¡Intenta de nuevo!";
  }
};

export const getSuggestedReplies = async (course: string, lastBotMessage: string): Promise<string[]> => {
  if (!apiKey) return [];
  const prompt = `Como tutor QueZadin (${course}), genera 3 sugerencias cortas de respuesta (máximo 4 palabras cada una) para que el alumno continúe la sesión de estudio tras leer: "${lastBotMessage}".
  Si el mensaje menciona practicar o Khan Academy, una opción debe ser invocar más práctica específica del tema.
  Retorna JSON array de strings.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return ["Dame un ejemplo", "Ver en Khan Academy", "Tengo otra duda"];
  }
};

export const summarizeStudentPerformance = async (name: string, data: string): Promise<string> => {
  if (!apiKey) return "Análisis no disponible.";

  const systemInstruction = `
    Eres "QueZadin Academic Analyst", un experto en pedagogía y análisis de datos educativos.
    Tu tarea es generar un informe ejecutivo y motivador para el Profesor Yonathan Herrera sobre el desempeño de un alumno.
    ESTRUCTURA DEL INFORME:
    1. Perfil Académico: Resumen rápido del estado actual.
    2. Fortalezas y Riesgos: Basado en promedio y asistencia.
    3. Recomendación Pedagógica: Una acción concreta para mejorar o mantener el rendimiento.
    Usa un tono profesional, empático y orientado a la mejora continua.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza el siguiente perfil de alumno:
      Nombre: ${name}
      Datos Académicos: ${data}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Error al procesar el análisis pedagógico.";
  }
};

export const generateStudyGuide = async (title: string, desc: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera tips de estudio para: ${title}. Menciona que son recomendados por el Prof. Yonathan Herrera e incluye una recomendación genérica de buscar el tema específico en es.khanacademy.org para practicar.`,
  });
  return response.text || "";
};

export const translateMessage = async (text: string, lang: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Traduce al ${lang}: ${text}`,
  });
  return response.text || "";
};

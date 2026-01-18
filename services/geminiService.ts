
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Student, PlanningUnit } from "../types";

/**
 * getAiTutorResponseStream: OPTIMIZADO PARA VELOCIDAD TURBO
 * - Utiliza gemini-3-flash-preview para una latencia mínima.
 * - Temperatura 0 para respuestas deterministas y rápidas.
 * - Instrucciones de sistema para usar Khan Academy en español y relevancia temática.
 */
export async function* getAiTutorResponseStream(course: string, question: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `Eres QueZadin, tutor de mates para ${course}. 
  REGLAS CRÍTICAS:
  1. Sé breve, motivador y usa Markdown.
  2. Si sugieres videos o ejercicios de Khan Academy, usa SIEMPRE el dominio es.khanacademy.org.
  3. Asegúrate de que los enlaces de Khan Academy incluyan el tema específico (ej: /math/aritmetica/fracciones) para que sean útiles.
  4. Usa Google Search para encontrar el enlace exacto si no lo conoces.`;

  try {
    const result = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0,
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    for await (const chunk of result) {
      if (chunk.text) {
        const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        yield { text: chunk.text, sources: sources };
      }
    }
  } catch (error) {
    console.error("Latency-optimized streaming error:", error);
    yield { text: "⚠️ Error rápido de conexión. Reintenta.", sources: [] };
  }
}

/**
 * getAiTutorSpeech: Genera audio para la respuesta del tutor.
 */
export const getAiTutorSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Di esto con entusiasmo juvenil: ${text.slice(0, 180)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error", error);
    return undefined;
  }
};

/**
 * getSuggestedReplies: Obtiene sugerencias de respuesta en paralelo con temperatura 0.
 */
export const getSuggestedReplies = async (course: string, lastUserMessage: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: ${course}. Mensaje: "${lastUserMessage}". JSON array de 3 sugerencias cortas para el alumno. Solo JSON.`,
      config: { 
        responseMimeType: "application/json",
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    const parsed = JSON.parse(response.text || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 3) : ["¿Un ejemplo?", "Listo", "No entiendo"];
  } catch (error) { 
    return ["¿Un ejemplo?", "Listo", "No entiendo"]; 
  }
};

export const summarizeStudentPerformance = async (studentName: string, data: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Resume desempeño de ${studentName}: ${data}. Muy breve.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Resumen no disponible.";
  } catch (error) {
    return "Error de resumen.";
  }
};

export const getTeacherCopilotReply = async (history: string[], student: Student, unit?: PlanningUnit): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let context = `Eres Prof. Yonathan para ${student.name}. `;
  if (unit) context += `Unidad: ${unit.title}. `;
  context += `Chat:\n${history.join('\n')}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
      config: { temperature: 0, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "";
  } catch (error) {
    return "Error copilot.";
  }
};

export const generateStudyGuide = async (unitTitle: string, unitDescription: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Tips de estudio para "${unitTitle}": ${unitDescription}. Directo y corto.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Sin tips.";
  } catch (error) {
    return "Error tips.";
  }
}

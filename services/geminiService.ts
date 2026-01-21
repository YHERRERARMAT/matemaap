
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Student, PlanningUnit, AIModelId } from "../types";

export async function* getAiTutorResponseStream(course: string, question: string, modelId: AIModelId = 'gemini-3-flash-preview') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `Eres QueZadin, tutor de matemáticas experto para el nivel ${course}. 
  
  TU MISIÓN:
  1. Ayudar al alumno a razonar, no dar solo el resultado.
  2. Usar Markdown para fórmulas y negritas.
  3. Si usas Gemini 3 Pro, expande tu razonamiento lógico.
  4. Cita siempre fuentes de Khan Academy (es.khanacademy.org) para reforzar el tema.`;

  try {
    const isPro = modelId.includes('pro');
    const config: any = {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
      maxOutputTokens: 2000,
    };

    if (isPro) {
      // Reservamos presupuesto para razonamiento profundo en el modelo Pro
      config.thinkingConfig = { thinkingBudget: 8000 };
    }

    const result = await ai.models.generateContentStream({
      model: modelId,
      contents: question,
      config: config
    });

    for await (const chunk of result) {
      if (chunk.text) {
        const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        yield { 
          text: chunk.text, 
          sources: sources,
          // En futuras versiones del SDK, aquí extraeríamos los thinking tokens si estuvieran disponibles en el stream
        };
      }
    }
  } catch (error) {
    console.error("AI stream error:", error);
    yield { text: "⚠️ Mi red neuronal está experimentando una sobrecarga en este modelo. ¿Probamos con la versión Flash?", sources: [] };
  }
}

export const getAiTutorSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Di esto con entusiasmo pedagógico: ${text.slice(0, 200)}` }] }],
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

export const getSuggestedReplies = async (course: string, lastUserMessage: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: Matemáticas ${course}. Mensaje previo: "${lastUserMessage}". Genera 3 respuestas rápidas y cortas que un alumno podría decir. Solo JSON array de strings.`,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.4,
      }
    });
    const parsed = JSON.parse(response.text || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 3) : ["Explícame más", "Dame un ejemplo", "Entendido"];
  } catch (error) { 
    return ["Explícame más", "Dame un ejemplo", "Entendido"]; 
  }
};

export const summarizeStudentPerformance = async (student: Student): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Como profesor jefe, resume el desempeño de ${student.name} (${student.grade}). 
  Promedio: ${student.averageScore}. Asistencia: ${student.attendance}%. PIE: ${student.isPIE ? 'Sí' : 'No'}. 
  Genera un reporte ejecutivo breve (máx 150 palabras).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Resumen no disponible.";
  } catch (error) {
    return "Error al generar resumen.";
  }
};

export const generateStudyGuide = async (unitTitle: string, unitDescription: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Genera una guía de estudio rápida para la unidad "${unitTitle}". 
  Descripción: ${unitDescription}. Incluye 3 tips clave para el examen.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Guía no disponible.";
  } catch (error) {
    return "Error al generar guía.";
  }
};

export const getTeacherCopilotReply = async (history: string[], student: Student, unit?: PlanningUnit, modelId: AIModelId = 'gemini-3-flash-preview'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let context = `Eres el Prof. Yonathan Herrera. Responde al apoderado de ${student.name}. 
  Contexto Unidad: ${unit?.title || 'General'}. Historial:\n${history.join('\n')}`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: context,
      config: { 
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: modelId.includes('pro') ? 2000 : 0 }
      }
    });
    return response.text || "Lo revisaré a la brevedad.";
  } catch (error) {
    return "Lo revisaré a la brevedad.";
  }
};

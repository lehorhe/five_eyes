import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description: "Krótkie, jednoakapitowe podsumowanie analizy."
    },
    detailedAnalysis: {
      type: Type.STRING,
      description: "Szczegółowy opis treści pliku, w tym obiektów, osób, działań i otoczenia (dla obrazów) lub transkrypcja, dźwięki tła i ton (dla audio)."
    },
    subjectProfiles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Profile zidentyfikowanych osób lub podmiotów, jeśli dotyczy."
    },
    locationAssessment: {
      type: Type.OBJECT,
      properties: {
        potentialLocation: {
          type: Type.STRING,
          description: "Prawdopodobna lokalizacja (miasto, kraj) na podstawie wskazówek wizualnych lub dźwiękowych."
        },
        reasoning: {
          type: Type.STRING,
          description: "Uzasadnienie dla oceny lokalizacji."
        }
      }
    },
    metadataInsights: {
      type: Type.STRING,
      description: "Wnioski na podstawie symulowanych lub wywnioskowanych metadanych (np. pora dnia, możliwy typ urządzenia)."
    },
    threatAssessment: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'],
          description: "Poziom zagrożenia (NISKI, ŚREDNI, WYSOKI, KRYTYCZNY, NIEZNANY)."
        },
        justification: {
          type: Type.STRING,
          description: "Uzasadnienie dla oceny poziomu zagrożenia."
        }
      }
    }
  },
  required: ['executiveSummary', 'detailedAnalysis', 'locationAssessment', 'metadataInsights', 'threatAssessment']
};


export const analyzeMediaContent = async (prompt: string, mediaData: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const mediaPart = {
      inlineData: {
        data: mediaData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [mediaPart, textPart] },
      config: {
        systemInstruction: "Jesteś agentem wywiadu 'Five Eyes' (https://en.wikipedia.org/wiki/Five_Eyes) specjalizującym się w analizie multimodalnej plików multimedialnych. Twoja analiza musi być wszechstronna, obiektywna i ustrukturyzowana. Odpowiadaj wyłącznie w formacie JSON zgodnym z dostarczonym schematem. Cała odpowiedź musi być w języku polskim.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Nie udało się uzyskać analizy z API Gemini.");
  }
};
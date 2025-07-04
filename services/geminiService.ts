
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MindMapNode, SpeakerAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("La variabile d'ambiente API_KEY non è impostata.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const summarizeAudio = async (file: File): Promise<string> => {
  const audioPart = await fileToGenerativePart(file);
  const textPart = {
    text: "Analizza questa registrazione audio. Prima, identifica i 5 temi o 'cluster' di discussione più importanti e ricorrenti. Poi, usa questi cluster per generare un riassunto efficace e concreto. Il riassunto deve iniziare con il titolo 'Cluster di discussione:' seguito da una lista dei cluster identificati. Dopodiché, fornisci il riassunto completo. L'intera risposta deve essere fornita esclusivamente in lingua italiana, curando la formattazione e la chiarezza.",
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: { parts: [audioPart, textPart] },
  });
  
  return response.text;
};

export const analyzeSpeakers = async (file: File): Promise<SpeakerAnalysisResult> => {
  const audioPart = await fileToGenerativePart(file);
  const textPart = {
    text: `Analizza la conversazione in questo file audio e fornisci un'analisi dettagliata degli speaker. Identifica ogni oratore (es. "Speaker A", "Speaker B").

Per l'intera conversazione, esegui le seguenti operazioni:
1. Per ogni speaker identificato, crea un riassunto conciso dei suoi punti di vista e argomenti principali.
2. Per ogni speaker, estrai un "grafico della conoscenza" composto da almeno 3 "cluster" (temi o concetti chiave) che ha discusso.
3. Analizza l'intera conversazione per identificare i punti in comune tra gli speaker.
4. Analizza l'intera conversazione per identificare i punti in cui le opinioni degli speaker sono distanti o divergenti.

Importante: l'intero contenuto testuale nei valori dell'oggetto JSON (summary, knowledgeGraph, commonGround, divergentPoints) deve essere scritto esclusivamente in lingua italiana.

Fornisci l'output esclusivamente come un singolo oggetto JSON che segua questa struttura:
{
  "speakers": [
    {
      "speakerId": "string (es. Speaker A)",
      "summary": "string (riassunto dei punti di vista)",
      "knowledgeGraph": ["string (cluster 1)", "string (cluster 2)", "string (cluster 3)"]
    }
  ],
  "commonGround": ["string (punto in comune 1)", "string (punto in comune 2)"],
  "divergentPoints": ["string (punto di divergenza 1)", "string (punto di divergenza 2)"]
}

Rispondi solo con l'oggetto JSON formattato correttamente, senza testo introduttivo, spiegazioni o \`\`\`json markdown.`,
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: { parts: [audioPart, textPart] },
    config: {
      responseMimeType: "application/json",
    },
  });

  let jsonStr = response.text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr) as SpeakerAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response from API:", e);
    throw new Error("La risposta dell'API non era un JSON valido per l'analisi degli speaker.");
  }
};

export const generateMindMapData = async (file: File): Promise<MindMapNode> => {
  const audioPart = await fileToGenerativePart(file);
  const textPart = {
    text: `Analizza il contenuto di questo file audio e genera una mappa mentale dei concetti principali, argomenti e relazioni. Fornisci l'output come un singolo oggetto JSON. L'oggetto deve avere una struttura nidificata con una proprietà 'topic' (stringa) e una proprietà opzionale 'children' (un array di oggetti con la stessa struttura). Importante: tutti i valori testuali per la proprietà 'topic' devono essere scritti esclusivamente in lingua italiana. Esempio: {"topic": "Idea Centrale", "children": [{"topic": "Sotto-argomento 1"}]}`,
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: { parts: [audioPart, textPart] },
    config: {
      responseMimeType: "application/json",
    },
  });

  let jsonStr = response.text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr) as MindMapNode;
  } catch (e) {
    console.error("Failed to parse JSON response from API:", e);
    throw new Error("La risposta dell'API non era un JSON valido per la mappa mentale.");
  }
};

export const generateCombinedAnalysis = async (file: File): Promise<{ summary: string; mindMap: MindMapNode; }> => {
    const [summary, mindMap] = await Promise.all([
        summarizeAudio(file),
        generateMindMapData(file),
    ]);
    return { summary, mindMap };
};

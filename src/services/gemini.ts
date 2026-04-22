/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function evaluateAnswer(question: string, answer: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the following interview answer for the question: "${question}".
      Answer: "${answer}"
      
      Provide a raw score from 0 to 10 and a short constructive feedback (max 2 sentences).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        },
      },
    });

    const result = JSON.parse(response.text || '{"score": 5, "feedback": "Evaluation failed."}');
    return result as { score: number; feedback: string };
  } catch (error) {
    console.error("Gemini evaluation error:", error);
    return { score: 0, feedback: "Sorry, I couldn't evaluate that answer right now." };
  }
}

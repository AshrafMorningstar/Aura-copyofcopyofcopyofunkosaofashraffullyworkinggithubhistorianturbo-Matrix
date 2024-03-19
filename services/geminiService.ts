/**
 * @license
 * Copyright © 2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * Licensed under the MIT License.
 * This is a personal educational recreation.
 * Original concepts remain property of their respective creators.
 * 
 * @author Ashraf Morningstar
 * @see https://github.com/AshrafMorningstar
 */
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedItem, ActivityType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateActivityPlan = async (
  language: string, 
  repoName: string, 
  count: number
): Promise<Partial<GeneratedItem>[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, using offline mode.");
    return generateMockData(count, language);
  }

  try {
    const batchSize = Math.min(count, 20);
    
    const prompt = `
      You are a GitHub Activity Generator.
      Generate ${batchSize} realistic GitHub items for a repository named "${repoName}" in "${language}".
      Return a mix of Issues, Pull Requests, and standalone Commits.
      
      For each item provide:
      - type: 'ISSUE', 'PR', or 'COMMIT'
      - title: A realistic title (max 50 chars)
      - description: A realistic body text.
      
      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['ISSUE', 'PR', 'COMMIT'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    return data.map((item: any, index: number) => ({
      ...item,
      type: item.type === 'ISSUE' ? ActivityType.ISSUE : 
            item.type === 'COMMIT' ? ActivityType.COMMIT : ActivityType.PR,
    }));

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return generateMockData(count, language);
  }
};

const generateMockData = (count: number, language: string): Partial<GeneratedItem>[] => {
  const templates = [
    { type: ActivityType.ISSUE, title: `Runtime error in ${language} module`, desc: "Getting an undefined reference error when loading the core module on startup." },
    { type: ActivityType.ISSUE, title: "Feature: Dark mode support", desc: "Users are requesting a dark mode toggle for the main dashboard interface." },
    { type: ActivityType.PR, title: "Refactor auth middleware", desc: "Cleaned up the authentication logic and added better error handling for 401 states." },
    { type: ActivityType.COMMIT, title: "Update README badges", desc: "Added new status badges for CI pipelines." },
    { type: ActivityType.PR, title: "Fix typos in documentation", desc: "Corrected spelling mistakes in README and CONTRIBUTING.md." },
    { type: ActivityType.COMMIT, title: "Bump version number", desc: "Incremented package version to 1.0.4" },
  ];

  return Array.from({ length: count }).map((_, i) => {
    const t = templates[i % templates.length];
    return {
      type: t.type,
      title: `${t.title} (Batch ${Math.floor(i/5)})`,
      description: t.desc
    };
  });
};
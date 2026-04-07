import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function synthesizeVideo(url: string): Promise<string> {
  const prompt = `You are a deep industry and subject matter expert. I am a busy professional executive.
Please analyze the following YouTube video: ${url}

Provide a synthesis of the video. The output MUST be formatted in Markdown.
To save space, do NOT use a list for the metadata. Format the output EXACTLY using the following structure:

# [Video Title]
**[Channel Name]** • [Upload Date] • [Duration]

### Speakers
[A short bio or background about the host(s) and any guest(s) featured in the video.]

### Executive Summary
[A brief overview of the video's core premise.]

### Key Takeaways
[The top insights, strategic takeaways, and actionable advice discussed in the video. Use bullet points.]

### Actionable Insights
[Specific, actionable nuances, step-by-step methods, configurations, or granular advice (e.g., specific file structures, methodologies, tools, or frameworks mentioned in the video that someone could immediately implement). Use bullet points.]

Constraints:
- Keep the entire synthesis concise, neat, and no longer than one page.
- Cater the tone and insights to busy executives.
- Use your search capabilities to find information about the video, channel, and speakers if needed.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    if (!response.text) {
      throw new Error("No summary generated.");
    }

    return response.text;
  } catch (error) {
    console.error("Error generating synthesis:", error);
    throw error;
  }
}

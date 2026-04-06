export interface VideoSummary {
  url: string;
  summary: string;
  timestamp: number;
}

export function getStoredSummary(url: string): VideoSummary | null {
  try {
    const stored = localStorage.getItem(`execbrief_summary_v2_${url}`);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error reading from local storage", e);
    return null;
  }
}

export function storeSummary(url: string, summary: string) {
  try {
    const data: VideoSummary = { url, summary, timestamp: Date.now() };
    localStorage.setItem(`execbrief_summary_v2_${url}`, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing to local storage", e);
  }
}

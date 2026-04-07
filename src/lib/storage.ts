export interface VideoSummary {
  url: string;
  summary: string;
  timestamp: number;
}

export function getStoredSummary(url: string): VideoSummary | null {
  try {
    const stored = localStorage.getItem(`execbrief_summary_v4_${url}`);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error reading from local storage", e);
    return null;
  }
}

export function storeSummary(url: string, summary: string) {
  try {
    const data: VideoSummary = { url, summary, timestamp: Date.now() };
    localStorage.setItem(`execbrief_summary_v4_${url}`, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing to local storage", e);
  }
}

export function getAllStoredSummaries(): VideoSummary[] {
  try {
    const summaries: VideoSummary[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('execbrief_summary_v4_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          summaries.push(JSON.parse(stored));
        }
      }
    }
    return summaries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Error reading all from local storage", e);
    return [];
  }
}

export function deleteStoredSummary(url: string) {
  try {
    localStorage.removeItem(`execbrief_summary_v4_${url}`);
  } catch (e) {
    console.error("Error deleting from local storage", e);
  }
}

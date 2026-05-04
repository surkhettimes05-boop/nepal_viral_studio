export interface GeneratedNews {
  id: number;
  headline: string;
  source: string;
  reason: string;
  description: string;
  link: string;
  publishedAt: string;
  category: 'Politics' | 'Tragedy' | 'Bizarre' | 'Sports' | 'Tech' | 'Global';
}

export interface TikTokPackage {
  viralScore: number;
  scoreReason: string;
  hooks: {
    nepali: string;
    english: string;
    bilingual: string;
  };
  imageText: {
    headline: string;
    subtext: string;
    emojis: string;
    bgColor: string;
  };
  caption: string;
  commentBait: string[];
  bestTime: string;
}

export const geminiService = {
  async fetchLatestTrends(): Promise<GeneratedNews[]> {
    const response = await fetch('/api/trends');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch trends');
    }
    return response.json();
  },

  async generateTikTokPackage(story: GeneratedNews): Promise<TikTokPackage> {
    const response = await fetch('/api/generate-package', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate package');
    }
    return response.json();
  }
};

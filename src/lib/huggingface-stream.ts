import { HfInference } from '@huggingface/inference';

interface AnalysisResult {
  sentiment: {
    label: string;
    score: number;
  };
  topics?: string[];
  actionItems?: string[];
  engagement?: number;
}

// Individual element in the array returned by textClassification
interface TextClassificationOutputElement {
  label: string;
  score: number;
}

// Output from zeroShotClassification
interface ZeroShotClassificationOutput {
  sequence: string;
  labels: string[];
  scores: number[];
}

interface SummarizationResult {
  summary_text: string;
}

export class HuggingFaceStream {
  private hf: HfInference;
  private apiKey: string;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  async analyzeChunk(text: string): Promise<AnalysisResult> {
    try {
      // Sentiment analysis using DistilRoBERTa
      const sentimentResult = await this.hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text,
      }) as any;

      // Topic extraction using KeyBERT approach with zero-shot classification
      const topicsResult = await this.hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text,
        parameters: {
          candidate_labels: [
            'marketing', 'sales', 'product', 'finance', 
            'customer service', 'operations', 'strategy', 
            'technology', 'human resources', 'legal'
          ]
        }
      }) as any;

      // Try to extract action items
      const actionItemsResult = text.includes('action') || 
                               text.includes('task') || 
                               text.includes('to-do') || 
                               text.includes('follow up') ||
                               text.includes('need to') ||
                               text.includes('should') ?
        await this.hf.summarization({
          model: 'facebook/bart-large-cnn',
          inputs: text,
          parameters: {
            max_length: 100,
            min_length: 10,
          }
        }) as any : null;

      // Calculate engagement score based on text features
      const engagementScore = this.calculateEngagement(text);

      // Build and return the complete analysis result with proper runtime checks
      return {
        sentiment: {
          label: Array.isArray(sentimentResult) && sentimentResult.length > 0 ? 
            sentimentResult[0].label : 'NEUTRAL',
          score: Array.isArray(sentimentResult) && sentimentResult.length > 0 ? 
            sentimentResult[0].score : 0.5,
        },
        topics: topicsResult && Array.isArray(topicsResult.labels) ? 
          topicsResult.labels
            .map((label: string, index: number) => ({ 
              label, 
              score: topicsResult.scores[index] 
            }))
            .filter((topic: any) => topic.score > 0.3)
            .map((topic: any) => topic.label) : [],
        actionItems: actionItemsResult && actionItemsResult.summary_text ? 
          [actionItemsResult.summary_text] : [],
        engagement: engagementScore,
      };
    } catch (error) {
      console.error('Error in analyze chunk:', error);
      return {
        sentiment: {
          label: 'NEUTRAL',
          score: 0.5,
        },
        topics: [],
        actionItems: [],
        engagement: 0.5,
      };
    }
  }

  private calculateEngagement(text: string): number {
    // Simple heuristic for engagement - can be improved
    const engagementPatterns = [
      { pattern: /\?/g, weight: 0.1 },  // Questions indicate engagement
      { pattern: /!/g, weight: 0.1 },   // Exclamations indicate enthusiasm
      { pattern: /agree|yes|great|good|excellent/gi, weight: 0.05 }, // Agreement
      { pattern: /disagree|no|but|however|though/gi, weight: 0.05 }, // Disagreement (still engaged)
      { pattern: /interesting|curious|tell me more/gi, weight: 0.1 }, // Expressions of interest
    ];
    
    let score = 0.5; // Base engagement score
    
    // Apply each pattern to the text and adjust score
    engagementPatterns.forEach(({ pattern, weight }) => {
      const matches = (text.match(pattern) || []).length;
      score += matches * weight;
    });
    
    // Normalize score between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  async analyzeText(text: string): Promise<any> {
    try {
      // Make a request to HuggingFace API for sentiment analysis
      const response = await fetch(
        'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: text })
        }
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  async transcribeAudio(audioData: ArrayBuffer): Promise<any> {
    try {
      // Use Hugging Face for Whisper-based transcription
      const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: new Uint8Array(audioData)
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async diarizeAudio(audioData: ArrayBuffer): Promise<any> {
    try {
      // Use Hugging Face/PyAnnote for speaker diarization
      const response = await fetch('https://api-inference.huggingface.co/models/pyannote/speaker-diarization', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: new Uint8Array(audioData)
      });
      
      if (!response.ok) {
        throw new Error(`Diarization failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Diarization error:', error);
      throw error;
    }
  }

  async classifyTopics(text: string, candidateLabels: string[]): Promise<any> {
    try {
      // Use zero-shot classification to identify topics
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: text,
            parameters: { candidate_labels: candidateLabels }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Topic classification failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error classifying topics:', error);
      throw error;
    }
  }
} 
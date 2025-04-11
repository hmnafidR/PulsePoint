import { HfInference } from '@huggingface/inference';

export class HuggingFaceService {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async analyzeSentiment(text: string) {
    return await this.hf.textClassification({
      model: 'SamLowe/roberta-base-go_emotions',
      inputs: text,
    });
  }

  async detectQuestion(text: string) {
    return await this.hf.textClassification({
      model: 'shahrukhx01/question-vs-statement-classifier',
      inputs: text,
    });
  }

  async analyzeSpeakerEmotion(text: string) {
    return await this.hf.textClassification({
      model: 'ehcalabres/bert-emotion-english-distilled',
      inputs: text,
    });
  }
} 
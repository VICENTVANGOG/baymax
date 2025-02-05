declare global {
    interface SpeechRecognition {
      start(): void;
      stop(): void;
      continuous: boolean;
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: (event: SpeechRecognitionErrorEvent) => void;
    }
  
    interface SpeechRecognitionResult {
      transcript: string;
      confidence: number;
    }
  
    interface SpeechRecognitionEvent {
      error(arg0: string, error: unknown): unknown;
      results: SpeechRecognitionResultList;
      resultIndex: number;
    }
  
    type SpeechRecognitionResultList = Array<SpeechRecognitionResult>;
  }
  
  export {};
  
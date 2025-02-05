declare global {
    interface Window {
      SpeechRecognition: new () => SpeechRecognition;
      webkitSpeechRecognition: new () => SpeechRecognition;
    }
  }
  
  // Esto es necesario para que el archivo sea tratado como un módulo de tipo y se pueda importar
  export {};
  
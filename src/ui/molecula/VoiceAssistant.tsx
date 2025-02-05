"use client"
import { useState, useEffect } from "react";
import openAiService from "@/app/api/services/openAi.service"; // Asegúrate de tener esta importación de tu servicio.

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isActivated, setIsActivated] = useState(false); // Para saber si el asistente está activado.

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true; // Esto hará que el reconocimiento esté activo constantemente
        recognitionInstance.lang = "es-ES";
        recognitionInstance.interimResults = true; // Para que reconozca lo que dices en tiempo real
        recognitionInstance.maxAlternatives = 1;
        setRecognition(recognitionInstance);

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => { 
          const transcript = event.results[event.resultIndex][0].transcript;
          setTranscript(transcript);

          // Si la palabra "auh" es detectada, activamos el asistente.
          if (transcript.toLowerCase().includes("auh") && !isActivated) {
            setIsActivated(true);
            speak("Hola, soy Baymax, tu asistente médico personal.");
          }

          if (isActivated && transcript.toLowerCase().includes("me duele")) {
            // Si mencionas "me duele", se activa la consulta a la API de OpenAI.
            handlePainResponse(transcript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
          console.error("Error de reconocimiento de voz:", event.error);
        };
      }
    }
  }, [isActivated]);

  const handlePainResponse = async (input: string) => {
    try {
      const result = await openAiService.createPrompt(input);
      setResponse(result.reply);
      speak(result.reply);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setResponse("Hubo un error al obtener la respuesta.");
      speak("Hubo un error al obtener la respuesta.");
    }
  };

  const speak = (text: string) => {
    if (typeof window !== "undefined") {
      setIsSpeaking(true);
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "es-ES";
      speech.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
    }
  };

  const toggleListening = () => {
    if (isSpeaking) {
      // Si está hablando, cancelamos la síntesis y detenemos el reconocimiento.
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (!isListening) {
      // Empezamos el reconocimiento de voz
      recognition?.start();
    } else {
      // Si ya está escuchando, lo detenemos
      recognition?.stop();
    }

    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Asistente Virtual de Voz</h1>
      <button
        onClick={toggleListening}
        className={`mb-4 ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
        disabled={isSpeaking || !recognition}
      >
        {isActivated ? (isListening ? "Detener" : "Escuchar") : "Esperando la palabra clave..."}
      </button>
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        <p className="mb-2">
          <strong>Tú dijiste:</strong> {transcript}
        </p>
        <p>
          <strong>Respuesta del asistente:</strong> {response}
        </p>
        {isSpeaking && <p className="text-green-500 mt-2">El asistente está hablando...</p>}
      </div>
      {!recognition && <p className="text-red-500 mt-4">Tu navegador no soporta el reconocimiento de voz.</p>}
    </div>
  );
};

export default VoiceAssistant;

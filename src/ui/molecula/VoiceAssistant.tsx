"use client";

import { useState, useEffect } from "react";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.lang = "es-ES";
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 1;
        setRecognition(recognitionInstance);

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.resultIndex][0].transcript;
          console.log("Transcript received:", transcript); // Log the transcript
          setTranscript(transcript);

          // Changed the keyword to "que dolor"
          if (transcript.toLowerCase().includes("que dolor") && !isActivated) {
            console.log("Activation word detected: 'que dolor'"); // Log if activation word is detected
            setIsActivated(true);
            speak("Hola, soy Baymax, tu asistente médico personal.");
          }

          if (isActivated && transcript.toLowerCase().includes("me duele")) {
            console.log("Pain detected: 'me duele'"); // Log when pain is detected
            handlePainResponse(transcript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
          console.error("Error de reconocimiento de voz:", event.error); // Log error
        };
      } else {
        console.error("SpeechRecognition is not supported in this browser.");
      }
    }
  }, [isActivated]);

  const handlePainResponse = async (input: string) => {
    try {
      console.log("Sending prompt to API:", input); // Log the input being sent
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (data.reply) {
        setResponse(data.reply);
        speak(data.reply);
      } else {
        setResponse("Hubo un error al obtener la respuesta.");
        speak("Hubo un error al obtener la respuesta.");
      }
    } catch (error) {
      console.error("Error fetching from API:", error); // Log any API errors
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
    console.log("Toggling listening state..."); // Log when toggle is triggered

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (!isListening) {
      console.log("Starting recognition..."); // Log when recognition starts
      recognition?.start();
    } else {
      console.log("Stopping recognition..."); // Log when recognition stops
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

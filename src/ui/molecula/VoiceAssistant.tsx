"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

// Definimos las interfaces para SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: SpeechGrammarList
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  start(): void
  stop(): void
  abort(): void
}

// Extendemos la interfaz Window para incluir SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechGrammarList extends EventTarget {
  addFromString(grammar: string, weight: number): void
  addFromUri(src: string, weight: number): void
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false
      recognition.lang = "es-ES"
      recognition.interimResults = false
      recognition.maxAlternatives = 1
    }
  }, [recognition])

  const handleListen = useCallback(() => {
    if (!recognition) return

    if (isListening) {
      recognition.start()
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        handleResponse(transcript)
      }
    } else {
      recognition.stop()
    }

    recognition.onend = () => {
      setIsListening(false)
    }
  }, [isListening, recognition])

  useEffect(() => {
    handleListen()
  }, [handleListen])

  const handleResponse = (input: string) => {
    const assistantResponse = `He entendido que has dicho: ${input}`
    setResponse(assistantResponse)
    speak(assistantResponse)
  }

  const speak = (text: string) => {
    setIsSpeaking(true)
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = "es-ES"
    speech.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(speech)
  }

  const toggleListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    setIsListening(!isListening)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Asistente Virtual de Voz</h1>
      <button
        onClick={toggleListening}
        className={`mb-4 ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
        disabled={isSpeaking || !recognition}
      >
        {isListening ? "Detener" : "Hablar"}
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
  )
}

export default VoiceAssistant


// components/VoiceInput.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { VoiceRecorder } from "@/lib/voice-recorder"

export default function VoiceInput() {
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    recorderRef.current = new VoiceRecorder()

    recorderRef.current.onTranscription((text) => {
      setTranscript(text)
      setIsRecording(false)
    })

    recorderRef.current.onError((err) => {
      console.error("Voice recording error:", err)
      setIsRecording(false)
    })
  }, [])

  const handleStart = async () => {
    if (!recorderRef.current) return
    try {
      await recorderRef.current.start()
      setTranscript("")
      setIsRecording(true)
    } catch (err) {
      console.error("Error starting recorder:", err)
    }
  }

  const handleStop = () => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div className="p-4 rounded-xl border w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Voice Input</h2>

      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded ${isRecording ? "bg-red-500" : "bg-green-600"} text-white`}
          onClick={isRecording ? handleStop : handleStart}
        >
          {isRecording ? "Stop" : "Start Recording"}
        </button>
      </div>

      {transcript && (
        <div className="mt-4 bg-gray-100 p-3 rounded-md text-gray-700">
          <strong>Transcript:</strong>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  )
}

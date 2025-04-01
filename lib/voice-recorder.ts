export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private onTranscriptionCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null
  private isRecording = false

  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
  }

  public async start(): Promise<void> {
    try {
      if (this.isRecording) {
        return
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" })

          // In a real implementation, you would send this to a speech-to-text service
          // For now, we'll simulate it with a timeout
          setTimeout(() => {
            // Simulate different responses based on audio length
            const audioLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.size, 0)
            let simulatedText = ""

            if (audioLength < 1000) {
              simulatedText = "This is a short simulated response."
            } else if (audioLength < 5000) {
              simulatedText =
                "This is a medium-length simulated response. I would typically elaborate more on my experience and skills in this area."
            } else {
              simulatedText =
                "This is a detailed simulated response. In a real interview, I would provide specific examples from my experience, discuss technical approaches I've used, and explain my problem-solving methodology in depth. I would also highlight relevant skills and how they apply to the position."
            }

            if (this.onTranscriptionCallback) {
              this.onTranscriptionCallback(simulatedText)
            }
          }, 1000)
        } catch (error) {
          if (this.onErrorCallback && error instanceof Error) {
            this.onErrorCallback(error)
          }
        }
      }

      this.mediaRecorder.start()
      this.isRecording = true
    } catch (error) {
      if (this.onErrorCallback && error instanceof Error) {
        this.onErrorCallback(error)
      }
      throw error
    }
  }

  public stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false

      // Stop all audio tracks
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }

  public onTranscription(callback: (text: string) => void): void {
    this.onTranscriptionCallback = callback
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback
  }

  public isActive(): boolean {
    return this.isRecording
  }
}


import type { Timestamp } from "firebase/firestore"

export interface Interview {
  id: string
  userId: string
  role: string
  type: string
  level: string
  technologies: string[]
  questions: InterviewQuestion[]
  createdAt: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  started: boolean
  completed: boolean
  currentQuestionIndex: number
  score?: number
  title?: string
}

export interface InterviewQuestion {
  question: string
  type: string
  userAnswer?: string
  feedback?: {
    score: number
    strengths: string[]
    improvements: string[]
    detailedFeedback: string
  }
}

export interface InterviewGeneratorParams {
  role: string
  type: string
  level: string
  questionCount: number
  technologies: string[]
}

export interface AnswerEvaluationParams {
  question: string
  answer: string
  role: string
  level: string
  type: string
}

export interface EvaluationResult {
  score: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
}


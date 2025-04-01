import { sql } from "@/lib/db"
import type { InterviewQuestion } from "./types"

export async function analyzeJobDescription(userId: number, description: string, title?: string, company?: string) {
  try {
    // Save the job description
    const jobDescResult = await sql`
      INSERT INTO job_descriptions (user_id, description, title, company)
      VALUES (${userId}, ${description}, ${title || null}, ${company || null})
      RETURNING id
    `

    const jobDescId = jobDescResult[0].id

    // Extract key information from the job description
    const extractedInfo = await extractJobInfo(description)

    // Generate interview questions based on the job description
    const questions = await generateQuestionsFromJobDescription(description, extractedInfo)

    // Create an interview with these questions
    const interviewData = {
      userId,
      role: extractedInfo.role,
      type: "mixed", // Both technical and behavioral
      level: extractedInfo.level,
      technologies: extractedInfo.technologies,
      questions,
      title: `${extractedInfo.role} at ${company || "Company"} - Job Description Interview`,
      jobDescription: description,
    }

    // Create the interview
    const interviewResult = await sql`
      INSERT INTO interviews 
        (user_id, role, type, level, technologies, questions, title, job_description) 
      VALUES (
        ${interviewData.userId}, 
        ${interviewData.role}, 
        ${interviewData.type}, 
        ${interviewData.level}, 
        ${interviewData.technologies}, 
        ${JSON.stringify(interviewData.questions)}, 
        ${interviewData.title}, 
        ${interviewData.jobDescription}
      ) 
      RETURNING *
    `

    // Update the job description with the interview ID
    await sql`
      UPDATE job_descriptions
      SET interview_id = ${interviewResult[0].id}
      WHERE id = ${jobDescId}
    `

    return {
      success: true,
      interview: {
        ...interviewResult[0],
        id: interviewResult[0].id.toString(),
      },
    }
  } catch (error) {
    console.error("Error analyzing job description:", error)
    return { success: false, error: "Failed to analyze job description" }
  }
}

async function extractJobInfo(description: string) {
  // In a real implementation, this would use AI to extract information
  // For now, we'll use a simplified approach

  // Extract role
  let role = "Software Developer"
  if (description.toLowerCase().includes("frontend") || description.toLowerCase().includes("front-end")) {
    role = "Frontend Developer"
  } else if (description.toLowerCase().includes("backend") || description.toLowerCase().includes("back-end")) {
    role = "Backend Developer"
  } else if (description.toLowerCase().includes("fullstack") || description.toLowerCase().includes("full-stack")) {
    role = "Full Stack Developer"
  } else if (description.toLowerCase().includes("data scientist")) {
    role = "Data Scientist"
  } else if (description.toLowerCase().includes("product manager")) {
    role = "Product Manager"
  }

  // Extract level
  let level = "mid"
  if (description.toLowerCase().includes("senior") || description.toLowerCase().includes("lead")) {
    level = "senior"
  } else if (description.toLowerCase().includes("junior") || description.toLowerCase().includes("entry")) {
    level = "junior"
  }

  // Extract technologies
  const technologies = []
  const techKeywords = [
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "node",
    "python",
    "java",
    "c#",
    "ruby",
    "go",
    "php",
    "sql",
    "nosql",
    "mongodb",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
  ]

  for (const tech of techKeywords) {
    if (description.toLowerCase().includes(tech)) {
      technologies.push(tech.charAt(0).toUpperCase() + tech.slice(1))
    }
  }

  return { role, level, technologies }
}

async function generateQuestionsFromJobDescription(description: string, jobInfo: any): Promise<InterviewQuestion[]> {
  // In a real implementation, this would use AI to generate questions
  // For now, we'll use a simplified approach with predefined questions

  const technicalQuestions = [
    `Based on the job description, explain your experience with ${jobInfo.technologies.join(", ")}.`,
    `The job requires ${jobInfo.role} skills. Can you describe a project where you demonstrated these skills?`,
    `How would you approach solving a technical challenge mentioned in the job description?`,
    `The job mentions ${jobInfo.technologies[0] || "certain technologies"}. How do you stay updated with the latest developments in this area?`,
    `What technical skills from the job description do you think are most important for success in this role?`,
  ]

  const behavioralQuestions = [
    `The job description emphasizes teamwork. Can you describe a situation where you collaborated effectively in a team?`,
    `This role requires problem-solving skills. Can you share an example of a complex problem you solved?`,
    `The company culture values innovation. Can you describe a time when you implemented an innovative solution?`,
    `How do your career goals align with this position and company?`,
    `The job requires working under pressure. How do you handle tight deadlines and high-pressure situations?`,
  ]

  // Mix technical and behavioral questions
  const questions: InterviewQuestion[] = []

  for (let i = 0; i < 5; i++) {
    if (i % 2 === 0) {
      questions.push({
        question: technicalQuestions[Math.floor(i / 2)],
        type: "technical",
      })
    } else {
      questions.push({
        question: behavioralQuestions[Math.floor(i / 2)],
        type: "behavioral",
      })
    }
  }

  return questions
}


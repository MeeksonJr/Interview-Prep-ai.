import { generateAnalysis } from "@/app/actions/gemini-actions"

export async function analyzeJobMatchWithResume(
  resume: any,
  jobDescription: string,
  jobTitle?: string,
  company?: string,
) {
  try {
    console.log(`Analyzing job match for resume: ${resume.id} (${resume.file_name})`)

    // Extract resume content from the resume object or use the analysis if content is not available
    let resumeContent = resume.content

    if (!resumeContent) {
      // If no content is available, use the analysis as a fallback
      resumeContent = resume.analysis
        ? `Resume Analysis: ${JSON.stringify(resume.analysis)}`
        : "No resume content available"
    }

    // Prepare the prompt for Gemini
    const prompt = `
    You are an expert resume reviewer and job application analyst. 
    
    RESUME:
    ${resumeContent}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    JOB TITLE: ${jobTitle || "Not specified"}
    COMPANY: ${company || "Not specified"}
    
    Analyze how well this resume matches the job description. Provide a detailed analysis in JSON format with the following structure:
    {
      "match_percentage": number between 0-100,
      "technical_match": number between 0-100,
      "experience_match": number between 0-100,
      "education_match": number between 0-100,
      "summary": "A brief summary of the overall match",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "skills": {
        "technical": [
          {"name": "Skill name", "match": true or false},
          ...
        ],
        "soft": [
          {"name": "Skill name", "match": true or false},
          ...
        ]
      },
      "missing_keywords": ["Keyword 1", "Keyword 2", ...],
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "application_strategy": "Detailed strategy for applying to this job"
    }
    
    IMPORTANT: For the "match" field in skills, only use boolean values (true or false). Do not use strings or other values.
    
    Be honest but constructive in your assessment. If the match is poor, provide actionable recommendations.
    
    Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.
    `

    // Call Gemini API to analyze the match
    const rawResponse = await generateAnalysis(prompt)

    try {
      // Clean the response if it contains markdown code blocks
      let cleanedResponse = rawResponse

      // Remove markdown code block indicators if present
      if (cleanedResponse.includes("```json")) {
        cleanedResponse = cleanedResponse.replace(/```json\n/g, "").replace(/```/g, "")
      } else if (cleanedResponse.includes("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n/g, "").replace(/```/g, "")
      }

      // Normalize any non-standard boolean values
      cleanedResponse = cleanedResponse
        .replace(/"match": partially/g, '"match": false')
        .replace(/"match": Partially/g, '"match": false')
        .replace(/"match": "partially"/g, '"match": false')
        .replace(/"match": "Partially"/g, '"match": false')
        .replace(/"match": "true"/g, '"match": true')
        .replace(/"match": "false"/g, '"match": false')

      console.log("Cleaned response:", cleanedResponse.substring(0, 100) + "...")

      // Parse the JSON response
      const analysis = JSON.parse(cleanedResponse)
      return analysis
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      console.log("Raw response:", rawResponse)

      // Fallback to a basic analysis if parsing fails
      return generateFallbackAnalysis(resume, jobDescription, jobTitle, company)
    }
  } catch (error: any) {
    console.error("Error in job match analysis:", error)

    // Fallback to a basic analysis if the API call fails
    return generateFallbackAnalysis(resume, jobDescription, jobTitle, company)
  }
}

// Fallback function in case the Gemini API fails
function generateFallbackAnalysis(resume: any, jobDescription: string, jobTitle?: string, company?: string) {
  console.log("Using fallback analysis due to API error")

  // Generate a match percentage between 40 and 70 for fallback
  const matchPercentage = Math.floor(Math.random() * 31) + 40

  return {
    match_percentage: matchPercentage,
    technical_match: matchPercentage + Math.floor(Math.random() * 10) - 5,
    experience_match: matchPercentage + Math.floor(Math.random() * 10) - 5,
    education_match: matchPercentage + Math.floor(Math.random() * 10) - 5,
    summary: `This is a fallback analysis because the AI service encountered an error. The estimated match is around ${matchPercentage}%, but this is not based on detailed analysis.`,
    strengths: [
      "This is a fallback analysis",
      "Please try again later for accurate results",
      "The AI service is currently unavailable",
    ],
    gaps: ["Unable to provide detailed gap analysis", "Try again later for accurate results"],
    skills: {
      technical: [
        { name: "JavaScript", match: Math.random() > 0.5 },
        { name: "React", match: Math.random() > 0.5 },
        { name: "Node.js", match: Math.random() > 0.5 },
      ],
      soft: [
        { name: "Communication", match: Math.random() > 0.5 },
        { name: "Teamwork", match: Math.random() > 0.5 },
      ],
    },
    missing_keywords: ["Unable to analyze keywords"],
    recommendations: [
      "Try again later for accurate recommendations",
      "Ensure your resume is properly uploaded",
      "Check that the job description is detailed enough for analysis",
    ],
    application_strategy: "Please try again later for a personalized application strategy.",
  }
}


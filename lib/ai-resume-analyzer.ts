// Mock implementation of the AI resume analyzer
export async function analyzeResumeWithAI(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  careerPath: string,
  level: string,
) {
  try {
    console.log(`Analyzing resume: ${fileName} (${fileType}) for ${careerPath} at ${level} level`)

    // In a real implementation, we would extract text from the file and analyze it with an AI model
    // For now, we'll return mock data based on the career path and level

    // Generate a score between 60 and 95
    const score = Math.floor(Math.random() * 36) + 60

    // Generate mock analysis data
    const analysis = generateMockAnalysis(careerPath, level, score)

    return {
      success: true,
      score,
      analysis,
    }
  } catch (error: any) {
    console.error("Error in AI resume analysis:", error)
    return {
      success: false,
      error: error.message || "Failed to analyze resume",
    }
  }
}

function generateMockAnalysis(careerPath: string, level: string, score: number) {
  // Technical skills based on career path
  const technicalSkills: Record<string, string[]> = {
    frontend: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS"],
    backend: ["Node.js", "Express", "Python", "Django", "SQL", "MongoDB", "API Design"],
    fullstack: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "MongoDB", "Git"],
    devops: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Monitoring"],
    data: ["Python", "SQL", "Pandas", "NumPy", "Data Visualization", "Machine Learning", "ETL"],
    mobile: ["React Native", "Swift", "Kotlin", "Flutter", "Mobile UI Design", "API Integration"],
    ai: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Data Preprocessing"],
  }

  // Soft skills
  const softSkills = [
    "Communication",
    "Problem Solving",
    "Teamwork",
    "Time Management",
    "Adaptability",
    "Critical Thinking",
    "Leadership",
  ]

  // Select a random subset of technical skills based on career path
  const selectedTechnicalSkills = technicalSkills[careerPath] || technicalSkills.fullstack
  const numTechnicalSkills = Math.floor(Math.random() * 3) + 3 // 3-5 skills
  const detectedTechnicalSkills = shuffleArray(selectedTechnicalSkills).slice(0, numTechnicalSkills)

  // Select a random subset of soft skills
  const numSoftSkills = Math.floor(Math.random() * 2) + 1 // 1-2 skills
  const detectedSoftSkills = shuffleArray(softSkills).slice(0, numSoftSkills)

  // Generate strengths based on score
  const strengths = generateStrengths(careerPath, level, score)

  // Generate areas for improvement based on score
  const areasForImprovement = generateAreasForImprovement(careerPath, level, score)

  // Generate recommendations
  const recommendations = generateRecommendations(careerPath, level, score, areasForImprovement)

  // Generate overall assessment
  const overallAssessment = generateOverallAssessment(score)

  return {
    detected_skills: {
      technical: detectedTechnicalSkills,
      soft: detectedSoftSkills,
    },
    strengths,
    areas_for_improvement: areasForImprovement,
    recommendations,
    overall_assessment: overallAssessment,
  }
}

function generateStrengths(careerPath: string, level: string, score: number) {
  const commonStrengths = [
    "Clear presentation of work experience with quantifiable achievements",
    "Well-structured resume with good organization",
    "Relevant technical skills highlighted appropriately",
    "Good balance of technical and soft skills",
    "Education and certifications clearly presented",
  ]

  const pathSpecificStrengths: Record<string, string[]> = {
    frontend: [
      "Strong portfolio of frontend projects",
      "Demonstrated experience with modern JavaScript frameworks",
      "UI/UX design sensibilities evident in project descriptions",
    ],
    backend: [
      "Strong focus on scalable architecture and system design",
      "Experience with database optimization and management",
      "Clear examples of API development and integration",
    ],
    fullstack: [
      "Balanced presentation of both frontend and backend skills",
      "End-to-end project implementations highlighted",
      "Demonstrated ability to work across the full technology stack",
    ],
    devops: [
      "Strong emphasis on automation and infrastructure as code",
      "Experience with cloud platforms and containerization",
      "Focus on monitoring, reliability, and system performance",
    ],
    data: [
      "Strong analytical skills demonstrated through projects",
      "Experience with data processing and visualization",
      "Statistical analysis and modeling capabilities highlighted",
    ],
    mobile: [
      "Focus on mobile-specific development challenges",
      "Experience with multiple mobile platforms",
      "Understanding of mobile UI/UX best practices",
    ],
    ai: [
      "Strong mathematical and algorithmic foundation",
      "Experience with machine learning frameworks and libraries",
      "Research and practical application of AI techniques",
    ],
  }

  // Select strengths based on score
  const numStrengths = score >= 80 ? 3 : score >= 70 ? 2 : 1

  // Combine common and path-specific strengths
  const allStrengths = [...commonStrengths, ...(pathSpecificStrengths[careerPath] || pathSpecificStrengths.fullstack)]

  return shuffleArray(allStrengths).slice(0, numStrengths)
}

function generateAreasForImprovement(careerPath: string, level: string, score: number) {
  const commonAreas = [
    "Resume lacks quantifiable achievements and impact metrics",
    "Technical skills section could be more comprehensive",
    "Work experience descriptions are too generic",
    "Missing relevant keywords for ATS optimization",
    "Education section needs more structure and clarity",
    "Project descriptions lack detail on technologies used",
    "Resume is too lengthy and could be more concise",
  ]

  const pathSpecificAreas: Record<string, string[]> = {
    frontend: [
      "Portfolio link or examples of UI/UX work missing",
      "No mention of responsive design or cross-browser compatibility",
      "Limited demonstration of modern frontend frameworks",
    ],
    backend: [
      "Limited mention of database optimization or scaling strategies",
      "No examples of API design or documentation",
      "Missing information on system architecture experience",
    ],
    fullstack: [
      "Imbalance between frontend and backend skills",
      "Limited demonstration of end-to-end project implementation",
      "Missing examples of full-stack problem solving",
    ],
    devops: [
      "Limited examples of CI/CD pipeline implementation",
      "Missing information on monitoring and observability",
      "No mention of security practices or compliance",
    ],
    data: [
      "Limited examples of data cleaning and preprocessing",
      "No mention of big data technologies or scaling",
      "Missing information on statistical analysis methods",
    ],
    mobile: [
      "Limited mention of mobile-specific challenges like performance",
      "No examples of working with device features or APIs",
      "Missing information on app store deployment",
    ],
    ai: [
      "Limited examples of model training and evaluation",
      "No mention of data preprocessing for ML models",
      "Missing information on model deployment and scaling",
    ],
  }

  // Select areas for improvement based on score
  const numAreas = score >= 90 ? 1 : score >= 80 ? 2 : score >= 70 ? 3 : 4

  // Combine common and path-specific areas
  const allAreas = [...commonAreas, ...(pathSpecificAreas[careerPath] || pathSpecificAreas.fullstack)]

  return shuffleArray(allAreas).slice(0, numAreas)
}

function generateRecommendations(careerPath: string, level: string, score: number, areasForImprovement: string[]) {
  // Generate recommendations based on areas for improvement
  const recommendations = areasForImprovement.map((area) => {
    if (area.includes("quantifiable achievements")) {
      return "Add specific metrics and outcomes to your work experiences (e.g., 'Improved application performance by 40%')"
    } else if (area.includes("technical skills")) {
      return "Expand your technical skills section with relevant technologies for your target role"
    } else if (area.includes("generic")) {
      return "Be more specific about your contributions and responsibilities in each role"
    } else if (area.includes("keywords")) {
      return "Research job descriptions for your target role and incorporate relevant keywords"
    } else if (area.includes("education")) {
      return "Structure your education section with clear dates, degrees, and relevant coursework"
    } else if (area.includes("project descriptions")) {
      return "Add more detail about technologies and methodologies used in your projects"
    } else if (area.includes("lengthy")) {
      return "Focus on your most relevant experiences and limit your resume to 1-2 pages"
    } else if (area.includes("portfolio")) {
      return "Add a link to your portfolio or GitHub repository with examples of your work"
    } else if (area.includes("responsive design")) {
      return "Highlight your experience with responsive design and cross-browser compatibility"
    } else if (area.includes("database")) {
      return "Include examples of database optimization or scaling strategies you've implemented"
    } else if (area.includes("API design")) {
      return "Add details about API design patterns and documentation practices you've used"
    } else if (area.includes("imbalance")) {
      return "Balance your presentation of frontend and backend skills based on your target role"
    } else if (area.includes("CI/CD")) {
      return "Describe specific CI/CD pipelines you've implemented or maintained"
    } else if (area.includes("data cleaning")) {
      return "Include examples of data cleaning and preprocessing techniques you've used"
    } else if (area.includes("mobile-specific")) {
      return "Highlight your experience with mobile-specific challenges like performance optimization"
    } else if (area.includes("model training")) {
      return "Provide details about ML models you've trained, including evaluation metrics"
    } else {
      return "Review and update your resume to address the identified areas for improvement"
    }
  })

  // Add general recommendations based on level
  if (level === "junior") {
    recommendations.push(
      "Consider adding relevant coursework, projects, or internships to compensate for limited work experience",
    )
  } else if (level === "mid") {
    recommendations.push(
      "Focus on highlighting leadership and mentoring experiences to position yourself for senior roles",
    )
  } else if (level === "senior") {
    recommendations.push("Emphasize strategic initiatives, architecture decisions, and team leadership experiences")
  }

  return recommendations
}

function generateOverallAssessment(score: number) {
  if (score >= 90) {
    return "Your resume is very strong and well-positioned for your target role. With a few minor improvements, it will be excellent."
  } else if (score >= 80) {
    return "Your resume is good with several strengths, but there are some areas that could be improved to make it more competitive."
  } else if (score >= 70) {
    return "Your resume has potential but needs significant improvements to stand out in a competitive job market."
  } else {
    return "Your resume needs substantial revisions to effectively showcase your skills and experience for your target role."
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}


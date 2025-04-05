import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    // Generate a fallback response based on the ID
    const resourceInfo = getResourceInfo(id)

    return NextResponse.json({
      success: true,
      data: resourceInfo,
    })
  } catch (error: any) {
    console.error("Fallback API route error:", error)

    // Even if there's an error, return a valid response
    return NextResponse.json({
      success: true,
      data: `<h2>Resource: ${id}</h2><p>We're experiencing technical difficulties. Please try again later.</p>`,
    })
  }
}

function getResourceInfo(id: string): string {
  // Predefined content for common resource IDs
  const resources: Record<string, string> = {
    "interview-techniques": `
      <h2>Interview Techniques</h2>
      <p>Effective interview techniques are crucial for success in job interviews. Here are some key strategies:</p>
      
      <h3>Preparation</h3>
      <ul>
        <li>Research the company thoroughly</li>
        <li>Practice common interview questions</li>
        <li>Prepare examples of past achievements</li>
        <li>Review your resume and be ready to discuss all points</li>
      </ul>
      
      <h3>During the Interview</h3>
      <ul>
        <li>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
        <li>Maintain good eye contact and posture</li>
        <li>Listen carefully and ask clarifying questions when needed</li>
        <li>Show enthusiasm and interest in the role</li>
      </ul>
      
      <h3>Follow-up</h3>
      <ul>
        <li>Send a thank-you email within 24 hours</li>
        <li>Reference specific points from the conversation</li>
        <li>Reiterate your interest in the position</li>
      </ul>
    `,
    "resume-tips": `
      <h2>Resume Writing Tips</h2>
      <p>Your resume is often your first impression with potential employers. Here are essential tips to make it stand out:</p>
      
      <h3>Structure and Format</h3>
      <ul>
        <li>Keep it concise (1-2 pages maximum)</li>
        <li>Use a clean, professional design</li>
        <li>Include clear section headings</li>
        <li>Use bullet points for readability</li>
        <li>Choose a professional font (Arial, Calibri, Times New Roman)</li>
      </ul>
      
      <h3>Content Best Practices</h3>
      <ul>
        <li>Start with a compelling summary or objective</li>
        <li>Quantify achievements when possible (e.g., "Increased sales by 20%")</li>
        <li>Use action verbs (managed, developed, created, implemented)</li>
        <li>Tailor your resume for each job application</li>
        <li>Include relevant keywords from the job description</li>
      </ul>
      
      <h3>Sections to Include</h3>
      <ul>
        <li>Contact information</li>
        <li>Professional summary</li>
        <li>Work experience</li>
        <li>Education</li>
        <li>Skills</li>
        <li>Optional: certifications, projects, volunteer work</li>
      </ul>
      
      <h3>Common Mistakes to Avoid</h3>
      <ul>
        <li>Typos and grammatical errors</li>
        <li>Including personal information (age, marital status)</li>
        <li>Using generic descriptions</li>
        <li>Including outdated or irrelevant experience</li>
        <li>Using an unprofessional email address</li>
      </ul>
    `,
    "technical-interviews": `
      <h2>Technical Interview Preparation</h2>
      <p>Technical interviews require specific preparation strategies:</p>
      
      <h3>Core Concepts</h3>
      <ul>
        <li>Data structures (arrays, linked lists, trees, graphs)</li>
        <li>Algorithms (sorting, searching, dynamic programming)</li>
        <li>System design principles</li>
        <li>Time and space complexity analysis</li>
      </ul>
      
      <h3>Practice Strategies</h3>
      <ul>
        <li>Solve problems on platforms like LeetCode and HackerRank</li>
        <li>Practice whiteboarding solutions</li>
        <li>Explain your thought process out loud</li>
        <li>Review fundamental concepts in your field</li>
      </ul>
      
      <h3>During the Interview</h3>
      <ul>
        <li>Clarify requirements before coding</li>
        <li>Think about edge cases</li>
        <li>Test your solution with examples</li>
        <li>Discuss trade-offs in your approach</li>
      </ul>
    `,
    "behavioral-questions": `
      <h2>Mastering Behavioral Questions</h2>
      <p>Behavioral questions assess how you've handled situations in the past to predict future performance.</p>
      
      <h3>Common Themes</h3>
      <ul>
        <li>Leadership and teamwork</li>
        <li>Conflict resolution</li>
        <li>Problem-solving</li>
        <li>Adaptability and learning</li>
        <li>Time management and prioritization</li>
      </ul>
      
      <h3>The STAR Method</h3>
      <p><strong>Situation:</strong> Describe the context and background</p>
      <p><strong>Task:</strong> Explain your responsibility or challenge</p>
      <p><strong>Action:</strong> Detail the specific steps you took</p>
      <p><strong>Result:</strong> Share the outcomes and what you learned</p>
      
      <h3>Tips for Success</h3>
      <ul>
        <li>Prepare 5-7 strong examples that can be adapted to different questions</li>
        <li>Include quantifiable results whenever possible</li>
        <li>Be honest and authentic</li>
        <li>Keep responses concise (2-3 minutes)</li>
      </ul>
    `,
    "salary-negotiation": `
      <h2>Salary Negotiation Strategies</h2>
      <p>Effective salary negotiation can significantly impact your compensation. Here's how to approach it:</p>
      
      <h3>Before the Negotiation</h3>
      <ul>
        <li>Research industry salary ranges for your position and location</li>
        <li>Know your minimum acceptable salary</li>
        <li>Prepare to discuss your value and achievements</li>
        <li>Practice your negotiation conversation</li>
      </ul>
      
      <h3>During the Negotiation</h3>
      <ul>
        <li>Let the employer make the first offer</li>
        <li>Express enthusiasm for the role</li>
        <li>Present your counteroffer with confidence</li>
        <li>Consider the entire compensation package (benefits, bonuses, etc.)</li>
        <li>Use silence strategically after making your case</li>
      </ul>
      
      <h3>Common Tactics</h3>
      <ul>
        <li>Provide specific salary ranges rather than exact figures</li>
        <li>Emphasize your unique skills and experience</li>
        <li>Reference market research to support your ask</li>
        <li>Be prepared to compromise on some points</li>
      </ul>
      
      <h3>After Receiving an Offer</h3>
      <ul>
        <li>Ask for time to consider the offer</li>
        <li>Get the final offer in writing</li>
        <li>Express gratitude regardless of the outcome</li>
      </ul>
    `,
    "remote-interviews": `
      <h2>Mastering Remote Interviews</h2>
      <p>Remote interviews require special preparation and techniques. Here's how to succeed:</p>
      
      <h3>Technical Setup</h3>
      <ul>
        <li>Test your internet connection, camera, and microphone</li>
        <li>Download and familiarize yourself with the video platform</li>
        <li>Have a backup plan (phone number, alternative device)</li>
        <li>Ensure good lighting and a neutral background</li>
      </ul>
      
      <h3>Environment Preparation</h3>
      <ul>
        <li>Find a quiet, distraction-free space</li>
        <li>Inform household members about your interview time</li>
        <li>Have water and notes nearby</li>
        <li>Close unnecessary applications on your computer</li>
      </ul>
      
      <h3>During the Interview</h3>
      <ul>
        <li>Look at the camera (not the screen) to maintain "eye contact"</li>
        <li>Speak clearly and at a moderate pace</li>
        <li>Use hand gestures sparingly and naturally</li>
        <li>Minimize background noise</li>
      </ul>
      
      <h3>Remote-Specific Tips</h3>
      <ul>
        <li>Dress professionally from head to toe</li>
        <li>Practice active listening cues (nodding, smiling)</li>
        <li>Be prepared for technical difficulties</li>
        <li>Follow up with a thank-you email</li>
      </ul>
    `,
  }

  // Return the predefined content or a generic response
  return (
    resources[id] ||
    `
    <h2>Resource: ${id}</h2>
    <p>This is a generic resource page for "${id}". The specific content is not available at this time.</p>
    <p>Please check back later or explore other resources in our library.</p>
  `
  )
}


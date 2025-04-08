# Interview Prep AI

Interview Prep AI is a comprehensive SaaS application designed to help job seekers prepare for interviews by providing AI-powered mock interviews, resume analysis, and job description matching.

![Interview Prep AI](https://placeholder.svg?height=400&width=800)

## Features

### 🤖 AI-Powered Mock Interviews

- **Customizable Interviews**: Create interviews tailored to specific roles, experience levels, and technologies
- **Real-time Feedback**: Receive instant feedback on your answers during the interview
- **Multiple Interview Types**: Practice technical, behavioral, or mixed interviews
- **Voice Interaction**: Speak your answers for a more realistic interview experience
- **Detailed Results**: Get comprehensive analysis of your performance with actionable feedback

### 📝 Resume Analysis

- **Resume Upload**: Upload your resume for AI analysis
- **Skill Assessment**: Identify strengths and weaknesses in your resume
- **Improvement Suggestions**: Get actionable recommendations to enhance your resume
- **Career Path Alignment**: See how well your resume aligns with your target career path

### 🔍 Job Description Analysis

- **Job Match Analysis**: Compare your resume against specific job descriptions
- **Skill Gap Identification**: Identify missing skills and experience for target roles
- **Keyword Optimization**: Get suggestions for keywords to include in your resume
- **Application Strategy**: Receive tailored advice on how to approach your application

### 👥 Community Features

- **Shared Interviews**: Access interviews created by other users
- **Save & Like**: Save interesting interviews for later or like them to show appreciation
- **Trending Content**: Discover popular and trending interview templates

### 📊 Analytics & Progress Tracking

- **Performance Metrics**: Track your improvement over time
- **Skill Development**: Monitor progress in specific skill areas
- **Interview History**: Review all your past interviews and results

### 💼 Additional Tools

- **Job Description Generator**: Create tailored interview questions from real job postings
- **Resource Library**: Access guides and tips for interview success
- **Subscription Plans**: Free, Pro, and Premium tiers with increasing features and usage limits

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL
- **Authentication**: Firebase Authentication
- **AI**: Google Gemini AI
- **Voice**: Vapi Voice AI
- **Payments**: PayPal Integration

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase account
- Google Gemini API key

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_connection_StringL=

GEMINI_API_KEY=

NEXT_PUBLIC_GEMINI_API_KEY=
JWT_SECRET=

VARIABLE_NAME=

PAYPAL_API_URL=https://sandbox.paypal.com

PAYPAL_WEBHOOK_ID=

DATABASE_URL=

NEXTAUTH_URL=

NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GITHUB_ID=161087278

GITHUB_SECRET=your-github-secret

PAYPAL_CLIENT_ID=

PAYPAL_CLIENT_SECRET=

OPENAI_API_KEY=your-openai-api-key

BLOB_READ_WRITE_TOKEN=your-blob-read-write-token

```
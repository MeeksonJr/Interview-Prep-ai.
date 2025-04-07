"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Mic, Brain, BarChart, CheckCircle, Users, Zap, Star, MessageSquare, Award } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  // No data fetching here, so we don't need to handle errors
  return (
    <div className="flex flex-col items-center justify-center animated-background">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6 max-w-3xl">
              <motion.h1
                className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl gradient-text pulse-glow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Master Your <span className="text-white">Interview Skills</span>
              </motion.h1>
              <motion.p
                className="max-w-[700px] text-xl md:text-2xl text-muted-foreground mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                AI-powered interview practice that helps you prepare, practice, and perfect your responses for your
                dream job.
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
                  <Link href="/login">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 hover:bg-white/10 text-lg px-8 py-6"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </motion.div>
            </div>

            {/* Floating badges */}
            <div className="hidden md:flex absolute top-1/4 left-10 animate-float-slow">
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI-Powered Feedback
                </span>
              </div>
            </div>
            <div className="hidden md:flex absolute top-1/3 right-10 animate-float">
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Personalized Practice
                </span>
              </div>
            </div>
            <div className="hidden md:flex absolute bottom-1/4 left-1/4 animate-float-slow">
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Real-time Analysis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-blue-500/10 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-black/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Powerful Features
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Everything you need to ace your next interview
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Powered Interviews</h3>
                  <p className="text-muted-foreground">
                    Our AI simulates real interview scenarios, asking relevant questions for your specific job role and
                    experience level.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Personalized Feedback</h3>
                  <p className="text-muted-foreground">
                    Receive comprehensive feedback on your communication, technical depth, problem-solving skills, and
                    more.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Track Your Progress</h3>
                  <p className="text-muted-foreground">
                    See how your interview skills develop with each practice session and identify areas for further
                    improvement.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Realistic Conversations</h3>
                  <p className="text-muted-foreground">
                    Practice with natural, flowing conversations that mimic real interview dynamics and follow-up
                    questions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Role-Specific Training</h3>
                  <p className="text-muted-foreground">
                    Customize your practice sessions for specific roles, from software engineering to product management
                    and more.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/70 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Expert Insights</h3>
                  <p className="text-muted-foreground">
                    Get insights based on thousands of successful interviews and industry best practices.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Simple steps to improve your interview skills
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="rounded-full bg-white/10 p-6 w-24 h-24 flex items-center justify-center">
                  <span className="text-3xl font-bold">1</span>
                </div>
                <div className="absolute top-0 right-0 rounded-full bg-white/5 p-2 border border-white/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Create Your Interview</h3>
              <p className="text-muted-foreground">
                Select your role, experience level, and the types of questions you want to practice.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <div className="rounded-full bg-white/10 p-6 w-24 h-24 flex items-center justify-center">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <div className="absolute top-0 right-0 rounded-full bg-white/5 p-2 border border-white/10">
                  <Mic className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Practice Your Answers</h3>
              <p className="text-muted-foreground">
                Respond to interview questions through text or voice, just like in a real interview.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <div className="rounded-full bg-white/10 p-6 w-24 h-24 flex items-center justify-center">
                  <span className="text-3xl font-bold">3</span>
                </div>
                <div className="absolute top-0 right-0 rounded-full bg-white/5 p-2 border border-white/10">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Get Detailed Feedback</h3>
              <p className="text-muted-foreground">
                Receive personalized feedback and actionable tips to improve your interview performance.
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center mt-16">
            <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200">
              <Link href="/login">
                Start Practicing Now <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-black/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Success stories from people who landed their dream jobs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                      <span className="text-xl font-bold">JD</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-muted-foreground">Software Engineer at Google</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "This platform helped me prepare for my technical interviews like nothing else. The AI feedback was
                    spot-on and helped me identify weaknesses in my responses."
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                      <span className="text-xl font-bold">JS</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Jane Smith</h4>
                      <p className="text-sm text-muted-foreground">Product Manager at Amazon</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "After practicing with this tool for two weeks, I felt so much more confident in my actual
                    interviews. The behavioral questions were especially helpful."
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                      <span className="text-xl font-bold">RJ</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Robert Johnson</h4>
                      <p className="text-sm text-muted-foreground">Data Scientist at Microsoft</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "The technical questions were challenging and realistic. I was able to practice explaining complex
                    concepts clearly, which made a huge difference in my interviews."
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-10 text-center max-w-3xl mx-auto">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Ace Your Next Interview?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of job seekers who have improved their interview skills and landed their dream jobs.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200">
                <Link href="/login">
                  Get Started for Free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-white/10">
                <Link href="/subscription">View Pricing</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-purple-500/10 to-transparent"></div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-black/80 border-t border-white/10 text-center">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center space-x-4">
            <a href="https://www.instagram.com/md_meekson_jr/" className="text-muted-foreground hover:text-white">
              Instagram
            </a>
            <a href="https://github.com/MeeksonJr" className="text-muted-foreground hover:text-white">
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mohamed-datt-b60907296/"
              className="text-muted-foreground hover:text-white"
            >
              LinkedIn
            </a>
            <a href="https://mohameddatt.com/" className="text-muted-foreground hover:text-white">
              Portfolio
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-4">&copy; 2023 Interview Prep AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


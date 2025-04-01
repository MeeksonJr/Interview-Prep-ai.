"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface AnalysisResultsProps {
  analysis: any
  jobTitle?: string
  company?: string
}

export function AnalysisResults({ analysis, jobTitle, company }: AnalysisResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("summary")

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Function to determine the color based on the match percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  // Function to determine the text color based on the match percentage
  const getMatchTextColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 60) return "text-yellow-500"
    if (percentage >= 40) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-none shadow-lg bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
            <span>Job Match Analysis</span>
            {jobTitle && company && (
              <Badge variant="outline" className="ml-2 text-sm font-normal">
                {jobTitle} at {company}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-300">
            AI-powered analysis of how well your resume matches this job
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Overall Match</span>
              <span className={`text-lg font-bold ${getMatchTextColor(analysis.match_percentage)}`}>
                {analysis.match_percentage}%
              </span>
            </div>
            <Progress
              value={analysis.match_percentage}
              className="h-3 bg-gray-700"
              indicatorClassName={getMatchColor(analysis.match_percentage)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Technical</div>
              <div className="flex items-center">
                <Progress
                  value={analysis.technical_match}
                  className="h-2 bg-gray-700 flex-grow mr-2"
                  indicatorClassName={getMatchColor(analysis.technical_match)}
                />
                <span className={`text-sm font-bold ${getMatchTextColor(analysis.technical_match)}`}>
                  {analysis.technical_match}%
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Experience</div>
              <div className="flex items-center">
                <Progress
                  value={analysis.experience_match}
                  className="h-2 bg-gray-700 flex-grow mr-2"
                  indicatorClassName={getMatchColor(analysis.experience_match)}
                />
                <span className={`text-sm font-bold ${getMatchTextColor(analysis.experience_match)}`}>
                  {analysis.experience_match}%
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Education</div>
              <div className="flex items-center">
                <Progress
                  value={analysis.education_match}
                  className="h-2 bg-gray-700 flex-grow mr-2"
                  indicatorClassName={getMatchColor(analysis.education_match)}
                />
                <span className={`text-sm font-bold ${getMatchTextColor(analysis.education_match)}`}>
                  {analysis.education_match}%
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center text-left p-0 h-auto"
                  onClick={() => toggleSection("summary")}
                >
                  <h3 className="text-md font-medium text-white">Summary</h3>
                  {expandedSection === "summary" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <AnimatePresence>
                  {expandedSection === "summary" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-gray-300">{analysis.summary}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center text-left p-0 h-auto"
                  onClick={() => toggleSection("strengths")}
                >
                  <h3 className="text-md font-medium text-green-400">Strengths</h3>
                  {expandedSection === "strengths" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <AnimatePresence>
                  {expandedSection === "strengths" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2">
                        {analysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center text-left p-0 h-auto"
                  onClick={() => toggleSection("gaps")}
                >
                  <h3 className="text-md font-medium text-red-400">Gaps</h3>
                  {expandedSection === "gaps" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <AnimatePresence>
                  {expandedSection === "gaps" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2">
                        {analysis.gaps.map((gap: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <XCircle size={18} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center text-left p-0 h-auto"
                  onClick={() => toggleSection("recommendations")}
                >
                  <h3 className="text-md font-medium text-blue-400">Recommendations</h3>
                  {expandedSection === "recommendations" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                <AnimatePresence>
                  {expandedSection === "recommendations" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2">
                        {analysis.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle size={18} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-medium text-white mb-3">Technical Skills</h3>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.skills.technical.map((skill: any, index: number) => (
                    <div key={index} className="flex items-center bg-gray-700 rounded-md p-2">
                      {skill.match ? (
                        <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-400 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-300 truncate">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-medium text-white mb-3">Soft Skills</h3>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.skills.soft.map((skill: any, index: number) => (
                    <div key={index} className="flex items-center bg-gray-700 rounded-md p-2">
                      {skill.match ? (
                        <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-400 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-300 truncate">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-medium text-white mb-3">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-medium text-white mb-3">Application Strategy</h3>
                <p className="text-gray-300 whitespace-pre-line">{analysis.application_strategy}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNextButton,
  // CarouselPreviousButton,
} from "@/components/ui/carousel"

import { ArrowRight, CheckCircle, Users, Sparkles, Award } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl gradient-text pulse-glow">
                Supercharge Your <span className="text-white">Interview Prep</span>
              </h1>
              <p className="max-w-[700px] text-xl md:text-2xl text-muted-foreground mx-auto">
                Harness the power of AI to boost your brand's presence, engage your audience, and stay ahead of the
                competition.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
                  <Link href="/login">
                    Watch Demo <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 hover:bg-white/10 text-lg px-8 py-6"
                >
                  <Link href="/login">Sign up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-blue-500/10 to-transparent"></div>
      </section>

      {/* Overview Section */}
      <section className="w-full py-20 bg-black/50" id="overview">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">Overview</h2>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">40.4M</div>
                  <div className="bg-green-500/20 rounded-full p-2">
                    <span className="text-xs">+20.1%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Total Followers</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">15M</div>
                  <div className="bg-green-500/20 rounded-full p-2">
                    <span className="text-xs">+12.3%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Total Engagements</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">2,015M</div>
                  <div className="bg-green-500/20 rounded-full p-2">
                    <span className="text-xs">+10.5%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Total Impressions</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">714.5M</div>
                  <div className="bg-green-500/20 rounded-full p-2">
                    <span className="text-xs">+10.5%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Total Reach</p>
              </CardContent>
            </Card>
          </div>

          {/* social media performance */}
          <div className="mt-10">
            <Card className="bg-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Social Media Performance</CardTitle>
                <CardDescription>Key trends in metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-white"></div>
              </CardContent>
            </Card>
          </div>

          {/* post performance */}
          <div className="mt-10">
            <Card className="bg-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Post performance</CardTitle>
                <CardDescription>View comments, sentiment analysis, and engagement stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Summer collection launch</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-500">+45%</span> Positive
                      <span className="mx-2">|</span>
                      <span className="text-gray-200">18% negative</span>
                      <span className="mx-2">|</span> 24% neutral
                    </p>
                    <p className="text-xs text-gray-400">230 comments • 30,563 views</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Product Update</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-500">+55%</span> Positive
                      <span className="mx-2">|</span>
                      <span className="text-gray-200">34% neutral</span>
                      <span className="mx-2">|</span> 11% positive
                    </p>
                    <p className="text-xs text-gray-400">230 comments • 30,563 views</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Customer Story</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-500">+45%</span> Positive
                      <span className="mx-2">|</span>
                      <span className="text-gray-200">7% negative</span>
                      <span className="mx-2">|</span> 24% neutral
                    </p>
                    <p className="text-xs text-gray-400">230 comments • 30,563 views</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-muted-foreground">Trusted by companies world-wide</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-gray-400">Logoipsum</div>
            <div className="text-gray-400">Logoipsum</div>
            <div className="text-gray-400">Logoipsum</div>
            <div className="text-gray-400">Logoipsum</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-black/50" id="features">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
              Powerful Features
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to ace your next interview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="gradient-border bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Gain deep insights into your social media performance with our cutting-edge analytics tools.
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-border bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Content</h3>
                <p className="text-muted-foreground">
                  Generate engaging content tailored to your brand voice and audience preferences.
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-border bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Competitor Analysis</h3>
                <p className="text-muted-foreground">
                  Stay ahead of the game by tracking and analyzing your competitors' strategies.
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-border bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Trend Prediction</h3>
                <p className="text-muted-foreground">
                  Leverage AI to predict upcoming trends and stay ahead of the curve.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* In Action Section */}
      <section className="w-full py-20 bg-black/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
                See BrandBoostr in Action
              </h2>
              <p className="text-xl text-muted-foreground">
                Harness the power of AI to boost your brand's presence, engage your audience, and stay ahead of the
                competition.
              </p>
              <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
                <Link href="/login">Sign up</Link>
              </Button>
            </div>
            <div>
              <Card className="bg-gray-800 text-white">
                <CardContent className="p-6">
                  <div className="bg-white h-[200px]"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
              What Our Clients Say
            </h2>
          </div>

          <Carousel
            className="w-full"
            opts={{
              align: "center",
              loop: true,
              autoPlay: {
                delay: 5000,
              },
            }}
          >
            <CarouselContent>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="gradient-border bg-gray-800 text-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">
                      "BrandBoost.ai has revolutionized our social media strategy. The AI-powered insights are
                      invaluable!"
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                        <span className="text-xl font-bold">SJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Sarah Johnson</h4>
                        <p className="text-sm text-gray-400">Marketing Director, TechCorp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="gradient-border bg-gray-800 text-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">
                      "BrandBoost.ai has revolutionized our social media strategy. The AI-powered insights are
                      invaluable!"
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                        <span className="text-xl font-bold">SJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Sarah Johnson</h4>
                        <p className="text-sm text-gray-400">Marketing Director, TechCorp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="gradient-border bg-gray-800 text-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">
                      "BrandBoost.ai has revolutionized our social media strategy. The AI-powered insights are
                      invaluable!"
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="rounded-full bg-white/10 w-12 h-12 flex items-center justify-center">
                        <span className="text-xl font-bold">SJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Sarah Johnson</h4>
                        <p className="text-sm text-gray-400">Marketing Director, TechCorp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-20 bg-black/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
              Choose Your Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Starter</CardTitle>
                <CardDescription>$49 / per month</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-black hover:bg-gray-200">Get started</Button>
              </CardFooter>
            </Card>
            <Card className="bg-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Starter</CardTitle>
                <CardDescription>$49 / per month</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-black hover:bg-gray-200">Get started</Button>
              </CardFooter>
            </Card>
            <Card className="bg-gray-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle>Starter</CardTitle>
                <CardDescription>$49 / per month</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-black hover:bg-gray-200">Get started</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Supercharge Section */}
      <section className="w-full py-24 bg-black">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
                Supercharge Your <span className="text-white">Social Media Strategy</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Harness the power of AI to boost your brand's presence, engage your audience, and stay ahead of the
                competition.
              </p>
              <Button asChild size="lg" className="gap-2 bg-white text-black hover:bg-gray-200 text-lg px-8 py-6">
                <Link href="/login">
                  Watch Demo <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}


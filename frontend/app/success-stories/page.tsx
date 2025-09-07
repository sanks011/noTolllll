import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Calendar, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function SuccessStoriesContent() {
  const featuredStories = [
    {
      id: 1,
      title: "From US Tariffs to EU Success: A Seafood Exporter's Journey",
      author: "Rajesh Kumar",
      company: "Ocean Fresh Exports",
      location: "Bhubaneswar, Odisha",
      date: "May 15, 2024",
      readTime: "5 min read",
      category: "Market Diversification",
      impact: {
        revenue: "₹3.2Cr",
        markets: 4,
        jobs: 85,
      },
      excerpt:
        "How we pivoted from US markets to establish a thriving presence in Germany, Netherlands, and France within 8 months.",
      image: "/seafood-export-success.jpg",
      featured: true,
      likes: 124,
      comments: 18,
    },
    {
      id: 2,
      title: "Textile Transformation: Breaking into Japanese Premium Markets",
      author: "Priya Sharma",
      company: "Heritage Textiles",
      location: "Cuttack, Odisha",
      date: "April 28, 2024",
      readTime: "4 min read",
      category: "Premium Markets",
      impact: {
        revenue: "₹1.8Cr",
        markets: 2,
        jobs: 45,
      },
      excerpt: "Our journey from traditional US exports to becoming a preferred supplier for Japanese luxury brands.",
      image: "/textile-export-japan.jpg",
      featured: true,
      likes: 89,
      comments: 12,
    },
  ]

  const allStories = [
    {
      id: 3,
      title: "Small Farmer Cooperative's Big Win in UAE Markets",
      author: "Suresh Patel",
      company: "Coastal Farmers Collective",
      location: "Puri, Odisha",
      date: "May 10, 2024",
      readTime: "3 min read",
      category: "Cooperative Success",
      impact: {
        revenue: "₹95L",
        markets: 1,
        jobs: 120,
      },
      excerpt: "How 50 small farmers came together to export directly to Dubai, bypassing traditional middlemen.",
      likes: 67,
      comments: 8,
    },
    {
      id: 4,
      title: "Digital Transformation: Using AI for Market Intelligence",
      author: "Amit Mohanty",
      company: "Smart Exports Ltd",
      location: "Bhubaneswar, Odisha",
      date: "May 5, 2024",
      readTime: "6 min read",
      category: "Technology",
      impact: {
        revenue: "₹2.1Cr",
        markets: 3,
        jobs: 35,
      },
      excerpt: "Leveraging data analytics and AI to identify new market opportunities and optimize pricing strategies.",
      likes: 156,
      comments: 24,
    },
    {
      id: 5,
      title: "Compliance Made Simple: Our HACCP Certification Journey",
      author: "Meera Das",
      company: "Quality Seafoods",
      location: "Paradip, Odisha",
      date: "April 22, 2024",
      readTime: "4 min read",
      category: "Compliance",
      impact: {
        revenue: "₹1.4Cr",
        markets: 2,
        jobs: 28,
      },
      excerpt: "Step-by-step guide to obtaining international certifications and accessing premium markets.",
      likes: 78,
      comments: 15,
    },
    {
      id: 6,
      title: "Relief Scheme Success: Government Support That Worked",
      author: "Bikash Jena",
      company: "Marine Exports Co",
      location: "Berhampur, Odisha",
      date: "April 18, 2024",
      readTime: "3 min read",
      category: "Government Support",
      impact: {
        revenue: "₹75L",
        markets: 1,
        jobs: 42,
      },
      excerpt: "How we successfully applied for and received government relief funding to expand operations.",
      likes: 92,
      comments: 11,
    },
  ]

  const categories = [
    "All Stories",
    "Market Diversification",
    "Premium Markets",
    "Cooperative Success",
    "Technology",
    "Compliance",
    "Government Support",
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Success Stories</h1>
          <p className="text-muted-foreground">
            Learn from fellow exporters who have successfully navigated market diversification
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button key={category} variant={category === "All Stories" ? "default" : "outline"} size="sm">
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Stories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Featured Stories</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img
                    src={story.image || "/placeholder.svg"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge>{story.category}</Badge>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {story.likes}
                      </span>
                      <span>{story.comments} comments</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{story.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/indian-businessman.png" />
                        <AvatarFallback>
                          {(story.author || "Unknown")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{story.author}</p>
                        <p className="text-xs text-muted-foreground">{story.company}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {story.date}
                      </div>
                      <div>{story.readTime}</div>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{story.impact.revenue}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{story.impact.markets}</div>
                      <div className="text-xs text-muted-foreground">Markets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{story.impact.jobs}</div>
                      <div className="text-xs text-muted-foreground">Jobs</div>
                    </div>
                  </div>

                  <Button className="w-full mt-4">Read Full Story</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Stories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">More Success Stories</h2>
          <div className="grid gap-4">
            {allStories.map((story) => (
              <Card key={story.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{story.category}</Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{story.readTime}</span>
                      </div>

                      <h3 className="text-lg font-semibold line-clamp-1">{story.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{story.excerpt}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/indian-professional.jpg" />
                            <AvatarFallback className="text-xs">
                              {(story.author || "Unknown")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <span className="font-medium">{story.author}</span>
                            <span className="text-muted-foreground"> • {story.company}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {story.likes}
                          </span>
                          <span>{story.comments} comments</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 space-y-2 text-right">
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="text-green-600 font-medium">{story.impact.revenue}</div>
                        <div className="text-blue-600 font-medium">{story.impact.markets} markets</div>
                        <div className="text-purple-600 font-medium">{story.impact.jobs} jobs</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Read More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Award className="h-12 w-12 mx-auto" />
              <h3 className="text-xl font-semibold">Share Your Success Story</h3>
              <p className="text-primary-foreground/80">
                Inspire other exporters by sharing your market diversification journey and achievements.
              </p>
              <Button variant="secondary" size="lg">
                Submit Your Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function SuccessStoriesSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SuccessStoriesPage() {
  return (
    <Suspense fallback={<SuccessStoriesSkeleton />}>
      <SuccessStoriesContent />
    </Suspense>
  )
}

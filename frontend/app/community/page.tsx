import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MessageCircle, Share2, Plus, TrendingUp, Users, Award } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

const forumPosts = [
  {
    id: 1,
    title: "EU Market Opens New Opportunities for Seafood Exporters",
    category: "Market Updates",
    author: "Rajesh Kumar",
    avatar: "/indian-businessman.png",
    expertise: ["Seafood", "EU Markets"],
    content:
      "The European Union has announced new import regulations that favor sustainable seafood practices. This could be a game-changer for our certified organic shrimp exporters...",
    likes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
    trending: true,
  },
  {
    id: 2,
    title: "How I Secured My First Japanese Buyer Through TradeNavigator",
    category: "Success Stories",
    author: "Priya Sharma",
    avatar: "/indian-businesswoman.png",
    expertise: ["Textiles", "Japan"],
    content:
      "After facing rejection from US buyers due to tariffs, I used the platform's buyer directory and pitch assistant to connect with a textile importer in Tokyo. Here's my journey...",
    likes: 45,
    comments: 12,
    timeAgo: "5 hours ago",
    featured: true,
  },
  {
    id: 3,
    title: "Question: Best certification for Korean seafood market?",
    category: "Q&A",
    author: "Amit Patel",
    avatar: "/indian-man.png",
    expertise: ["Seafood"],
    content:
      "I'm looking to enter the Korean market with my frozen fish products. What certifications are most valued by Korean importers? Any recommendations?",
    likes: 12,
    comments: 15,
    timeAgo: "1 day ago",
  },
]

const communityStats = [
  { label: "Active Members", value: "2,847", icon: Users, change: "+12%" },
  { label: "Success Stories", value: "156", icon: Award, change: "+8%" },
  { label: "Markets Discussed", value: "23", icon: TrendingUp, change: "+3%" },
]

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
            <p className="text-muted-foreground mt-1">Connect, share, and learn from fellow exporters</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <stat.icon className="h-8 w-8 text-primary" />
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Forum Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Form */}
            <Card>
              <CardHeader>
                <CardTitle>Share with the Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Post title..." />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market-updates">Market Updates</SelectItem>
                      <SelectItem value="success-stories">Success Stories</SelectItem>
                      <SelectItem value="qa">Q&A</SelectItem>
                      <SelectItem value="general">General Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Share your thoughts, experiences, or questions..." rows={3} />
                <div className="flex justify-end">
                  <Button>Post to Community</Button>
                </div>
              </CardContent>
            </Card>

            {/* Forum Posts */}
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className={`${post.featured ? "ring-2 ring-primary/20" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                        <AvatarFallback>
                          {(post.author || "Unknown")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{post.category}</Badge>
                          {post.trending && <Badge className="bg-orange-100 text-orange-700">Trending</Badge>}
                          {post.featured && <Badge className="bg-primary text-white">Featured</Badge>}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="font-medium">{post.author}</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                          <div className="flex space-x-1">
                            {post.expertise.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground">{post.content}</p>
                        <div className="flex items-center space-x-6 pt-2">
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-600 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Market Updates", count: 45 },
                  { name: "Success Stories", count: 32 },
                  { name: "Q&A", count: 78 },
                  { name: "General Discussion", count: 23 },
                ].map((category, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Rajesh Kumar", posts: 24, expertise: "Seafood Expert" },
                  { name: "Priya Sharma", posts: 18, expertise: "Textile Specialist" },
                  { name: "Amit Patel", posts: 15, expertise: "Market Analyst" },
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/contributor-.jpg?height=32&width=32&query=contributor+${index}`} />
                      <AvatarFallback>
                        {(contributor.name || "Unknown")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">{contributor.expertise}</p>
                    </div>
                    <Badge variant="outline">{contributor.posts}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Globe, Users, Shield, TrendingUp, Star, Building2, Award, FileText, Phone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* Government Banner */}
          <div className="flex items-center justify-center py-2 mb-4 bg-primary/5 rounded-lg">
            <Badge variant="outline" className="text-xs font-medium">
              <Building2 className="h-3 w-3 mr-1" />
              Government of Odisha Official Platform
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-lg font-bold">Market Navigator</div>
                  <div className="text-xs text-muted-foreground">Export Facilitation Platform</div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/signin"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="font-medium">
                <Link href="/auth/signup">Register Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Approved by Ministry of Commerce & Industry
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 tracking-tight">
            Official Export Facilitation Platform for
            <span className="text-primary"> Odisha Exporters</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto leading-relaxed">
            Navigate U.S. tariff challenges with government-backed market intelligence, verified buyer networks,
            compliance assistance, and exclusive access to relief schemes — all through one official platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 h-auto font-medium" asChild>
              <Link href="/auth/signup">
                Start Registration <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto font-medium bg-transparent" asChild>
              <Link href="#features">
                <FileText className="mr-2 h-5 w-5" />
                View Guidelines
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-balance">Government-Backed Export Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive support system designed by the Government of Odisha to help exporters overcome trade
              barriers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Market Intelligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time tariff analysis and market opportunities across 50+ countries with government data backing
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Verified Buyer Network</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with pre-verified international buyers through government trade missions and partnerships
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Compliance Assistance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Official regulatory guidance and compliance support with government-approved vendor network
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Government Schemes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct access to state and central government relief schemes and export promotion benefits
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Success Stories from Exporters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "After U.S. tariffs hit our shrimp exports, TradeNavigator helped us find new buyers in Japan. We
                  recovered 80% of our lost revenue within 6 months."
                </p>
                <div className="font-semibold">Rajesh Kumar</div>
                <div className="text-sm text-muted-foreground">Seafood Exporter, Bhubaneswar</div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "The compliance center saved us months of paperwork. We're now exporting textiles to EU markets with
                  full regulatory confidence."
                </p>
                <div className="font-semibold">Priya Patel</div>
                <div className="text-sm text-muted-foreground">Textile Manufacturer, Cuttack</div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Government relief schemes were complex until TradeNavigator simplified the process. We secured ₹2.5
                  crores in support funding."
                </p>
                <div className="font-semibold">Suresh Mohanty</div>
                <div className="text-sm text-muted-foreground">Farmer Cooperative Leader, Puri</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary" className="text-primary bg-primary-foreground/90">
              <Building2 className="h-4 w-4 mr-2" />
              Government Approved Platform
            </Badge>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join the Official Export Network</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Register with the Government of Odisha's official platform and access exclusive export facilitation services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-medium" asChild>
              <Link href="/auth/signup">
                Register as Exporter <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 font-medium border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              asChild
            >
              <Link href="tel:+91-674-2536000">
                <Phone className="mr-2 h-5 w-5" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-bold">Market Navigator</div>
                  <div className="text-xs text-muted-foreground">Govt. of Odisha</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Official export facilitation platform by the Government of Odisha to support exporters in overcoming
                trade barriers.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Department of Industries</p>
                <p>Government of Odisha</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/market-intelligence" className="hover:text-foreground">
                    Market Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="/buyers" className="hover:text-foreground">
                    Buyer Directory
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-foreground">
                    Compliance Center
                  </Link>
                </li>
                <li>
                  <Link href="/relief-schemes" className="hover:text-foreground">
                    Relief Schemes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-foreground">
                    Community Forum
                  </Link>
                </li>
                <li>
                  <Link href="/success-stories" className="hover:text-foreground">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal & Policies</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="hover:text-foreground">
                    Export Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Platform
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Government of Odisha. All rights reserved. Official Export Facilitation Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

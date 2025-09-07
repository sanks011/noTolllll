// External API integrations for Groq AI and News API

const GROQ_API_KEY = process.env.GROQ_API_KEY
const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_BASE = "https://newsapi.org/v2"
const GROQ_API_BASE = "https://api.groq.com/openai/v1"

class ExternalApiService {
  // Groq AI Chat Completion
  async groqChatCompletion(messages: any[], model: string = "mixtral-8x7b-32768"): Promise<any> {
    try {
      if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable is not set')
      }

      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  // News API - Get everything
  async getNews(query: string, sortBy: string = 'publishedAt', pageSize: number = 10): Promise<any> {
    try {
      if (!NEWS_API_KEY) {
        throw new Error('NEWS_API_KEY environment variable is not set')
      }

      const params = new URLSearchParams({
        q: query,
        sortBy,
        pageSize: pageSize.toString(),
        apiKey: NEWS_API_KEY,
        language: 'en'
      })

      const response = await fetch(`${NEWS_API_BASE}/everything?${params}`)
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('News API error:', error)
      throw error
    }
  }

  // News API - Get top headlines
  async getTopHeadlines(category?: string, country: string = 'us', pageSize: number = 10): Promise<any> {
    try {
      if (!NEWS_API_KEY) {
        throw new Error('NEWS_API_KEY environment variable is not set')
      }

      const params = new URLSearchParams({
        country,
        pageSize: pageSize.toString(),
        apiKey: NEWS_API_KEY,
      })

      if (category) {
        params.append('category', category)
      }

      const response = await fetch(`${NEWS_API_BASE}/top-headlines?${params}`)
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('News API error:', error)
      throw error
    }
  }

  // Generate trade insights using Groq AI
  async generateTradeInsights(marketData: any[]): Promise<string> {
    try {
      const prompt = `As a trade and export expert, analyze the following market data and provide key insights for Indian exporters:

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide 3-4 key insights focusing on:
1. Market opportunities
2. Tariff trends
3. Risk assessment
4. Recommended actions

Keep the response concise and actionable, under 200 words.`

      const response = await this.groqChatCompletion([
        { role: 'user', content: prompt }
      ])

      return response.choices[0]?.message?.content || 'Unable to generate insights at this time.'
    } catch (error) {
      console.error('Error generating trade insights:', error)
      return 'Unable to generate insights at this time.'
    }
  }

  // Generate buyer recommendations using Groq AI
  async generateBuyerRecommendations(userProfile: any, buyers: any[]): Promise<string> {
    try {
      const prompt = `As a trade expert, analyze the user profile and buyer data to provide personalized recommendations:

User Profile:
- Company: ${userProfile.companyName}
- Sector: ${userProfile.sector}
- Role: ${userProfile.role}

Available Buyers:
${buyers.slice(0, 5).map(buyer => `- ${buyer.name} (${buyer.country}): ${buyer.productCategories?.join(', ')}`).join('\n')}

Provide 2-3 specific recommendations for which buyers to prioritize and why. Keep it under 150 words.`

      const response = await this.groqChatCompletion([
        { role: 'user', content: prompt }
      ])

      return response.choices[0]?.message?.content || 'Unable to generate recommendations at this time.'
    } catch (error) {
      console.error('Error generating buyer recommendations:', error)
      return 'Unable to generate recommendations at this time.'
    }
  }

  // Generate compliance insights using Groq AI
  async generateComplianceInsights(targetCountries: string[]): Promise<string> {
    try {
      const prompt = `Provide current trade compliance insights for Indian exporters targeting these countries: ${targetCountries.join(', ')}.

Focus on:
1. Key regulatory changes in 2024-2025
2. Documentation requirements
3. Common compliance issues
4. Best practices

Keep response under 200 words and actionable.`

      const response = await this.groqChatCompletion([
        { role: 'user', content: prompt }
      ])

      return response.choices[0]?.message?.content || 'Unable to generate compliance insights at this time.'
    } catch (error) {
      console.error('Error generating compliance insights:', error)
      return 'Unable to generate compliance insights at this time.'
    }
  }

  // Get trade-related news
  async getTradeNews(): Promise<any[]> {
    try {
      const response = await this.getNews('international trade export import tariff', 'publishedAt', 6)
      return response.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        urlToImage: article.urlToImage
      })) || []
    } catch (error) {
      console.error('Error fetching trade news:', error)
      return []
    }
  }

  // Get business news headlines
  async getBusinessNews(): Promise<any[]> {
    try {
      const response = await this.getTopHeadlines('business', 'us', 5)
      return response.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        urlToImage: article.urlToImage
      })) || []
    } catch (error) {
      console.error('Error fetching business news:', error)
      return []
    }
  }

  // Generate market analysis using AI
  async generateMarketAnalysis(country: string, product: string): Promise<string> {
    try {
      const prompt = `Provide a brief market analysis for exporting ${product} to ${country}. Include:
1. Market size and demand
2. Key competitors
3. Entry barriers
4. Opportunities

Keep response under 150 words and focus on actionable insights for Indian exporters.`

      const response = await this.groqChatCompletion([
        { role: 'user', content: prompt }
      ])

      return response.choices[0]?.message?.content || 'Unable to generate market analysis at this time.'
    } catch (error) {
      console.error('Error generating market analysis:', error)
      return 'Unable to generate market analysis at this time.'
    }
  }

  // Generate success story content using AI
  async generateSuccessStory(companyProfile: any): Promise<any> {
    try {
      const prompt = `Create a realistic success story for an Indian exporter with this profile:
- Sector: ${companyProfile.sector || 'Seafood'}
- Company: ${companyProfile.companyName || 'Indian Export Company'}
- Target Markets: ${companyProfile.targetCountries?.join(', ') || 'Japan, EU, UAE'}

Include:
1. Challenge faced
2. Solution implemented
3. Results achieved
4. Key learnings

Format as a JSON object with fields: title, author, company, challenge, solution, results, impact, timeline. Keep each field under 100 words.`

      const response = await this.groqChatCompletion([
        { role: 'user', content: prompt }
      ])

      try {
        const content = response.choices[0]?.message?.content
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (parseError) {
        console.error('Error parsing success story JSON:', parseError)
      }

      return {
        title: "Export Success Story",
        author: companyProfile.contactPerson || "Export Manager",
        company: companyProfile.companyName || "Indian Export Company",
        challenge: "Market entry challenges",
        solution: "Strategic partnerships and compliance",
        results: "Successful market expansion",
        impact: "Increased revenue and market presence",
        timeline: "6 months"
      }
    } catch (error) {
      console.error('Error generating success story:', error)
      return {
        title: "Export Success Story",
        author: "Export Manager",
        company: "Indian Export Company",
        challenge: "Unable to generate story at this time",
        solution: "Please try again later",
        results: "N/A",
        impact: "N/A",
        timeline: "N/A"
      }
    }
  }
}

export const externalApiService = new ExternalApiService()

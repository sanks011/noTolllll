const axios = require('axios');
const logger = require('../config/logger');

class NewsService {
  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY;
    this.baseUrl = 'https://gnews.io/api/v4';
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes cache
  }

  /**
   * Get cached news or fetch new data
   */
  async getNews(category = 'tariff') {
    const cacheKey = `news_${category}`;
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      logger.info(`Returning cached news for category: ${category}`);
      return {
        articles: cachedData.data,
        cached: true,
        lastUpdated: new Date(cachedData.timestamp)
      };
    }

    try {
      const articles = await this.fetchNewsFromAPI(category);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });

      logger.info(`Fetched and cached ${articles.length} articles for category: ${category}`);
      
      return {
        articles,
        cached: false,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching news:', error);
      
      // Return cached data if available, even if expired
      if (cachedData) {
        logger.info('Returning expired cached data due to API error');
        return {
          articles: cachedData.data,
          cached: true,
          lastUpdated: new Date(cachedData.timestamp),
          error: 'Using cached data due to API error'
        };
      }
      
      throw error;
    }
  }

  /**
   * Fetch news from GNews API
   */
  async fetchNewsFromAPI(category) {
    let query = '';
    let searchTerms = [];

    // Define search terms based on category
    switch (category) {
      case 'tariff':
        searchTerms = [
          'tariff rates India',
          'customs duty India',
          'import tariff',
          'trade war tariffs',
          'WTO tariff disputes'
        ];
        break;
      case 'trade':
        searchTerms = [
          'India exports',
          'international trade',
          'trade agreements',
          'export import policy',
          'trade barriers'
        ];
        break;
      case 'economy':
        searchTerms = [
          'India economy',
          'global trade',
          'economic indicators',
          'GDP growth',
          'industrial production'
        ];
        break;
      default:
        searchTerms = ['tariff India trade'];
    }

    // Use the first search term for the query
    query = searchTerms[0];

    const params = {
      q: query,
      lang: 'en',
      country: 'in', // Focus on Indian news
      max: 20,
      apikey: this.apiKey
    };

    logger.info(`Fetching news with query: ${query}`);

    const response = await axios.get(`${this.baseUrl}/search`, {
      params,
      timeout: 10000
    });

    if (!response.data || !response.data.articles) {
      throw new Error('Invalid response from GNews API');
    }

    // Filter and enhance articles
    let articles = response.data.articles
      .filter(article => 
        article.title && 
        article.description && 
        article.url &&
        this.isRelevantToTrade(article)
      )
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url
        },
        category: this.categorizeArticle(article),
        relevanceScore: this.calculateRelevance(article, searchTerms)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15); // Return top 15 most relevant articles

    return articles;
  }

  /**
   * Check if article is relevant to trade/tariff topics
   */
  isRelevantToTrade(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    const tradeKeywords = [
      'tariff', 'trade', 'export', 'import', 'customs', 'duty', 'wto',
      'commerce', 'economic', 'business', 'industry', 'manufacturing',
      'agreement', 'policy', 'international', 'global', 'market'
    ];

    return tradeKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Categorize article based on content
   */
  categorizeArticle(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    
    if (content.includes('tariff') || content.includes('duty') || content.includes('customs')) {
      return 'Tariffs & Duties';
    } else if (content.includes('export') || content.includes('import')) {
      return 'Import/Export';
    } else if (content.includes('agreement') || content.includes('policy')) {
      return 'Trade Policy';
    } else if (content.includes('economic') || content.includes('gdp')) {
      return 'Economic News';
    } else {
      return 'General Trade';
    }
  }

  /**
   * Calculate relevance score for article
   */
  calculateRelevance(article, searchTerms) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    let score = 0;

    // Base score for trade-related keywords
    const tradeKeywords = ['tariff', 'trade', 'export', 'import', 'india'];
    tradeKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += keyword === 'india' ? 5 : 3;
      }
    });

    // Bonus for title matches
    searchTerms.forEach(term => {
      if (article.title.toLowerCase().includes(term.toLowerCase())) {
        score += 5;
      }
    });

    // Recent articles get higher scores
    const publishDate = new Date(article.publishedAt);
    const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublish < 1) score += 3;
    else if (daysSincePublish < 7) score += 1;

    return score;
  }

  /**
   * Manually refresh cache
   */
  async refreshNews(category = 'tariff') {
    const cacheKey = `news_${category}`;
    this.cache.delete(cacheKey);
    logger.info(`Cache cleared for category: ${category}`);
    return await this.getNews(category);
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    const cacheInfo = {};
    for (const [key, value] of this.cache.entries()) {
      cacheInfo[key] = {
        articlesCount: value.data.length,
        timestamp: new Date(value.timestamp),
        age: Date.now() - value.timestamp
      };
    }
    return cacheInfo;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('All news cache cleared');
  }
}

module.exports = new NewsService();

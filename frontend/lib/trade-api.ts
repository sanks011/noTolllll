import { apiService } from './api';

export interface TradeBuyer {
  country: string;
  countryCode: string;
  importValue: number;
  marketPotential: 'High' | 'Medium' | 'Low';
  records: number;
}

export interface ExportPerformance {
  code: string;
  description: string;
  totalValue: number;
  trend: 'growing' | 'stable' | 'declining';
  growthRate: number;
  yearlyData: Record<string, number>;
}

export interface TradingPartner {
  country: string;
  countryCode: string;
  exportValue: number;
  marketShare: number;
  records: number;
}

export interface MarketOpportunity {
  commodity: {
    code: string;
    description: string;
    trend: string;
    growthRate: number;
  };
  marketSize: number;
  topBuyers: {
    country: string;
    importValue: number;
    potential: string;
  }[];
}

export interface CommodityTrend {
  commodity: {
    code: string;
    description: string;
    totalValue: number;
    trend: string;
    growthRate: number;
    yearlyData: Record<string, number>;
  };
  marketAnalysis: {
    totalPotentialMarket: number;
    numberOfMarkets: number;
    averageMarketSize: number;
  };
  topMarkets: {
    country: string;
    countryCode: string;
    importValue: number;
    marketPotential: string;
    competitiveness: number;
  }[];
}

export const tradeApi = {
  // Get potential buyers for a commodity
  getPotentialBuyers: async (cmdCode: string, limit: number = 10): Promise<{
    success: boolean;
    data: {
      commodity: string;
      buyers: TradeBuyer[];
    };
  }> => {
    return apiService.getTradePotentialBuyers(cmdCode, limit);
  },

  // Get India's export performance
  getExportPerformance: async (cmdCodes?: string): Promise<{
    success: boolean;
    data: {
      sector: string;
      commodities: ExportPerformance[];
    };
  }> => {
    return apiService.getTradeExportPerformance(cmdCodes);
  },

  // Get top trading partners
  getTradingPartners: async (cmdCode?: string, limit: number = 10): Promise<{
    success: boolean;
    data: {
      partners: TradingPartner[];
    };
  }> => {
    return apiService.getTradeTradingPartners(cmdCode, limit);
  },

  // Get market opportunities
  getMarketOpportunities: async (sector?: string): Promise<{
    success: boolean;
    data: {
      sector: string;
      opportunities: MarketOpportunity[];
    };
  }> => {
    return apiService.getTradeMarketOpportunities(sector);
  },

  // Get commodity trends
  getCommodityTrends: async (cmdCode: string, years?: string): Promise<{
    success: boolean;
    data: CommodityTrend;
  }> => {
    return apiService.getTradeCommodityTrends(cmdCode, years);
  },

  // Clear cache
  clearCache: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiService.clearTradeCache();
  }
};

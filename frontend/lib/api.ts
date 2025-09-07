const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    companyName: string;
    contactPerson: string;
    userType: string;
    role: string;
    sector: string;
    isAdmin?: boolean;
    hsCode?: string;
    targetCountries?: string[];
  };
}

export interface SignupData {
  email: string;
  companyName: string;
  contactPerson: string;
  userType: string;
  role: string;
  sector?: string;
  hsCode?: string;
  targetCountries?: string[];
  password: string;
}

export interface DashboardData {
  user: {
    name: string;
    company: string;
    role: string;
    sector: string;
  };
  [key: string]: any;
}

export interface MarketIntelligenceParams {
  hsCode?: string;
  countries?: string;
  page?: number;
  limit?: number;
}

export interface BuyersParams {
  country?: string;
  productCategory?: string;
  certification?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface ContactUpdateData {
  status: string;
  notes?: string;
  dealValue?: number;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Always get the latest token from localStorage
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : this.token;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(data: SignupData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/profile', {
      method: 'GET',
    });
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Dashboard methods
  async getIndianDashboard(): Promise<{ success: boolean; data: DashboardData }> {
    return this.request<{ success: boolean; data: DashboardData }>('/dashboard/indian');
  }

  async getInternationalDashboard(): Promise<{ success: boolean; data: DashboardData }> {
    return this.request<{ success: boolean; data: DashboardData }>('/dashboard/international');
  }

  async updateProfile(profileData: any): Promise<{ success: boolean; message: string; user: any }> {
    return this.request<{ success: boolean; message: string; user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Market Intelligence methods
  async getMarketIntelligence(params?: MarketIntelligenceParams): Promise<any> {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<any>(`/market-intelligence${query ? `?${query}` : ''}`);
  }

  async getMarketCountries(): Promise<{ success: boolean; data: string[] }> {
    return this.request<{ success: boolean; data: string[] }>('/market-intelligence/countries');
  }

  async getMarketHsCodes(): Promise<{ success: boolean; data: string[] }> {
    return this.request<{ success: boolean; data: string[] }>('/market-intelligence/hs-codes');
  }

  // Buyers methods
  async getBuyers(params?: BuyersParams): Promise<any> {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<any>(`/buyers${query ? `?${query}` : ''}`);
  }

  async getBuyerById(id: string): Promise<any> {
    return this.request<any>(`/buyers/${id}`);
  }

  async updateBuyerContact(id: string, data: ContactUpdateData): Promise<any> {
    return this.request(`/buyers/${id}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBuyerFilterOptions(): Promise<any> {
    return this.request<any>('/buyers/filters/options');
  }

  // Compliance methods
  async getCompliance(): Promise<any> {
    return this.request<any>('/compliance');
  }

  async updateComplianceRequirement(requirement: string, completed: boolean, fileUrl?: string): Promise<any> {
    return this.request('/compliance/requirement', {
      method: 'PUT',
      body: JSON.stringify({ requirement, completed, fileUrl }),
    });
  }

  async getComplianceVendors(): Promise<any> {
    return this.request<any>('/compliance/vendors');
  }

  // Relief Schemes methods
  async getReliefSchemes(): Promise<any> {
    return this.request<any>('/relief-schemes');
  }

  async applyForReliefScheme(id: string, documentsUploaded?: string[]): Promise<any> {
    return this.request(`/relief-schemes/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ documentsUploaded }),
    });
  }

  async getReliefApplications(): Promise<any> {
    return this.request<any>('/relief-schemes/applications');
  }

  // Forum methods
  async getForumPosts(params?: any): Promise<any> {
    const query = params ? new URLSearchParams(params).toString() : '';
    return this.request<any>(`/forum/posts${query ? `?${query}` : ''}`);
  }

  async createForumPost(data: any): Promise<any> {
    return this.request('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getForumPost(id: string): Promise<any> {
    return this.request<any>(`/forum/posts/${id}`);
  }

  async addForumReply(id: string, content: string): Promise<any> {
    return this.request(`/forum/posts/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async likeForumPost(id: string): Promise<any> {
    return this.request(`/forum/posts/${id}/like`, {
      method: 'POST',
    });
  }

  // Impact methods
  async getImpactDashboard(): Promise<any> {
    return this.request<any>('/impact/dashboard');
  }

  async logImpactEvent(data: any): Promise<any> {
    return this.request('/impact/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getImpactEvents(params?: any): Promise<any> {
    const query = params ? new URLSearchParams(params).toString() : '';
    return this.request<any>(`/impact/events${query ? `?${query}` : ''}`);
  }

  // File upload methods
  async uploadFile(file: File, purpose?: string, relatedId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (purpose) formData.append('purpose', purpose);
    if (relatedId) formData.append('relatedId', relatedId);

    return this.request('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  async uploadMultipleFiles(files: File[], purpose?: string, relatedId?: string): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (purpose) formData.append('purpose', purpose);
    if (relatedId) formData.append('relatedId', relatedId);

    return this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  async getUserFiles(params?: any): Promise<any> {
    const query = params ? new URLSearchParams(params).toString() : '';
    return this.request<any>(`/upload/files${query ? `?${query}` : ''}`);
  }

  async deleteFile(id: string): Promise<any> {
    return this.request(`/upload/files/${id}`, {
      method: 'DELETE',
    });
  }

  // User methods
  async getUserProfile(): Promise<any> {
    return this.request<any>('/users/profile');
  }

  async updateUserProfile(data: any): Promise<any> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Trade methods
  async getTradePotentialBuyers(cmdCode: string, limit: number = 10): Promise<any> {
    return this.request(`/trade/potential-buyers/${cmdCode}?limit=${limit}`);
  }

  async getTradeFrequentBuyersFromIndia(cmdCode?: string, limit: number = 15): Promise<any> {
    const params = new URLSearchParams();
    if (cmdCode) params.append('cmdCode', cmdCode);
    params.append('limit', limit.toString());
    
    return this.request(`/trade/frequent-buyers-from-india?${params}`);
  }

  async getTradeBilateralAnalysis(countryCode: string, cmdCode?: string): Promise<any> {
    const params = cmdCode ? `?cmdCode=${cmdCode}` : '';
    return this.request(`/trade/bilateral-analysis/${countryCode}${params}`);
  }

  async getTradeExportPerformance(cmdCodes?: string): Promise<any> {
    const url = cmdCodes ? `/trade/export-performance?cmdCodes=${cmdCodes}` : '/trade/export-performance';
    return this.request(url);
  }

  async getTradeTradingPartners(cmdCode?: string, limit: number = 10): Promise<any> {
    let url = `/trade/trading-partners?limit=${limit}`;
    if (cmdCode) url += `&cmdCode=${cmdCode}`;
    return this.request(url);
  }

  async getTradeMarketOpportunities(sector?: string): Promise<any> {
    const url = sector ? `/trade/market-opportunities?sector=${sector}` : '/trade/market-opportunities';
    return this.request(url);
  }

  async getTradeCommodityTrends(cmdCode: string, years?: string): Promise<any> {
    let url = `/trade/commodity-trends/${cmdCode}`;
    if (years) url += `?years=${years}`;
    return this.request(url);
  }

  async clearTradeCache(): Promise<any> {
    return this.request('/trade/clear-cache', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }
}

export const apiService = new ApiService();

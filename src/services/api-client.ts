/**
 * Typed API client for the Flask backend
 * All endpoints are relative - Vercel routes /api/* to Flask
 */

import type {
  FetchDataRequest,
  MarketsResponse,
  EventsResponse,
  HealthResponse,
  ApiError,
} from '../types/api';

class ApiClient {
  private baseUrl = '';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({
        error: `HTTP Error ${response.status}`,
      }))) as ApiError;
      throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchMarkets(params?: FetchDataRequest): Promise<MarketsResponse> {
    return this.request<MarketsResponse>('/fetch_markets', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  async fetchEvents(params?: FetchDataRequest): Promise<EventsResponse> {
    return this.request<EventsResponse>('/fetch_events', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health', {
      method: 'GET',
    });
  }

  getDownloadUrl(filename: string): string {
    return `${this.baseUrl}/download/${encodeURIComponent(filename)}`;
  }
}

export const apiClient = new ApiClient();

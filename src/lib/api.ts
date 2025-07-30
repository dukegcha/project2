// API configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types for API responses
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface Reservation {
  id: number;
  party_size: number;
  reservation_time: string;
  special_occasion?: string;
  status: string;
  table_id: number;
  created_at: string;
}

// API utility function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Authentication API
export const authAPI = {
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    return apiRequest<{ id: number }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: { email: string; password: string }) {
    const response = await apiRequest<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    localStorage.setItem('authToken', response.token);
    return response;
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

// Availability API
export const availabilityAPI = {
  async getAvailableSlots(date: string, partySize: number) {
    return apiRequest<AvailabilitySlot[]>(
      `/availability?date=${date}&party_size=${partySize}`
    );
  },
};

// Reservations API
export const reservationsAPI = {
  async createReservation(reservationData: {
    party_size: number;
    reservation_time: string;
    special_occasion?: string;
  }) {
    return apiRequest<{ id: number; message: string }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },

  async getReservationHistory() {
    return apiRequest<Reservation[]>('/reservations/history');
  },
};

// Format date for API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format datetime for API (ISO string)
export function formatDateTimeForAPI(date: Date, time: string): string {
  const [hours, minutes] = time.split(':');
  const dateTime = new Date(date);
  dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return dateTime.toISOString();
}
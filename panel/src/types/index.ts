export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'instructor';
  area?: string;
  isOnline?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  createdAt: string;
  status: 'draft' | 'published';
}

export interface Guide {
  id: string;
  activityId: string;
  instructorId: string;
  title: string;
  introduction: string;
  objectives: string[];
  materials: string[];
  development: string;
  evaluation: string;
  createdAt: string;
  status: 'draft' | 'published';
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
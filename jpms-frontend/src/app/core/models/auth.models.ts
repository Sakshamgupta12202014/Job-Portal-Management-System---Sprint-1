export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: number;
  name: string;
  email: string;
  message?: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  profilePictureUrl: string;
  resumeUrl: string;
  bio?: string;
  location?: string;
  skills?: string;
  experienceYears?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  skills?: string;
  experienceYears?: number;
}

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: number;
  name: string;
  email: string;
}

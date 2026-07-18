export interface BioCardLink {
  id: string;
  title: string;
  url: string;
}

export interface BioCard {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl?: string; // Can be base64 string or an uploaded path
  links: BioCardLink[];
  theme: string; // "slate", "sunset", "emerald", "royal", "neon"
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

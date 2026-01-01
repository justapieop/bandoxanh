export type Theme = 'light' | 'dark';

export enum WasteType {
  Plastic = 'Nhựa',
  Paper = 'Giấy',
  Metal = 'Kim loại',
  Glass = 'Thủy tinh',
  Organic = 'Hữu cơ',
  Electronic = 'Điện tử',
  Battery = 'Pin',
  General = 'Rác thải chung',
}

export interface Station {
  id: number;
  type?: 'station';
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  wasteTypes: WasteType[];
  image: string;
  isSponsored?: boolean;
}

export interface Award {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface User {
  id: number;
  name: string | null;
  avatar: string | null;
  joinDate: string | null;
  bio: string | null;
  awards?: Award[];
  clerkId: string;
  plan?: string;
  points: number;
  level: number;
  isAdmin: boolean;
  email: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  aiUsageCount?: number;
  lastUsageReset?: Date;
}

export interface Comment {
  id: number;
  author: User;
  content: string;
  timestamp: string;
}

export interface Post {
  id: number;
  author: User;
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  poll?: Poll;
}

export interface Poll {
  question: string;
  options: { id: number; text: string; votes: number }[];
}

export interface NewsArticle {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  content: string;
  isFeatured?: boolean;
}

export interface RecyclingEvent {
  id: number;
  type?: 'event';
  name: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  organizer: string;
  description: string;
  image: string;
  isSponsored?: boolean;
}

export interface BikeRental {
  id: number;
  type?: 'bike';
  name: string;
  address: string;
  lat: number;
  lng: number;
  availableBikes: number;
  price: string;
  image: string;
  hours?: string;
  available?: number;
  instructions?: string;
  isSponsored?: boolean;
}

export interface VegetarianRestaurant {
  id: number;
  type?: 'restaurant';
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  priceRange: string;
  cuisine: string;
  image: string;
  hours?: string;
  menu?: string;
  isSponsored?: boolean;
}

export interface DonationPoint {
  id: number;
  type?: 'donation';
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  acceptedItems: string;
  beneficiary: string;
  image: string;
  beneficiaryImage?: string | null;
  isSponsored?: boolean;
}

export interface GptAnalysis {
  wasteType: string;
  recyclingSuggestion: string;
  diyIdeas?: { title: string; steps: string[] }[];
}

export interface DiyProject {
  title: string;
  difficulty: string;
  materials: string[];
  steps: string[];
  videoUrl?: string;
}

export interface DiyAnalysis {
  identifiedItem: string;
  material: string;
  projects: DiyProject[];
}

export interface CalorieAnalysis {
  foodName: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  portionSize: string;
  healthTip: string;
}

export interface EventDetails {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  venue: string;
  address: string;
  city: string;
  description: string;
  mapUrl: string;
  icon: string;
  distanceFromHotel?: string;
  routePoints?: {
    p1Label: string;
    p1Name: string;
    p2Label: string;
    p2Name: string;
    p3Label: string;
    p3Name: string;
  };
}

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'traditional' | 'romantic' | 'candid' | 'proposal' | 'all';
  description?: string;
}

export interface MemoryPost {
  id: string;
  author: string;
  relationship: string;
  message: string;
  date: string;
  imageUrl?: string;
  likes: number;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  textDark: boolean;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'dress' | 'venue' | 'rsvp' | 'general';
}

export interface RsvpFormData {
  fullName: string;
  email: string;
  phone: string;
  attending: 'yes' | 'no';
  guestCount: number;
  dietaryNotes?: string;
  message?: string;
}

export type PollOptionId = 'participate' | 'unavailable';

export interface PollResultData {
  participate: number;
  unavailable: number;
  total: number;
  participatePct: number;
  unavailablePct: number;
}


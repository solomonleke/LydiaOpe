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
}

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'traditional' | 'romantic' | 'candid' | 'all';
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

import { EventDetails, PhotoItem, ColorSwatch, FaqItem, MemoryPost } from '../types/wedding';

export const COUPLE_DATA = {
  hashtag: '#OPENLILY2026',
  title: 'Holy Matrimony of Ezinne & Opeyemi',
  // Background music track URL (Can be a local file like '/music.mp3' or an online MP3 link)
  bgMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  bride: {
    name: 'Ezinne Lydia Ezeh',
    shortName: 'Ezinne (Lydia)',
    parents: 'Engr. James & Mrs. Susan (JP) Ezeh',
    bio: 'An elegant soul with a heart of gold. Ezinne brings warmth, grace, and infectious joy wherever she goes.',
    photo: '/images/PHOTO-2026-09-12-08-18-29.jpg'
  },
  groom: {
    name: 'Opeyemi Noah Adeleke',
    shortName: 'Opeyemi (Noah)',
    parents: 'Mr. Segun & Late Mrs. Elizabeth Adeleke',
    bio: 'A visionary leader with unwavering devotion. Opeyemi finds his home in Ezinne’s smile.',
    photo: '/images/PHOTO-2026-09-12-08-18-30.jpg'
  },
  weddingDateISO: '2026-10-10T11:00:00+01:00',
  weddingDateFormatted: 'Saturday, 10th October, 2026',
  locationCity: 'Enugu State, Nigeria',
  ivImageUrl: '/images/iv.jpg',
  rsvpHotlines: ['07061581496', '08165413816'],
  story: [
    {
      year: 'First Spark',
      title: 'When Paths Crossed',
      description: 'What started as a warm conversation blossomed into a deep connection built on faith, trust, and undeniable mutual affection.'
    },
    {
      year: 'The Journey',
      title: 'Growing Together',
      description: 'Through shared dreams, laughter, unforgettable trips, and quiet moments of prayer, Ezinne and Opeyemi knew they had found their forever.'
    },
    {
      year: 'The Proposal',
      title: 'A Promise of Forever',
      description: 'Surrounded by intimate warmth and golden light, Opeyemi asked the question that changed their lives forever. Ezinne joyfully said YES!'
    }
  ]
};

export const EVENTS: EventDetails[] = [
  {
    id: 'ceremony',
    title: 'Holy Matrimony',
    subtitle: 'Church Blessing & Exchange of Vows',
    time: '11:00 AM (1100 HRS)',
    date: 'Saturday, 10th October, 2026',
    venue: 'Mater Dei Parish',
    address: 'Mgbowo Street, Trans-Ekulu',
    city: 'Enugu Metropolis, Enugu State',
    description: 'Join us as we exchange our sacred vows before God and family in an atmosphere of worship and divine love.',
    mapUrl: 'https://maps.google.com/?q=Mater+Dei+Parish+Trans+Ekulu+Enugu',
    icon: 'Church'
  },
  {
    id: 'reception',
    title: 'Wedding Reception',
    subtitle: 'Royal Celebration & Dinner',
    time: '2:00 PM (1400 HRS)',
    date: 'Saturday, 10th October, 2026',
    venue: 'Decastle Hotel and Resort',
    address: 'Umuona Street, Enugu GRA',
    city: 'Enugu State, Nigeria',
    description: 'Celebrate our union with high elegance, fine dining, joyful music, and traditional royalty.',
    mapUrl: 'https://maps.google.com/?q=Decastle+Hotel+and+Resort+Enugu+GRA',
    icon: 'PartyPopper'
  }
];

export const COLORS: ColorSwatch[] = [
  {
    name: 'Royal Burgundy',
    hex: '#6B0D25',
    textDark: false,
    description: 'Rich, velvet passion & traditional grandeur'
  },
  {
    name: 'Blush Pink',
    hex: '#F4C2C2',
    textDark: true,
    description: 'Soft romance, tenderness & modern elegance'
  },
  {
    name: 'Champagne Gold',
    hex: '#D4AF37',
    textDark: true,
    description: 'Opulent celebration, warmth & royalty'
  },
  {
    name: 'Ivory White',
    hex: '#FFFFFF',
    textDark: true,
    description: 'Purity, divine blessing & eternal new beginnings'
  }
];

export const GALLERY_IMAGES: PhotoItem[] = [
  {
    id: 'p1',
    url: '/images/PHOTO-2026-09-12-08-18-29.jpg',
    title: 'Serenade in Silk',
    category: 'romantic',
    description: 'Gentle gazes and peaceful moments on warm ivory velvet.'
  },
  {
    id: 'p2',
    url: '/images/PHOTO-2026-09-12-08-18-30.jpg',
    title: 'Royal Isiagu Velvet',
    category: 'traditional',
    description: 'Ezinne & Opeyemi in matching luxury burgundy and gold traditional attire.'
  },
  {
    id: 'p3',
    url: '/images/PHOTO-2026-09-12-08-18-29_1.jpg',
    title: 'Golden Embrace',
    category: 'romantic',
    description: 'Warm lighting highlighting their unbreakable bond.'
  },
  {
    id: 'p4',
    url: '/images/PHOTO-2026-09-12-08-18-29_2.jpg',
    title: 'Whispers of Love',
    category: 'candid',
    description: 'Quiet laughter shared between soulmates.'
  },
  {
    id: 'p5',
    url: '/images/PHOTO-2026-09-12-08-18-30_1.jpg',
    title: 'Cultural Elegance',
    category: 'traditional',
    description: 'Striking poses celebrating Igbo & Yoruba fusion heritage.'
  },
  {
    id: 'p6',
    url: '/images/PHOTO-2026-09-12-08-18-30_2.jpg',
    title: 'The Royal Pair',
    category: 'traditional',
    description: 'Regal portraits in rich burgundy textures.'
  },
  {
    id: 'p7',
    url: '/images/PHOTO-2026-09-12-08-18-31.jpg',
    title: 'Modern Romance',
    category: 'romantic',
    description: 'Chic portrait in casual, contemporary styling.'
  },
  {
    id: 'p8',
    url: '/images/PHOTO-2026-09-12-08-18-31_1.jpg',
    title: 'Joy Unfiltered',
    category: 'candid',
    description: 'Spontaneous smiles that light up the room.'
  },
  {
    id: 'p9',
    url: '/images/PHOTO-2026-09-12-08-18-31_2.jpg',
    title: 'Hand in Hand',
    category: 'romantic',
    description: 'Stepping confidently together towards #OPENLILY2026.'
  },
  {
    id: 'p10',
    url: '/images/PHOTO-2026-09-12-08-18-32.jpg',
    title: 'Eternal Promise',
    category: 'candid',
    description: 'An intimate portrait reflecting deep commitment.'
  },
  {
    id: 'p11',
    url: '/images/PHOTO-2026-09-12-08-18-32_1.jpg',
    title: 'Counting Down',
    category: 'candid',
    description: 'Radiant joy as October 10th approaches.'
  }
];

export const INITIAL_MEMORIES: MemoryPost[] = [
  {
    id: 'm1',
    author: 'Chidimma Ezeh',
    relationship: 'Maid of Honor & Sister',
    message: 'To my dearest sister Ezinne and my new brother Opeyemi, seeing you two together warms my heart. You complete each other so effortlessly!',
    date: 'Sept 10, 2026',
    likes: 24
  },
  {
    id: 'm2',
    author: 'Babajide Adeleke',
    relationship: 'Best Man & Brother',
    message: 'Opeyemi, you found the most incredible partner in Ezinne. Wishing you both a lifetime of divine blessings, joy, and peace!',
    date: 'Sept 11, 2026',
    likes: 19
  }
];

export const FAQS: FaqItem[] = [
  {
    question: 'What is the dress code and color theme?',
    answer: 'The official colors of the day are Burgundy, Blush Pink, Champagne Gold, and White. We kindly request formal traditional or black-tie attire reflecting these royal tones.',
    category: 'dress'
  },
  {
    question: 'Can I download the official invitation card (IV)?',
    answer: 'Yes! You can view and download the high-resolution invitation card directly from the Official Invitation section on this website.',
    category: 'rsvp'
  },
  {
    question: 'Where are the event venues located?',
    answer: 'The Holy Matrimony takes place at Mater Dei Parish in Trans-Ekulu (11:00 AM), while the Wedding Reception is hosted at Decastle Hotel and Resort in Enugu GRA (2:00 PM). Map links are available under the Schedule section.',
    category: 'venue'
  },
  {
    question: 'How do I submit my RSVP?',
    answer: 'Please fill out the interactive RSVP form on this website before October 1st, 2026, or contact our event hotlines directly at 07061581496 or 08165413816.',
    category: 'rsvp'
  }
];

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
    id: 'marathon',
    title: 'Pre-Wedding 10km Marathon',
    subtitle: 'Friday Morning Run & Health Walk',
    time: '6:30 AM (0630 HRS)',
    date: 'Friday, 9th October, 2026',
    venue: 'Okpara Square',
    address: 'Independence Layout',
    city: 'Enugu Metropolis, Enugu State',
    description: 'Kick off the celebration weekend with a refreshing 10km morning run & fun walk with the couple! All fitness levels welcome. Branded tees & energy drinks provided.',
    mapUrl: 'https://maps.google.com/?q=Okpara+Square+Enugu',
    icon: 'Trophy'
  },
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
  },
  {
    id: 'p12',
    url: '/images/DSC09760.JPG.jpeg',
    title: 'The Proposal Moment',
    category: 'proposal',
    description: 'Captured during the unforgettable romantic proposal.'
  },
  {
    id: 'p13',
    url: '/images/DSC09803.JPG.jpeg',
    title: 'She Said Yes!',
    category: 'proposal',
    description: 'The priceless reaction as Ezinne joyfully accepted Opeyemi’s proposal.'
  },
  {
    id: 'p14',
    url: '/images/DSC09804.JPG.jpeg',
    title: 'Proposal Joy',
    category: 'proposal',
    description: 'Radiant happiness right after the magical proposal.'
  },
  {
    id: 'p15',
    url: '/images/DSC09816.JPG.jpeg',
    title: 'A Promise of Forever',
    category: 'proposal',
    description: 'Intimate portrait celebrating their proposal and forever commitment.'
  },
  {
    id: 'p16',
    url: '/images/DSC09820.JPG.jpeg',
    title: 'Ring of Love',
    category: 'proposal',
    description: 'Cherished memories from the proposal celebration.'
  },
  {
    id: 'p17',
    url: '/images/DSC09825.JPG.jpeg',
    title: 'Proposal Romance',
    category: 'proposal',
    description: 'Special moments captured during the surprise proposal.'
  },
  {
    id: 'p18',
    url: '/images/DSC09827.JPG.jpeg',
    title: 'Shared Laughter & Love',
    category: 'proposal',
    description: 'Sweet, unscripted moments right after the proposal.'
  },
  {
    id: 'p19',
    url: '/images/DSC09838.JPG.jpeg',
    title: 'Whispered Vows',
    category: 'proposal',
    description: 'Quiet whispers of love shared during the proposal evening.'
  },
  {
    id: 'p20',
    url: '/images/DSC09855.JPG.jpeg',
    title: 'Proposal Elegance',
    category: 'proposal',
    description: 'Ezinne glowing with joy during the proposal shoot.'
  },
  {
    id: 'p21',
    url: '/images/DSC09856.JPG.jpeg',
    title: 'The Groom\'s Proposal Joy',
    category: 'proposal',
    description: 'Opeyemi beaming with joy after Ezinne said YES!'
  },
  {
    id: 'p22',
    url: '/images/DSC09860.JPG.jpeg',
    title: 'Warm Proposal Embrace',
    category: 'proposal',
    description: 'Wrapped in love right after the proposal.'
  },
  {
    id: 'p23',
    url: '/images/DSC09868.JPG.jpeg',
    title: 'Celebration of Love',
    category: 'proposal',
    description: 'Capturing the magic of their proposal story.'
  },
  {
    id: 'p24',
    url: '/images/DSC09870.JPG.jpeg',
    title: 'Proposal Forever',
    category: 'proposal',
    description: 'Stepping into the future together after a beautiful proposal.'
  }
];

export const INITIAL_MEMORIES: MemoryPost[] = [];

export const FAQS: FaqItem[] = [
  {
    question: 'How can I participate in the Friday 10km Pre-Wedding Marathon?',
    answer: 'The 10km Marathon & Fun Walk kicks off on Friday, 9th October, 2026 at 6:30 AM at Okpara Square, Enugu. All guests, friends, and family are warmly invited! Wear comfortable sports gear. Branded shirts, water, and light refreshments will be provided.',
    category: 'general'
  },
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

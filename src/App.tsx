import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OurStory } from './components/OurStory';
import { InvitationSection } from './components/InvitationSection';
import { ScheduleSection } from './components/ScheduleSection';
import { DressCodeSection } from './components/DressCodeSection';
import { GallerySection } from './components/GallerySection';
import { MemoryWallSection } from './components/MemoryWallSection';
import { FaqSection } from './components/FaqSection';
import { RsvpSection } from './components/RsvpSection';
import { GiftRegistryModal } from './components/GiftRegistryModal';
import { AudioPlayer } from './components/AudioPlayer';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [audio, setAudio] = useState(false);
  const [ivModal, setIvModal] = useState(false);
  const [giftModal, setGiftModal] = useState(false);

  return (
    <>
      <Navbar isPlaying={audio} onToggleAudio={() => setAudio(!audio)} onOpenRegistry={() => setGiftModal(true)} />
      <Hero onOpenIv={() => setIvModal(true)} />
      <OurStory />
      <InvitationSection isOpenModal={ivModal} onToggleModal={setIvModal} />
      <ScheduleSection />
      <DressCodeSection />
      <GallerySection />
      <MemoryWallSection />
      <FaqSection />
      <RsvpSection />
      <Footer />
      <GiftRegistryModal isOpen={giftModal} onClose={() => setGiftModal(false)} />
      <AudioPlayer isPlaying={audio} onToggle={() => setAudio(!audio)} />
    </>
  );
};

export default App;

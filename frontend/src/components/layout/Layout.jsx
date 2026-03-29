import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AnnouncementBanner from '../common/AnnouncementBanner';
import GeminiChatbot from '../common/GeminiChatbot';
import FloatingShapes from '../common/FloatingShapes';
import Spotlight from '../common/Spotlight';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <FloatingShapes />
      <Spotlight />
      <Header onMenuToggle={toggleSidebar} />
      <AnnouncementBanner />
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay active" onClick={closeSidebar}></div>}
      <div className="layout">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="main" style={{
          animation: 'slide-in-up 0.5s ease-out'
        }}>
          {children}
        </main>
      </div>
      <GeminiChatbot />
    </div>
  );
}

export default Layout;

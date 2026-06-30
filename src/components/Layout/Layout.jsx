import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingCalculator } from '../FloatingCalculator/FloatingCalculator';
import './Layout.css';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="app-body">
        <Header onMenuToggle={toggleSidebar} />
        <main className="main-content-scroll">
          <Outlet />
        </main>
      </div>
      <FloatingCalculator />
    </div>
  );
};
export default Layout;

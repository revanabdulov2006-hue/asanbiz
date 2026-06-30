import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, Sun, Moon, Bell, Check } from 'lucide-react';
import './Header.css';

export const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, user, notifications, markAllNotificationsRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
  };

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle-btn" 
          onClick={onMenuToggle}
          aria-label="Menyunu aç"
        >
          <Menu size={20} />
        </button>
        <div className="header-welcome hidden-mobile">
          <h2>Xoş gəldiniz, <span className="highlight-text">{user?.name}</span></h2>
          <p>AsanBiznesim idarəetmə paneli</p>
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle Button */}
        <button 
          className="header-action-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Gündüz rejimi' : 'Gecə rejimi'}
          aria-label="Temanı dəyiş"
        >
          {theme === 'dark' ? <Sun size={20} className="glow-icon-sun" /> : <Moon size={20} className="glow-icon-moon" />}
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="notifications-container">
          <button 
            className={`header-action-btn notification-btn ${unreadCount > 0 ? 'pulse' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Bildirişlər"
            aria-label="Bildirişləri göstər"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowNotifications(false)} />
              <div className="notifications-dropdown glass-panel fade-in">
                <div className="dropdown-header">
                  <h4>Bildirişlər</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="mark-read-btn">
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="dropdown-list">
                  {notifications.length > 0 ? (
                    notifications.map((noti) => (
                      <div 
                        key={noti.id} 
                        className={`dropdown-item ${noti.read ? 'read' : 'unread'} noti-${noti.type}`}
                      >
                        <div className="noti-indicator" />
                        <p>{noti.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-empty">
                      <p>Yeni bildiriş yoxdur</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info Capsule Pill with Dynamic Image Avatar */}
        <div 
          className="header-user-capsule"
          onClick={() => navigate('/app/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-capsule-avatar">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="user-capsule-avatar-img"
              />
            ) : (
              user?.initials
            )}
          </div>
          <span className="user-capsule-name hidden-mobile">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};
export default Header;

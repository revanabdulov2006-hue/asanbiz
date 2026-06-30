import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Clock, 
  RefreshCw, 
  LogOut, 
  Building2, 
  User, 
  Mail, 
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import './PendingApproval.css';

export const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, login, logout, theme, toggleTheme, addNotification } = useStore();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefreshStatus = async () => {
    if (!user) return;
    setIsChecking(true);
    
    // Simulate a brief network call checking status
    setTimeout(() => {
      // Re-trigger login behind the scenes to fetch updated status from users registry
      const checkRes = login(user.email, user.password);
      
      setIsChecking(false);
      
      if (checkRes.success) {
        if (checkRes.user.status === 'Aktiv') {
          addNotification({
            type: 'success',
            message: `TƏSDİQ EDİLDİ: Girişiniz aktivləşdirildi! Dashboard-a keçid edilir.`
          });
          navigate('/app');
        } else if (checkRes.user.status === 'Rədd Edilib') {
          addNotification({
            type: 'danger',
            message: `SORĞU RƏDD EDİLDİ: Şirkətə qoşulma sorğunuz rədd edildi.`
          });
        } else {
          addNotification({
            type: 'warning',
            message: `HƏLƏ TƏSDİQLƏNMƏYİB: Şirkət rəhbəri qeydiyyatınızı hələ təsdiqləməyib.`
          });
        }
      }
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'info',
      message: 'Hesabdan çıxış edildi.'
    });
    navigate('/');
  };

  return (
    <div className="pending-page-wrapper">
      {/* Background Soft Blobs */}
      <div className="pending-mesh-bg">
        <div className="pending-blob blob-1" />
        <div className="pending-blob blob-2" />
      </div>

      {/* Theme Control */}
      <div className="pending-theme-control">
        <button 
          className="pending-theme-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Gündüz rejimi' : 'Gecə rejimi'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="pending-card-container">
        {/* Logo and Brand Branding */}
        <div className="pending-logo" onClick={() => navigate('/')}>
          <img src="/img/logo.svg" alt="AsanBiznesim" />
          <span>AsanBiznesim</span>
        </div>

        {/* Premium Glass Card */}
        <div className="pending-glass-card">
          <div className="pending-card-glow" />

          {/* Icon Pulse Animation */}
          <div className="pending-badge-animation-wrapper">
            <div className="pulse-circle pulse-1" />
            <div className="pulse-circle pulse-2" />
            <div className="pending-icon-box">
              <Clock size={32} className="clock-pulse" />
            </div>
          </div>

          <div className="pending-status-title">
            <span className="status-badge-pulsing">TƏSDİQ GÖZLƏYİR</span>
            <h2>Qoşulma Sorğunuz Göndərildi</h2>
            <p>
              Hörmətli <strong>{user?.name || 'İşçi'}</strong>, hesabınız uğurla yaradıldı. 
              Sistemə tam daxil olmaq üçün işləyəcəyiniz şirkətin rəhbəri sorğunuzu təsdiqləməlidir.
            </p>
          </div>

          {/* Detail card list */}
          <div className="pending-details-box">
            <div className="detail-item">
              <Building2 size={16} />
              <div className="detail-info">
                <span>Müraciət edilən Şirkət</span>
                <strong>{user?.companyName || 'AsanBiznesim Şirkəti'}</strong>
              </div>
            </div>
            
            <div className="detail-item">
              <Mail size={16} />
              <div className="detail-info">
                <span>Sizin E-mail</span>
                <strong>{user?.email || 'istifadeci@mail.com'}</strong>
              </div>
            </div>

            <div className="detail-item">
              <User size={16} />
              <div className="detail-info">
                <span>Vəzifə / Rol</span>
                <strong>İşçi (Əməkdaş)</strong>
              </div>
            </div>
          </div>

          {user?.status === 'Rədd Edilib' && (
            <div className="pending-alert-rejected">
              <ShieldAlert size={18} />
              <div>
                <strong>Müraciətiniz rədd edilib</strong>
                <span>Təəssüf ki, şirkət rəhbəri bu sorğunu qəbul etmədi. Digər şirkət kodu ilə yenidən qeydiyyatdan keçə bilərsiniz.</span>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pending-actions-column">
            <button 
              onClick={handleRefreshStatus} 
              disabled={isChecking}
              className="btn-pending-primary"
            >
              <RefreshCw size={16} className={isChecking ? 'spin-icon' : ''} />
              <span>{isChecking ? 'Yoxlanılır...' : 'Yenilə və Yoxla'}</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="btn-pending-secondary"
            >
              <LogOut size={16} />
              <span>Hesabdan Çıxış Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Key, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft,
  Sun,
  Moon,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import './Auth.css';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, login, theme, toggleTheme, addNotification } = useStore();

  // Determine initial mode based on route path
  const isRegisterPath = location.pathname === '/register';
  const [isLoginMode, setIsLoginMode] = useState(!isRegisterPath);
  
  // Registration and Login form states
  const [role, setRole] = useState('Employee'); // 'Admin' (Sahibkar) or 'Employee' (İşçi)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with path changes
  useEffect(() => {
    setIsLoginMode(location.pathname !== '/register');
    setError('');
    setSuccess('');
    setShowPassword(false);
  }, [location.pathname]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email || !password || (!isLoginMode && !name)) {
      setError('Zəhmət olmasa bütün sahələri doldurun.');
      setIsLoading(false);
      return;
    }

    if (isLoginMode) {
      // Handle Login
      const res = login(email, password);
      if (res.success) {
        setSuccess('Uğurla daxil oldunuz! Yönləndirilirsiniz...');
        addNotification({
          type: 'success',
          message: `XOŞ GƏLDİNİZ: ${res.user.name} platformaya uğurla daxil oldu.`
        });
        
        setTimeout(() => {
          setIsLoading(false);
          // If employee pending approval, App.jsx routing will automatically catch it
          navigate('/app');
        }, 1200);
      } else {
        setError(res.message || 'E-mail və ya şifrə yanlışdır!');
        setIsLoading(false);
      }
    } else {
      // Handle Registration
      if (role === 'Admin' && !companyName) {
        setError('Zəhmət olmasa şirkət adını daxil edin.');
        setIsLoading(false);
        return;
      }
      if (role === 'Employee' && !companyCode) {
        setError('Zəhmət olmasa işləyəcəyiniz şirkətin kodunu daxil edin.');
        setIsLoading(false);
        return;
      }

      const res = signUp({
        name,
        email,
        password,
        role, // 'Admin' or 'Employee'
        companyName,
        companyCode: companyCode.toUpperCase().trim()
      });

      if (res.success) {
        if (role === 'Admin') {
          setSuccess(`Qeydiyyat uğurludur! Şirkət Kodunuz: ${res.companyCode}. Panelə yönləndirilirsiniz...`);
          addNotification({
            type: 'success',
            message: `QEYDİYYAT TAMAMLANDI: ${name} adı ilə yeni şirkət yaradıldı. Kod: ${res.companyCode}`
          });
        } else {
          setSuccess('Qeydiyyat uğurludur! Şirkətə qoşulma sorğusu göndərildi. Təsdiq gözlənilir...');
        }
        
        setTimeout(() => {
          setIsLoading(false);
          navigate('/app');
        }, 3000);
      } else {
        setError(res.message || 'Qeydiyyat zamanı xəta baş verdi.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Dynamic Premium Video Background */}
      <div className="auth-video-bg-container">
        <video 
          src="https://assets.mixkit.co/videos/preview/mixkit-financial-analytics-graphs-on-a-digital-display-39967-large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="auth-video-bg"
        />
        <div className="auth-video-overlay" />
      </div>

      {/* Floating Controls Header */}
      <div className="auth-header-controls">
        <button className="auth-back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={16} /> Landing Page
        </button>

        <button 
          className="auth-theme-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Gündüz rejimi' : 'Gecə rejimi'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-container">
        {/* Logo and Brand Branding */}
        <div className="auth-brand-logo" onClick={() => navigate('/')}>
          <img src="/img/logo.svg" alt="AsanBiznesim" />
          <span>AsanBiznesim</span>
        </div>

        {/* Unified Glass Card container */}
        <div className="auth-glass-card">
          <div className="auth-card-glow" />
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                navigate('/login');
              }}
            >
              Daxil Ol
            </button>
            <button 
              className={`auth-tab-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                navigate('/register');
              }}
            >
              Qeydiyyat
            </button>
          </div>

          <div className="auth-welcome-text">
            <h2>{isLoginMode ? 'Yenidən Xoş Gəldiniz!' : 'Biznesinizi Qurmağa Başlayın'}</h2>
            <p>
              {isLoginMode 
                ? 'Hesabınıza daxil olaraq real-time biznes proseslərinizi idarə edin.' 
                : 'AsanBiznesim ilə dəftər-kağız xaosuna tamamilə son qoyun.'
              }
            </p>
          </div>

          {/* Error and Success Banners */}
          {error && (
            <div className="auth-alert alert-error">
              <span className="alert-dot" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="auth-alert alert-success">
              <span className="alert-dot" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {/* 1. If Registering, select Role */}
            {!isLoginMode && (
              <div className="role-selector-container">
                <label className="input-label">Qeydiyyat Tipi</label>
                <div className="role-selector-row">
                  <button
                    type="button"
                    className={`role-btn ${role === 'Admin' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('Admin')}
                  >
                    <Building2 size={16} />
                    <div className="role-btn-text">
                      <strong>Sahibkar (Müdir)</strong>
                      <span>Şirkət qurub kodu idarə edir</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    className={`role-btn ${role === 'Employee' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('Employee')}
                  >
                    <User size={16} />
                    <div className="role-btn-text">
                      <strong>İşçi (Əməkdaş)</strong>
                      <span>Şirkət kodunu daxil edərək qoşulur</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Full Name input (Register only) */}
            {!isLoginMode && (
              <div className="input-group">
                <label htmlFor="name" className="input-label">Ad Soyad</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={16} />
                  <input
                    type="text"
                    id="name"
                    placeholder="Adınız və Soyadınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. Email input */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">E-mail Ünvanı</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  id="email"
                  placeholder="nümunə@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 4. Password input */}
            <div className="input-group">
              <label htmlFor="pass" className="input-label">Şifrə</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="pass"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifrəni gizlə" : "Şifrəni göstər"}
                  title={showPassword ? "Şifrəni gizlə" : "Şifrəni göstər"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 5. Register Specific Dynamic Fields */}
            {!isLoginMode && role === 'Admin' && (
              <div className="input-group slide-in-field">
                <label htmlFor="compName" className="input-label">Şirkət Adı</label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" size={16} />
                  <input
                    type="text"
                    id="compName"
                    placeholder="AsanBiznesim MMC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isLoginMode && role === 'Employee' && (
              <div className="input-group slide-in-field">
                <label htmlFor="compCode" className="input-label">Şirkət Kodu</label>
                <div className="input-wrapper">
                  <Key className="input-icon" size={16} />
                  <input
                    type="text"
                    id="compCode"
                    placeholder="ASAN-XXXXXX"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    required
                  />
                </div>
                <div className="field-hint-text">
                  <Info size={12} /> Sahibkarın sizə təqdim etdiyi 6-rəqəmli kodu daxil edin.
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  <span>{isLoginMode ? 'Giriş Et' : 'Qeydiyyatdan Keç'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom helper actions */}
          <div className="auth-card-footer">
            {isLoginMode ? (
              <p>
                Hesabınız yoxdur?{' '}
                <button 
                  type="button" 
                  className="footer-link-btn"
                  onClick={() => {
                    setIsLoginMode(false);
                    navigate('/register');
                  }}
                >
                  Pulsuz Qeydiyyatdan Keçin
                </button>
              </p>
            ) : (
              <p>
                Artıq qeydiyyatınız var?{' '}
                <button 
                  type="button" 
                  className="footer-link-btn"
                  onClick={() => {
                    setIsLoginMode(true);
                    navigate('/login');
                  }}
                >
                  Hesabınıza Giriş Edin
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;

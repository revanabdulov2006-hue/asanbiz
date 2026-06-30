import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  UploadCloud, 
  ShieldCheck, 
  Check, 
  Trash2, 
  FileCheck,
  Lock,
  KeyRound,
  X,
  Camera
} from 'lucide-react';
import './Pages.css';
import './Profile.css';

export const Profile = () => {
  const { user, updateUserProfile, setUserRole } = useStore();
  
  // Local state for profile inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Local states for Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security Verification Modal States - MANDATORY FOR ALL CHANGES
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // { type: 'profile'|'avatar'|'cv'|'remove_cv'|'password_change', data: ... }

  // Custom file upload references and upload simulation state
  const fileInputRef = useRef(null);
  const customAvatarInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Save confirmation toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!user) return null;

  // Helper to trigger transient success toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Trigger Security Verification before executing any action
  const triggerVerification = (type, data) => {
    setPendingAction({ type, data });
    setVerifyPassword('');
    setVerifyError('');
    setShowVerifyModal(true);
  };

  // Confirm and Execute the Pending Changes after password matches
  const handleConfirmVerification = (e) => {
    e.preventDefault();
    
    if (verifyPassword !== user.password) {
      setVerifyError('Şifrə yanlışdır! Təhlükəsizlik səbəbindən əməliyyat dayandırıldı.');
      return;
    }

    // Passwords match! Execute action:
    const act = pendingAction;
    if (act.type === 'profile') {
      updateUserProfile(act.data);
      triggerToast('Profil məlumatlarınız uğurla güncəlləndi!');
    } else if (act.type === 'avatar') {
      updateUserProfile({ profileImage: act.data });
      triggerToast('Profil şəkliniz uğurla yeniləndi!');
    } else if (act.type === 'cv') {
      simulateFileUpload(act.data);
    } else if (act.type === 'remove_cv') {
      updateUserProfile({ cvFile: null });
      triggerToast('CV faylınız silindi.');
    } else if (act.type === 'password_change') {
      updateUserProfile({ password: act.data.newPassword });
      triggerToast('Giriş şifrəniz uğurla yeniləndi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    // Reset and close verification
    setShowVerifyModal(false);
    setVerifyPassword('');
    setPendingAction(null);
  };

  // Submit Profile Form (Triggers security check first)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    triggerVerification('profile', {
      name,
      email,
      phone,
      companyName,
      bio
    });
  };

  // Submit Change Password Form (Triggers check first)
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (currentPassword !== user.password) {
      triggerToast('Cari giriş şifrəniz yanlışdır!');
      return;
    }
    if (newPassword.length < 6) {
      triggerToast('Yeni şifrə ən azı 6 simvoldan ibarət olmalıdır!');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Yeni şifrə təsdiq məbləği ilə uyğun gəlmir!');
      return;
    }

    // Credentials look good. Trigger verification
    triggerVerification('password_change', { newPassword });
  };

  // Handle custom image file upload converting it to base64 DataURL (Triggers security check first)
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        triggerVerification('avatar', base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate file upload with incremental progress bar
  const simulateFileUpload = (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            updateUserProfile({
              cvFile: {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
              }
            });
            triggerToast('CV faylınız uğurla yükləndi!');
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 120);
  };

  // Handle Drag & Drop events for CV (Triggers check first)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      triggerVerification('cv', e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      triggerVerification('cv', e.target.files[0]);
    }
  };

  const handleRemoveCV = (e) => {
    e.stopPropagation();
    triggerVerification('remove_cv', null);
  };

  const handleRoleToggle = (newRole) => {
    setUserRole(newRole);
    triggerToast(`Sistem rolunuz ${newRole === 'Admin' ? 'Müdir' : 'İşçi'} olaraq dəyişdirildi!`);
  };

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top Banner Row */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Profil Məlumatları</h1>
            <p className="page-subheading">Şəxsi məlumatlarınızı tənzimləyin, şifrənizi dəyişin və CV-nizi yükləyin</p>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="profile-layout-grid">
          
          {/* Left Side: General Profile Form Settings & Password Change Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* General Profile Settings Form */}
            <div className="table-card glass-panel" style={{ padding: '20px' }}>
              <div className="table-header" style={{ marginBottom: '16px' }}>
                <h3>Şəxsi Məlumatları Redaktə Et</h3>
              </div>
              
              <form onSubmit={handleSaveProfile} className="modal-form" style={{ padding: 0 }}>
                <div className="form-group">
                  <label>
                    <User size={13} style={{ marginRight: 4 }} />
                    Ad Soyad
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ad və soyadınız" 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Mail size={13} style={{ marginRight: 4 }} />
                      E-mail Ünvanı
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="email@asanbiznesim.az" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <Phone size={13} style={{ marginRight: 4 }} />
                      Telefon Nömrəsi
                    </label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+994 50 000 00 00" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Building size={13} style={{ marginRight: 4 }} />
                    Şirkətin / Mağazanın Adı
                  </label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    placeholder="Şirkət adı" 
                  />
                </div>

                <div className="form-group">
                  <label>Qısa Bioqrafiya / Qeyd</label>
                  <textarea 
                    rows="3" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Özünüz haqqında qısa məlumat yazın..."
                  ></textarea>
                </div>

                <div className="modal-actions" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary">
                    Profili Yenilə (Şifrə ilə)
                  </button>
                </div>
              </form>
            </div>

            {/* Giriş Məlumatlarını (Şifrə) Dəyiş Formu */}
            <div className="table-card glass-panel" style={{ padding: '20px' }}>
              <div className="table-header" style={{ marginBottom: '16px' }}>
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><KeyRound size={16} className="text-accent" /> Giriş Şifrəsini Yenilə</h3>
              </div>
              
              <form onSubmit={handlePasswordChangeSubmit} className="modal-form" style={{ padding: 0 }}>
                <div className="form-group">
                  <label>
                    <Lock size={13} style={{ marginRight: 4 }} />
                    Cari Giriş Şifrəsi
                  </label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Cari şifrəni daxil edin" 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Yeni Şifrə</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Ən azı 6 simvol" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Yeni Şifrənin Təsdiqi</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Yeni şifrəni yenidən yazın" 
                      required 
                    />
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
                    Giriş Şifrəsini Dəyişdir
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Side: Profile Card & CV Drag Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Main User Card Capsule */}
            <div className="profile-card glass-panel">
              <div className="profile-card-banner" />
              
              {/* INTERACTIVE CLICKABLE AVATAR OVERLAY - Click to directly upload custom image */}
              <div 
                className="profile-card-avatar-wrapper"
                onClick={() => customAvatarInputRef.current?.click()}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Profil şəklini dəyişmək üçün klikləyin"
              >
                <div className="profile-card-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <span>{user.initials}</span>
                  )}
                  
                  {/* Glassmorphic hover camera overlay */}
                  <div 
                    className="avatar-hover-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.72)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      gap: '4px'
                    }}
                  >
                    <Camera size={18} />
                    <span>Şəkli Dəyiş</span>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={customAvatarInputRef} 
                  onChange={handleCustomAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="profile-card-info">
                <h2>{user.name}</h2>
                <span className="profile-card-company">{user.companyName}</span>
                <div>
                  <span className={`profile-card-role-badge ${user.role === 'Admin' ? 'role-admin' : 'role-employee'}`}>
                    {user.role === 'Admin' ? 'Müdir' : 'İşçi'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0 8px', textAlign: 'center' }}>
                {user.bio || 'Hələ bioqrafiya qeyd edilməyib.'}
              </p>

              <div className="profile-card-stats" style={{ margin: '8px 0 0 0' }}>
                <div className="stat-item" style={{ border: 0 }}>
                  <span className="stat-label">Səlahiyyətlər</span>
                  <span className="stat-value" style={{ color: 'var(--color-success)' }}>{user.permissions?.length || 0} Səhifə</span>
                </div>
              </div>

              {/* DEDICATED CUSTOM PHOTO UPLOAD SELECTOR BUTTON - Presets removed as requested */}
              <div style={{ width: '100%', marginTop: 8, padding: '0 8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => customAvatarInputRef.current?.click()}
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
                >
                  <UploadCloud size={16} className="text-accent" />
                  <span>Şəxsi Profil Şəkli Yüklə</span>
                </button>
              </div>

            </div>

            {/* Interactive Drag & Drop CV Area */}
            <div className="cv-upload-card glass-panel" style={{ padding: '20px' }}>
              <div className="cv-card-header" style={{ marginBottom: '12px' }}>
                <h3>CV / Rezume Yüklə</h3>
                <p>Profilinizi tamamlamaq üçün CV rezumenizi yükləyin (Təsdiqləmə tələb olunur)</p>
              </div>

              {isUploading ? (
                <div className="drag-zone" style={{ padding: '24px 0' }}>
                  <div className="uploading-animation">
                    <span className="uploading-title">CV yüklənir...</span>
                    <div className="upload-progressbar-bg" style={{ margin: '8px 0' }}>
                      <div 
                        className="upload-progressbar-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
              ) : user.cvFile ? (
                <div className="uploaded-file-capsule">
                  <div className="file-info-col">
                    <div className="file-icon-wrapper">
                      <FileCheck size={18} />
                    </div>
                    <div className="file-meta">
                      <span className="file-title-name" title={user.cvFile.name}>
                        {user.cvFile.name}
                      </span>
                      <span className="file-size-bytes">{user.cvFile.size}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="file-remove-btn" 
                    onClick={handleRemoveCV}
                    title="Faylı sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div 
                  className={`drag-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '24px 0', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,.docx,.doc"
                  />
                  <div className="drag-icon-wrapper" style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    <UploadCloud size={32} />
                  </div>
                  <div className="drag-text">
                    <span className="drag-title" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>CV sürüşdürüb buraxın</span>
                    <span className="drag-subtitle" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>və ya klikləyərək kompüterdən seçin (.pdf, .docx)</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* SECURITY VERIFICATION MODAL - MANDATORY TO RENDER FOR ANY PROFILE CHANGES */}
        {showVerifyModal && (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ maxWidth: '400px', padding: '24px' }}
            >
              <div className="modal-header" style={{ marginBottom: '8px' }}>
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={18} className="text-danger" /> Şəxsiyyətin Təsdiqlənməsi</h3>
                <button className="close-modal-btn" onClick={() => { setShowVerifyModal(false); setPendingAction(null); }}><X size={18} /></button>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
                Təhlükəsizlik və şəxsi məlumatların qorunması məqsədilə, bu əməliyyatı tamamlamaq üçün **cari giriş şifrənizi** yazaraq özünüz olduğunuzu təsdiq etməlisiniz.
              </div>

              <form onSubmit={handleConfirmVerification}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Cari Giriş Şifrəniz</label>
                  <input 
                    type="password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder="Giriş şifrənizi yazın"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                {verifyError && (
                  <div style={{ color: 'var(--color-error)', fontSize: '0.74rem', fontWeight: '600', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    {verifyError}
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowVerifyModal(false); setPendingAction(null); }}>Ləğv et</button>
                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Təsdiqlə və Yadda Saxla</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Floating Save/Switch Toast banner */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              className="save-toast-banner"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Check size={16} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Profile;

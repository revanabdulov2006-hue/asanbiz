import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  X, 
  AlertTriangle, 
  Play, 
  Pause,
  ShieldAlert, 
  CheckCircle, 
  DollarSign, 
  Info,
  Clock,
  Video,
  Volume2,
  Image,
  Upload,
  Shirt,
  Users
} from 'lucide-react';
import './Pages.css';

export const Instructions = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'tutorials'
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null); // Simulated video player modal
  const [selectedCategory, setSelectedCategory] = useState('All');

  // State for simulated video playback inside modal
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35); // simulated percent

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Nizam-İntizam':
        return <Clock size={15} style={{ marginRight: '4px' }} />;
      case 'Geyim Qaydası':
        return <Shirt size={15} style={{ marginRight: '4px' }} />;
      case 'Xidmət Standardı':
        return <Users size={15} style={{ marginRight: '4px' }} />;
      case 'Maliyyə Məsuliyyəti':
        return <DollarSign size={15} style={{ marginRight: '4px' }} />;
      default:
        return <BookOpen size={15} style={{ marginRight: '4px' }} />;
    }
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Yüksək':
        return {
          leftBorder: '4px solid var(--color-error)',
          bgColor: 'rgba(239, 68, 68, 0.03)',
          badgeColor: 'status-danger',
          penaltyBg: 'rgba(239, 68, 68, 0.05)',
          penaltyBorder: 'rgba(239, 68, 68, 0.15)',
          penaltyText: 'var(--color-error)'
        };
      case 'Orta':
        return {
          leftBorder: '4px solid var(--color-warning)',
          bgColor: 'rgba(245, 158, 11, 0.03)',
          badgeColor: 'status-warning',
          penaltyBg: 'rgba(245, 158, 11, 0.05)',
          penaltyBorder: 'rgba(245, 158, 11, 0.15)',
          penaltyText: 'var(--color-warning)'
        };
      case 'Yüngül':
      default:
        return {
          leftBorder: '4px solid var(--color-success)',
          bgColor: 'rgba(34, 197, 94, 0.03)',
          badgeColor: 'status-success',
          penaltyBg: 'rgba(34, 197, 94, 0.05)',
          penaltyBorder: 'rgba(34, 197, 94, 0.15)',
          penaltyText: 'var(--color-success)'
        };
    }
  };

  // Form states for creating a new instruction/rule
  const [contentType, setContentType] = useState('rule'); // 'rule' or 'tutorial'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nizam-İntizam');
  const [description, setDescription] = useState('');
  const [penaltyText, setPenaltyText] = useState('');
  const [severity, setSeverity] = useState('Orta'); // Yüngül, Orta, Yüksək

  // File Upload states (simulated for frontend)
  const [uploadedVideo, setUploadedVideo] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  // Local state for dynamic entries
  const [rules, setRules] = useState([
    { 
      id: 1, 
      title: 'İş Qrafiki və Gecikmələr', 
      category: 'Nizam-İntizam', 
      severity: 'Orta',
      description: 'Hər bir işçi öz smenindən 10 dəqiqə əvvəl mağazada olmalıdır. İşə gecikmə və ya növbəni xəbərsiz tərk etmək qəti qadağandır.',
      penalty: '3 şifahi xəbərdarlıqdan sonra, hər növbəti gecikmə üçün gündəlik maaşın 10%-i kəsilir. Smenə səbəbsiz gəlməmək aylıq maaşdan 15% birbaşa kəsintiyə səbəb olur.'
    },
    { 
      id: 2, 
      title: 'Uniforma və Şəxsi Səliqə', 
      category: 'Geyim Qaydası', 
      severity: 'Yüngül',
      description: 'İş saatlarında "AsanBiznesim" loqolu təmiz işçi forması geyinilməli və şəxsi yaxa kartı taxılmalıdır.',
      penalty: 'Uniforma qaydalarının pozulması zamanı 1-ci dəfə şifahi xəbərdarlıq, təkrarlanarsa növbəti hər dəfə üçün aylıq maaşdan 5% cərimə tətbiq olunur.'
    },
    { 
      id: 3, 
      title: 'Müştərilərlə Rəftar və Kobudluq', 
      category: 'Xidmət Standardı', 
      severity: 'Yüksək',
      description: 'Müştərilərlə rəftar zamanı tam nəzakətli, gülərüz və səbirli davranılmalıdır. Hər hansı mübahisə yarandıqda birbaşa Müdirə məlumat verilməlidir.',
      penalty: 'Müştəriyə qarşı kobudluq, nalayiq ifadələr işdən azad olunmaya qədər ciddi intizam cəzası və 15% maaş kəsintisi ilə nəticələnir.'
    },
    { 
      id: 4, 
      title: 'Kassa Təhlükəsizliyi və Kəsirlər', 
      category: 'Maliyyə Məsuliyyəti', 
      severity: 'Yüksək',
      description: 'Növbə zamanı kassa çeklərinin düzgün vurulması və terminal ödənişlərinin Z-hesabat ilə uyğunluğu kassirin birbaşa məsuliyyətidir.',
      penalty: 'Smen hesabatı (açot) zamanı aşkarlanan hər hansı nağd kəsir məbləği 100% həcmdə məsul işçinin maaşından (kəsir məbləği qədər) tutulur.'
    }
  ]);

  const [tutorials, setTutorials] = useState([
    {
      id: 101,
      title: 'Kassa Növbəsinin Açılması və Yoxlanış',
      hasVideo: true,
      hasImage: true,
      description: 'Bu təlimatda kassanın səhər açılışı, ilkin nağd pul qalığının sayılması və POS-terminal bağlantılarının yoxlanılması addım-addım izah olunur.',
      steps: [
        'Kassanı açın və dünəndən qalan başlanğıc nağd pul balansını dəqiq sayın.',
        'POS-terminal aparatının şəbəkə və kağız rulon bağlantısını yoxlayın.',
        'Sistemdə "Növbəni Başlat" əmrini verərək saatı qeyd edin.'
      ],
      videoName: 'reg_opening_guide.mp4',
      imageName: 'register_counter.jpg'
    },
    {
      id: 102,
      title: 'Smen Sonu Hesabatının (Açot) Təhvil Verilməsi',
      hasVideo: true,
      hasImage: false,
      description: 'İşçi smenini bitirərkən pulu Müdirə necə təhvil verməli və sistemdə "Açot" formasını necə doldurmalıdır təlimatı.',
      steps: [
        'Kassadakı bütün nağd əskinasları və qəpikləri qruplaşdıraraq sayın.',
        'POS-terminaldan "Gün Sonu Hesabatı" (Z-Hesabat) çıxarın.',
        'AsanBiznesim sistemində "Açotlar" bölməsinə keçib Kassadakı Pul və Terminal məbləğini yazaraq təhvil verin.'
      ],
      videoName: 'shift_reporting_final.mp4',
      imageName: null
    },
    {
      id: 103,
      title: 'Yararlılıq Tarixi (Srok) Nəzarəti və Arxivləşdirmə',
      hasVideo: false,
      hasImage: true,
      description: 'Süd, un məhsulları və tez xarab olan digər malların vaxtı keçdikdə vitrindən çıxarılması və srok siyahısına yazılması proseduru.',
      steps: [
        'Hər gün saat 14:00-da süd dolabındakı bütün məhsulların srokunu tək-tək yoxlayın.',
        'İstifadə müddətinə 7 gün və ya daha az qalmış məhsulları endirim rəfinə yerləşdirin.',
        'Sroku tam bitmiş məhsulları vitrindən götürüb sistemdə "Vitrindən Çıxar" olaraq qeyd edin.'
      ],
      videoName: null,
      imageName: 'shelf_inventory.png'
    }
  ]);

  // File Upload Handlers (Simulated)
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedVideo(file.name);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file.name);
    }
  };

  // Handle form submission for new rules/tutorials
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    if (contentType === 'rule') {
      const newRule = {
        id: Date.now(),
        title,
        category,
        severity,
        description,
        penalty: penaltyText || 'Qayda pozuntusuna görə xüsusi maaş kəsintisi təyin edilməyib.'
      };
      setRules([...rules, newRule]);
    } else {
      const newTut = {
        id: Date.now(),
        title,
        hasVideo: !!uploadedVideo,
        hasImage: !!uploadedImage,
        description,
        steps: description.split('\n').filter(line => line.trim() !== ''),
        videoName: uploadedVideo || null,
        imageName: uploadedImage || null
      };
      setTutorials([...tutorials, newTut]);
    }

    // Reset fields & close modal
    setTitle('');
    setDescription('');
    setPenaltyText('');
    setUploadedVideo('');
    setUploadedImage('');
    setShowAddModal(false);
  };

  const handlePlayVideoSim = (tut) => {
    setActiveVideo(tut);
    setIsPlaying(true);
    setVideoProgress(15);

    // Simulate video playing loader
    const interval = setInterval(() => {
      setVideoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 5;
      });
    }, 800);
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'Yüksək') return <span className="status-pill status-danger" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}><ShieldAlert size={10} style={{ marginRight: '3px' }} /> Yüksək Risk</span>;
    if (sev === 'Orta') return <span className="status-pill status-warning" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}><Info size={10} style={{ marginRight: '3px' }} /> Orta Səviyyə</span>;
    return <span className="status-pill status-success" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}><CheckCircle size={10} style={{ marginRight: '3px' }} /> Yüngül Qayda</span>;
  };

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Title row */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">İş Prinsipləri və Təlimatlar</h1>
            <p className="page-subheading">Mağazadaxili nizam-intizam qaydaları, qadağalar, maaş kəsintiləri və əməliyyat təlimatları paneli</p>
          </div>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Yeni Material Əlavə Et
            </button>
          )}
        </div>

        {/* Info panel alert */}
        <div className="limit-meter-section glass-panel" style={{ padding: '14px 18px', marginBottom: 'var(--spacing-md)', display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
          <BookOpen className="text-accent" size={24} />
          <div style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
            <span className="bold-text" style={{ color: 'var(--text-primary)' }}>Hörmətli Heyət Üzvləri!</span> Bu bölmədəki qaydalar mağazamızın təhlükəsizliyi, müştəri məmnuniyyəti və professional iş mühiti üçün mütləqdir. Qayda pozuntuları avtomatik cərimə sisteminə və maaş kəsintilərinə yol aça bilər. Təlimatlar bölməsindəki video izahları mütəmadi izləməyiniz tövsiyə olunur.
          </div>
        </div>

        {/* Tab switchers */}
        <div className="tabs-header-row" style={{ marginBottom: 'var(--spacing-md)' }}>
          <button 
            className={`tab-pill-btn ${activeTab === 'rules' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rules')}
          >
            <ShieldAlert size={16} /> Nizam-İntizam Qaydaları və Cərimələr
          </button>
          <button 
            className={`tab-pill-btn ${activeTab === 'tutorials' ? 'active' : ''}`} 
            onClick={() => setActiveTab('tutorials')}
          >
            <Video size={16} /> İş Təlimatları və Video İzahlar
          </button>
        </div>

        {/* TAB 1: RULES & PENALTIES PANEL */}
        {activeTab === 'rules' && (() => {
          const highCount = rules.filter(r => r.severity === 'Yüksək').length;
          const mediumCount = rules.filter(r => r.severity === 'Orta').length;
          const lightCount = rules.filter(r => r.severity === 'Yüngül').length;
          const filteredRules = selectedCategory === 'All' 
            ? rules 
            : rules.filter(r => r.category === selectedCategory);

          return (
            <div className="invoices-layout-grid">
              <div className="table-card glass-panel" style={{ padding: '20px' }}>
                
                {/* Stats & Title Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>Nizam-İntizam və Maaş Kəsintisi Kodeksi</h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mağazadaxili rəsmi qaydalar və pozuntuların nəticələri</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="status-pill status-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 'bold', padding: '4px 10px' }}>
                      <ShieldAlert size={12} /> {highCount} Yüksək Risk
                    </span>
                    <span className="status-pill status-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 'bold', padding: '4px 10px' }}>
                      <Info size={12} /> {mediumCount} Orta Səviyyə
                    </span>
                    <span className="status-pill status-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 'bold', padding: '4px 10px' }}>
                      <CheckCircle size={12} /> {lightCount} Yüngül
                    </span>
                  </div>
                </div>

                {/* Categories Filter Bar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', padding: '4px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {['All', 'Nizam-İntizam', 'Geyim Qaydası', 'Xidmət Standardı', 'Maliyyə Məsuliyyəti'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`tab-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                      style={{ 
                        fontSize: '0.74rem', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        border: 'none',
                        background: selectedCategory === cat ? 'var(--color-primary)' : 'transparent',
                        color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat === 'All' ? <BookOpen size={13} /> : getCategoryIcon(cat)}
                      {cat === 'All' ? 'Hamısı' : cat}
                    </button>
                  ))}
                </div>

                {/* Rules Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                  {filteredRules.length > 0 ? (
                    filteredRules.map((rule) => {
                      const style = getSeverityStyle(rule.severity);
                      return (
                        <div 
                          key={rule.id} 
                          className="limit-meter-section" 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '10px', 
                            padding: '16px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            borderLeft: style.leftBorder,
                            background: style.bgColor,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                          }}
                        >
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                {getCategoryIcon(rule.category)} {rule.category}
                              </span>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{rule.title}</h4>
                            </div>
                            {getSeverityBadge(rule.severity)}
                          </div>

                          {/* Rule Requirement Section */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.05em' }}>📋 QAYDA VƏ TƏLƏB:</span>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                              {rule.description}
                            </p>
                          </div>

                          {/* Penalty Section */}
                          <div 
                            style={{ 
                              padding: '10px 12px', 
                              backgroundColor: style.penaltyBg, 
                              border: `1px solid ${style.penaltyBorder}`, 
                              borderRadius: '6px', 
                              fontSize: '0.76rem' 
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: style.penaltyText, fontWeight: 'bold', marginBottom: '4px' }}>
                              <DollarSign size={13} /> POZUNTU HALINDA NƏTİCƏ:
                            </div>
                            <span style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{rule.penalty}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                      Bu kateqoriya üzrə qayda tapılmadı.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 2: INSTRUCTIONAL TEXT AND VIDEO TUTORIALS */}
        {activeTab === 'tutorials' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {tutorials.map((tut) => (
              <div key={tut.id} className="table-card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Title */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>{tut.title}</h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {tut.hasVideo && (
                        <span className="status-pill status-info" style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', fontSize: '0.7rem' }}>
                          <Video size={11} /> Video İzah
                        </span>
                      )}
                      {tut.hasImage && (
                        <span className="status-pill status-success" style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', fontSize: '0.7rem' }}>
                          <Image size={11} /> Şəkilli
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {tut.description}
                  </p>
                </div>

                {/* Step notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>📋 Addım-Addım Təlimat:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {tut.steps.map((step, index) => (
                      <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '0.68rem' }}>
                          {index + 1}
                        </span>
                        <span style={{ lineHeight: '1.3' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Attachment HUD */}
                {(tut.videoName || tut.imageName) && (
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span className="bold-text">Əlavələr:</span>
                    {tut.videoName && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Video size={10} /> {tut.videoName}</span>}
                    {tut.imageName && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Image size={10} /> {tut.imageName}</span>}
                  </div>
                )}

                {/* Simulated Video Player Box */}
                {(tut.hasVideo || tut.videoName) ? (
                  <div 
                    className="limit-meter-section" 
                    style={{ 
                      position: 'relative', 
                      height: '140px', 
                      borderRadius: '8px', 
                      background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.6) 0%, rgba(34, 197, 94, 0.2) 100%)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
                    }}
                    onClick={() => handlePlayVideoSim(tut)}
                    title="Simulyasiyalı video izahı izlə"
                  >
                    {/* Grid Lines simulating digital overlay */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                    
                    {/* Central Play Button */}
                    <div 
                      style={{ 
                        zIndex: 2, 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 255, 255, 0.25)', 
                        backdropFilter: 'blur(8px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        transition: 'transform 0.2s'
                      }}
                      className="play-btn-hover"
                    >
                      <Play size={20} fill="#fff" stroke="#fff" style={{ marginLeft: '3px' }} />
                    </div>
                    
                    {/* Bottom Video Metadata HUD */}
                    <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2, fontSize: '0.68rem', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}><Video size={11} /> VİDEO DƏRSLİK</span>
                      <span>{tut.videoName || 'Play simulation'}</span>
                    </div>
                  </div>
                ) : (
                  // If only Image is uploaded
                  <div 
                    className="limit-meter-section" 
                    style={{ 
                      position: 'relative', 
                      height: '140px', 
                      borderRadius: '8px', 
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(30, 41, 59, 0.6) 100%)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden'
                    }}
                  >
                    <Image size={32} className="text-accent" style={{ opacity: 0.6, marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Mətn & Şəkilli Təlimat Vərəqi</span>
                    {tut.imageName && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Fayl: {tut.imageName}</span>}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* MODAL: Video Player Simulation Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setActiveVideo(null)}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '640px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <h3 style={{ color: '#fff', fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Video size={16} /> Təlimat Video İzahı Simulyasiyası</h3>
                <button className="close-modal-btn" onClick={() => setActiveVideo(null)} style={{ color: '#fff' }}><X size={18} /></button>
              </div>

              {/* Simulated Screen */}
              <div style={{ position: 'relative', height: '280px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '14px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                
                {/* Simulated playback visual */}
                {isPlaying ? (
                  <div style={{ textAlign: 'center', zIndex: 2 }}>
                    <motion.div 
                      animate={{ scale: [1, 1.08, 1] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ color: 'var(--color-primary)', display: 'inline-flex', justifyContent: 'center', marginBottom: '10px' }}
                    >
                      <Volume2 size={36} />
                    </motion.div>
                    <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Təlimat Oynadılır...</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '3px' }}>{activeVideo.title}</p>
                    {activeVideo.videoName && <p style={{ color: 'var(--color-accent)', fontSize: '0.68rem', marginTop: '2px' }}>Fayl: {activeVideo.videoName}</p>}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', zIndex: 2 }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setIsPlaying(true)}>
                      <Play size={24} fill="#fff" stroke="#fff" style={{ marginLeft: '3px' }} />
                    </div>
                    <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>Təlimat izlənməsi başa çatdı</p>
                    <p style={{ color: 'var(--color-success)', fontSize: '0.72rem', marginTop: '3px', fontWeight: 'bold' }}>İzlənildi ✓ (100%)</p>
                  </div>
                )}

                {/* Progress bar HUD */}
                <div style={{ position: 'absolute', bottom: '10px', left: '15px', right: '15px', zIndex: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.65rem', marginBottom: '4px' }}>
                    <span>{isPlaying ? '0:45' : 'Video sonu'}</span>
                    <span>{activeVideo.videoName ? 'Media Simulyator' : 'Təlimat Videosu'}</span>
                  </div>
                  <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${isPlaying ? videoProgress : 100}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>

              {/* Bottom steps review */}
              <div style={{ color: '#ccc', fontSize: '0.8rem', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span className="bold-text" style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Əsas Nöqtələr:</span>
                <ul style={{ listStyleType: 'disc', paddingLeft: '15px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem' }}>
                  {activeVideo.steps.map((st, i) => <li key={i}>{st}</li>)}
                </ul>
              </div>

              <div className="modal-actions" style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setActiveVideo(null)} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Bağla</button>
                {isPlaying ? (
                  <button className="btn btn-primary" onClick={() => setIsPlaying(false)}><Pause size={14} style={{ marginRight: '4px' }} /> Dayandır</button>
                ) : (
                  <button className="btn btn-primary" onClick={() => { setIsPlaying(true); setVideoProgress(0); }}><Play size={14} style={{ marginRight: '4px' }} /> Yenidən İzlə</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add New Instruction/Rule Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '540px' }}
          >
            <div className="modal-header">
              <h3>Yeni Təlimat / Qayda Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="modal-form">
              
              <div className="form-group">
                <label>Materialın Tipi</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="radio" checked={contentType === 'rule'} onChange={() => setContentType('rule')} /> Nizam-İntizam Qaydası / Qadağa
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="radio" checked={contentType === 'tutorial'} onChange={() => setContentType('tutorial')} /> Video / Əməliyyat Təlimatı
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Başlıq</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder={contentType === 'rule' ? 'Qayda başlığı (məs. Müştəri ilə Rəftar)' : 'Təlimat başlığı (məs. İnventar sayımı)'} 
                  required 
                />
              </div>

              {contentType === 'rule' ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Kateqoriya</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Nizam-İntizam">Nizam-İntizam</option>
                        <option value="Geyim Qaydası">Geyim Qaydası</option>
                        <option value="Xidmət Standardı">Xidmət Standardı</option>
                        <option value="Maliyyə Məsuliyyəti">Maliyyə Məsuliyyəti</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Risk / Ciddilik Səviyyəsi</label>
                      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="Yüngül">Yüngül Qayda</option>
                        <option value="Orta">Orta Səviyyə</option>
                        <option value="Yüksək">Yüksək Risk</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Qayda İzahı (Açıqlama)</label>
                    <textarea 
                      rows="3" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Qaydanın ətraflı izahını bura yazın..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Maaş Kəsintisi / Cərimə Hökmü</label>
                    <textarea 
                      rows="2" 
                      value={penaltyText} 
                      onChange={(e) => setPenaltyText(e.target.value)} 
                      placeholder="Qayda pozulsa tətbiq olunacaq maaş kəsintisini bura yazın..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Təlimat İzahı (Mətn Notu)</label>
                    <textarea 
                      rows="4" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Addım-addım təlimat bəndlərini yazın (Hər addımı yeni sətirdən başlayaraq yazın)..."
                      required
                    />
                  </div>

                  {/* FILE UPLOAD INPUTS - Added as requested */}
                  <div className="form-row">
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Video size={14} /> Video Dərslik Yüklə</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoUpload}
                          style={{ display: 'none' }}
                          id="video-upload-file"
                        />
                        <label 
                          htmlFor="video-upload-file" 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                        >
                          <Upload size={12} /> Fayl Seçin
                        </label>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                          {uploadedVideo || 'Seçilməyib'}
                        </span>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Image size={14} /> Kaver Şəkil Yüklə</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          id="image-upload-file"
                        />
                        <label 
                          htmlFor="image-upload-file" 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                        >
                          <Upload size={12} /> Fayl Seçin
                        </label>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                          {uploadedImage || 'Seçilməyib'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Əlavə Et</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Instructions;

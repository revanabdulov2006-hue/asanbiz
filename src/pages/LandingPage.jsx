import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Play, Users, ShieldCheck, DeviceMobile, Lightning,
  Buildings, Hourglass, Receipt, Cpu, ChartLineUp,
  CloudArrowUp, BellRinging, Check,
  FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo,
  List, X, Star, Question,
  Sparkle, Robot, Package, ClipboardText,
  Envelope, Phone
} from '@phosphor-icons/react';
import BlurText from '../components/landing/BlurText';
import ScrollStack, { ScrollStackItem } from '../components/landing/ScrollStack';
import Carousel from '../components/landing/Carousel';
import ContainerScroll from '../components/landing/ContainerScroll';
import CircularGallery from '../components/landing/CircularGallery';
import StaggerFeatures from '../components/landing/StaggerFeatures';
import './LandingPage.css';

/* ─── Scroll-reveal (Jakub recipe) ─────────────────── */
const FadeIn = ({ children, delay = 0, className = '', style }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-72px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ type: 'spring', duration: 0.55, bounce: 0, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

/* ─── DATA ──────────────────────────────────────────── */
const FEEDBACKS = [
  {
    name: 'Leyla Məmmədova', company: 'Şirin Çörək Evi', role: 'Qurucu',
    text: 'AsanBiznesim sayəsində mağazalarımızda gündəlik un və çörək satışını, smen hesabatlarını itkisiz izləyirik. Hər şey çox sadədir!',
    rating: 5, bg: 'linear-gradient(135deg,#06b6d4,#3b82f6)'
  },
  {
    name: 'İlqar Qasımov', company: 'Meyvəli Topdan', role: 'Direktor',
    text: 'Tədarükçü borclarının izlənilməsi və son istifadə tarixi keçən məhsulların idarəsi çox rahat oldu. Xərclərimiz 20% azaldı.',
    rating: 5, bg: 'linear-gradient(135deg,#8b5cf6,#d946ef)'
  },
  {
    name: 'Rəşad Əliyev', company: 'Südlük Süd MMC', role: 'Satış Rəhbəri',
    text: 'Bulud sinxronizasiyası sayəsində anbar sayımunu və kassa kəsirlərini telefonumdan anlıq görə bilirəm.',
    rating: 5, bg: 'linear-gradient(135deg,#10b981,#059669)'
  },
  {
    name: 'Nigar Hüseynova', company: 'Grand Market', role: 'Menecer',
    text: 'İşçilərə verdiyimiz günlük işlərin foto-təsdiqlə tamamlanmasını izləmək keyfiyyəti artırdı. Hər kəsə tövsiyə edirəm!',
    rating: 5, bg: 'linear-gradient(135deg,#f59e0b,#d97706)'
  },
  {
    name: 'Elçin Fərzəliyev', company: 'Qida Təchizat ASC', role: 'Direktor',
    text: 'Səsli bildiriş sistemi və AI köməkçisi hesabatları anında çatdırır. Biznesimizin əvəzolunmaz köməkçisidir.',
    rating: 5, bg: 'linear-gradient(135deg,#ef4444,#b91c1c)'
  }
];

const PAIN_POINTS = [
  { icon: <Users size={20} weight="duotone" />, title: 'İşçi Nəzarəti Problemi', desc: 'Kim gəldi, kim işi bitirdi? Şəkilli təsdiq olmadıqda hər şey təxminə çevrilir.' },
  { icon: <Hourglass size={20} weight="duotone" />, title: 'Anbar İtkisi (Sroun Keçməsi)', desc: 'Son istifadə tarixlərini izləyə bilməmək hər ay yüzlərlə manatlıq zay məhsul itkisinə yol açır.' },
  { icon: <Receipt size={20} weight="duotone" />, title: 'Borcları İzləyə Bilməmək', desc: 'Faktura itkiləri, təchizatçı borcları, aşılan aylıq limitlər biznesin nəzarətdən çıxmasına gətirir.' },
  { icon: <Buildings size={20} weight="duotone" />, title: 'Dəftər-Kağız Xaosu', desc: 'Dağınıq qeyd kağızları həm vaxt itkisi, həm də ciddi hesablama xətalarıdır.' },
  { icon: <ChartLineUp size={20} weight="duotone" />, title: 'Tapşırıqların Gecikməsi', desc: 'İşçi performansını, anbar sayımını və növbə hesabatlarını real vaxtda izləmək mümkün olmur.' },
  { icon: <Cpu size={20} weight="duotone" />, title: 'Məlumatın Dağınıqlığı', desc: 'Notlar bir yerdə, hesabatlar WhatsApp-da, fakturalar isə siyirmədə. Axtarmaq saatlar aparır.' },
];

const SOLUTIONS = [
  {
    step: '01', icon: <Package size={22} weight="duotone" />,
    title: 'Hesabınızı Yaradın',
    desc: 'Kart tələb olunmur. Cəmi 1 dəqiqədə pulsuz hesabınızı açın - 30 günlük tam limitsiz sınaq başlayır.',
    action: '/register', actionText: '30 Gün Pulsuz Sına', img: '/img/Photo landing page.png'
  },
  {
    step: '02', icon: <ClipboardText size={22} weight="duotone" />,
    title: 'Biznesinizi Sistemdə Yaradın',
    desc: 'Firmaları, tapşırıqları, işçiləri, borcları - hamısını 5-10 dəqiqədə sistemə daxil edin.',
    action: null, actionText: 'Demo İzlə', img: '/img/ilqar.png'
  },
  {
    step: '03', icon: <BellRinging size={22} weight="duotone" />,
    title: 'Günlük Nəzarəti Başladın',
    desc: 'Kassirləriniz smen sonunda hesabatları, biznesinizə daxil olan malları, foto-təsdiqli tapşırıqları sistemə yükləsin.',
    action: '/register', actionText: 'Sistemi İndi Sına', img: '/img/Günlük tapşırıqlar.svg'
  },
  {
    step: '04', icon: <Robot size={22} weight="duotone" />,
    title: 'Uzaqdan 24/7 Nəzarət Edin',
    desc: 'Dünyanın istənilən yerindən kassa kəsirlərini, borcları, srok itkisini real zamanda izləyin. AI ilə işlərinizi avtomatlaşdırın.',
    action: '/login', actionText: 'Sistemə Daxil Ol', img: '/img/screenshot.png'
  }
];

const FEATURES = [
  { icon: <Lightning size={24} weight="duotone" />, title: 'Real-Time Hesabatlar', desc: 'Kassa, anbar və smen nəticələrini saniyələr içində görün.' },
  { icon: <BellRinging size={24} weight="duotone" />, title: 'Ağıllı Səsli Bildirişlər', desc: 'Kritik hadisələr baş verəndə AI sizə dərhal xəbər verir.' },
  { icon: <DeviceMobile size={24} weight="duotone" />, title: '100% Mobil Responsiv', desc: 'İstənilən cihazdan, istənilən yerdən tam funksional giriş.' },
  { icon: <Users size={24} weight="duotone" />, title: 'Çox-İstifadəçili Giriş', desc: 'Müdir, kassir, satıcı - hər rol üçün ayrı icazə sistemi.' },
  { icon: <CloudArrowUp size={24} weight="duotone" />, title: 'Bulud Sinxronizasiyası', desc: 'Məlumatlarınız anlıq buluda yüklənir - heç nə itirilmir.' },
  { icon: <ShieldCheck size={24} weight="duotone" />, title: '256-bit SSL Təhlükəsizlik', desc: 'Bank səviyyəli şifrələmə ilə bütün məlumatlarınız qorunur.' },
  { icon: <Robot size={24} weight="duotone" />, title: 'AI Avtomatlaşdırma', desc: 'Süni intellekt köməkçisi analizi avtomatik aparır, tövsiyələr verir.' },
];

const FAQ_DATA = [
  { q: 'Sistem necə işləyir?', a: 'AsanBiznesim bulud əsaslı idarəetmə sistemidir. Qeydiyyatdan keçdikdən sonra anbarınızı, firmalarınızı və smen hesabatlarınızı heç bir texniki bilik tələb olunmadan brauzerinizdən idarə edə bilərsiniz.' },
  { q: 'Mobil tətbiq varmı?', a: 'Bəli, AsanBiznesim platforması 100% mobil responsivdir. Smartfon, planşet və ya noutbukdan brauzer vasitəsilə bütün funksiyalara daxil olub idarə edə bilərsiniz.' },
  { q: 'Məlumatlar təhlükəsizdir?', a: 'Məlumatlarınızın təhlükəsizliyi əsas prioritetimizdir. Bütün məlumat mübadiləsi 256-bit SSL ilə qorunur, hər gün avtomatik ehtiyat nüsxələri bulud serverlərimizdə saxlanılır.' },
  { q: 'Dəstək xidməti varmı?', a: 'Bəli, bütün müştərilərimiz üçün 24/7 peşəkar texniki dəstək mövcuddur. Hər hansı sualınız olduqda platforma daxilindən dəstək ala bilərsiniz.' },
  { q: 'İstənilən cihazda işləyir?', a: 'Bəli. Köhnə noutbuk, yeni smartfon - AsanBiznesim optimallaşdırılmış kod strukturu sayəsində hər internet cihazında yüksək sürətlə işləyir.' },
];

const TRUSTED_GALLERY = [
  { image: 'https://picsum.photos/seed/sudluk/800/600', text: 'Südlük Süd MMC' },
  { image: 'https://picsum.photos/seed/sirin/800/600', text: 'Şirin Çörək Evi' },
  { image: 'https://picsum.photos/seed/grandmkt/800/600', text: 'Grand Market' },
  { image: 'https://picsum.photos/seed/meyveli/800/600', text: 'Meyvəli Topdan' },
  { image: 'https://picsum.photos/seed/qidatex/800/600', text: 'Qida Təchizat ASC' },
];

/* ─── MAIN COMPONENT ────────────────────────────────── */
export const LandingPage = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleDemo = (e) => {
    if (e) e.preventDefault();
    const res = loginAsDemo();
    if (res.success) navigate('/app');
  };

  return (
    <div className="lp-root">
      {/* Ambient background */}
      <div className="lp-ambient" aria-hidden="true">
        <div className="lp-ambient-blob lp-ambient-blob-1" />
        <div className="lp-ambient-blob lp-ambient-blob-2" />
      </div>

      {/* ── NAVBAR ──────────────────────────────────── */}
      <div className="lp-nav-wrapper">
        <nav className="lp-nav-island" role="navigation">
          <a href="#hero" className="lp-nav-logo">
            <img src="/img/logo.svg" alt="AsanBiznesim loqosu" onError={e => e.target.style.display='none'} />
            <span>AsanBiznesim</span>
          </a>

          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Özəlliklər</a>
            <a href="#solution" className="lp-nav-link">Həllər</a>
            <a href="#pricing" className="lp-nav-link">Qiymətlər</a>
            <a href="#faq" className="lp-nav-link">FAQ</a>
            <a href="#founders" className="lp-nav-link">Qurucular</a>
          </div>

          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
              Daxil Ol
            </button>
            <button className="lp-btn-primary lp-nav-hide-mobile" onClick={() => navigate('/register')}>
              Pulsuz Başla
              <span className="lp-btn-icon-wrap" aria-hidden="true">
                <ArrowRight size={12} weight="bold" />
              </span>
            </button>
            <button
              className="lp-mobile-toggle"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Menyunu bağla' : 'Menyunu aç'}
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.span key="x" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }} transition={{ duration:0.15 }}><X size={18} weight="bold" /></motion.span>
                  : <motion.span key="m" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }} transition={{ duration:0.15 }}><List size={18} weight="bold" /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <a href="#features" className="lp-mobile-menu-link" onClick={() => setMenuOpen(false)}>Özəlliklər</a>
        <a href="#solution" className="lp-mobile-menu-link" onClick={() => setMenuOpen(false)}>Həllər</a>
        <a href="#pricing" className="lp-mobile-menu-link" onClick={() => setMenuOpen(false)}>Qiymətlər</a>
        <a href="#faq" className="lp-mobile-menu-link" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a href="#founders" className="lp-mobile-menu-link" onClick={() => setMenuOpen(false)}>Qurucular</a>
        <div className="lp-mobile-menu-btns">
          <button className="lp-btn-primary-lg" onClick={() => { setMenuOpen(false); navigate('/register'); }}>
            Pulsuz Başla
          </button>
          <button className="lp-btn-outline-lg" onClick={() => { setMenuOpen(false); navigate('/login'); }}>
            Sistemə Daxil Ol
          </button>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────── */}
      <section id="hero" className="lp-hero">
        <ContainerScroll
          titleComponent={
            <div className="lp-hero-center">
              <FadeIn delay={0}>

              </FadeIn>

              <BlurText
                text="Biznesinizi dəftər-kağız ve WhatsApp xaosundan çıxarın."
                delay={80}
                animateBy="words"
                direction="top"
                stepDuration={0.4}
                className="lp-hero-h1"
                style={{ margin: '0 auto', justifyContent: 'center' }}
              />

              <FadeIn delay={0.1}>
                <p className="lp-hero-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
                  Biznesinizi parçalanmış sistemlərlə deyil, vahid ekosistemlə idarə edin.
Anbar, işçilər, maliyyə, tədarük və smena hesabatları — hamısı bir platformada.
                </p>
              </FadeIn>

              <FadeIn delay={0.14}>
                <div className="lp-hero-ctas" style={{ justifyContent: 'center' }}>
                  <button className="lp-hero-cta-primary" onClick={() => navigate('/register')}>
                    30 Gün Pulsuz Sınaq
                    <ArrowRight size={16} weight="bold" />
                  </button>
                  <button className="lp-hero-cta-secondary" onClick={handleDemo}>
                    <Play size={14} weight="fill" />
                    Göz at
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.18}>
                
              </FadeIn>
            </div>
          }
        >
          <img
            src="/img/screenhero.png"
            alt="AsanBiznesim idarəetmə paneli"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
            onError={e => e.target.style.opacity = '0'}
          />
        </ContainerScroll>
      </section>

      {/* ── TRUSTED BY ──────────────────────────────── */}
      <div className="lp-trusted">
        <p className="lp-trusted-label">Azərbaycanın modern biznesləri bizə inanır</p>
        <div className="lp-trusted-gallery-wrap">
          <CircularGallery
            items={TRUSTED_GALLERY}
            bend={3}
            textColor="#16A34A"
            borderRadius={0.05}
            scrollEase={0.03}
            font="bold 24px Plus Jakarta Sans"
            fontUrl="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap"
          />
        </div>
      </div>

      {/* ── PAIN POINTS ─────────────────────────────── */}
      <section className="lp-section">
        <FadeIn>
          <div className="lp-pain-header">
            <span className="lp-eyebrow">Gündəlik Problemlər</span>
            <h2 className="lp-heading">Biznesinizdə bunlarla vaxt itirirsiniz?</h2>
            <p className="lp-subtext">
              Probleminiz işin çoxluğu deyil. Probleminiz köhnəlmiş idarəetmə sistemidir. O isə hər gün sizdən vaxtınızı, qazancınızı və enerjinizi alır.
            </p>
          </div>
        </FadeIn>

        <div className="lp-pain-scroll-wrap">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={60}
            itemStackDistance={28}
            stackPosition="18%"
            scaleEndPosition="8%"
            baseScale={0.90}
            itemScale={0.025}
          >
            {PAIN_POINTS.map((p, i) => (
              <ScrollStackItem key={i} itemClassName="lp-pain-stack-card">
                <div className="lp-pain-icon">{p.icon}</div>
                <h3 className="lp-pain-title">{p.title}</h3>
                <p className="lp-pain-desc">{p.desc}</p>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      {/* ── SOLUTIONS ───────────────────────────────── */}
      <section id="solution" className="lp-section">
        <FadeIn>
          <div className="lp-solutions-header">
            <span className="lp-eyebrow">Sürətli Başlanğıc</span>
            <h2 className="lp-heading">Sistem necə işləyir?</h2>
            <p className="lp-subtext" style={{ margin: '0 auto' }}>
              AsanBiznesim-də cəmi 4 addımla biznesinizi tam rəqəmsal idarəçiliyə keçirin.
            </p>
          </div>
        </FadeIn>

        <div className="lp-solutions-list">
          {SOLUTIONS.map((s, i) => (
            <FadeIn key={i}>
              <div className={`lp-solution-row${i % 2 !== 0 ? ' reversed' : ''}`}>
                <div className="lp-solution-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="lp-solution-step">{s.step}</div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--lp-surface)', border: '1px solid rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lp-accent)' }}>{s.icon}</div>
                  </div>
                  <h3 className="lp-solution-title">{s.title}</h3>
                  <p className="lp-solution-desc">{s.desc}</p>
                  <button
                    className="lp-solution-action"
                    onClick={() => s.action ? navigate(s.action) : handleDemo()}
                  >
                    {s.actionText} <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
                <div className="lp-solution-visual">
                  <div className="lp-bezel-outer">
                    <div className="lp-bezel-inner">
                      <img
                        src={s.img}
                        alt={s.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <div id="features" className="lp-features-bg">
        <div className="lp-section">
          <FadeIn>
            <div className="lp-features-header">
              <span className="lp-eyebrow">Texnoloji Üstünlüklər</span>
              <h2 className="lp-heading">İşinizi asanlaşdıran funksiyalar</h2>
            </div>
          </FadeIn>
          <StaggerFeatures items={FEATURES} />
        </div>
      </div>

      {/* ── METRICS ─────────────────────────────────── */}
      <div className="lp-metrics">
        <div className="lp-metrics-inner">
          {[
            { value: '150+', label: 'Aktiv İstifadəçi' },
            { value: '₼148k+', label: 'İdarə olunan Əməliyyat' },
            { value: '26%', label: 'Daha Az Anbar İtkisi' },
            { value: '24/7', label: 'Peşəkar Texniki Dəstək' },
          ].map((m, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div className="lp-metric-item">
                <div className="lp-metric-value">{m.value}</div>
                <div className="lp-metric-label">{m.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section className="lp-section">
        <FadeIn>
          <div className="lp-testimonials-header">
            <span className="lp-eyebrow">Müştəri Rəyləri</span>
            <h2 className="lp-heading">Müştərilərimiz nə deyir?</h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="lp-carousel-wrap">
            <Carousel
              items={FEEDBACKS.map((f, i) => ({
                id: i,
                title: f.name,
                subtitle: `${f.company} · ${f.role}`,
                description: `"${f.text}"`,
                icon: <Star size={14} weight="fill" style={{ color: '#16A34A' }} />
              }))}
              baseWidth={480}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
            />
          </div>
        </FadeIn>
      </section>

      {/* ── PRICING ─────────────────────────────────── */}
      <div id="pricing" className="lp-features-bg">
        <div className="lp-section">
          <FadeIn>
            <div className="lp-pricing-header">
              <span className="lp-eyebrow">Tarif Planları</span>
              <h2 className="lp-heading">Biznesinizə uyğun qiymətlər</h2>
              <p className="lp-subtext" style={{ margin: '0 auto' }}>
              Sizə ən uyğun planı seçib anında başlayın.
              </p>
            </div>
          </FadeIn>

          <div className="lp-pricing-grid">
            {/* Free */}
            <FadeIn delay={0}>
              <div className="lp-pricing-card" style={{ height: '100%' }}>
                <span className="lp-pricing-badge free">Pulsuz</span>
                <div>
                  <div className="lp-pricing-name">Mikro sahibkarlar</div>
                  <div className="lp-pricing-desc">Yeni açılan, kiçik fərdi fəaliyyət nöqtələri üçün.</div>
                </div>
                <div className="lp-pricing-price">
                  <span className="lp-price-value">₼ 0</span>
                  <span className="lp-price-period">/ ömürlük</span>
                </div>
                <div className="lp-pricing-divider" />
                <ul className="lp-pricing-features">
                  {['1 Aktiv İstifadəçi', 'Aylıq 20 Faktura', 'Anbar tarix izlənməsi', 'Görülməli işlər siyahısı'].map(f => (
                    <li key={f} className="lp-pricing-feat">
                      <span className="lp-pricing-check"><Check size={10} weight="bold" /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="lp-pricing-btn secondary" onClick={() => navigate('/register')}>Pulsuz Başla</button>
              </div>
            </FadeIn>

            {/* Featured */}
            <FadeIn delay={0.06}>
              <div className="lp-pricing-card featured" style={{ height: '100%' }}>
                <span className="lp-pricing-badge popular">Populyar</span>
                <div>
                  <div className="lp-pricing-name">Kiçik sahibkarlar</div>
                  <div className="lp-pricing-desc">Böyüyən, işçi heyəti olan kiçik və orta bizneslər üçün.</div>
                </div>
                <div className="lp-pricing-price">
                  <span className="lp-price-value">₼ 19</span>
                  <span className="lp-price-period">/ aylıq</span>
                </div>
                <div className="lp-pricing-divider" />
                <ul className="lp-pricing-features">
                  {['3 Aktiv Əməkdaş', 'Aylıq 45 Fakturalar', 'Dövrüyənin izlənməsi', 'Tapşırıqların izlənməsi', 'Anbar Tarix İzlənməsi'].map(f => (
                    <li key={f} className="lp-pricing-feat">
                      <span className="lp-pricing-check"><Check size={10} weight="bold" /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="lp-pricing-btn primary" onClick={() => navigate('/register')}>30 Gün Pulsuz Sına</button>
              </div>
            </FadeIn>

            {/* Max */}
            <FadeIn delay={0.12}>
              <div className="lp-pricing-card" style={{ height: '100%' }}>
                <span className="lp-pricing-badge max">Maksimum</span>
                <div>
                  <div className="lp-pricing-name">Böyük bizneslər</div>
                  <div className="lp-pricing-desc">Yüksək dövrüyəsi olan, topdan satış, 3 və daha çox əməkdaşlı bizneslər üçün.</div>
                </div>
                <div className="lp-pricing-price">
                  <span className="lp-price-value">₼ 49</span>
                  <span className="lp-price-period">/ aylıq</span>
                </div>
                <div className="lp-pricing-divider" />
                <ul className="lp-pricing-features">
                  {['Limitsiz İstifadəçi', 'Fərdi Tapşırıq Sistemi', 'Tam AI Avtomatlaşdırma', '100MB Sənəd Yükləmə', 'VIP 24/7 Dəstək Meneceri'].map(f => (
                    <li key={f} className="lp-pricing-feat">
                      <span className="lp-pricing-check"><Check size={10} weight="bold" /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="lp-pricing-btn secondary" onClick={() => navigate('/login')}>Müəssisə ilə Əlaqə</button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section id="faq" className="lp-section">
        <div className="lp-faq-layout">
          <FadeIn>
            <div className="lp-faq-left">
              <span className="lp-eyebrow">Kömək lazımdır?</span>
              <h2 className="lp-heading">Tez-tez soruşulan suallar</h2>
              <p className="lp-subtext">
                Platformamız haqqında tez-tez verilən sualların cavabları ilə tanış olun.
              </p>

              <div style={{ marginTop: '32px' }}>
                <div className="lp-faq-support">
                  <div className="lp-faq-support-icon">
                    <Question size={26} weight="duotone" />
                  </div>
                  <div className="lp-faq-support-title">Başqa sualınız var?</div>
                  <p className="lp-faq-support-desc">
                    Axtardığınız cavabı tapa bilmədinizsə, 24/7 dəstək komandamızla əlaqə saxlayın.
                  </p>
                  <div className="lp-faq-contacts">
                    <a href="mailto:support@asanbiznesim.az" className="lp-faq-contact-link">
                      <Envelope size={16} /> support@asanbiznesim.az
                    </a>
                    <a href="tel:+994501112233" className="lp-faq-contact-link">
                      <Phone size={16} /> +994 50 111 22 33
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="lp-faq-right">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="lp-faq-item">
                  <button
                    className="lp-faq-trigger"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    aria-expanded={activeFaq === i}
                  >
                    <span>{item.q}</span>
                    <span className="lp-faq-icon">
                      {activeFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  <div className={`lp-faq-answer${activeFaq === i ? ' open' : ''}`}>
                    <p className="lp-faq-answer-text">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOUNDERS ────────────────────────────────── */}
      <section id="founders" className="lp-section">
        <FadeIn>
          <div className="lp-founders-header">
            <span className="lp-eyebrow">Biz Kimik?</span>
            <h2 className="lp-heading">Qurucularımız</h2>
            <p className="lp-subtext" style={{ margin: '0 auto' }}>
              AsanBiznesim platformasını Azərbaycanın KOB sektoru üçün yaradan peşəkar komanda.
            </p>
          </div>
        </FadeIn>

        <div className="lp-founders-grid">
          {[
            {
              name: 'Rəvan Abdulzadə', role: 'Təsisçi və Baş Rəhbər (CEO)',
              img: '/img/founder1.png', abbr: 'AS',
              quote: 'Bizneslərin dəftər-kağız xaosundan çıxaraq bulud sistemlərinə keçməsi sadəcə rahatlıq deyil, gəlirlərin qorunmasıdır.'
            },
            {
              name: 'İlqar Hacıyev', role: 'Həm-Təsisçi və Texniki Rəhbər (CTO)',
              img: '/img/founder2.png', abbr: 'LR',
              quote: 'Ağıllı alqoritmlər və güclü sinxronizasiya arxitekturası sahibkarlarımıza 100% təhlükəsizlik və mobil sürət təmin edir.'
            }
          ].map((f, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="lp-founder-card">
                <div className="lp-founder-avatar-wrap">
                  <img
                    src={f.img}
                    alt={f.name}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div class="lp-founder-avatar-fallback">${f.abbr}</div>`;
                    }}
                  />
                </div>
                <div>
                  <div className="lp-founder-name">{f.name}</div>
                  <div className="lp-founder-role">{f.role}</div>
                </div>
                <blockquote className="lp-founder-quote">"{f.quote}"</blockquote>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────── */}
      <div className="lp-cta-section">
        <div className="lp-cta-inner">
          <FadeIn>
            <span className="lp-cta-eyebrow">Gözləməyə dəyməz</span>
          </FadeIn>
          <FadeIn delay={0.06}>
            <h2 className="lp-cta-heading">
              Biznesinizi rəqəmsallaşdırmağa bu gün başlayın.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="lp-cta-sub">
              Dəftər-kağız xaosu əvəzinə modern, premium idarəetmə sistemi ilə gəlirlərinizi artırın.
            </p>
          </FadeIn>
          <FadeIn delay={0.14}>
            <button className="lp-cta-btn" onClick={() => navigate('/register')}>
              İndi Başla (30 Gün Pulsuz)
              <ArrowRight size={16} weight="bold" />
            </button>
          </FadeIn>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div className="lp-footer-brand">
            <a href="#hero" className="lp-footer-logo">
              <img src="/img/logo.svg" alt="AsanBiznesim" onError={e => e.target.style.display='none'} />
              <span className="lp-footer-logo-text">AsanBiznesim</span>
            </a>
            <p className="lp-footer-brand-desc">
              Azərbaycan biznesləri üçün optimallaşdırılmış, bulud əsaslı professional idarəetmə ekosistemi. Dəftər-kağız xaosuna son.
            </p>
            <div className="lp-footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="Facebook"><FacebookLogo size={16} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="Instagram"><InstagramLogo size={16} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="LinkedIn"><LinkedinLogo size={16} /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="YouTube"><YoutubeLogo size={16} /></a>
            </div>
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Məhsul</div>
            <a href="#features" className="lp-footer-link">Özəlliklər</a>
            <a href="#solution" className="lp-footer-link">Həllər</a>
            <a href="#pricing" className="lp-footer-link">Tariflər</a>
            <a href="#" className="lp-footer-link" onClick={e => { e.preventDefault(); handleDemo(); }}>Demo Sistem</a>
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Şirkət</div>
            <a href="#founders" className="lp-footer-link">Haqqımızda</a>
            <a href="#" className="lp-footer-link">Karyera</a>
            <a href="#" className="lp-footer-link">Bloq</a>
            <a href="#" className="lp-footer-link">Tərəfdaşlıq</a>
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Əlaqə</div>
            <a href="#" className="lp-footer-link">Dəstək Mərkəzi</a>
            <span className="lp-footer-link" style={{ cursor: 'default' }}>Bakı, Nərimanov r.</span>
            <a href="mailto:support@asanbiznesim.az" className="lp-footer-link">support@asanbiznesim.az</a>
            <a href="tel:+994501112233" className="lp-footer-link">+994 50 111 22 33</a>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span className="lp-footer-copy">
            &copy; {new Date().getFullYear()} AsanBiznesim MMC. Bütün hüquqlar qorunur.
          </span>
          <div className="lp-footer-legal">
            <a href="#">İstifadəçi Razılaşması</a>
            <a href="#">Gizlilik Siyasəti</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

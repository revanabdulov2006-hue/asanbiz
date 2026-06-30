import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  DollarSign, 
  CreditCard, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CalendarDays,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import './Pages.css';
import './Analytics.css';

export const Analytics = () => {
  const { invoices, companies, debts, payments, expenses, shiftReports } = useStore();

  const [activeTab, setActiveTab] = useState('financial'); // 'financial' or 'shifts'
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [selectedCompanyId, setSelectedCompanyId] = useState('All'); // All or MMC company id

  // 1. FILTERING DATA DYNAMICALLY BASED ON VIEWPORT CONTROLS
  const filteredInvoices = invoices.filter((inv) => {
    const isCompanyMatch = selectedCompanyId === 'All' || inv.companyId === Number(selectedCompanyId);
    const isDateMatch = (!startDate || inv.date >= startDate) && (!endDate || inv.date <= endDate);
    return isCompanyMatch && isDateMatch;
  });

  const filteredPayments = payments.filter((pay) => {
    const isCompanyMatch = selectedCompanyId === 'All' || pay.companyId === Number(selectedCompanyId);
    const isDateMatch = (!startDate || pay.date >= startDate) && (!endDate || pay.date <= endDate);
    return isCompanyMatch && isDateMatch;
  });

  // Filter shift reports based on date range
  const filteredShiftReports = (shiftReports || []).filter((rep) => {
    const isDateMatch = (!startDate || rep.date >= startDate) && (!endDate || rep.date <= endDate);
    return isDateMatch;
  });

  // 2. FINANCIAL STATS CALCULATIONS FOR THE KPI CARDS
  const totalPurchase = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalReturn = filteredInvoices.reduce((sum, inv) => sum + Number(inv.returnAmount || 0), 0);
  const netPurchase = Math.max(0, totalPurchase - totalReturn);
  const totalPayments = filteredPayments.reduce((sum, pay) => sum + Number(pay.amount || 0), 0);

  // Remaining Credit Debt generated within this filtered period
  const totalCreditRemaining = filteredInvoices.reduce((sum, inv) => {
    if (inv.paymentType === 'Nağd') return sum;
    if (inv.paymentType === 'Qarışıq') return sum + Number(inv.creditRemaining || 0);
    return sum + (Number(inv.amount || 0) - Number(inv.returnAmount || 0)); // Nisyə is full net sum
  }, 0);

  // Shift Reports Calculations
  const totalShiftSales = filteredShiftReports.reduce((sum, r) => sum + (r.cashSales + r.cardSales), 0);
  const totalShiftCash = filteredShiftReports.reduce((sum, r) => sum + r.cashSales, 0);
  const totalShiftCard = filteredShiftReports.reduce((sum, r) => sum + r.cardSales, 0);
  const totalShiftDiscrepancy = filteredShiftReports.reduce((sum, r) => sum + r.discrepancy, 0);

  // 3. MONTH-OVER-MONTH DYNAMIC TREND DATA COMPILATION
  const momData = [
    { name: 'Mart 2026', 'Alış Həcmi': 2800, 'Qaytarma': 120, 'Net Alış': 2680, 'Ödənişlər': 2400 },
    { name: 'Aprel 2026', 'Alış Həcmi': 3400, 'Qaytarma': 180, 'Net Alış': 3220, 'Ödənişlər': 2900 },
    { name: 'May 2026 (Cari)', 'Alış Həcmi': totalPurchase, 'Qaytarma': totalReturn, 'Net Alış': netPurchase, 'Ödənişlər': totalPayments }
  ];

  // Chart data for Daily Shift Sales Trend
  const shiftTrendData = [...filteredShiftReports].reverse().map(r => ({
    name: `${r.date.substring(5)} (${r.shift === 'Gündüz smeni' ? 'Gün' : 'Gecə'})`,
    'Nağd Satış': r.cashSales,
    'Kartla Satış': r.cardSales,
    'Toplam Alver': r.cashSales + r.cardSales,
    'Kassa Fərqi': r.discrepancy
  }));

  // Chart data for Ratio
  const shiftRatioData = [
    { name: 'Nağd Satış', value: totalShiftCash },
    { name: 'Kartla Satış', value: totalShiftCard }
  ];

  // Calculate Growth dynamics
  const aprilNet = 3220;
  const growthRate = aprilNet > 0 ? (((netPurchase - aprilNet) / aprilNet) * 100) : 0;
  const isGrowth = growthRate >= 0;

  // 4. SUPPLIER PURCHASE SHARE DATA PREPARATION
  const companyDistribution = companies.map((comp) => {
    const compInvoices = filteredInvoices.filter(i => i.companyId === comp.id);
    const compNet = compInvoices.reduce((sum, inv) => sum + (Number(inv.amount || 0) - Number(inv.returnAmount || 0)), 0);
    return {
      name: comp.name,
      value: compNet
    };
  }).filter(c => c.value > 0);

  // Palette colors for Pie Charts
  const COLORS = ['#166534', '#22c55e', '#f59e0b', '#3b82f6', '#0ea5e9', '#8b5cf6'];

  // 5. INVOICES VS PAYMENTS PER COMPANY DATA PREPARATION
  const companyFinanceRatio = companies.map((comp) => {
    const compInvoices = filteredInvoices.filter(i => i.companyId === comp.id);
    const compNet = compInvoices.reduce((sum, inv) => sum + (Number(inv.amount || 0) - Number(inv.returnAmount || 0)), 0);
    
    const compPayments = filteredPayments.filter(p => p.companyId === comp.id);
    const compPaySum = compPayments.reduce((sum, pay) => sum + Number(pay.amount || 0), 0);

    return {
      name: comp.name.replace(' MMC', '').substring(0, 14),
      'Alınan Mal': compNet,
      'Edilən Ödəniş': compPaySum
    };
  }).filter(c => c['Alınan Mal'] > 0 || c['Edilən Ödəniş'] > 0);

  // 6. OPERATIONAL OVERHEAD EXPENSE CATEGORY DATA PREPARATION
  const expenseCategories = [
    { name: 'Maaşlar', value: 2400 },
    { name: 'İcarə', value: 1500 },
    { name: 'Kommunal', value: 350 },
    { name: 'Reklam / Pazarlama', value: 200 },
    { name: 'Nəqliyyat', value: 120 }
  ];

  return (
    <motion.div 
      className="page-container fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Title */}
      <div className="page-title-row">
        <div>
          <h1 className="page-heading">Maliyyə Analizi və Hesabatlar</h1>
          <p className="page-subheading">Alış həcmləri, kassa alverləri, ödəniş balansları və smen hesabatlarının idarəetmə lövhəsi</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="tabs-header-row" style={{ marginBottom: 'var(--spacing-md)' }}>
        <button 
          className={`tab-pill-btn ${activeTab === 'financial' ? 'active' : ''}`} 
          onClick={() => setActiveTab('financial')}
        >
          <TrendingUp size={16} /> Maliyyə və Dövriyyə Analizi
        </button>
        <button 
          className={`tab-pill-btn ${activeTab === 'shifts' ? 'active' : ''}`} 
          onClick={() => setActiveTab('shifts')}
        >
          <ClipboardList size={16} /> Smen Hesabatı (Açot) Analizləri
        </button>
      </div>

      {/* TIMELINE FILTERS BAR */}
      <div className="analytics-filter-bar glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={18} className="text-muted" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Axtarış və Hesabat İntervalı:</span>
        </div>
        
        <div className="filters-group">
          {activeTab === 'financial' && (
            <div className="filter-item">
              <label>Firma</label>
              <select 
                value={selectedCompanyId} 
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              >
                <option value="All">Bütün Tərəfdaşlar</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="filter-item">
            <label>Başlanğıc Tarixi</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>

          <div className="filter-item">
            <label>Bitmə Tarixi</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* FINANCIAL ANALYSIS TAB */}
      {activeTab === 'financial' && (
        <>
          {/* KPI STATISTICS METRIC CARDS */}
          <div className="kpi-cards-grid">
            {/* KPI 1: Total Gross Purchase */}
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-purchase">
                <FileText size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Toplam Alış</span>
                <span className="kpi-value">₼ {totalPurchase.toFixed(2)}</span>
              </div>
            </div>

            {/* KPI 2: Total Returns */}
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-return">
                <RotateCcw size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Toplam Vazvrat</span>
                <span className="kpi-value" style={{ color: 'var(--color-error)' }}>₼ {totalReturn.toFixed(2)}</span>
              </div>
            </div>

            {/* KPI 3: Total Paid */}
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-payment">
                <DollarSign size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Toplam Ödəniş</span>
                <span className="kpi-value" style={{ color: 'var(--color-success)' }}>₼ {totalPayments.toFixed(2)}</span>
              </div>
            </div>

            {/* KPI 4: Net Outstanding Debt Added */}
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-debt">
                <CreditCard size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Dövri Nisyə Borc</span>
                <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>₼ {totalCreditRemaining.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* CHARTS ROW GRID */}
          <div className="charts-layout-grid">
            {/* Chart 1: MoM Net Purchase Dynamics and growth curves */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Alışların Aylıq Dinamikası və Trendi</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net hesab cəmi və aparılan ödəniş müqayisəsi</span>
                </div>
                <span className={`trend-badge ${isGrowth ? 'trend-up' : 'trend-down'}`}>
                  {isGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isGrowth ? '+' : ''}{growthRate.toFixed(1)}% {isGrowth ? 'artım' : 'azalma'}</span>
                </span>
              </div>

              <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                <ResponsiveContainer>
                  <AreaChart data={momData}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Net Alış" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Ödənişlər" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorPay)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Purchase Share by Supplier (MMC) */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Tərəfdaş Firmaların Alış Payı</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Məhsul aldığım firmaların dövri faiz bölgüsü</span>
                </div>
              </div>

              {companyDistribution.length > 0 ? (
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={companyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {companyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₼ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Seçilmiş tarixdə pay bölgüsü yoxdur.
                </div>
              )}
            </div>

            {/* Chart 3: Financial Ratio - Purchase vs Payments per Supplier */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Firma Üzrə Mal Alışı və Edilən Ödəniş Nisbəti</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Alış-Ödəniş balansının tərəfdaş MMC-lərə görə analizi</span>
                </div>
              </div>

              {companyFinanceRatio.length > 0 ? (
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <BarChart data={companyFinanceRatio} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip formatter={(value) => `₼ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Alınan Mal" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Edilən Ödəniş" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Seçilmiş tarixdə göstərici yoxdur.
                </div>
              )}
            </div>

            {/* Chart 4: Overhead Expense Category Breakdown */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Kateqoriyalara Görə Xərclər (Overhead Expenses)</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Maaşlar, İcarələr, Kommunal və digər əməliyyat xərcləri</span>
                </div>
              </div>

              <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={10}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₼ ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SMART AI INSIGHTS & STRATEGIC RECOMMENDATIONS PANEL */}
          <div className="ai-insights-card glass-panel" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <Sparkles size={20} className="text-success" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Ağıllı Maliyyə Analizi & AI Tövsiyələri</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
              Süni İntellekt mühərriki faktura dövriyyəsini, srok qalıqlarını və tərəfdaş borclarını analiz edərək sizə tövsiyələr hazırladı:
            </p>

            <div className="insights-list">
              {/* Insight 1: MoM purchase dynamic */}
              <div className="insight-item">
                <div className="insight-icon-wrapper" style={{ color: 'var(--color-primary-light)' }}>
                  <TrendingUp size={18} />
                </div>
                <div className="insight-text-wrapper">
                  <span className="insight-text-title">Alış Həcmində Müsbət Dinamika</span>
                  <span className="insight-text-desc">
                    Cari ayda alış həcminiz Aprel ayına nisbətən **+{growthRate.toFixed(1)}% artaraq** ₼ {netPurchase.toFixed(0)}-ə çatmışdır. Bu, mağazadaxili satış dövriyyəsinin müsbət istiqamətdə artdığını göstərir.
                  </span>
                </div>
              </div>

              {/* Insight 2: Limit Risk alert */}
              <div className="insight-item">
                <div className="insight-icon-wrapper" style={{ color: 'var(--color-warning)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div className="insight-text-wrapper">
                  <span className="insight-text-title">Borc Limiti Riski (Meyvə-Tərəvəz)</span>
                  <span className="insight-text-desc">
                    **Meyvə-Tərəvəz Topdan** firmasına olan borcunuz limitin 100%-ni aşaraq **₼ 3,200.00**-a çatmışdır. Yeni sifarişlərdə gecikmə yaşamamaq üçün bu firmaya yaxın müddətdə ödəniş edilməsi tövsiyə olunur.
                  </span>
                </div>
              </div>

              {/* Insight 3: Payment schedule reminders */}
              <div className="insight-item">
                <div className="insight-icon-wrapper" style={{ color: 'var(--color-accent)' }}>
                  <Lightbulb size={18} />
                </div>
                <div className="insight-text-wrapper">
                  <span className="insight-text-title">Yaxınlaşan Ödəniş Dövrləri (Ay Sonu)</span>
                  <span className="insight-text-desc">
                    Gələn həftə **"Ay sonu"** ödəniş cədvəlinə daxil olan firmaların (**Südlük Süd MMC**, **Qida Təchizat**) borc hesabatı daxil olacaq. Nağd pul axınını tənzimləmək məqsədilə kassanı hazırlamaq tövsiyə olunur.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SHIFT REPORTS ANALYSIS TAB */}
      {activeTab === 'shifts' && (
        <>
          {/* KPI CARDS FOR SHIFTS */}
          <div className="kpi-cards-grid">
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-purchase">
                <ClipboardList size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Toplam Smen Alveri</span>
                <span className="kpi-value">₼ {totalShiftSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-payment">
                <DollarSign size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Smen Sonu Nağd Satış</span>
                <span className="kpi-value" style={{ color: 'var(--color-success)' }}>₼ {totalShiftCash.toFixed(2)}</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrapper kpi-icon-debt">
                <CreditCard size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Smen Sonu Kart Satışı</span>
                <span className="kpi-value" style={{ color: 'var(--color-accent)' }}>₼ {totalShiftCard.toFixed(2)}</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className={`kpi-icon-wrapper ${totalShiftDiscrepancy < 0 ? 'kpi-icon-return' : 'kpi-icon-purchase'}`}>
                <AlertTriangle size={22} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Ümumi Kassa Fərqi</span>
                <span className="kpi-value" style={{ color: totalShiftDiscrepancy < 0 ? 'var(--color-error)' : (totalShiftDiscrepancy > 0 ? 'var(--color-warning)' : 'var(--color-success)') }}>
                  ₼ {totalShiftDiscrepancy === 0 ? '0.00' : (totalShiftDiscrepancy > 0 ? `+${totalShiftDiscrepancy.toFixed(2)}` : totalShiftDiscrepancy.toFixed(2))}
                </span>
              </div>
            </div>
          </div>

          {/* SHIFT CHARTS GRID */}
          <div className="charts-layout-grid">
            {/* Chart 1: Sales Trend */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Günlük Smen Alver Trendi</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nağd və Kart üzrə növbə sonu satış balansının analizi</span>
                </div>
              </div>
              {shiftTrendData.length > 0 ? (
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <BarChart data={shiftTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip formatter={(value) => `₼ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Nağd Satış" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Kartla Satış" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Seçilmiş tarixdə hesabat tapılmadı.
                </div>
              )}
            </div>

            {/* Chart 2: Method Distribution */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-card-header">
                <div>
                  <h3>Ödəniş Metodu Bölgüsü (Smen)</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Smen sonu real pul metodlarının faiz nisbəti</span>
                </div>
              </div>
              {totalShiftSales > 0 ? (
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={shiftRatioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="var(--color-primary)" />
                        <Cell fill="var(--color-accent)" />
                      </Pie>
                      <Tooltip formatter={(value) => `₼ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Məlumat mövcud deyil.
                </div>
              )}
            </div>

            {/* Chart 3: Discrepancy dinamikasi */}
            <div className="chart-card-wrapper glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="chart-card-header">
                <div>
                  <h3>Kassa Fərqi və Kəsirlər (Təhlil Diaqramı)</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Smenlərdə yaranmış nağd kassa kəsir və artıq göstəriciləri</span>
                </div>
              </div>
              {shiftTrendData.length > 0 ? (
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <AreaChart data={shiftTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip formatter={(value) => `₼ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                      <Area type="monotone" dataKey="Kassa Fərqi" stroke="var(--color-error)" fill="rgba(239, 68, 68, 0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Kəsir məlumatı yoxdur.
                </div>
              )}
            </div>
          </div>

          {/* REPORTS TABLE INSIDE ANALYTICS */}
          <div className="table-card glass-panel" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="table-header">
              <h3>Smen Hesabatları Reyestri</h3>
              <span className="count-badge">{filteredShiftReports.length} hesabat</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tarix</th>
                    <th>Smen</th>
                    <th>Məsul Kassir</th>
                    <th>Nağd Satış (₼)</th>
                    <th>Kartla Satış (₼)</th>
                    <th>Toplam Alver (₼)</th>
                    <th>Kassadakı Real (₼)</th>
                    <th>Kassa Fərqi (₼)</th>
                    <th>Qeyd</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShiftReports.length > 0 ? (
                    filteredShiftReports.map((rep) => {
                      const isShortage = rep.discrepancy < 0;
                      const isSurplus = rep.discrepancy > 0;
                      return (
                        <tr key={rep.id}>
                          <td className="bold-text">{rep.date}</td>
                          <td><span className="status-pill status-info">{rep.shift}</span></td>
                          <td>{rep.employeeName}</td>
                          <td>₼ {rep.cashSales.toFixed(2)}</td>
                          <td>₼ {rep.cardSales.toFixed(2)}</td>
                          <td className="bold-text">₼ {(rep.cashSales + rep.cardSales).toFixed(2)}</td>
                          <td>₼ {rep.cashInRegister.toFixed(2)}</td>
                          <td>
                            <span className={`status-pill ${isShortage ? 'status-danger' : (isSurplus ? 'status-warning' : 'status-success')}`} style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>
                              {rep.discrepancy === 0 ? 'Düzdür (0.00)' : (isSurplus ? `+${rep.discrepancy.toFixed(2)}` : rep.discrepancy.toFixed(2))}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rep.notes || '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Seçilmiş tarixdə hesabat tapılmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Analytics;


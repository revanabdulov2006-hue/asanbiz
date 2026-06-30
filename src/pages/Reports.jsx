import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  DollarSign, 
  X, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2,
  Filter,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import './Pages.css';

export const Reports = () => {
  const { shiftReports, addShiftReport, editShiftReport, deleteShiftReport, user } = useStore();

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/app" replace />;
  }

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Gündüz smeni');
  const [cashSales, setCashSales] = useState('');
  const [cardSales, setCardSales] = useState('');
  const [cashInRegister, setCashInRegister] = useState('');
  const [notes, setNotes] = useState('');

  // Filtering States
  const [filterEmployee, setFilterEmployee] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('2026-05-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-05-31');
  const [filterMonth, setFilterMonth] = useState('All');

  // Handle click to open form for editing
  const handleEditClick = (rep) => {
    setEditingReportId(rep.id);
    setDate(rep.date);
    setShift(rep.shift);
    setCashSales(rep.cashSales.toString());
    setCardSales(rep.cardSales.toString());
    setCashInRegister(rep.cashInRegister.toString());
    setNotes(rep.notes);
    setShowAddForm(true);
  };

  // Handle click to open form for adding
  const handleAddClick = () => {
    setEditingReportId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setShift('Gündüz smeni');
    setCashSales('');
    setCardSales('');
    setCashInRegister('');
    setNotes('');
    setShowAddForm(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingReportId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setShift('Gündüz smeni');
    setCashSales('');
    setCardSales('');
    setCashInRegister('');
    setNotes('');
  };

  // Handle report submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardSales || !cashInRegister || !cashSales) return;

    if (editingReportId) {
      editShiftReport(editingReportId, {
        date,
        shift,
        cashSales: Number(cashSales),
        cardSales: Number(cardSales),
        cashInRegister: Number(cashInRegister),
        employeeName: shiftReports.find(r => r.id === editingReportId)?.employeeName || user?.name || 'İşçi',
        notes
      });
    } else {
      addShiftReport({
        date,
        shift,
        cashSales: Number(cashSales),
        cardSales: Number(cardSales),
        cashInRegister: Number(cashInRegister),
        employeeName: user?.name || 'İşçi',
        notes
      });
    }

    handleCloseModal();
  };

  // Handle Quick Month Filter selection
  const handleMonthChange = (monthVal) => {
    setFilterMonth(monthVal);
    if (monthVal === 'All') {
      setFilterStartDate('2026-05-01');
      setFilterEndDate('2026-05-31');
    } else if (monthVal === '2026-05') {
      setFilterStartDate('2026-05-01');
      setFilterEndDate('2026-05-31');
    } else if (monthVal === '2026-04') {
      setFilterStartDate('2026-04-01');
      setFilterEndDate('2026-04-30');
    } else if (monthVal === '2026-03') {
      setFilterStartDate('2026-03-01');
      setFilterEndDate('2026-03-31');
    }
  };

  // Get dynamic unique list of employees from reports
  const employeeList = Array.from(new Set(shiftReports.map(r => r.employeeName)));

  // Filtered reports
  const filteredReports = shiftReports.filter((rep) => {
    if (user?.role === 'Employee' && rep.employeeName !== user?.name) {
      return false;
    }
    const isEmployeeMatch = filterEmployee === 'All' || rep.employeeName === filterEmployee;
    const isDateMatch = (!filterStartDate || rep.date >= filterStartDate) && (!filterEndDate || rep.date <= filterEndDate);
    return isEmployeeMatch && isDateMatch;
  });

  // Calculate filtered stats
  const periodTotalSales = filteredReports.reduce((sum, r) => sum + (r.cashSales + r.cardSales), 0);
  const periodTotalCash = filteredReports.reduce((sum, r) => sum + r.cashSales, 0);
  const periodTotalCard = filteredReports.reduce((sum, r) => sum + r.cardSales, 0);

  // Live Calculations for modal preview
  const parsedCardSales = Number(cardSales || 0);
  const parsedCashInRegister = Number(cashInRegister || 0);
  const totalSales = parsedCashInRegister + parsedCardSales;

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Title section */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Smen Açotları (Hesabatlar)</h1>
            <p className="page-subheading">Növbə sonu kassa alverinin təhvil-təslim hesabatlarının reyestri</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Açot Əlavə Et
          </button>
        </div>

        {/* SUMMARY KPI CARDS PANEL */}
        <div className="kpi-cards-grid" style={{ marginBottom: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {/* KPI 1: Period Total Sales */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className="kpi-icon-wrapper kpi-icon-purchase" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <TrendingUp size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dövrün Toplam Alveri</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>₼ {periodTotalSales.toFixed(2)}</span>
            </div>
          </div>

          {/* KPI 2: Period Total Cash */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className="kpi-icon-wrapper kpi-icon-payment" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <DollarSign size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kassadakı Toplam Nağd</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>₼ {periodTotalCash.toFixed(2)}</span>
            </div>
          </div>

          {/* KPI 3: Period Total Card */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className="kpi-icon-wrapper kpi-icon-debt" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <CreditCard size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toplam Terminal (Kart)</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>₼ {periodTotalCard.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE FILTERS BAR */}
        <div className="analytics-filter-bar glass-panel" style={{ marginBottom: 'var(--spacing-md)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter className="text-muted" size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Axtarış və Filtrləmə:</span>
          </div>
          
          <div className="filters-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {/* Employee Filter */}
            {user?.role === 'Admin' && (
              <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>İşçiyə görə</label>
                <select 
                  value={filterEmployee} 
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                >
                  <option value="All">Bütün İşçilər</option>
                  {employeeList.map((empName, idx) => (
                    <option key={idx} value={empName}>{empName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Month Filter */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ay üzrə</label>
              <select 
                value={filterMonth} 
                onChange={(e) => handleMonthChange(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                <option value="All">Bütün Aylar (May)</option>
                <option value="2026-05">May 2026</option>
                <option value="2026-04">Aprel 2026</option>
                <option value="2026-03">Mart 2026</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Başlanğıc Tarixi</label>
              <input 
                type="date" 
                value={filterStartDate} 
                onChange={(e) => setFilterStartDate(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              />
            </div>

            {/* Date Range End */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bitmə Tarixi</label>
              <input 
                type="date" 
                value={filterEndDate} 
                onChange={(e) => setFilterEndDate(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="invoices-layout-grid">
          <div className="table-card glass-panel">
            <div className="table-header">
              <h3>Smen Hesabatları Reyestri</h3>
              <span className="count-badge">{filteredReports.length} hesabat</span>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tarix</th>
                    <th>Smen</th>
                    <th>Məsul Kassir</th>
                    <th>Sistemdəki Nağd (₼)</th>
                    <th>Kassadakı Real (₼)</th>
                    <th>Fərq (₼)</th>
                    <th>Terminal (₼)</th>
                    <th>Toplam Alver (₼)</th>
                    <th>Qeyd</th>
                    <th>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((rep) => {
                      const diff = rep.discrepancy;
                      return (
                        <tr key={rep.id}>
                          <td className="bold-text">{rep.date}</td>
                          <td>
                            <span className="status-pill status-info" style={{ fontSize: '0.72rem' }}>
                              {rep.shift}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={13} className="text-muted" />
                              {rep.employeeName}
                            </span>
                          </td>
                          <td className="bold-text">₼ {rep.cashSales.toFixed(2)}</td>
                          <td className="bold-text">₼ {rep.cashInRegister.toFixed(2)}</td>
                          <td>
                            {diff > 0 ? (
                              <span className="bold-text" style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                +₼ {diff.toFixed(2)} 
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.12)', fontWeight: 'bold' }}>Artıq</span>
                              </span>
                            ) : diff < 0 ? (
                              <span className="bold-text" style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                -₼ {Math.abs(diff).toFixed(2)} 
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.12)', fontWeight: 'bold' }}>Əksik</span>
                              </span>
                            ) : (
                              <span className="bold-text" style={{ color: '#22c55e' }}>
                                ₼ 0.00
                              </span>
                            )}
                          </td>
                          <td className="bold-text" style={{ color: 'var(--color-accent)' }}>₼ {rep.cardSales.toFixed(2)}</td>
                          <td className="bold-text" style={{ color: 'var(--color-success)' }}>₼ {(rep.cashInRegister + rep.cardSales).toFixed(2)}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rep.notes}>
                            {rep.notes || '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => handleEditClick(rep)}
                                style={{ padding: '5px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Düzəliş Et"
                              >
                                <Edit size={12} /> Düzəliş
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => {
                                  if (window.confirm("Bu smen hesabatını silmək istədiyinizdən əminsiniz?")) {
                                    deleteShiftReport(rep.id);
                                  }
                                }}
                                style={{ padding: '5px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                title="Sil"
                              >
                                <Trash2 size={12} /> Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Seçilmiş filtrlərə uyğun heç bir smen hesabatı tapılmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MODAL: Add/Edit Shift Report Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '580px' }}
          >
            <div className="modal-header">
              <h3>{editingReportId ? 'Smen Açotuna Düzəliş Et' : 'Yeni Smen Açotu Daxil Et'}</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tarix</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Smen Seçimi</label>
                  <select value={shift} onChange={(e) => setShift(e.target.value)} required>
                    <option value="Gündüz smeni">Gündüz smeni (08:00 - 16:00)</option>
                    <option value="Gecə smeni">Gecə smeni (16:00 - 23:00)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sistemdəki Faktiki Göstərici (Nağd, ₼)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={cashSales} 
                    onChange={(e) => setCashSales(e.target.value)} 
                    placeholder="Sistem nağd gözləntisi" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Kassadakı Real Mövcud Nağd Pul (₼)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={cashInRegister} 
                    onChange={(e) => setCashInRegister(e.target.value)} 
                    placeholder="Kassadakı pul məbləği" 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: '1 1 50%' }}>
                  <label>Terminal (POS-Terminal) Summası (₼)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={cardSales} 
                    onChange={(e) => setCardSales(e.target.value)} 
                    placeholder="Terminal satışı cəmi" 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 50%', visibility: 'hidden' }}>
                  {/* Spacing placeholder to balance rows */}
                </div>
              </div>

              {/* Real-time Math Analysis Box */}
              {(cashSales !== '' && cashInRegister !== '') && (
                <div className="limit-meter-section" style={{ padding: '12px 14px', fontSize: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>Növbə Sonu Real Alver (Nağd + Kart):</span>
                      <span className="bold-text" style={{ color: 'var(--color-success)' }}>₼ {(parsedCashInRegister + parsedCardSales).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Kassadakı Real Mövcud Nağd:</span>
                      <span>₼ {parsedCashInRegister.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Sistemdəki Faktiki Göstərici:</span>
                      <span>₼ {parsedCashSales.toFixed(2)}</span>
                    </div>
                    
                    <hr style={{ border: 0, borderBottom: '1px solid var(--border-color)', margin: '4px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="bold-text">Kassa Fərqi (Discrepancy):</span>
                      {Number((parsedCashInRegister - parsedCashSales).toFixed(2)) > 0 ? (
                        <span className="status-pill status-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 'bold', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                          +₼ {Number((parsedCashInRegister - parsedCashSales).toFixed(2))} (Artıq)
                        </span>
                      ) : Number((parsedCashInRegister - parsedCashSales).toFixed(2)) < 0 ? (
                        <span className="status-pill status-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                          -₼ {Math.abs(Number((parsedCashInRegister - parsedCashSales).toFixed(2)))} (Əksik)
                        </span>
                      ) : (
                        <span className="status-pill status-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={12} /> ₼ 0.00 (Qaydasındadır)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Növbə Qeydləri / Şərhlər</label>
                <textarea 
                  rows="3" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Smen sonu yaranan qeydlər, təhvil-təslim şərhləri..." 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">
                  {editingReportId ? 'Dəyişiklikləri Saxla' : 'Açotu Təhvil Ver'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Reports;

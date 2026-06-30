import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Settings, 
  Search, 
  Filter, 
  DollarSign, 
  X, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import './Pages.css';

export const Debts = () => {
  const { debts, companies, invoices, setSupplierLimit, addPayment } = useStore();
  
  // UI states
  const [expandedId, setExpandedId] = useState(null);
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [newLimitVal, setNewLimitVal] = useState('');
  
  // Top bar search & filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Formal, Informal
  const [periodFilter, setPeriodFilter] = useState('All'); // All, Ay əvvəli, Ay ortası, Ay sonu

  // Quick Direct Payment Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompany, setPaymentCompany] = useState(null); // Prefilled company object
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLimitSave = (companyId) => {
    if (!newLimitVal) return;
    setSupplierLimit(companyId, Number(newLimitVal));
    setEditingLimitId(null);
    setNewLimitVal('');
  };

  // Triggered when paying directly for a company
  const handleOpenPaymentModal = (company) => {
    setPaymentCompany(company);
    setPayDate(new Date().toISOString().split('T')[0]);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentCompany || !payAmount) return;

    addPayment({
      companyId: Number(paymentCompany.id),
      amount: Number(payAmount),
      description: payDesc || `Firma üzrə birbaşa ödəniş`,
      date: payDate
    });

    setPayAmount('');
    setPayDesc('');
    setShowPaymentModal(false);
    setPaymentCompany(null);
  };

  // Perform search and filter calculations on client side
  const filteredDebts = debts.filter((debt) => {
    const comp = companies.find(c => c.id === debt.companyId);
    if (!comp) return false;

    // Search query match
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Legal status type match
    const matchesType = typeFilter === 'All' || comp.type === typeFilter;
    
    // Monthly payment cycle period match
    const matchesPeriod = periodFilter === 'All' || comp.paymentPeriod === periodFilter;

    return matchesSearch && matchesType && matchesPeriod;
  });

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Title block */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Təchizatçı Borcları və Limitlər</h1>
            <p className="page-subheading">Aylıq alış limitləri, ödəniş dövrləri və cari borc qalıqları</p>
          </div>
        </div>

        {/* FILTER PANEL - Modern responsive search & dropdown filters */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Company search input with icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', flex: 1.5, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Firma adına görə borcları axtar..." 
                style={{ 
                  padding: '8px 12px 8px 32px', 
                  fontSize: '0.85rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)', 
                  width: '100%', 
                  backgroundColor: 'var(--bg-primary)', 
                  color: 'var(--text-primary)' 
                }} 
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap', flex: 2, justifyContent: 'flex-end' }}>
              
              {/* Filter 1: Legal Status Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={12} className="text-muted" />
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '0.8125rem', 
                    fontWeight: 600, 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  <option value="All">Bütün Tip Firmalar</option>
                  <option value="Formal">Resmî (Formal)</option>
                  <option value="Informal">Qeyri-Resmî (Informal)</option>
                </select>
              </div>

              {/* Filter 2: Monthly Payment Cycle Period */}
              <select 
                value={periodFilter} 
                onChange={(e) => setPeriodFilter(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '0.8125rem', 
                  fontWeight: 600, 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-primary)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="All">Bütün Ödəniş Dövrləri</option>
                <option value="Ay əvvəli">Ay əvvəli ödənilənlər</option>
                <option value="Ay ortası">Ay ortası ödənilənlər</option>
                <option value="Ay sonu">Ay sonu ödənilənlər</option>
              </select>

            </div>
          </div>
        </div>

        {/* Main Grid display list */}
        <div className="debts-grid-panel">
          {filteredDebts.length > 0 ? (
            filteredDebts.map((debt) => {
              const comp = companies.find(c => c.id === debt.companyId);
              if (!comp) return null;
              
              const usagePercent = Math.min(100, (debt.totalDebt / debt.monthlyLimit) * 100);
              const isOver = debt.totalDebt > debt.monthlyLimit;
              const isNear = debt.totalDebt > debt.monthlyLimit * 0.85 && !isOver;
              
              const compInvoices = invoices.filter(i => i.companyId === debt.companyId);

              let progressBarColor = 'var(--color-success)';
              if (isOver) progressBarColor = 'var(--color-error)';
              else if (isNear) progressBarColor = 'var(--color-warning)';

              return (
                <div key={debt.id} className="debt-item-card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
                  <div>
                    <div className="debt-card-header">
                      <div className="header-info">
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className={`status-pill ${comp.type === 'Formal' ? 'status-success' : 'status-pending'}`} style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                            {comp.type === 'Formal' ? '✓ Resmî' : '◎ Gayri Resmî'}
                          </span>
                          <span className="status-pill status-info" style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                            ⏱ {comp.paymentPeriod || 'Ay sonu'}
                          </span>
                        </div>
                        <h3 style={{ marginTop: '4px' }}>{comp.name}</h3>
                        <p>{comp.phone} • {comp.address}</p>
                      </div>
                      <div className="header-balance">
                        <span className="balance-label">Cari Borc</span>
                        <h2 className={isOver ? 'text-red' : 'text-primary'}>₼ {debt.totalDebt.toFixed(2)}</h2>
                      </div>
                    </div>

                    <div className="limit-meter-section" style={{ marginTop: '8px' }}>
                      <div className="meter-labels">
                        <span>Alış Limiti: <strong>₼ {debt.monthlyLimit.toFixed(2)}</strong></span>
                        <span>{usagePercent.toFixed(0)}% istifadə</span>
                      </div>
                      <div className="meter-bar-bg">
                        <div 
                          className="meter-bar-fill" 
                          style={{ 
                            width: `${usagePercent}%`,
                            backgroundColor: progressBarColor
                          }} 
                        />
                      </div>
                      
                      {isOver && (
                        <div className="limit-alert-banner alert-red text-red">
                          <ShieldAlert size={14} />
                          <span>Aylıq alış limiti aşılıb! Əlavə borclandırılma məhudlaşdırıla bilər.</span>
                        </div>
                      )}
                      {isNear && (
                        <div className="limit-alert-banner alert-yellow text-orange">
                          <ShieldAlert size={14} />
                          <span>Borc limiti yaxınlaşır. Yeni alışı planlayarkən diqqətli olun.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="debt-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                      <button className="expand-details-btn" onClick={() => toggleExpand(debt.id)}>
                        {expandedId === debt.id ? (
                          <>Gizlə <ChevronUp size={14} /></>
                        ) : (
                          <>Fakturalara Bax ({compInvoices.length}) <ChevronDown size={14} /></>
                        )}
                      </button>

                      {/* DIRECT PAYMENT BUTTON + LIMIT TRIGGER cogs */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenPaymentModal(comp)}
                          style={{ padding: '4px 10px', display: 'inline-flex', gap: '2px', backgroundColor: 'rgba(22, 197, 94, 0.08)', color: 'var(--color-primary-light)', borderColor: 'rgba(22, 197, 94, 0.15)' }}
                          title="Firma üzrə nağd ödəniş icra et"
                        >
                          <DollarSign size={12} /> Ödəniş Et
                        </button>

                        <div className="limit-settings-action">
                          {editingLimitId === debt.id ? (
                            <div className="inline-limit-edit">
                              <input 
                                type="number" 
                                placeholder="Limit ₼"
                                value={newLimitVal} 
                                onChange={(e) => setNewLimitVal(e.target.value)} 
                                style={{ width: '70px', padding: '4px 6px' }}
                              />
                              <button className="limit-save-btn" onClick={() => handleLimitSave(debt.companyId)}>Ok</button>
                              <button className="limit-cancel-btn" onClick={() => setEditingLimitId(null)}>X</button>
                            </div>
                          ) : (
                            <button className="settings-btn" onClick={() => { setEditingLimitId(debt.id); setNewLimitVal(debt.monthlyLimit); }} style={{ fontSize: '0.7rem' }}>
                              <Settings size={12} /> Limiti Dəyiş
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === debt.id && (
                        <motion.div 
                          className="expanded-invoices-list"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="expanded-title-line">
                            <h4>Faktura Tarixçəsi</h4>
                          </div>
                          {compInvoices.length > 0 ? (
                            <div className="expanded-rows-wrapper">
                              {compInvoices.map((inv) => (
                                <div key={inv.id} className="expanded-invoice-row">
                                  <div className="row-left">
                                    <FileText size={16} className="text-muted" />
                                    <div className="info">
                                      <span className="bold">{inv.invoiceNo}</span>
                                      <span>{inv.date} • {inv.description || 'Qeyd yoxdur'}</span>
                                    </div>
                                  </div>
                                  <div className="row-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                    <span className="bold">₼ {inv.amount.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                      Net: ₼ {(inv.amount - (inv.returnAmount || 0)).toFixed(2)} ({inv.paymentType || 'Nisyə'})
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="expanded-empty">
                              <p>Bu şirkətə aid faktura tapılmadı</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--text-muted)' }} />
              <p>Seçilmiş axtarış və filtrləmə meyarlarına uyğun heç bir borc hesabı tapılmadı.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* QUICK PAYMENT MODAL - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      <AnimatePresence>
        {showPaymentModal && paymentCompany && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>{paymentCompany.name} — Ödəniş Əlavə Et</h3>
                <button className="close-modal-btn" onClick={() => setShowPaymentModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="modal-form">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-primary)', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Cari Borc Balansı:</span>
                    <span className="bold-text text-red">₼ {debts.find(d => d.companyId === paymentCompany.id)?.totalDebt.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Ödəniş Dövrü:</span>
                    <span className="bold-text">{paymentCompany.paymentPeriod || 'Qeyd olunmayıb'}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ödəniş Məbləği (₼)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={payAmount} 
                      onChange={(e) => setPayAmount(e.target.value)} 
                      placeholder="0.00" 
                      required 
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Ödəniş Tarixi</label>
                    <input 
                      type="date" 
                      value={payDate} 
                      onChange={(e) => setPayDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Açıqlama / Metod</label>
                  <input 
                    type="text" 
                    value={payDesc} 
                    onChange={(e) => setPayDesc(e.target.value)} 
                    placeholder="Məsələn: Bank köçürməsi, Nağd ödəniş və s." 
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Ləğv et</button>
                  <button type="submit" className="btn btn-primary">Ödənişi İcra Et</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Debts;

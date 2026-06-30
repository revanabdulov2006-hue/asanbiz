import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  HelpCircle, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import './Pages.css';

export const Companies = () => {
  const { companies, addCompany } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for creating a new company
  const [name, setName] = useState('');
  const [type, setType] = useState('Formal');
  const [taxId, setTaxId] = useState('');
  const [tradeRegistryNo, setTradeRegistryNo] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentPeriod, setPaymentPeriod] = useState('Ay sonu'); // Defaults to end of the month

  // Search & Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Formal, Informal
  const [periodFilter, setPeriodFilter] = useState('All'); // All, Ay əvvəli, Ay ortası, Ay sonu

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    addCompany({
      name,
      type,
      taxId: type === 'Formal' ? taxId : null,
      tradeRegistryNo: type === 'Formal' ? tradeRegistryNo : null,
      ownerName: type === 'Informal' ? ownerName : null,
      phone,
      address,
      paymentPeriod // Pass payment schedule period!
    });

    // Reset form states
    setName('');
    setTaxId('');
    setTradeRegistryNo('');
    setOwnerName('');
    setPhone('');
    setAddress('');
    setPaymentPeriod('Ay sonu');
    setShowAddForm(false);
  };

  // Perform search and filter calculations on client side
  const filteredCompanies = companies.filter((comp) => {
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
        {/* Title section */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Əməkdaşlıq Edilən Firmalar</h1>
            <p className="page-subheading">Biznes tərəfdaşlarımızın hüquqi qeydiyyat reyestri və ödəniş dövrləri</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Yeni Firma Əlavə Et
          </button>
        </div>

        {/* FILTER PANEL - Modern search & dropdown filters */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Company search input with icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', flex: 1.5, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Firma adına görə tərəfdaşları axtar..." 
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

        {/* Main responsive grid layout list */}
        <div className="companies-layout-grid">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((comp) => (
              <div key={comp.id} className="company-info-card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="company-card-top">
                    <div className="company-avatar-icon">
                      <Building2 size={20} />
                    </div>
                    <div className="company-name-row">
                      <h3>{comp.name}</h3>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span className={`status-pill ${comp.type === 'Formal' ? 'status-success' : 'status-pending'}`} style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                          {comp.type === 'Formal' ? <ShieldCheck size={10} /> : <HelpCircle size={10} />}
                          {comp.type === 'Formal' ? 'Resmî' : 'Gayri Resmî'}
                        </span>
                        <span className="status-pill status-info" style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                          ⏱ {comp.paymentPeriod || 'Ay sonu'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="company-card-details" style={{ marginTop: 'var(--spacing-md)' }}>
                    {comp.type === 'Formal' ? (
                      <>
                        <div className="detail-line"><span>VÖEN:</span> <strong>{comp.taxId}</strong></div>
                        <div className="detail-line"><span>Sicil No:</span> <strong>{comp.tradeRegistryNo || 'Qeyd olunmayıb'}</strong></div>
                      </>
                    ) : (
                      <div className="detail-line"><span>Sahibi:</span> <strong>{comp.ownerName}</strong></div>
                    )}
                    
                    <div className="detail-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span>Telefon:</span> 
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Phone size={11} className="text-muted" /> {comp.phone}
                      </strong>
                    </div>

                    <div className="detail-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span>Ünvan:</span> 
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '2px', textAlign: 'right' }}>
                        <MapPin size={11} className="text-muted" /> {comp.address || 'Qeyd olunmayıb'}
                      </strong>
                    </div>

                    <hr style={{ border: 0, borderBottom: '1px solid var(--border-color)', margin: '6px 0' }} />
                    
                    <div className="detail-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Ödəniş Dövrü:</span>
                      <strong className="bold-text text-green" style={{ fontSize: '0.8rem' }}>
                        {comp.paymentPeriod || 'Ay sonu'}
                      </strong>
                    </div>

                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--text-muted)' }} />
              <p>Seçilmiş axtarış və filtrləmə meyarlarına uyğun heç bir tərəfdaş firma tapılmadı.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* MODAL: Add New Company Form - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Yeni Tərəfdaş Firma Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Firma / Şirkət Adı</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Məsələn: Südlük Süd MMC" required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Şirkət Qeydiyyat Növü</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="Formal">Resmî Firma (Registered)</option>
                    <option value="Informal">Gayri Resmî Firma (Informal)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Müntəzəm Ödəniş Dövrü</label>
                  <select value={paymentPeriod} onChange={(e) => setPaymentPeriod(e.target.value)} required>
                    <option value="Ay əvvəli">Ay əvvəli (Beginning of Month)</option>
                    <option value="Ay ortası">Ay ortası (Middle of Month)</option>
                    <option value="Ay sonu">Ay sonu (End of Month)</option>
                  </select>
                </div>
              </div>

              {type === 'Formal' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>VÖEN (Tax ID)</label>
                    <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="VOEN" required />
                  </div>
                  <div className="form-group">
                    <label>Sicil Nömrəsi</label>
                    <input type="text" value={tradeRegistryNo} onChange={(e) => setTradeRegistryNo(e.target.value)} placeholder="Sicil No" />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Sahibinin Adı</label>
                  <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Sahibinin adı və soyadı" required />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994" required />
                </div>
                <div className="form-group">
                  <label>Ünvan</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="İş ünvanı" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Qeyd et</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Companies;

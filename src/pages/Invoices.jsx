import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Upload, 
  DollarSign, 
  Check, 
  X, 
  Calendar, 
  Search, 
  Eye, 
  Info,
  CreditCard,
  Barcode,
  Printer,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';
import './Pages.css';

export const Invoices = () => {
  const { 
    invoices, 
    companies, 
    addInvoice, 
    deleteInvoice, 
    editInvoice, 
    payments, 
    addPayment 
  } = useStore();
  
  // Modals visibility state
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // High-fidelity document viewer state
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Invoice creation form states
  const [companyId, setCompanyId] = useState('');
  const [amount, setAmount] = useState('');
  const [returnAmount, setReturnAmount] = useState(''); // Qaytarma / Vazvrat
  const [paymentType, setPaymentType] = useState('Nisyə'); // Nisyə, Nağd, Qarışıq
  const [cashPaid, setCashPaid] = useState(''); // If split (Qarışıq)
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');

  // Payment creation form states
  const [payCompanyId, setPayCompanyId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  // Invoice EDITING states inside the modal
  const [isEditing, setIsEditing] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editReturnAmount, setEditReturnAmount] = useState('');
  const [editPaymentType, setEditPaymentType] = useState('Nisyə');
  const [editCashPaid, setEditCashPaid] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');

  // Handle invoice submission
  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!companyId || !amount) return;
    
    addInvoice({
      companyId: Number(companyId),
      amount: Number(amount),
      returnAmount: Number(returnAmount || 0),
      paymentType,
      cashPaid: paymentType === 'Qarışıq' ? Number(cashPaid || 0) : 0,
      description,
      date,
      documentPath: fileName ? `/uploads/invoices/${fileName}` : null
    });

    // Reset fields and close modal
    setCompanyId('');
    setAmount('');
    setReturnAmount('');
    setPaymentType('Nisyə');
    setCashPaid('');
    setDescription('');
    setFileName('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddInvoice(false);
  };

  // Handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!payCompanyId || !payAmount) return;
    
    addPayment({
      companyId: Number(payCompanyId),
      amount: Number(payAmount),
      description: payDesc || 'Firma üzrə ödəniş',
      date: payDate
    });

    // Reset payment states
    setPayCompanyId('');
    setPayAmount('');
    setPayDesc('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setShowAddPayment(false);
  };

  // Start editing the selected invoice inside the modal
  const handleStartEdit = () => {
    setEditCompanyId(selectedInvoice.companyId);
    setEditAmount(selectedInvoice.amount);
    setEditReturnAmount(selectedInvoice.returnAmount || 0);
    setEditPaymentType(selectedInvoice.paymentType || 'Nisyə');
    setEditCashPaid(selectedInvoice.cashPaid || '');
    setEditDescription(selectedInvoice.description || '');
    setEditDate(selectedInvoice.date || new Date().toISOString().split('T')[0]);
    setIsEditing(true);
  };

  // Save the edited invoice inside the modal
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editCompanyId || !editAmount) return;

    const amt = Number(editAmount);
    const ret = Number(editReturnAmount || 0);
    const payTp = editPaymentType;
    const cPaid = payTp === 'Qarışıq' ? Number(editCashPaid || 0) : 0;
    const netSum = Math.max(0, amt - ret);
    
    let credRemaining = 0;
    if (payTp === 'Nisyə') {
      credRemaining = netSum;
    } else if (payTp === 'Qarışıq') {
      credRemaining = Math.max(0, netSum - cPaid);
    }

    // Call store action
    editInvoice(selectedInvoice.id, {
      companyId: Number(editCompanyId),
      amount: amt,
      returnAmount: ret,
      paymentType: payTp,
      cashPaid: payTp === 'Nağd' ? netSum : cPaid,
      creditRemaining: credRemaining,
      description: editDescription,
      date: editDate
    });

    // Update local state to immediately show changes in the digital viewer
    setSelectedInvoice({
      ...selectedInvoice,
      companyId: Number(editCompanyId),
      amount: amt,
      returnAmount: ret,
      paymentType: payTp,
      cashPaid: payTp === 'Nağd' ? netSum : cPaid,
      creditRemaining: credRemaining,
      description: editDescription,
      date: editDate
    });

    setIsEditing(false);
  };

  // Delete invoice
  const handleDeleteInvoiceClick = () => {
    if (window.confirm(`${selectedInvoice.invoiceNo} nömrəli fakturanı silmək istədiyinizdən əminsiniz? Bu əməliyyat borcları və nağd ödənişləri avtomatik ləğv edəcək.`)) {
      deleteInvoice(selectedInvoice.id);
      setSelectedInvoice(null);
      setIsEditing(false);
    }
  };

  // Dynamic calculations for the mixed payment UI preview
  const parsedAmount = Number(amount || 0);
  const parsedReturn = Number(returnAmount || 0);
  const netAmount = Math.max(0, parsedAmount - parsedReturn);
  const parsedCashPaid = Number(cashPaid || 0);
  const creditPortion = Math.max(0, netAmount - parsedCashPaid);

  // Dynamic calculations for editing UI preview
  const parsedEditAmount = Number(editAmount || 0);
  const parsedEditReturn = Number(editReturnAmount || 0);
  const netEditAmount = Math.max(0, parsedEditAmount - parsedEditReturn);
  const parsedEditCash = Number(editCashPaid || 0);
  const editCreditPortion = Math.max(0, netEditAmount - parsedEditCash);

  // Filter invoices based on company search term
  const filteredInvoices = invoices.filter((inv) => {
    const comp = companies.find(c => c.id === inv.companyId);
    if (!comp) return false;
    return comp.name.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h1 className="page-heading">Fakturalar və Ödənişlər</h1>
            <p className="page-subheading">Borc hesabları, qaytarmalar, nağd/nisyə və aparılan ödəmələrin reyestri</p>
          </div>
          <div className="page-actions-row">
            <button className="btn btn-primary" onClick={() => setShowAddInvoice(true)}>
              <Plus size={16} /> Faktura Əlavə Et
            </button>
            <button className="btn btn-accent" onClick={() => setShowAddPayment(true)}>
              <DollarSign size={16} /> Ödəniş Et
            </button>
          </div>
        </div>

        {/* Main Page Layout Grid (Split between invoices and payments) */}
        <div className="invoices-layout-grid">
          
          {/* Left Side: Invoice Register Table */}
          <div className="table-card glass-panel">
            <div className="table-header" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              <h3>Qəbul Edilən Fakturalar</h3>
              
              {/* Search Input Bar next to headers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Firma adına görə axtar..." 
                  style={{ 
                    padding: '6px 12px 6px 26px', 
                    fontSize: '0.78rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    width: '200px', 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--text-primary)' 
                  }} 
                />
              </div>

              <span className="count-badge">{filteredInvoices.length} faktura</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Faktura No</th>
                    <th>Firma</th>
                    <th>Tarix</th>
                    <th>Ödəniş Tipi</th>
                    <th>Vazvrat (₼)</th>
                    <th>Məbləğ</th>
                    <th>Net Hesab</th>
                    <th>Sənəd</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => {
                      const comp = companies.find(c => c.id === inv.companyId);
                      return (
                        <tr 
                          key={inv.id} 
                          onClick={() => setSelectedInvoice(inv)}
                          style={{ cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                          className="hover-row-effect"
                        >
                          <td className="bold-text" style={{ color: 'var(--color-primary)' }}>
                            {inv.invoiceNo}
                          </td>
                          <td>{comp ? comp.name : 'Unknown'}</td>
                          <td>{inv.date}</td>
                          <td>
                            <span className={`status-pill ${
                              inv.paymentType === 'Nağd' ? 'status-success' : 
                              inv.paymentType === 'Qarışıq' ? 'status-info' : 'status-pending'
                            }`} style={{ fontSize: '0.7rem' }}>
                              {inv.paymentType || 'Nisyə'}
                            </span>
                          </td>
                          <td className="bold-text text-red">
                            ₼ {(inv.returnAmount || 0).toFixed(2)}
                          </td>
                          <td className="bold-text">₼ {inv.amount.toFixed(2)}</td>
                          <td className="bold-text text-green">
                            ₼ {(inv.amount - (inv.returnAmount || 0)).toFixed(2)}
                          </td>
                          <td>
                            <span 
                              className="file-attachment-badge" 
                              style={{ 
                                backgroundColor: inv.documentPath ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                                color: inv.documentPath ? 'var(--color-accent)' : 'var(--text-muted)'
                              }}
                            >
                              <Eye size={11} /> {inv.documentPath ? 'Sənədə bax' : 'Rəqəmsal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Meyarlara uyğun heç bir faktura tapılmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Payments Log Table */}
          <div className="table-card glass-panel">
            <div className="table-header">
              <h3>Edilən Ödənişlər</h3>
              <span className="count-badge">{payments.length} ödəniş</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tarix</th>
                    <th>Firma</th>
                    <th>Qeyd / Metod</th>
                    <th>Məbləğ</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => {
                    const comp = companies.find(c => c.id === pay.companyId);
                    return (
                      <tr key={pay.id}>
                        <td>{pay.date}</td>
                        <td>{comp ? comp.name : 'Unknown'}</td>
                        <td>{pay.description}</td>
                        <td className="bold-text text-green">₼ {pay.amount.toFixed(2)}</td>
                        <td><span className="status-pill status-success">Ödənilib</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>

      {/* MODAL 1: Add Invoice Form - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      {showAddInvoice && (
        <div className="modal-overlay" onClick={() => setShowAddInvoice(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '520px' }}
          >
            <div className="modal-header">
              <h3>Yeni Faktura Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddInvoice(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleInvoiceSubmit} className="modal-form">
              
              <div className="form-row">
                <div className="form-group">
                  <label>Firma Seçimi</label>
                  <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
                    <option value="">Firma seçin</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tarix</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Faktura Məbləği (₼)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Qaytarma / Vazvrat (₼)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={returnAmount} 
                    onChange={(e) => setReturnAmount(e.target.value)} 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ödəniş Tipi</label>
                  <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} required>
                    <option value="Nisyə">Nisyə (Tamamilə borca yazılır)</option>
                    <option value="Nağd">Nağd (Tamamilə nağd ödənilir)</option>
                    <option value="Qarışıq">Qarışıq (Hissəli split ödəniş)</option>
                  </select>
                </div>

                {paymentType === 'Qarışıq' ? (
                  <div className="form-group">
                    <label>Nağd Ödənilən Hissə (₼)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={cashPaid} 
                      onChange={(e) => setCashPaid(e.target.value)} 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                ) : (
                  <div className="form-group" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <label>Nağd Ödənilən Hissə</label>
                    <input type="text" placeholder="Aktiv deyil" disabled />
                  </div>
                )}
              </div>

              <div className="limit-meter-section" style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Net Faktura Məbləği:</span>
                    <span className="bold-text">₼ {netAmount.toFixed(2)}</span>
                  </div>
                  {paymentType === 'Qarışıq' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary-light)' }}>
                        <span>Nağd Ödənilən (Kassadan çıxır):</span>
                        <span className="bold-text">₼ {parsedCashPaid.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-secondary)' }}>
                        <span>Nisyə Qalan (Borca əlavə olunur):</span>
                        <span className="bold-text">₼ {creditPortion.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {paymentType === 'Nağd' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary-light)' }}>
                      <span>Nağd Ödənilən (Kassadan çıxır):</span>
                      <span className="bold-text">₼ {netAmount.toFixed(2)} (Borca 0 ₼ yazılır)</span>
                    </div>
                  )}
                  {paymentType === 'Nisyə' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-secondary)' }}>
                      <span>Nisyə Qalan (Tam borca yazılır):</span>
                      <span className="bold-text">₼ {netAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Açıqlama / Təfərrüat</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Məsələn: Ərzaq alışları və s." />
              </div>

              <div className="form-group">
                <label>Faktura Sənədi / Şəkli (Drag & Drop)</label>
                <div className="file-upload-zone" style={{ padding: 'var(--spacing-md)' }}>
                  <Upload size={20} className="upload-icon" />
                  <input 
                    type="file" 
                    id="file-input"
                    onChange={(e) => setFileName(e.target.files[0]?.name || '')} 
                  />
                  <span style={{ fontSize: '0.75rem' }}>
                    {fileName ? `Yükləndi: ${fileName}` : 'Faylı sürükləyin və ya klikləyin (PDF, PNG - Maks 5MB)'}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInvoice(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Yadda Saxla</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Add Payment Form - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      {showAddPayment && (
        <div className="modal-overlay" onClick={() => setShowAddPayment(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Yeni Ödəniş Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddPayment(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="modal-form">
              <div className="form-group">
                <label>Firma seçimi</label>
                <select value={payCompanyId} onChange={(e) => setPayCompanyId(e.target.value)} required>
                  <option value="">Firma seçin</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ödəniş Məbləği (₼)</label>
                  <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Tarix</label>
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Açıqlama / Qeyd</label>
                <input type="text" value={payDesc} onChange={(e) => setPayDesc(e.target.value)} placeholder="Bank köçürməsi, nağd və s." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPayment(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Tamamla</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: High-Fidelity Interactive Document & digital Invoice Viewer / EDITING MODAL - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="modal-overlay" onClick={() => { setSelectedInvoice(null); setIsEditing(false); }}>
            <motion.div 
              className="modal-content glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              style={{ maxWidth: '780px', width: '95%' }}
            >
              <div className="modal-header">
                <h3>
                  {isEditing 
                    ? `Faktura Məlumatlarında Düzəliş Et` 
                    : `Faktura Detalları və Rəqəmsal Sənəd Baxışı`
                  }
                </h3>
                <button className="close-modal-btn" onClick={() => { setSelectedInvoice(null); setIsEditing(false); }}><X size={18} /></button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)', maxHeight: '78vh', overflowY: 'auto' }} className="daily-layout-columns">
                
                {/* Left Side Details Column / or Editing Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  
                  {isEditing ? (
                    <form onSubmit={handleSaveEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                      <div className="form-group">
                        <label>Firma Seçimi</label>
                        <select value={editCompanyId} onChange={(e) => setEditCompanyId(e.target.value)} required>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Məbləğ (₼)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editAmount} 
                            onChange={(e) => setEditAmount(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Tarix</label>
                          <input 
                            type="date" 
                            value={editDate} 
                            onChange={(e) => setEditDate(e.target.value)} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Qaytarma / Vazvrat (₼)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editReturnAmount} 
                            onChange={(e) => setEditReturnAmount(e.target.value)} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Ödəniş Tipi</label>
                          <select value={editPaymentType} onChange={(e) => setEditPaymentType(e.target.value)} required>
                            <option value="Nisyə">Nisyə (Tamamilə Borc)</option>
                            <option value="Nağd">Nağd (Tamamilə Nağd)</option>
                            <option value="Qarışıq">Qarışıq (Hissəli Ödəniş)</option>
                          </select>
                        </div>
                      </div>

                      {editPaymentType === 'Qarışıq' && (
                        <div className="form-group">
                          <label>Nağd Ödənilən Hissə (₼)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editCashPaid} 
                            onChange={(e) => setEditCashPaid(e.target.value)} 
                            required 
                          />
                        </div>
                      )}

                      <div className="limit-meter-section" style={{ padding: '8px 12px', fontSize: '0.75rem', marginTop: '2px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Yeni Net Hesab:</span>
                            <span className="bold-text">₼ {netEditAmount.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-secondary)' }}>
                            <span>Yeni Borca Yazılan:</span>
                            <span className="bold-text">₼ {(editPaymentType === 'Nağd' ? 0 : editCreditPortion).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Açıqlama</label>
                        <input 
                          type="text" 
                          value={editDescription} 
                          onChange={(e) => setEditDescription(e.target.value)} 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Geri</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1.2 }}>Saxla</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="limit-meter-section" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Hesab Detalları</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Firma Adı:</span>
                            <span className="bold-text" style={{ textAlign: 'right' }}>
                              {companies.find(c => c.id === selectedInvoice.companyId)?.name || 'Unknown'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Tarix:</span>
                            <span className="bold-text">{selectedInvoice.date}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Faktura Məbləği:</span>
                            <span className="bold-text">₼ {selectedInvoice.amount.toFixed(2)}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Qaytarma (Vazvrat):</span>
                            <span className="bold-text text-red">₼ {(selectedInvoice.returnAmount || 0).toFixed(2)}</span>
                          </div>

                          <hr style={{ border: 0, borderBottom: '1px solid var(--border-color)', margin: '4px 0' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>Net Ümumi:</span>
                            <span className="bold-text text-green">₼ {(selectedInvoice.amount - (selectedInvoice.returnAmount || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="limit-meter-section" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Ödəniş Bölüşdürülməsi</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Ödəniş Növü:</span>
                            <span className="bold-text status-pill status-info" style={{ padding: '1px 8px' }}>
                              {selectedInvoice.paymentType || 'Nisyə'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Nağd Ödənilən:</span>
                            <span className="bold-text text-green">₼ {(selectedInvoice.cashPaid || 0).toFixed(2)}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Borca Yazılan Hissə:</span>
                            <span className="bold-text text-yellow">
                              ₼ {(selectedInvoice.creditRemaining !== undefined ? selectedInvoice.creditRemaining : (selectedInvoice.paymentType === 'Nağd' ? 0 : selectedInvoice.amount - (selectedInvoice.returnAmount || 0))).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong>Açıqlama:</strong><br />
                        <span style={{ fontStyle: 'italic' }}>{selectedInvoice.description || 'Hər hansı əlavə qeyd yoxdur.'}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                        <button 
                          type="button"
                          className="btn btn-secondary btn-danger"
                          onClick={handleDeleteInvoiceClick}
                          style={{ flex: 1, display: 'inline-flex', gap: '4px' }}
                        >
                          <Trash2 size={13} /> Fakturanı Sil
                        </button>
                        
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleStartEdit}
                          style={{ flex: 1, display: 'inline-flex', gap: '4px', borderColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                        >
                          <Edit size={13} /> Düzəliş Et
                        </button>
                      </div>
                    </>
                  )}

                </div>

                {/* Right Side Digital Invoice Preview / Attached Document */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Elektron Sənəd / E-Faktura Görüntüsü:</span>
                  
                  <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', position: 'relative', overflow: 'hidden', minHeight: '340px', backgroundColor: 'var(--bg-primary)' }}>
                    
                    <div style={{ position: 'absolute', top: '15px', right: '15px', width: '70px', height: '70px', border: '3px double var(--color-success)', borderRadius: '50%', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(15deg)', opacity: 0.6, fontSize: '0.6rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.1, pointerEvents: 'none' }}>
                      E-FAKTURA<br/>TƏSDİQLƏNDİ
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>AsanBiznesim MMC</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Elektron Faktura Xidməti • VÖEN 9900123456</span>
                      </div>
                      <span className="bold-text" style={{ fontSize: '0.8125rem' }}>{selectedInvoice.invoiceNo}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, fontSize: '0.78rem', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <span>MƏHSUL / AÇIQLAMA</span>
                        <span>MƏBLƏĞ</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>{selectedInvoice.description || 'Ərzaq / Mal-material tədarükü'}</span>
                        <span>₼ {selectedInvoice.amount.toFixed(2)}</span>
                      </div>

                      {selectedInvoice.returnAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--color-error)' }}>
                          <span>Qaytarılan mallar (Vazvrat)</span>
                          <span>-₼ {selectedInvoice.returnAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', borderTop: '2px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                          <span>CƏMİ (Net Hesab):</span>
                          <span>₼ {(selectedInvoice.amount - (selectedInvoice.returnAmount || 0)).toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>Nağd Ödəniş Hissəsi:</span>
                          <span>₼ {(selectedInvoice.cashPaid || 0).toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>Nisyə (Cari Borc):</span>
                          <span>₼ {(selectedInvoice.creditRemaining !== undefined ? selectedInvoice.creditRemaining : (selectedInvoice.paymentType === 'Nağd' ? 0 : selectedInvoice.amount - (selectedInvoice.returnAmount || 0))).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '1px', height: '24px', alignItems: 'stretch' }}>
                        {[2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,2,1,3,1,2,1,4,2].map((w, idx) => (
                          <div key={idx} style={{ width: `${w}px`, backgroundColor: 'var(--text-primary)', opacity: 0.8 }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>*ASAN-{selectedInvoice.id}*</span>
                    </div>

                  </div>
                </div>

              </div>
              
              <div className="modal-actions" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectedInvoice(null); setIsEditing(false); }}>Bağla</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    window.print();
                  }}
                  style={{ display: 'inline-flex', gap: '4px' }}
                >
                  <Printer size={14} /> Çap Et
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Invoices;

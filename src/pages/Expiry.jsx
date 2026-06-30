import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  Plus, 
  X, 
  Trash2, 
  Check, 
  Building2, 
  Trash, 
  AlertTriangle,
  Archive,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import './Pages.css';

export const Expiry = () => {
  const { 
    expiryProducts, 
    companies, 
    addExpiryProduct, 
    deleteExpiryProduct, 
    resolveExpiryProduct,
    user
  } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  
  // Creation form states
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [companyId, setCompanyId] = useState(''); // associated supplier company

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !expiryDate || !quantity || !companyId) return;

    addExpiryProduct({
      productName,
      expiryDate,
      quantity: Number(quantity),
      companyId: Number(companyId)
    });

    // Reset states
    setProductName('');
    setExpiryDate('');
    setQuantity('');
    setCompanyId('');
    setShowAddForm(false);
  };

  const getStatusBadge = (p) => {
    if (p.status === 'Vitrindən Çıxarıldı') {
      return <span className="status-pill status-success" style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
        <Check size={11} /> Vitrindən Çıxarılıb
      </span>;
    }

    const daysLeft = p.daysLeft;
    if (daysLeft < 0) {
      return <span className="status-pill status-danger">Müddəti bitib ({Math.abs(daysLeft)} gün əvvəl)</span>;
    } else if (daysLeft <= 7) {
      return <span className="status-pill status-warning">{daysLeft} gün qalıb</span>;
    } else {
      return <span className="status-pill status-success">{daysLeft} gün qalıb</span>;
    }
  };

  const getRowClass = (p) => {
    if (p.status === 'Vitrindən Çıxarıldı') return 'row-resolved-settled';
    if (p.daysLeft < 0) return 'row-expired';
    if (p.daysLeft <= 7) return 'row-warning';
    return '';
  };

  // --- STATS CALCULATIONS FOR EXPIRY & VELOCITY ANALYTICS ---
  
  // 1. Group expired/warning products by company to identify which suppliers have the most expired goods
  const companyExpiryStats = companies.map(comp => {
    const compProducts = expiryProducts.filter(p => p.companyId === comp.id);
    const expiredQty = compProducts
      .filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı')
      .reduce((sum, p) => sum + p.quantity, 0);
    const warningQty = compProducts
      .filter(p => p.daysLeft >= 0 && p.daysLeft <= 7 && p.status !== 'Vitrindən Çıxarıldı')
      .reduce((sum, p) => sum + p.quantity, 0);
    
    return {
      id: comp.id,
      name: comp.name.replace(' MMC', '').replace(' ASC', ''),
      expiredQty,
      warningQty,
      totalWasteQty: expiredQty + warningQty
    };
  }).filter(c => c.expiredQty > 0 || c.warningQty > 0)
    .sort((a, b) => b.expiredQty - a.expiredQty);

  // 2. Identify slowest moving products based on high levels of expired waste
  const slowMovingProducts = expiryProducts
    .filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı')
    .map(p => {
      const comp = companies.find(c => c.id === p.companyId);
      return {
        ...p,
        companyName: comp ? comp.name : 'Məlum deyil',
        // Dynamic smart suggestions based on quantity of expired goods
        suggestion: p.quantity >= 20 
          ? `Zəif dövriyyə! Növbəti sifariş limitini 30-40% azaldın.` 
          : `Zəif satış sürəti. Sifarişləri 15-20% azaldaraq nisyə borcu qoruyun.`
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3); // Get top 3 slowest items

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
            <h1 className="page-heading">Məhsul Yararlılıq Müddətləri (Sroklar)</h1>
            <p className="page-subheading">Tez xarab olan məhsulların son istifadə tarixlərinə, çıxarılma statuslarına və tərəfdaş firmalara nəzarət</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Məhsul Əlavə Et
          </button>
        </div>

        {/* Main inventory list */}
        <div className="table-card glass-panel" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="table-header">
            <h3>Məhsul Siyahısı</h3>
            <span className="count-badge">{expiryProducts.length} məhsul</span>
          </div>
          <div className="table-wrapper">
            <table className="expiry-table">
              <thead>
                <tr>
                  <th>Məhsul Adı</th>
                  <th>Miqdar</th>
                  <th>Təchizatçı Firma</th>
                  <th>Daxil Edilən Tarix</th>
                  <th>Son İstifadə Tarixi</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {expiryProducts.length > 0 ? (
                  expiryProducts.map((p) => {
                    const comp = companies.find(c => c.id === p.companyId);
                    const isResolved = p.status === 'Vitrinden Cixarildi' || p.status === 'Vitrindən Çıxarıldı';

                    return (
                      <tr 
                        key={p.id} 
                        className={getRowClass(p)}
                        style={{ 
                          opacity: isResolved ? 0.65 : 1,
                          transition: 'opacity var(--transition-smooth)'
                        }}
                      >
                        <td className="bold-text" style={{ textDecoration: isResolved ? 'line-through' : 'none' }}>
                          {p.productName}
                        </td>
                        <td>{p.quantity} ədəd</td>
                        <td>
                          <span className="file-attachment-badge" style={{ backgroundColor: 'rgba(22, 101, 52, 0.08)', color: 'var(--color-primary)' }}>
                            <Building2 size={11} /> {comp ? comp.name : 'Unknown'}
                          </span>
                        </td>
                        <td>{p.createdAt}</td>
                        <td>{p.expiryDate}</td>
                        <td>{getStatusBadge(p)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                            
                            {/* Pull from Shelf / Resolve button */}
                            {!isResolved && p.status !== 'Vitrindən Çıxarıldı' ? (
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => resolveExpiryProduct(p.id)}
                                style={{ 
                                  padding: '4px 8px', 
                                  display: 'inline-flex', 
                                  gap: '2px', 
                                  backgroundColor: 'rgba(59, 130, 246, 0.08)', 
                                  color: 'var(--color-accent)', 
                                  borderColor: 'rgba(59, 130, 246, 0.15)',
                                  fontSize: '0.72rem'
                                }}
                                title="Vitrindən çıxarılmış kimi qeyd et"
                              >
                                <Archive size={11} /> Vitrindən Çıxar
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>
                                Çıxarıldı
                              </span>
                            )}

                            {/* Delete product button */}
                            <button 
                              className="btn btn-secondary btn-sm btn-danger"
                              onClick={() => {
                                if (window.confirm(`"${p.productName}" srok siyahısından tamamilə silinsin?`)) {
                                  deleteExpiryProduct(p.id);
                                }
                              }}
                              style={{ padding: '4px 6px' }}
                              title="Siyahıdan tamamilə sil"
                            >
                              <Trash2 size={12} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      İzlənən məhsul tapılmadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPIRY & SALES VELOCITY ANALYTICS DASHBOARD */}
        {companyExpiryStats.length > 0 && user?.role === 'Admin' && (
          <div className="charts-layout-grid" style={{ marginBottom: 'var(--spacing-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart Block: Top Expired Companies */}
            <div className="chart-card-wrapper glass-panel" style={{ padding: '20px' }}>
              <div className="chart-card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={18} className="text-danger" /> Firmalara Görə Sroku Keçən Məhsullar (İtki)
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Vaxtı keçmiş zay məhsulların tədarükçü firmalar üzrə ədəd bölgüsü
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: 180, marginTop: 10 }}>
                <ResponsiveContainer>
                  <BarChart data={companyExpiryStats} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 5 }}>
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={9} width={90} />
                    <Tooltip formatter={(value) => `${value} ədəd`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Bar dataKey="expiredQty" fill="var(--color-error)" radius={[0, 4, 4, 0]} barSize={10}>
                      {companyExpiryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-error)' : 'rgba(239, 68, 68, 0.6)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights: Slow Moving Products & suggestions */}
            <div className="chart-card-wrapper glass-panel" style={{ padding: '20px' }}>
              <div className="chart-card-header" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingDown size={18} className="text-warning" /> Zəif Satan Mallar və Sifariş Tövsiyələri
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Son istifadə tarixi keçən məhsulların satış sürəti təhlili
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {slowMovingProducts.length > 0 ? (
                  slowMovingProducts.map((p) => (
                    <div key={p.id} className="limit-meter-section" style={{ padding: '8px 12px', fontSize: '0.78rem', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.01)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span className="bold-text" style={{ color: 'var(--text-primary)' }}>{p.productName}</span>
                        <span className="status-pill status-danger" style={{ fontSize: '0.68rem', padding: '2px 6px', fontWeight: 'bold' }}>{p.quantity} ədəd zay</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: '5px' }}>
                        <span>Firma: {p.companyName}</span>
                        <span>Srok: {p.expiryDate}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>Tövsiyə:</span>
                        <span>{p.suggestion}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    Zəif satan məhsul təhlili üçün vaxtı keçmiş məhsul qeydi yoxdur.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </motion.div>

      {/* MODAL: Add Product to Expiry Tracker - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Yararlılıq Tarixi Qeyd Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddForm(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Məhsul Adı</label>
                <input 
                  type="text" 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                  placeholder="Məsələn: Süzmə Pendir 500g" 
                  required 
                />
              </div>

              {/* Company Selector Dropdown */}
              <div className="form-group">
                <label>Təchizatçı Firma</label>
                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
                  <option value="">Firma seçin</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Miqdar (ədəd)</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="1" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Son İstifadə Tarixi</label>
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Yaz</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Expiry;

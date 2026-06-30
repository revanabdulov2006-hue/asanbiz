import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Clock, 
  AlertTriangle,
  FileText,
  X,
  ArrowUpDown
} from 'lucide-react';
import './Pages.css';

export const ProductRequests = () => {
  const { productRequests, addProductRequest, fulfillProductRequest, editProductRequest, deleteProductRequest, user } = useStore();

  // Redirect if user does not have permission
  if (!user || !user.permissions || !user.permissions.includes('requests')) {
    return <Navigate to="/app" replace />;
  }

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('Azalmış mallar');
  const [priority, setPriority] = useState('Orta');
  const [notes, setNotes] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Sort states
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} style={{ marginLeft: '6px', opacity: 0.4, display: 'inline-block', verticalAlign: 'middle' }} />;
    }
    return <span style={{ marginLeft: '4px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // KPI Calculations
  const totalPending = productRequests.filter(r => r.status === 'Gözləyir').length;
  const totalUrgent = productRequests.filter(r => r.status === 'Gözləyir' && r.priority === 'Təcili').length;
  const totalFulfilled = productRequests.filter(r => r.status === 'Təmin olundu').length;

  // Filtered and Sorted requests
  const filteredRequests = productRequests
    .filter((req) => {
      const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (req.notes && req.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'All' || req.type === filterType;
      const matchesPriority = filterPriority === 'All' || req.priority === filterPriority;
      const matchesStatus = filterStatus === 'All' || req.status === filterStatus;

      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        const weightA = a.priority === 'Təcili' ? 3 : a.priority === 'Orta' ? 2 : 1;
        const weightB = b.priority === 'Təcili' ? 3 : b.priority === 'Orta' ? 2 : 1;
        comparison = weightA - weightB;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'az');
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type, 'az');
      } else if (sortBy === 'dateAdded') {
        comparison = a.dateAdded.localeCompare(b.dateAdded);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleEditClick = (req) => {
    setEditingId(req.id);
    setName(req.name);
    setType(req.type);
    setPriority(req.priority);
    setNotes(req.notes || '');
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setName('');
    setType('Azalmış mallar');
    setPriority('Orta');
    setNotes('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName('');
    setType('Azalmış mallar');
    setPriority('Orta');
    setNotes('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      editProductRequest(editingId, {
        name,
        type,
        priority,
        notes
      });
    } else {
      addProductRequest({
        name,
        type,
        priority,
        notes
      });
    }

    handleCloseModal();
  };

  const isOwner = user?.role === 'Admin';

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
            <h1 className="page-heading">Sifariş Siyahısı (Tədarük)</h1>
            <p className="page-subheading">Mağazada azalan, bitən və müştərilərin tələb etdiyi məhsulların reyestri</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Məhsul / İstək Əlavə Et
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="kpi-cards-grid" style={{ marginBottom: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {/* Card 1: Pending */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gözləyən Sifarişlər</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalPending}</span>
            </div>
          </div>

          {/* Card 2: Urgent */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className={`kpi-icon-wrapper ${totalUrgent > 0 ? 'pulse-urgent' : ''}`} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Təcili Alınmalı</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800, color: totalUrgent > 0 ? '#ef4444' : 'var(--text-primary)' }}>{totalUrgent}</span>
            </div>
          </div>

          {/* Card 3: Fulfilled */}
          <div className="kpi-card glass-panel" style={{ padding: '16px' }}>
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Təmin Edilənlər</span>
              <span className="kpi-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalFulfilled}</span>
            </div>
          </div>
        </div>

        {/* Interactive Filters Panel */}
        <div className="analytics-filter-bar glass-panel" style={{ marginBottom: 'var(--spacing-md)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
            <Search className="text-muted" size={18} />
            <input 
              type="text"
              placeholder="Məhsul adı və ya qeydlərdə axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          </div>
          
          <div className="filters-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {/* Status Filter */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                <option value="All">Hamısı</option>
                <option value="Gözləyir">Gözləyir</option>
                <option value="Təmin olundu">Təmin olundu</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tələb Tipi</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                <option value="All">Bütün Tiplər</option>
                <option value="Azalmış mallar">Azalmış mallar</option>
                <option value="Bitmiş mallar">Bitmiş mallar</option>
                <option value="Müştəri sorğusu">Müştəri sorğusu</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Prioritet</label>
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                <option value="All">Bütün Dərəcələr</option>
                <option value="Təcili">Təcili</option>
                <option value="Orta">Orta</option>
                <option value="Kiçik">Kiçik</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sıralama</label>
              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                <option value="dateAdded-desc">Tarix (Yeni-Köhnə)</option>
                <option value="dateAdded-asc">Tarix (Köhnə-Yeni)</option>
                <option value="priority-desc">Prioritet (Təcili-Kiçik)</option>
                <option value="priority-asc">Prioritet (Kiçik-Təcili)</option>
                <option value="name-asc">Məhsul Adı (A-Z)</option>
                <option value="name-desc">Məhsul Adı (Z-A)</option>
                <option value="status-asc">Status (Gözləyir-Təmin)</option>
                <option value="status-desc">Status (Təmin-Gözləyir)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table Registry */}
        <div className="invoices-layout-grid">
          <div className="table-card glass-panel">
            <div className="table-header">
              <h3>Tələb və Sifariş Siyahısı</h3>
              <span className="count-badge">{filteredRequests.length} qeyd</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Ada görə sırala">
                      Məhsul Adı {getSortIcon('name')}
                    </th>
                    <th onClick={() => handleSort('type')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Tələb tipinə görə sırala">
                      Tələb Tipi {getSortIcon('type')}
                    </th>
                    <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Prioritetə görə sırala">
                      Prioritet {getSortIcon('priority')}
                    </th>
                    <th onClick={() => handleSort('dateAdded')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Qeyd tarixinə görə sırala">
                      Qeyd Tarixi {getSortIcon('dateAdded')}
                    </th>
                    <th>Təmin Tarixi</th>
                    <th>Qeydlər</th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Statusa görə sırala">
                      Status {getSortIcon('status')}
                    </th>
                    <th>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      return (
                        <tr 
                          key={req.id} 
                          style={{ 
                            opacity: req.status === 'Təmin olundu' ? 0.75 : 1,
                            backgroundColor: req.status === 'Təmin olundu' ? 'rgba(34, 197, 94, 0.02)' : 'transparent',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <td className="bold-text" style={{ 
                            textDecoration: req.status === 'Təmin olundu' ? 'line-through' : 'none',
                            color: req.status === 'Təmin olundu' ? 'var(--text-muted)' : 'var(--text-primary)'
                          }}>
                            {req.name}
                          </td>
                          <td>
                            {req.type === 'Azalmış mallar' ? (
                              <span className="status-pill status-warning" style={{ fontSize: '0.72rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                Azalmış mal
                              </span>
                            ) : req.type === 'Bitmiş mallar' ? (
                              <span className="status-pill status-danger" style={{ fontSize: '0.72rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                Bitmiş mal
                              </span>
                            ) : (
                              <span className="status-pill status-info" style={{ fontSize: '0.72rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                                Müştəri sorğusu
                              </span>
                            )}
                          </td>
                          <td>
                            {req.priority === 'Təcili' ? (
                              <span className="status-pill status-danger" style={{ fontSize: '0.72rem', fontWeight: 'bold', animation: req.status === 'Gözləyir' ? 'pulse-urgency 2s infinite' : 'none' }}>
                                Təcili
                              </span>
                            ) : req.priority === 'Orta' ? (
                              <span className="status-pill status-warning" style={{ fontSize: '0.72rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 'bold' }}>
                                Orta
                              </span>
                            ) : (
                              <span className="status-pill" style={{ fontSize: '0.72rem', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 'bold' }}>
                                Kiçik
                              </span>
                            )}
                          </td>
                          <td>{req.dateAdded}</td>
                          <td>{req.dateFulfilled || '-'}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.notes}>
                            {req.notes || '-'}
                          </td>
                          <td>
                            {req.status === 'Təmin olundu' ? (
                              <span className="status-pill status-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={10} /> Təmin olundu
                              </span>
                            ) : (
                              <span className="status-pill status-pending" style={{ fontSize: '0.72rem' }}>
                                Gözləyir
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {req.status === 'Gözləyir' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => fulfillProductRequest(req.id)}
                                  style={{ padding: '5px 10px', fontSize: '0.72rem', backgroundColor: '#22c55e', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Təmin Olundu olaraq qeyd et"
                                >
                                  <Check size={12} /> Təmin Olundu
                                </button>
                              )}
                              
                              {/* Edit / Delete Actions */}
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEditClick(req)}
                                style={{ padding: '5px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Düzəliş et"
                              >
                                <Edit size={12} />
                              </button>
                              
                              {isOwner && (
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    if (window.confirm("Bu sifariş qeydini silmək istədiyinizdən əminsiniz?")) {
                                      deleteProductRequest(req.id);
                                    }
                                  }}
                                  style={{ padding: '5px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                  title="Sil"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Heç bir sifariş və ya məhsul tələbi qeydi tapılmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal: Add/Edit Supply Request Form */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <motion.div 
              className="modal-content glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{ maxWidth: '540px' }}
            >
              <div className="modal-header">
                <h3>{editingId ? 'Sifariş Qeydini Düzəlt' : 'Yeni Sifariş / İstək Əlavə Et'}</h3>
                <button className="close-modal-btn" onClick={handleCloseModal}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                
                <div className="form-group">
                  <label>Məhsul Adı</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Məsələn: Südlük Süd 1L, Snickers Şokolad və s."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tələb Tipi</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                      <option value="Azalmış mallar">Azalmış mallar (Stok azalır)</option>
                      <option value="Bitmiş mallar">Bitmiş mallar (Stok tükənib)</option>
                      <option value="Müştəri sorğusu">Müştəri sorğusu (Müştəri istəyi)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tədarük Dərəcəsi (Prioritet)</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                      <option value="Təcili">Təcili (Tezliklə alınmalıdır)</option>
                      <option value="Orta">Orta (Normal ehtiyac)</option>
                      <option value="Kiçik">Kiçik (Aşağı ehtiyac)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Qeydlər / Şərhlər</label>
                  <textarea 
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Məhsul sayı, xüsusi paket tələbləri və ya müştəri qeydləri..."
                  />
                </div>

                <div className="modal-actions" style={{ marginTop: '14px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Ləğv et</button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Dəyişiklikləri Saxla' : 'Siyahıya Əlavə Et'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded urgency pulsing animation keyframe styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-urgency {
          0% {
            background-color: rgba(239, 68, 68, 0.15);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            background-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            background-color: rgba(239, 68, 68, 0.15);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .pulse-urgent {
          animation: pulse-urgency 2s infinite;
          border-radius: 50%;
        }
      `}} />
    </>
  );
};

export default ProductRequests;

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle, 
  Mail, 
  X, 
  UserCheck, 
  UserX, 
  Shield, 
  Settings, 
  UserPlus, 
  AlertCircle,
  Briefcase,
  DollarSign,
  Info
} from 'lucide-react';
import './Pages.css';

export const Employees = () => {
  const { 
    employees, 
    addEmployee, 
    approveEmployee, 
    rejectEmployee, 
    updateEmployeePermissions,
    user: currentUser
  } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Kassir');
  const [grossSalary, setGrossSalary] = useState('');
  const [email, setEmail] = useState('');

  // New employee creation form fields
  const [salaryType, setSalaryType] = useState('aylıq');
  const [addCheckedPermissions, setAddCheckedPermissions] = useState(['tasks', 'daily-tasks', 'notebook']);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDesc, setCustomTaskDesc] = useState('');

  // Permission selection modal state
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null); // The employee whose permissions we are configuring
  const [modalMode, setModalMode] = useState('approve'); // 'approve' or 'edit'
  
  // Local list of active checkbox permissions for the modal
  const [checkedPermissions, setCheckedPermissions] = useState([]);

  // Full catalog of available system permissions and their Azerbaijani labels/descriptions
  const systemPermissions = [
    { key: 'invoices', label: 'Fakturalar', desc: 'Fakturaları görmək və yeni hesab daxil etmək' },
    { key: 'debts', label: 'Borclar', desc: 'Tədarükçü cari borcları və aylıq limitlərin idarəetməsi' },
    { key: 'companies', label: 'Firmalar', desc: 'Formal və qeyri-formal firmaların reyestri' },
    { key: 'tasks', label: 'Tapşırıqlar', desc: 'İşçilərə tapşırıq təyin edilməsi və Kanban lövhəsi' },
    { key: 'daily-tasks', label: 'Gündəlik İşlər', desc: 'Gündəlik rutin işlərin siyahısı və To-Do' },
    { key: 'expiry', label: 'Sroklar', desc: 'Məhsulların son istifadə tarixlərinə nəzarət' },
    { key: 'requests', label: 'Sifariş Siyahısı', desc: 'Mağazada azalan/bitən məhsulların sifariş siyahısı və tədarük nəzarəti' },
    { key: 'expenses', label: 'Xərclər', desc: 'Şirkət xərcləri və işçi maaşlarının ödəniş paneli' },
    { key: 'notebook', label: 'Qeyd Dəftəri', desc: 'Sistemdaxili ümumi və şəxsi qeydlər' },
    { key: 'ai-agent', label: 'AI Agent', desc: 'Süni intellekt köməkçisi və iş avtomatlaşdırması' },
    { key: 'employees', label: 'İşçilərim', desc: 'Heyət idarəetməsi və icazə tənzimləmələri' }
  ];

  // Helper to open the permissions modal
  const handleOpenPermissionModal = (emp, mode) => {
    setSelectedEmp(emp);
    setModalMode(mode);
    
    // Pre-populate checkboxes: 
    // If approving, start with default employee permissions
    // If editing, use their current permissions excluding 'dashboard' (since dashboard is always auto-given)
    if (mode === 'approve') {
      setCheckedPermissions(['tasks', 'daily-tasks', 'notebook']);
    } else {
      setCheckedPermissions(emp.permissions.filter(p => p !== 'dashboard'));
    }
    
    setShowPermissionModal(true);
  };

  const handleCheckboxChange = (permKey) => {
    if (checkedPermissions.includes(permKey)) {
      setCheckedPermissions(checkedPermissions.filter(k => k !== permKey));
    } else {
      setCheckedPermissions([...checkedPermissions, permKey]);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    if (modalMode === 'approve') {
      approveEmployee(selectedEmp.id, checkedPermissions);
    } else {
      updateEmployeePermissions(selectedEmp.id, checkedPermissions);
    }

    setShowPermissionModal(false);
    setSelectedEmp(null);
  };

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    addEmployee({
      name,
      role,
      grossSalary: Number(grossSalary),
      email,
      salaryType,
      permissions: addCheckedPermissions,
      customTaskTitle,
      customTaskDesc
    });

    setName('');
    setRole('Kassir');
    setGrossSalary('');
    setEmail('');
    setSalaryType('aylıq');
    setAddCheckedPermissions(['tasks', 'daily-tasks', 'notebook']);
    setCustomTaskTitle('');
    setCustomTaskDesc('');
    setShowAddForm(false);
  };

  // Filter employees by status
  const pendingEmployees = employees.filter(emp => emp.status === 'Təsdiq Gözləyir');
  const activeEmployees = employees.filter(emp => emp.status === 'Aktiv');
  const rejectedEmployees = employees.filter(emp => emp.status === 'Rədd Edilib');

  // Verify if current user is owner (Admin) to perform write operations
  const isOwner = currentUser?.role === 'Admin';

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header section */}
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">İşçi Heyəti (AsanBiznesim)</h1>
            <p className="page-subheading">Mağaza / Müəssisə əməkdaşlarının idarə olunması, təsdiqlər və rol icazələri</p>
          </div>
          {isOwner && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Yeni İşçi Əlavə Et
            </button>
          )}
        </div>

        {/* Owner Access Validation Info Banner (Only if logged-in user is an Employee) */}
        {!isOwner && (
          <div className="glass-panel" style={{ padding: 'var(--spacing-md)', borderLeft: '4px solid var(--color-warning)', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <AlertCircle size={20} className="text-warning" />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Məhdud Giriş:</strong> Siz sistemə <strong>İşçi</strong> rolu ilə daxil olmusunuz. Heyət idarəetməsi, təsdiqlər və icazələrin dəyişdirilməsi yalnız <strong>Müdir</strong> tərəfindən həyata keçirilə bilər.
            </div>
          </div>
        )}

        {/* Section 1: Pending Approvals Grid - Highly premium visual cards */}
        {isOwner && (
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="table-header" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} className="text-secondary" />
                <span>Təsdiq Gözləyən Qeydiyyatlar</span>
              </h3>
              <span className="count-badge status-pending">{pendingEmployees.length} yeni sorğu</span>
            </div>

            {pendingEmployees.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-md)' }}>
                {pendingEmployees.map((emp) => (
                  <motion.div 
                    key={emp.id}
                    className="debt-item-card glass-panel"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    layout
                  >
                    <div className="debt-card-header">
                      <div className="header-info">
                        <h3 className="bold-text">{emp.name}</h3>
                        <p>{emp.email}</p>
                      </div>
                      <span className="status-pill status-pending">{emp.role}</span>
                    </div>

                    <div className="limit-meter-section" style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <DollarSign size={14} className="text-muted" />
                        <span>Gross Maaş: </span>
                        <span className="bold-text" style={{ marginLeft: 'auto' }}>₼ {emp.grossSalary.toFixed(2)} ({emp.salaryType || 'aylıq'})</span>
                      </div>
                    </div>

                    <div className="debt-card-footer" style={{ marginTop: '4px' }}>
                      <button 
                        className="btn btn-secondary btn-sm btn-danger"
                        onClick={() => rejectEmployee(emp.id)}
                        title="Qeydiyyatı rədd et"
                        style={{ padding: '6px 12px' }}
                      >
                        <UserX size={14} /> Rədd et
                      </button>
                      <button 
                        className="btn btn-primary btn-sm btn-accent"
                        onClick={() => handleOpenPermissionModal(emp, 'approve')}
                        title="Səlahiyyət təyin et və təsdiqlə"
                        style={{ padding: '6px 14px' }}
                      >
                        <UserCheck size={14} /> İcazə Ver və Təsdiqlə
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={24} className="text-success" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Təsdiq gözləyən yeni işçi qeydiyyatı yoxdur.</p>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Active Staff Table */}
        <div className="table-card glass-panel" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="table-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} className="text-success" />
              <span>Aktiv Çalışan Heyət</span>
            </h3>
            <span className="count-badge status-success">{activeEmployees.length} aktiv işçi</span>
          </div>
          
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Vəzifə / Rol</th>
                  <th>E-mail</th>
                  <th>Maaş (Gross)</th>
                  <th>Səlahiyyətlər</th>
                  <th>Status</th>
                  {isOwner && <th>İdarəetmə</th>}
                </tr>
              </thead>
              <tbody>
                {activeEmployees.length > 0 ? (
                  activeEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="bold-text">{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>
                        <span className="file-attachment-badge">
                          <Mail size={12} /> {emp.email}
                        </span>
                      </td>
                      <td className="bold-text">₼ {emp.grossSalary.toFixed(2)} ({emp.salaryType || 'aylıq'})</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                          {emp.permissions && emp.permissions.length > 0 ? (
                            emp.permissions.map((pKey) => {
                              if (pKey === 'dashboard') return null; // Skip dashboard as it is common
                              const match = systemPermissions.find(sp => sp.key === pKey);
                              return match ? (
                                <span 
                                  key={pKey} 
                                  className="assigned-badge"
                                  style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                                >
                                  {match.label}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-italics">Səlahiyyət yoxdur</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="status-pill status-success">
                          {emp.status}
                        </span>
                      </td>
                      {isOwner && (
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenPermissionModal(emp, 'edit')}
                            style={{ padding: '4px 8px', display: 'inline-flex', gap: '4px' }}
                            title="Səlahiyyətləri dəyişdir"
                          >
                            <Settings size={12} /> Tənzimlə
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isOwner ? 7 : 6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Siyahıda heç bir aktiv çalışan işçi yoxdur.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Rejected/Inactive Applicants */}
        {isOwner && rejectedEmployees.length > 0 && (
          <div className="table-card glass-panel" style={{ opacity: 0.8 }}>
            <div className="table-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="text-muted">
                <UserX size={18} className="text-muted" />
                <span>Rədd Edilən Müraciətlər</span>
              </h3>
              <span className="count-badge status-danger">{rejectedEmployees.length} müraciət</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Vəzifə</th>
                    <th>E-mail</th>
                    <th>Maaş</th>
                    <th>Status</th>
                    <th>Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="bold-text text-muted">{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>{emp.email}</td>
                      <td>₼ {emp.grossSalary.toFixed(2)}</td>
                      <td>
                        <span className="status-pill status-danger">Rədd edilib</span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-accent btn-sm"
                          onClick={() => handleOpenPermissionModal(emp, 'approve')}
                          style={{ padding: '4px 8px' }}
                        >
                          Yenidən Bax
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* MODAL 1: Permissions Allocation Dialog - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      <AnimatePresence>
        {showPermissionModal && selectedEmp && (
          <div className="modal-overlay" onClick={() => setShowPermissionModal(false)}>
            <motion.div 
              className="modal-content glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{ maxWidth: '540px' }}
            >
              <div className="modal-header">
                <h3>
                  {modalMode === 'approve' 
                    ? `İşçinin Qəbulu və İcazələr` 
                    : `Səlahiyyət Tənzimləmələri`
                  }
                </h3>
                <button className="close-modal-btn" onClick={() => setShowPermissionModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="modal-form">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedEmp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                    <span>{selectedEmp.role}</span>
                    <span>•</span>
                    <span>{selectedEmp.email}</span>
                  </div>
                </div>

                <div style={{ margin: '8px 0 4px 0', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  GİRİŞ İCAZƏSİ VERİLƏCƏK SƏHİFƏLƏR:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {systemPermissions.map((perm) => (
                    <div 
                      key={perm.key}
                      onClick={() => handleCheckboxChange(perm.key)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        padding: '10px', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: checkedPermissions.includes(perm.key) ? 'var(--color-primary-extralight)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={checkedPermissions.includes(perm.key)}
                        onChange={() => {}} // Controlled manually via div click
                        style={{ marginTop: '3px', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {perm.label}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {perm.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.1)', marginTop: '4px' }}>
                  <Info size={14} className="text-accent" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    * <strong>Ana Səhifə (Dashboard)</strong> icazəsi bütün təsdiqlənmiş işçilərə standart olaraq verilir.
                  </span>
                </div>

                <div className="modal-actions" style={{ marginTop: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPermissionModal(false)}
                  >
                    Ləğv et
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'approve' ? 'Təsdiqlə və Aktiv Et' : 'Dəyişiklikləri Saxla'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add New Employee Form - RENDERED OUTSIDE FOR FULL VIEWPORT OVERLAY */}
      <AnimatePresence>
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <motion.div 
              className="modal-content glass-panel" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '580px' }}
            >
              <div className="modal-header">
                <h3>Yeni İşçi Qeydiyyatı (Müdir tərəfindən)</h3>
                <button className="close-modal-btn" onClick={() => setShowAddForm(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddEmployeeSubmit} className="modal-form">
                <div className="form-group">
                  <label>Adı və Soyadı</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Məsələn: İlqar Məmmədov" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>E-mail ünvanı</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@asanbiznesim.az" 
                    required 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Vəzifə / Rol</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                      <option value="Kassir">Kassir</option>
                      <option value="Satıcı">Satıcı</option>
                      <option value="Anbardar">Anbardar</option>
                      <option value="Müdir">Müdir (Admin)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Gross Maaş (₼)</label>
                    <input 
                      type="number" 
                      value={grossSalary} 
                      onChange={(e) => setGrossSalary(e.target.value)} 
                      placeholder="800.00" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Maaş Dövrü</label>
                    <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)} required>
                      <option value="aylıq">Aylıq</option>
                      <option value="həftəlik">Həftəlik</option>
                      <option value="günlük">Günlük</option>
                    </select>
                  </div>
                </div>

                <div style={{ margin: '12px 0 4px 0', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  GİRİŞ İCAZƏSİ VERİLƏCƏK SƏHİFƏLƏR:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '12px', backgroundColor: 'var(--bg-primary)' }}>
                  {systemPermissions.map((perm) => (
                    <label 
                      key={perm.key}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: addCheckedPermissions.includes(perm.key) ? 'var(--color-primary-extralight)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 600
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={addCheckedPermissions.includes(perm.key)}
                        onChange={() => {
                          if (addCheckedPermissions.includes(perm.key)) {
                            setAddCheckedPermissions(addCheckedPermissions.filter(k => k !== perm.key));
                          } else {
                            setAddCheckedPermissions([...addCheckedPermissions, perm.key]);
                          }
                        }}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    XÜSUSİ TAPŞIRIQ TƏYİN ET (KÖNÜLLÜ)
                  </h4>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Tapşırıq Başlığı</label>
                      <input 
                        type="text" 
                        placeholder="Məsələn: Rəflərdəki köhnə malları təmizlə" 
                        value={customTaskTitle} 
                        onChange={(e) => setCustomTaskTitle(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '6px' }}>
                    <label>Tapşırıq Açıqlaması</label>
                    <textarea 
                      rows="2" 
                      placeholder="Tapşırıq haqqında ətraflı qeydlər..." 
                      value={customTaskDesc} 
                      onChange={(e) => setCustomTaskDesc(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '14px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Ləğv et</button>
                  <button type="submit" className="btn btn-primary">İşçini Əlavə Et</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Employees;

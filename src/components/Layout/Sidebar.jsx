import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  CreditCard, 
  Building2, 
  CheckSquare, 
  CalendarRange, 
  Hourglass, 
  Users, 
  Receipt, 
  Notebook, 
  Cpu, 
  UserCircle,
  BarChart2,
  LogOut,
  ClipboardList,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Package
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  
  // Collapsible navigation groups state
  const [openGroups, setOpenGroups] = useState({
    partners: true,  // "FİRMALAR VƏ MALİYYƏ"
    staff: true,     // "NİZAM-İNTİZAM VƏ HEYƏT"
    schedule: true,  // "İŞLƏR VƏ NƏZARƏT" (Tasks, Daily tasks, Expiry)
    others: true     // "DİGƏR BÖLMƏLƏR" (Expenses, Notebook, AI Agent, Analytics)
  });

  if (!user) return null;

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const getNavLinkClass = ({ isActive }) => 
    `sidebar-nav-link ${isActive ? 'active' : ''}`;

  // Helper function to check permissions
  const hasPermission = (permissionName) => {
    return user.permissions && user.permissions.includes(permissionName);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-section">
          <div className="brand-logo-container">
            <img 
              src="/img/logo.svg" 
              alt="AsanBiznesim" 
              className="brand-logo-image"
            />
            <div className="brand-logo-text">
              <h3>AsanBiznesim</h3>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav-menu" style={{ gap: '12px' }}>
          
          {/* STANDALONE: ANA SƏHİFƏ (At the very top, alone) */}
          {hasPermission('dashboard') && (
            <NavLink to="/app" end className={getNavLinkClass} onClick={onClose} style={{ marginBottom: '2px' }}>
              <Home size={16} />
              <span style={{ fontWeight: 600 }}>Ana Səhifə</span>
            </NavLink>
          )}

          {/* GROUP 1: PARTNERS & FINANCIALS (FİRMALAR VƏ MALİYYƏ) */}
          <div className="sidebar-nav-section">
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleGroup('partners')}
            >
              <span>FİRMALAR VƏ MALİYYƏ</span>
              {openGroups.partners ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>

            <AnimatePresence initial={false}>
              {openGroups.partners && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {hasPermission('companies') && (
                    <NavLink to="/app/companies" className={getNavLinkClass} onClick={onClose}>
                      <Building2 size={16} />
                      <span>Firmalar</span>
                    </NavLink>
                  )}

                  {hasPermission('invoices') && (
                    <NavLink to="/app/invoices" className={getNavLinkClass} onClick={onClose}>
                      <FileText size={16} />
                      <span>Fakturalar</span>
                    </NavLink>
                  )}

                  {hasPermission('debts') && (
                    <NavLink to="/app/debts" className={getNavLinkClass} onClick={onClose}>
                      <CreditCard size={16} />
                      <span>Borclar</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GROUP 2: HR & REGULATIONS (NİZAM-İNTİZAM VƏ HEYƏT) */}
          <div className="sidebar-nav-section">
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleGroup('staff')}
            >
              <span>NİZAM-İNTİZAM VƏ HEYƏT</span>
              {openGroups.staff ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>

            <AnimatePresence initial={false}>
              {openGroups.staff && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {hasPermission('employees') && (
                    <NavLink to="/app/employees" className={getNavLinkClass} onClick={onClose}>
                      <Users size={16} />
                      <span>İşçilərim</span>
                    </NavLink>
                  )}

                  {hasPermission('instructions') && (
                    <NavLink to="/app/instructions" className={getNavLinkClass} onClick={onClose}>
                      <BookOpen size={16} />
                      <span>Qaydalar və Təlimatlar</span>
                    </NavLink>
                  )}

                  {hasPermission('reports') && (
                    <NavLink to="/app/reports" className={getNavLinkClass} onClick={onClose}>
                      <ClipboardList size={16} />
                      <span>Açotlar</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GROUP 3: SCHEDULE & CONTROL (İŞLƏR VƏ NƏZARƏT) - Added as requested */}
          <div className="sidebar-nav-section">
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleGroup('schedule')}
            >
              <span>İŞLƏR VƏ NƏZARƏT</span>
              {openGroups.schedule ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>

            <AnimatePresence initial={false}>
              {openGroups.schedule && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {hasPermission('tasks') && (
                    <NavLink to="/app/tasks" className={getNavLinkClass} onClick={onClose}>
                      <CheckSquare size={16} />
                      <span>Tapşırıqlar</span>
                    </NavLink>
                  )}

                  {hasPermission('daily-tasks') && (
                    <NavLink to="/app/daily-tasks" className={getNavLinkClass} onClick={onClose}>
                      <CalendarRange size={16} />
                      <span>Gündəlik İşlər</span>
                    </NavLink>
                  )}

                  {hasPermission('expiry') && (
                    <NavLink to="/app/expiry" className={getNavLinkClass} onClick={onClose}>
                      <Hourglass size={16} />
                      <span>Sroklar</span>
                    </NavLink>
                  )}

                  {hasPermission('requests') && (
                    <NavLink to="/app/requests" className={getNavLinkClass} onClick={onClose}>
                      <Package size={16} />
                      <span>Sifariş Siyahısı</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GROUP 4: OTHER TOOLS (DİGƏR BÖLMƏLƏR) - Added as requested */}
          <div className="sidebar-nav-section">
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleGroup('others')}
            >
              <span>DİGƏR BÖLMƏLƏR</span>
              {openGroups.others ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>

            <AnimatePresence initial={false}>
              {openGroups.others && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {hasPermission('expenses') && (
                    <NavLink to="/app/expenses" className={getNavLinkClass} onClick={onClose}>
                      <Receipt size={16} />
                      <span>Xərclər (Rasxod)</span>
                    </NavLink>
                  )}

                  {hasPermission('notebook') && (
                    <NavLink to="/app/notebook" className={getNavLinkClass} onClick={onClose}>
                      <Notebook size={16} />
                      <span>Qeyd Dəftəri</span>
                    </NavLink>
                  )}

                  {hasPermission('ai-agent') && (
                    <NavLink to="/app/ai-agent" className={getNavLinkClass} onClick={onClose}>
                      <Cpu size={16} />
                      <span>AI Agent</span>
                    </NavLink>
                  )}

                  {hasPermission('analytics') && (
                    <NavLink to="/app/analytics" className={getNavLinkClass} onClick={onClose}>
                      <BarChart2 size={16} />
                      <span>Analiz və Hesabat</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STANDALONE: PROFİLİM (At the very bottom, alone) */}
          <NavLink to="/app/profile" className={getNavLinkClass} onClick={onClose} style={{ marginTop: '2px' }}>
            <UserCircle size={16} />
            <span style={{ fontWeight: 600 }}>Profilim</span>
          </NavLink>

        </nav>

        <div className="sidebar-footer-section">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <span>{user.initials}</span>
              )}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">
                {user.role === 'Admin' ? 'Müdir' : 'İşçi'}
              </span>
            </div>
          </div>
          <button className="sidebar-logout-button" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} />
            <span>Çıxış</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

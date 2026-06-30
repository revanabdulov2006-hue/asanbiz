import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Receipt, Users, Plus, ShieldAlert, X } from 'lucide-react';
import './Pages.css';

export const Expenses = () => {
  const { 
    expenses, 
    salaries, 
    budgetLimits, 
    employees, 
    addExpense, 
    paySalary,
    user
  } = useStore();

  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSalary, setShowAddSalary] = useState(false);

  const [category, setCategory] = useState('İcarə');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [employeeId, setEmployeeId] = useState('');
  const [grossSalary, setGrossSalary] = useState('');

  const taxAmount = grossSalary ? Number(grossSalary) * 0.15 : 0;
  const insuranceAmount = grossSalary ? Number(grossSalary) * 0.08 : 0;
  const netSalary = grossSalary ? Number(grossSalary) - taxAmount - insuranceAmount : 0;

  const visibleExpenses = expenses.filter(exp => !(user?.role === 'Employee' && exp.category === 'Maaş'));
  const visibleBudgets = budgetLimits.filter(b => !(user?.role === 'Employee' && b.category === 'Maaş'));

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    addExpense({
      type: 'Şirkət',
      category,
      amount: Number(amount),
      description,
      expenseDate
    });
    setAmount('');
    setDescription('');
    setShowAddExpense(false);
  };

  const handleSalarySubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !grossSalary) return;
    
    const emp = employees.find(emp => emp.id === Number(employeeId));
    if (emp) {
      addExpense({
        type: 'Şirkət',
        category: 'Maaş',
        amount: netSalary,
        description: `${emp.name} üçün xalis maaş ödənişi (Brüt: ${grossSalary} ₼)`,
        expenseDate: new Date().toISOString().split('T')[0]
      });
      alert(`Maaş Hesablandı və Ödənildi!\n\nİşçi: ${emp.name}\nBrüt: ${grossSalary} ₼\nVergi (15%): ${taxAmount.toFixed(2)} ₼\nSığorta (8%): ${insuranceAmount.toFixed(2)} ₼\nXalis (Net): ${netSalary.toFixed(2)} ₼`);
    }

    setEmployeeId('');
    setGrossSalary('');
    setShowAddSalary(false);
  };

  const getCategorySpend = (cat) => {
    return expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">Gider Və Maaş Yönetimi</h1>
            <p className="page-subheading">Şirkət xərclərinin kateqoriyalara görə təsnifatı və əmək haqları</p>
          </div>
          <div className="page-actions-row">
            <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
              <Plus size={16} /> Gider Əlavə Et
            </button>
            {user?.role === 'Admin' && (
              <button className="btn btn-accent" onClick={() => setShowAddSalary(true)}>
                <Users size={16} /> Maaş Hesabla
              </button>
            )}
          </div>
        </div>

        <div className="tabs-header-row">
          <button className={`tab-pill-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
            <Receipt size={16} /> Şirkət Giderləri
          </button>
          {user?.role === 'Admin' && (
            <button className={`tab-pill-btn ${activeTab === 'salaries' ? 'active' : ''}`} onClick={() => setActiveTab('salaries')}>
              <Users size={16} /> Maaş Reyestri
            </button>
          )}
          <button className={`tab-pill-btn ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>
            <ShieldAlert size={16} /> Büdcə Limitləri
          </button>
        </div>

        <div className="tab-contents-panel">
          {activeTab === 'expenses' && (
            <div className="table-card glass-panel">
              <div className="table-header">
                <h3>Xərc Reyestri</h3>
                <span className="count-badge">{visibleExpenses.length} xərc qeydi</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tarix</th>
                      <th>Növü</th>
                      <th>Kateqoriya</th>
                      <th>Açıqlama</th>
                      <th>Məbləğ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.date || exp.expenseDate}</td>
                        <td><span className={`status-pill ${exp.type === 'Şirkət' ? 'status-info' : 'status-pending'}`}>{exp.type}</span></td>
                        <td className="bold-text">{exp.category}</td>
                        <td>{exp.description}</td>
                        <td className="bold-text text-red">₼ {exp.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'salaries' && (
            <div className="table-card glass-panel">
              <div className="table-header">
                <h3>Hesablanmış Əmək Haqları</h3>
                <span className="count-badge">{salaries.length} ödəniş</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>İşçi</th>
                      <th>Gross Maaş</th>
                      <th>Vergi (15%)</th>
                      <th>Sığorta (8%)</th>
                      <th>Net Maaş</th>
                      <th>Tarix</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((sal) => {
                      const emp = employees.find(e => e.id === sal.employeeId);
                      return (
                        <tr key={sal.id}>
                          <td className="bold-text">{emp ? emp.name : 'Unknown'}</td>
                          <td>₼ {sal.grossSalary.toFixed(2)}</td>
                          <td className="text-red">- ₼ {sal.taxAmount.toFixed(2)}</td>
                          <td className="text-red">- ₼ {sal.insuranceAmount.toFixed(2)}</td>
                          <td className="bold-text text-green">₼ {sal.netSalary.toFixed(2)}</td>
                          <td>{sal.paymentDate || 'Gözləyir'}</td>
                          <td>
                            <button 
                              className={`status-pill btn-sm ${sal.status === 'Ölənilib' ? 'status-success' : 'status-warning'}`}
                              onClick={() => sal.status === 'Gözləyir' && paySalary(sal.id)}
                              disabled={sal.status === 'Ölənilib'}
                            >
                              {sal.status === 'Ölənilib' ? 'Ölənilib' : 'Ödə'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'budgets' && (
            <div className="budget-limits-layout-grid">
              {visibleBudgets.map((b) => {
                const currentSpend = getCategorySpend(b.category);
                const percentUsed = Math.min(100, (currentSpend / b.limit) * 100);
                const isExceeded = currentSpend > b.limit;
                const isWarning = currentSpend > b.limit * 0.8 && !isExceeded;

                let barColor = 'var(--color-primary)';
                if (isExceeded) barColor = 'var(--color-error)';
                else if (isWarning) barColor = 'var(--color-warning)';

                return (
                  <div key={b.category} className="budget-meter-card glass-panel">
                    <div className="budget-card-top-info">
                      <h4>{b.category}</h4>
                      <span className={isExceeded ? 'text-red' : 'text-muted'}>
                        ₼ {currentSpend.toFixed(2)} / <strong>₼ {b.limit.toFixed(2)}</strong>
                      </span>
                    </div>
                    
                    <div className="budget-progress-track">
                      <div 
                        className="budget-progress-fill" 
                        style={{ 
                          width: `${percentUsed}%`,
                          backgroundColor: barColor 
                        }} 
                      />
                    </div>

                    <div className="budget-card-bottom-info">
                      <span>{percentUsed.toFixed(0)}% istifadə</span>
                      {isExceeded && <span className="text-red bold">Büdcə aşılıb!</span>}
                      {isWarning && <span className="text-orange bold">Limitə yaxınlaşır!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {showAddExpense && (
        <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Yeni Xərc Əlavə Et</h3>
              <button className="close-modal-btn" onClick={() => setShowAddExpense(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="modal-form">
              <div className="form-group">
                <label>Kateqoriya</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="İcarə">İcarə</option>
                  <option value="Kommunal">Kommunal</option>
                  <option value="Pazarlama">Pazarlama</option>
                  <option value="Nəqliyyat">Nəqliyyat</option>
                  <option value="Digər">Digər</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Məbləğ (₼)</label>
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Tarix</label>
                  <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Açıqlama</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Təfərrüatlar..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddExpense(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAddSalary && (
        <div className="modal-overlay" onClick={() => setShowAddSalary(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>Maaş Hesabla & Ödə</h3>
              <button className="close-modal-btn" onClick={() => setShowAddSalary(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSalarySubmit} className="modal-form">
              <div className="form-group">
                <label>İşçi seçimi</label>
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                  <option value="">İşçi seçin</option>
                  {employees.filter(e => e.status === 'Aktiv').map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Gross Maaş məbləği (₼)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Məsələn: 800" 
                  value={grossSalary} 
                  onChange={(e) => setGrossSalary(e.target.value)} 
                  required 
                />
              </div>

              <div className="salary-calculation-preview-box">
                <h4>Avtomatik Hesablama Cədvəli</h4>
                <div className="preview-row">
                  <span>Gross Maaş:</span>
                  <span className="bold">₼ {grossSalary ? Number(grossSalary).toFixed(2) : '0.00'}</span>
                </div>
                <div className="preview-row text-red">
                  <span>Gelir Vergisi (15%):</span>
                  <span>- ₼ {taxAmount.toFixed(2)}</span>
                </div>
                <div className="preview-row text-red">
                  <span>Sosyal Sığorta (8%):</span>
                  <span>- ₼ {insuranceAmount.toFixed(2)}</span>
                </div>
                <hr className="calc-divider" />
                <div className="preview-row preview-net text-green">
                  <span>Net Maaş (Ödəniləcək):</span>
                  <span className="bold">₼ {netSalary.toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSalary(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Hesabla və Ödə</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
export default Expenses;

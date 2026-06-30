import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  CheckSquare, 
  Building2, 
  CalendarRange, 
  Hourglass, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard = () => {
  const { 
    user, 
    debts, 
    tasks, 
    dailyTasks, 
    expiryProducts, 
    invoices, 
    payments, 
    companies 
  } = useStore();
  const navigate = useNavigate();

  const totalDebtAmount = debts.reduce((sum, d) => sum + d.totalDebt, 0);
  const pendingTasksCount = tasks.filter(t => t.status !== 'Tamamlandı').length;
  const completedDailyCount = dailyTasks.filter(d => d.completed).length;
  const expiredCount = expiryProducts.filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi').length;
  const expiringCount = expiryProducts.filter(p => p.daysLeft >= 0 && p.daysLeft <= 7 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi').length;

  const expiredProductsList = expiryProducts.filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi');
  const expiringProductsList = expiryProducts.filter(p => p.daysLeft >= 0 && p.daysLeft <= 7 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi');

  const chartData = [
    { name: 'Yan', Alış: 4500, Ödəniş: 3800 },
    { name: 'Fev', Alış: 5200, Ödəniş: 4100 },
    { name: 'Mar', Alış: 6100, Ödəniş: 5800 },
    { name: 'Apr', Alış: 4800, Ödəniş: 4900 },
    { name: 'May', Alış: 5900, Ödəniş: 5200 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      className="dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {expiredCount > 0 && (
        <motion.div className="dashboard-alert alert-danger glass-panel" variants={itemVariants}>
          <div className="alert-content">
            <AlertTriangle className="alert-icon" />
            <span><strong>{expiredCount}</strong> məhsulun son istifadə tarixi keçib!</span>
          </div>
          <button className="alert-action-btn" onClick={() => navigate('/app/expiry')}>Bax</button>
        </motion.div>
      )}

      {expiringCount > 0 && (
        <motion.div className="dashboard-alert alert-warning glass-panel" variants={itemVariants}>
          <div className="alert-content">
            <AlertTriangle className="alert-icon" />
            <span><strong>{expiringCount}</strong> məhsulun son istifadə tarixinə 7 gündən az qalıb!</span>
          </div>
          <button className="alert-action-btn" onClick={() => navigate('/app/expiry')}>Bax</button>
        </motion.div>
      )}

      <motion.div className="stats-cards-grid" variants={containerVariants}>
        <motion.div 
          className="stat-card-wrapper glass-panel cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => navigate('/app/debts')}
        >
          <div className="stat-card-info">
            <span className="stat-card-label">Ümumi Borc</span>
            <h2 className="stat-card-value">₼ {totalDebtAmount.toFixed(2)}</h2>
          </div>
          <div className="stat-card-icon icon-orange">
            <CreditCard size={22} />
          </div>
        </motion.div>

        <motion.div 
          className="stat-card-wrapper glass-panel cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => navigate('/app/tasks')}
        >
          <div className="stat-card-info">
            <span className="stat-card-label">Gözləyən Tapşırıqlar</span>
            <h2 className="stat-card-value">{pendingTasksCount}</h2>
          </div>
          <div className="stat-card-icon icon-blue">
            <CheckSquare size={22} />
          </div>
        </motion.div>

        {user?.role === 'Admin' && (
          <motion.div 
            className="stat-card-wrapper glass-panel cursor-pointer"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => navigate('/app/companies')}
          >
            <div className="stat-card-info">
              <span className="stat-card-label">Firmalar</span>
              <h2 className="stat-card-value">{companies.length}</h2>
            </div>
            <div className="stat-card-icon icon-green">
              <Building2 size={22} />
            </div>
          </motion.div>
        )}

        <motion.div 
          className="stat-card-wrapper glass-panel cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => navigate('/app/daily-tasks')}
        >
          <div className="stat-card-info">
            <span className="stat-card-label">Gündəlik İşlər</span>
            <h2 className="stat-card-value">{completedDailyCount}/{dailyTasks.length}</h2>
          </div>
          <div className="stat-card-icon icon-purple">
            <CalendarRange size={22} />
          </div>
        </motion.div>

        <motion.div 
          className="stat-card-wrapper glass-panel cursor-pointer"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => navigate('/app/expiry')}
        >
          <div className="stat-card-info">
            <span className="stat-card-label">Bitən Sroklar</span>
            <h2 className="stat-card-value">{expiredCount + expiringCount}</h2>
          </div>
          <div className="stat-card-icon icon-red">
            <Hourglass size={22} />
          </div>
        </motion.div>
      </motion.div>

      <div className="dashboard-main-row">
        <motion.div className="dashboard-chart-card glass-panel" variants={itemVariants}>
          <div className="card-header-row">
            <div>
              <h3>Aylıq Analiz Göstəriciləri</h3>
              <p>Son 5 ayın alış və ödəniş dinamikası</p>
            </div>
            <div className="trend-badge">
              <TrendingUp size={14} /> 8.4% artım
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAlis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOdenis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }} 
                />
                <Area type="monotone" dataKey="Alış" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorAlis)" strokeWidth={2} />
                <Area type="monotone" dataKey="Ödəniş" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorOdenis)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="dashboard-quick-actions glass-panel" variants={itemVariants}>
          <h3>Sürətli Keçidlər</h3>
          <p>Tez əməliyyat aparmaq üçün keçidlər</p>
          <div className="quick-actions-grid">
            <button className="quick-action-pill" onClick={() => navigate('/app/invoices')}>
              <div className="pill-icon"><Plus size={18} /></div>
              <span>Yeni Faktura</span>
            </button>
            <button className="quick-action-pill" onClick={() => navigate('/app/debts')}>
              <div className="pill-icon"><CreditCard size={18} /></div>
              <span>Ödəniş Et</span>
            </button>
            <button className="quick-action-pill" onClick={() => navigate('/app/notebook')}>
              <div className="pill-icon"><Plus size={18} /></div>
              <span>Not Əlavə et</span>
            </button>
            <button className="quick-action-pill" onClick={() => navigate('/app/expiry')}>
              <div className="pill-icon"><Hourglass size={18} /></div>
              <span>Srok Əlavə et</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-activity-row">
        <motion.div className="activity-column glass-panel" variants={itemVariants}>
          <div className="column-header">
            <h3>Son Borclar (Fakturalar)</h3>
            <button onClick={() => navigate('/app/invoices')} className="view-all-btn">
              Hamısı <ArrowRight size={14} />
            </button>
          </div>
          <div className="column-list">
            {invoices.slice(0, 3).map((invoice) => {
              const comp = companies.find(c => c.id === invoice.companyId);
              return (
                <div key={invoice.id} className="activity-row-item">
                  <div className="row-item-left">
                    <div className="row-item-avatar text-green"><FileText size={16} /></div>
                    <div className="row-item-info">
                      <h4>{comp ? comp.name : 'Unknown Company'}</h4>
                      <span>{invoice.date} • {invoice.invoiceNo}</span>
                    </div>
                  </div>
                  <div className="row-item-right">
                    <span className="amount-text">₼ {invoice.amount.toFixed(2)}</span>
                    <span className="status-badge bg-orange">{invoice.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div className="activity-column glass-panel" variants={itemVariants}>
          <div className="column-header">
            <h3>Son Ödənişlər</h3>
            <button onClick={() => navigate('/app/invoices')} className="view-all-btn">
              Hamısı <ArrowRight size={14} />
            </button>
          </div>
          <div className="column-list">
            {payments.slice(0, 3).map((payment) => {
              const comp = companies.find(c => c.id === payment.companyId);
              return (
                <div key={payment.id} className="activity-row-item">
                  <div className="row-item-left">
                    <div className="row-item-avatar text-blue"><CreditCard size={16} /></div>
                    <div className="row-item-info">
                      <h4>{comp ? comp.name : 'Unknown Company'}</h4>
                      <span>{payment.date}</span>
                    </div>
                  </div>
                  <div className="row-item-right">
                    <span className="amount-text text-green">+₼ {payment.amount.toFixed(2)}</span>
                    <span className="status-badge bg-green">Ölənilib</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {(expiredProductsList.length > 0 || expiringProductsList.length > 0) && (
        <div className="dashboard-activity-row">
          {expiredProductsList.length > 0 && (
            <motion.div className="activity-column glass-panel" variants={itemVariants}>
              <div className="column-header">
                <h3 className="text-red">Son İstifadə Tarixi Bitənlər</h3>
              </div>
              <div className="column-list">
                {expiredProductsList.slice(0, 3).map((p) => (
                  <div key={p.id} className="activity-row-item">
                    <div className="row-item-left">
                      <div className="row-item-avatar bg-red-light text-red"><AlertTriangle size={16} /></div>
                      <div className="row-item-info">
                        <h4>{p.productName}</h4>
                        <span>Say: {p.quantity} ədəd</span>
                      </div>
                    </div>
                    <div className="row-item-right">
                      <span className="status-badge bg-red">{Math.abs(p.daysLeft)} gün əvvəl bitib</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {expiringProductsList.length > 0 && (
            <motion.div className="activity-column glass-panel" variants={itemVariants}>
              <div className="column-header">
                <h3 className="text-orange">Yaxınlaşan Sroklar (Siyahı)</h3>
              </div>
              <div className="column-list">
                {expiringProductsList.slice(0, 3).map((p) => (
                  <div key={p.id} className="activity-row-item">
                    <div className="row-item-left">
                      <div className="row-item-avatar bg-orange-light text-orange"><Hourglass size={16} /></div>
                      <div className="row-item-info">
                        <h4>{p.productName}</h4>
                        <span>Tarix: {p.expiryDate}</span>
                      </div>
                    </div>
                    <div className="row-item-right">
                      <span className="status-badge bg-orange">{p.daysLeft} gün qalıb</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};
export default Dashboard;

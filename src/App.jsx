import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Layout
import { Layout } from './components/Layout/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { PendingApproval } from './pages/PendingApproval';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { Debts } from './pages/Debts';
import { Companies } from './pages/Companies';
import { Tasks } from './pages/Tasks';
import { DailyTasks } from './pages/DailyTasks';
import { Expiry } from './pages/Expiry';
import { Expenses } from './pages/Expenses';
import { NotebookPage } from './pages/Notebook';
import { AIAgent } from './pages/AIAgent';
import { Employees } from './pages/Employees';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Instructions } from './pages/Instructions';
import { ProductRequests } from './pages/ProductRequests';

// Protected Route Wrapper for AsanBiznesim Panel
const ProtectedRoute = () => {
  const { user } = useStore();

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If employee is awaiting manager approval, render PendingApproval screen
  if (user.status === 'Təsdiq Gözləyir' || user.status === 'Rədd Edilib') {
    return <PendingApproval />;
  }

  // Otherwise, render full layout with normal dashboard navigation
  return <Layout />;
};

function App() {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="debts" element={<Debts />} />
          <Route path="companies" element={<Companies />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="daily-tasks" element={<DailyTasks />} />
          <Route path="expiry" element={<Expiry />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="notebook" element={<NotebookPage />} />
          <Route path="ai-agent" element={<AIAgent />} />
          <Route path="employees" element={<Employees />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="instructions" element={<Instructions />} />
          <Route path="requests" element={<ProductRequests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

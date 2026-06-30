import { create } from 'zustand';

const defaultUsers = [
  {
    name: 'Araz Süleymanov',
    role: 'Admin', // Admin (Müdir), Employee (İşçi)
    initials: 'AS',
    companyName: 'AsanBiznesim MMC',
    companyCode: 'ASAN-777777',
    email: 'araz@asanbiznesim.az',
    phone: '+994 50 111 22 33',
    bio: 'AsanBiznesim platformasının təsisçisi və baş rəhbəri.',
    profileImage: '/img/logo.svg',
    cvFile: null,
    password: '123456',
    status: 'Aktiv',
    permissions: [
      'dashboard', 'invoices', 'debts', 'companies', 'tasks', 'daily-tasks', 'expiry', 'expenses', 'notebook', 'ai-agent', 'employees', 'analytics', 'reports', 'instructions', 'requests'
    ]
  },
  {
    name: 'Leyla Rəhimova',
    role: 'Employee',
    initials: 'LR',
    companyName: 'AsanBiznesim MMC',
    companyCode: 'ASAN-777777',
    email: 'leyla@market.az',
    password: '123456',
    status: 'Aktiv',
    permissions: ['dashboard', 'tasks', 'daily-tasks']
  },
  {
    name: 'Əli Məmmədov',
    role: 'Employee',
    initials: 'ƏM',
    companyName: 'AsanBiznesim MMC',
    companyCode: 'ASAN-777777',
    email: 'ali@market.az',
    password: '123456',
    status: 'Aktiv',
    permissions: ['dashboard', 'tasks', 'daily-tasks', 'notebook']
  },
  {
    name: 'Zaur Nağıyev',
    role: 'Employee',
    initials: 'ZN',
    companyName: 'AsanBiznesim MMC',
    companyCode: 'ASAN-777777',
    email: 'zaur@market.az',
    password: '123456',
    status: 'Təsdiq Gözləyir',
    permissions: []
  }
];

// Sync and migrate permissions in localStorage for Admin roles to include new features like 'requests'
const allAdminPermissions = [
  'dashboard', 'invoices', 'debts', 'companies', 'tasks', 'daily-tasks', 'expiry', 'expenses', 'notebook', 'ai-agent', 'employees', 'analytics', 'reports', 'instructions', 'requests'
];

const loadUsersFromStorage = () => {
  let storedUsersStr = localStorage.getItem('users');
  if (!storedUsersStr) return defaultUsers;
  
  try {
    let storedUsers = JSON.parse(storedUsersStr);
    let modified = false;
    storedUsers = storedUsers.map(u => {
      if (u.role === 'Admin') {
        const missing = allAdminPermissions.filter(p => !u.permissions.includes(p));
        if (missing.length > 0) {
          u.permissions = [...u.permissions, ...missing];
          modified = true;
        }
      }
      return u;
    });
    if (modified) {
      localStorage.setItem('users', JSON.stringify(storedUsers));
    }
    return storedUsers;
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
    return defaultUsers;
  }
};

const loadCurrentUserFromStorage = (syncedUsers) => {
  let currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return null;
  
  try {
    let currentUser = JSON.parse(currentUserStr);
    if (currentUser) {
      if (currentUser.isDemo) {
        return currentUser;
      }
      if (currentUser.role === 'Admin') {
        const missing = allAdminPermissions.filter(p => !currentUser.permissions.includes(p));
        if (missing.length > 0) {
          currentUser.permissions = [...currentUser.permissions, ...missing];
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      } else {
        const matchedUser = syncedUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (matchedUser) {
          currentUser.permissions = matchedUser.permissions;
          currentUser.status = matchedUser.status;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    }
    return currentUser;
  } catch (e) {
    console.error('Failed to parse currentUser from localStorage', e);
    return null;
  }
};

const initialUsers = loadUsersFromStorage();
const initialCurrentUser = loadCurrentUserFromStorage(initialUsers);

export const useStore = create((set, get) => ({
  // --- UI & Theme State ---
  theme: localStorage.getItem('theme') || 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme });
  },
  
  // --- Authentication State ---
  users: initialUsers,
  user: initialCurrentUser,

  signUp: (userData) => {
    const { name, email, password, role, companyName, companyCode } = userData;
    const users = get().users;
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Bu e-mail ünvanı ilə artıq qeydiyyatdan keçilib!' };
    }
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    if (role === 'Admin') { // Sahibkar
      const generatedCode = `ASAN-${Math.floor(100000 + Math.random() * 900000)}`;
      const newUser = {
        name,
        email,
        password,
        role: 'Admin',
        initials,
        companyName,
        companyCode: generatedCode,
        status: 'Aktiv',
        profileImage: '/img/logo.svg',
        bio: 'AsanBiznesim platforması sahibi.',
        phone: '+994 50 000 00 00',
        permissions: [
          'dashboard', 'invoices', 'debts', 'companies', 'tasks', 'daily-tasks', 'expiry', 'expenses', 'notebook', 'ai-agent', 'employees', 'analytics', 'reports', 'instructions', 'requests'
        ]
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      set({ users: updatedUsers, user: newUser });
      return { success: true, companyCode: generatedCode };
      
    } else { // İşçi
      const adminUser = users.find(u => u.role === 'Admin' && u.companyCode === companyCode);
      if (!adminUser) {
        return { success: false, message: 'Daxil etdiyiniz Şirkət Kodu mövcud deyil!' };
      }
      
      const newUser = {
        name,
        email,
        password,
        role: 'Employee',
        initials,
        companyName: adminUser.companyName,
        companyCode,
        status: 'Təsdiq Gözləyir',
        permissions: []
      };
      
      const newEmp = {
        id: Date.now(),
        name,
        role: 'İşçi',
        grossSalary: 0,
        salaryType: 'aylıq',
        email,
        status: 'Təsdiq Gözləyir',
        permissions: [],
        companyCode
      };
      
      const updatedUsers = [...users, newUser];
      const updatedEmployees = [...get().employees, newEmp];
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          message: `YENİ QEYDİYYAT: ${name} işçi olaraq qoşulmaq istəyir. Təsdiq gözləyir.`
        });
      }, 100);
      
      set({ users: updatedUsers, employees: updatedEmployees, user: newUser });
      return { success: true };
    }
  },

  login: (email, password) => {
    const users = get().users;
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!foundUser) {
      return { success: false, message: 'E-mail və ya şifrə yanlışdır!' };
    }
    
    let syncedUser = { ...foundUser };
    if (syncedUser.role === 'Employee') {
      const empRecord = get().employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (empRecord) {
        syncedUser.status = empRecord.status;
        syncedUser.permissions = empRecord.permissions;
      }
    }
    
    localStorage.setItem('currentUser', JSON.stringify(syncedUser));
    set({ user: syncedUser });
    return { success: true, user: syncedUser };
  },

  loginAsDemo: () => {
    const demoUser = {
      name: 'Demo Müdir',
      role: 'Admin',
      initials: 'DM',
      companyName: 'Demo Biznes MMC',
      companyCode: 'DEMO-999999',
      email: 'demo@asanbiznesim.az',
      phone: '+994 50 999 99 99',
      bio: 'Sistemə demo rejimdə baxış keçirən qonaq istifadəçi.',
      profileImage: '/img/logo.svg',
      status: 'Aktiv',
      isDemo: true,
      permissions: [
        'dashboard', 'invoices', 'debts', 'companies', 'tasks', 'daily-tasks', 'expiry', 'expenses', 'notebook', 'ai-agent', 'employees', 'analytics', 'reports', 'instructions', 'requests'
      ]
    };
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    set({ user: demoUser });
    
    setTimeout(() => {
      get().addNotification({
        type: 'success',
        message: 'DEMO REJİM: Sistemə qonaq olaraq daxil oldunuz. Etdiyiniz dəyişikliklər çıxış etdikdə silinəcək.'
      });
    }, 500);

    return { success: true, user: demoUser };
  },

  logout: () => {
    const isDemo = get().user?.isDemo;
    localStorage.removeItem('currentUser');
    if (isDemo) {
      localStorage.removeItem('users');
      localStorage.removeItem('employees');
      window.location.href = '/';
    } else {
      set({ user: null });
    }
  },

  setUserRole: (role) => set((state) => {
    const nextPermissions = role === 'Admin' 
      ? ['dashboard', 'invoices', 'debts', 'companies', 'tasks', 'daily-tasks', 'expiry', 'expenses', 'notebook', 'ai-agent', 'employees', 'analytics', 'reports', 'instructions', 'requests']
      : ['dashboard', 'tasks', 'daily-tasks', 'notebook', 'instructions', 'expiry', 'expenses', 'invoices', 'requests'];
      
    const updatedUser = state.user ? {
      ...state.user,
      role,
      permissions: nextPermissions
    } : null;

    if (updatedUser) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const updatedUsers = state.users.map(u => u.email === updatedUser.email ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return { user: updatedUser, users: updatedUsers };
    }
    return {};
  }),

  updateUserProfile: (newData) => set((state) => {
    if (!state.user) return {};
    const initials = newData.name 
      ? newData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : state.user.initials;
    const updatedUser = {
      ...state.user,
      ...newData,
      initials
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    const updatedUsers = state.users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return {
      user: updatedUser,
      users: updatedUsers
    };
  }),
  
  // --- Notifications State ---
  notifications: [
    { id: 1, type: 'danger', message: '2 məhsulun son istifadə tarixi keçib!', read: false },
    { id: 2, type: 'warning', message: 'Südlük Süd MMC üçün alış limiti 90%-ə yaxınlaşır!', read: false },
    { id: 3, type: 'info', message: 'İşçi Zaur Nağıyev təsdiq gözləyir.', read: false },
  ],
  addNotification: (noti) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.36); // C6
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
    set((state) => ({ notifications: [{ id: Date.now(), read: false, ...noti }, ...state.notifications] }));
  },
  markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) })),

  // --- Companies Database ---
  companies: [
    { id: 1, name: 'Südlük Süd MMC', type: 'Formal', taxId: '1234567890', tradeRegistryNo: 'TR-98765', phone: '+994 50 123 45 67', address: 'Bakı ş., Nərimanov r.', paymentPeriod: 'Ay sonu' },
    { id: 2, name: 'Şirin Çörək evi', type: 'Informal', ownerName: 'Hikmət kişi', phone: '+994 55 987 65 43', address: 'Xırdalan ş., 28 May küçəsi', paymentPeriod: 'Ay ortası' },
    { id: 3, name: 'Meyvə-Tərəvəz Topdan', type: 'Informal', ownerName: 'Vaqif dayı', phone: '+994 70 543 21 09', address: 'Meyvəli bazarı, korpus 4', paymentPeriod: 'Ay əvvəli' },
    { id: 4, name: 'Qida Təchizat ASC', type: 'Formal', taxId: '0987654321', tradeRegistryNo: 'TR-12345', phone: '+994 12 444 55 66', address: 'Sumqayıt ş., Sülh küçəsi', paymentPeriod: 'Ay sonu' },
  ],
  addCompany: (company) => set((state) => ({ companies: [...state.companies, { id: state.companies.length + 1, ...company }] })),

  // --- Debts & Supplier Limits ---
  debts: [
    { id: 1, companyId: 1, totalDebt: 1250.00, monthlyLimit: 2000.00, lastUpdated: '2026-05-20' },
    { id: 2, companyId: 2, totalDebt: 450.00, monthlyLimit: 500.00, lastUpdated: '2026-05-25' },
    { id: 3, companyId: 3, totalDebt: 3200.00, monthlyLimit: 3000.00, lastUpdated: '2026-05-26' },
    { id: 4, companyId: 4, totalDebt: 0.00, monthlyLimit: 5000.00, lastUpdated: '2026-05-15' },
  ],
  setSupplierLimit: (companyId, amount) => set((state) => ({
    debts: state.debts.map(d => d.companyId === companyId ? { ...d, monthlyLimit: amount } : d)
  })),

  // --- Invoices Database ---
  invoices: [
    { id: 101, invoiceNo: 'INV-2026-001', companyId: 1, date: '2026-05-10', amount: 800.00, returnAmount: 0.00, paymentType: 'Nisyə', cashPaid: 0.00, creditRemaining: 800.00, description: 'Süd və qatıq məhsulları', documentPath: '/uploads/invoices/inv1.png', status: 'Gözləyir' },
    { id: 102, invoiceNo: 'INV-2026-002', companyId: 1, date: '2026-05-20', amount: 450.00, returnAmount: 0.00, paymentType: 'Nisyə', cashPaid: 0.00, creditRemaining: 450.00, description: 'Kəsmik tədarükü', documentPath: null, status: 'Gözləyir' },
    { id: 103, invoiceNo: 'INV-2026-003', companyId: 2, date: '2026-05-25', amount: 450.00, returnAmount: 0.00, paymentType: 'Nisyə', cashPaid: 0.00, creditRemaining: 450.00, description: 'Gündəlik çörək və bulka', documentPath: '/uploads/invoices/inv3.pdf', status: 'Gözləyir' },
    { id: 104, invoiceNo: 'INV-2026-004', companyId: 3, date: '2026-05-26', amount: 3200.00, returnAmount: 0.00, paymentType: 'Nisyə', cashPaid: 0.00, creditRemaining: 3200.00, description: 'Təzə meyvə və tərəvəz alışları', documentPath: '/uploads/invoices/inv4.jpg', status: 'Gözləyir' },
  ],
  addInvoice: (invoice) => set((state) => {
    const amountVal = Number(invoice.amount || 0);
    const returnVal = Number(invoice.returnAmount || 0);
    const payType = invoice.paymentType || 'Nisyə';
    const cashVal = payType === 'Qarışıq' ? Number(invoice.cashPaid || 0) : 0;
    
    // Net invoice sum after returns
    const netInvoiceSum = Math.max(0, amountVal - returnVal);
    
    // Remaining credit that goes to outstanding debt
    let creditRemaining = 0;
    if (payType === 'Nisyə') {
      creditRemaining = netInvoiceSum;
    } else if (payType === 'Qarışıq') {
      creditRemaining = Math.max(0, netInvoiceSum - cashVal);
    } // If 'Nağd', creditRemaining is 0 (it is paid completely in cash)
    
    const newInvoice = { 
      id: Date.now(), 
      invoiceNo: `INV-2026-${state.invoices.length + 100}`, 
      status: 'Gözləyir', 
      amount: amountVal,
      returnAmount: returnVal,
      paymentType: payType,
      cashPaid: payType === 'Nağd' ? netInvoiceSum : cashVal,
      creditRemaining: creditRemaining,
      ...invoice 
    };
    
    // Add automatic cash payment in payments log if cash was paid!
    const cashPortion = payType === 'Nağd' ? netInvoiceSum : cashVal;
    let newPayment = null;
    if (cashPortion > 0) {
      newPayment = {
        id: Date.now() + 1,
        companyId: Number(invoice.companyId),
        amount: cashPortion,
        description: `Faktura üzrə nağd ödəniş (Faktura №: ${newInvoice.invoiceNo})`,
        date: invoice.date || new Date().toISOString().split('T')[0]
      };
    }

    const updatedDebts = state.debts.map(d => {
      if (d.companyId === Number(invoice.companyId)) {
        const newDebt = d.totalDebt + creditRemaining;
        
        if (creditRemaining > 0) {
          if (newDebt > d.monthlyLimit) {
            setTimeout(() => {
              get().addNotification({
                type: 'danger',
                message: `KRİTİK: ${state.companies.find(c => c.id === d.companyId)?.name} üçün borc limiti (${d.monthlyLimit} ₼) aşıldı! Cari Borc: ${newDebt} ₼`
              });
            }, 100);
          } else if (newDebt > d.monthlyLimit * 0.85) {
            setTimeout(() => {
              get().addNotification({
                type: 'warning',
                message: `XƏBƏRDARLIQ: ${state.companies.find(c => c.id === d.companyId)?.name} üçün borc limiti yaxınlaşır. Cari Borc: ${newDebt} ₼`
              });
            }, 100);
          }
        }
        
        return { ...d, totalDebt: newDebt, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });

    return {
      invoices: [newInvoice, ...state.invoices],
      debts: updatedDebts,
      payments: newPayment ? [newPayment, ...state.payments] : state.payments
    };
  }),

  deleteInvoice: (invoiceId) => set((state) => {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (!inv) return {};

    const creditRemaining = Number(inv.creditRemaining || 0);
    const updatedDebts = state.debts.map(d => {
      if (d.companyId === Number(inv.companyId)) {
        return { ...d, totalDebt: Math.max(0, d.totalDebt - creditRemaining), lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });

    const updatedPayments = state.payments.filter(p => !p.description.includes(inv.invoiceNo));

    setTimeout(() => {
      get().addNotification({
        type: 'warning',
        message: `SİLİNDİ: ${inv.invoiceNo} nömrəli faktura silindi. Borc və ödənişlər tənzimləndi.`
      });
    }, 100);

    return {
      invoices: state.invoices.filter(i => i.id !== invoiceId),
      debts: updatedDebts,
      payments: updatedPayments
    };
  }),

  editInvoice: (invoiceId, updatedFields) => set((state) => {
    const oldInv = state.invoices.find(i => i.id === invoiceId);
    if (!oldInv) return {};

    const oldCreditRemaining = Number(oldInv.creditRemaining || 0);
    
    const amountVal = Number(updatedFields.amount !== undefined ? updatedFields.amount : oldInv.amount);
    const returnVal = Number(updatedFields.returnAmount !== undefined ? updatedFields.returnAmount : oldInv.returnAmount || 0);
    const payType = updatedFields.paymentType || oldInv.paymentType || 'Nisyə';
    const cashVal = payType === 'Qarışıq' ? Number(updatedFields.cashPaid !== undefined ? updatedFields.cashPaid : oldInv.cashPaid || 0) : 0;
    
    const netInvoiceSum = Math.max(0, amountVal - returnVal);
    
    let newCreditRemaining = 0;
    if (payType === 'Nisyə') {
      newCreditRemaining = netInvoiceSum;
    } else if (payType === 'Qarışıq') {
      newCreditRemaining = Math.max(0, netInvoiceSum - cashVal);
    }

    const updatedDebts = state.debts.map(d => {
      const oldCompanyMatch = d.companyId === Number(oldInv.companyId);
      const newCompanyMatch = d.companyId === Number(updatedFields.companyId || oldInv.companyId);
      
      let nextDebt = d.totalDebt;
      if (oldCompanyMatch) {
        nextDebt = Math.max(0, nextDebt - oldCreditRemaining);
      }
      if (newCompanyMatch) {
        nextDebt = nextDebt + newCreditRemaining;
      }
      return { ...d, totalDebt: nextDebt, lastUpdated: new Date().toISOString().split('T')[0] };
    });

    const newCashPortion = payType === 'Nağd' ? netInvoiceSum : cashVal;
    
    let filteredPayments = state.payments.filter(p => !p.description.includes(oldInv.invoiceNo));
    
    if (newCashPortion > 0) {
      const updatedPayment = {
        id: Date.now() + 2,
        companyId: Number(updatedFields.companyId || oldInv.companyId),
        amount: newCashPortion,
        description: `Faktura üzrə nağd ödəniş (Faktura №: ${oldInv.invoiceNo}) [Düzəliş]`,
        date: updatedFields.date || oldInv.date || new Date().toISOString().split('T')[0]
      };
      filteredPayments = [updatedPayment, ...filteredPayments];
    }

    const finalInvoice = {
      ...oldInv,
      ...updatedFields,
      amount: amountVal,
      returnAmount: returnVal,
      paymentType: payType,
      cashPaid: payType === 'Nağd' ? netInvoiceSum : cashVal,
      creditRemaining: newCreditRemaining
    };

    setTimeout(() => {
      get().addNotification({
        type: 'info',
        message: `GÜNCƏLLƏNDİ: ${oldInv.invoiceNo} nömrəli faktura məlumatları yeniləndi.`
      });
    }, 100);

    return {
      invoices: state.invoices.map(i => i.id === invoiceId ? finalInvoice : i),
      debts: updatedDebts,
      payments: filteredPayments
    };
  }),

  // --- Payments Database ---
  payments: [
    { id: 201, companyId: 1, date: '2026-05-15', amount: 500.00, description: 'Bank köçürməsi ilə ödəniş' },
    { id: 202, companyId: 2, date: '2026-05-22', amount: 200.00, description: 'Nəğd ödəniş' },
  ],
  addPayment: (payment) => set((state) => {
    const newPayment = { id: Date.now(), ...payment };
    const updatedDebts = state.debts.map(d => {
      if (d.companyId === Number(payment.companyId)) {
        return { ...d, totalDebt: Math.max(0, d.totalDebt - Number(payment.amount)), lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return d;
    });
    return {
      payments: [newPayment, ...state.payments],
      debts: updatedDebts
    };
  }),

  // --- Tasks Database ---
  tasks: [
    { id: 1, title: 'Anbar sayımı aparmaq', description: 'Meyvə-tərəvəz anbarının tam siyahısı və sayımı edilməlidir', assignedTo: 'Əli Məmmədov', dueDate: '2026-05-28', status: 'Gözləyir' },
    { id: 2, title: 'Fakturaya nəzarət', description: 'Şirin Çörək evindən gələn son fakturanın borclar siyahısına işlənməsi', assignedTo: 'Leyla Rəhimova', dueDate: '2026-05-27', status: 'Davam edir' },
    { id: 3, title: 'Son sroklu malların çıxarılması', description: 'Sroku 2 gün qalmış süd məhsullarının vitrindən endirimə keçirilməsi', assignedTo: 'Vüsal Həsənov', dueDate: '2026-05-26', status: 'Tamamlandı' },
  ],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, { id: Date.now(), status: 'Gözləyir', ...task }] })),
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),

  // --- Daily Tasks ---
  dailyTasks: [
    { id: 1, title: 'Kassanı açmaq və yoxlamaq', completed: true, time: '08:00', completedBy: 'Əli Məmmədov', completedAt: '2026-05-29 08:15', requiresImage: false },
    { id: 2, title: 'Vitrinlərin təmizliyi və düzülüşü', completed: true, time: '09:00', completedBy: 'Leyla Rəhimova', completedAt: '2026-05-29 09:05', requiresImage: false },
    { id: 3, title: 'Çörək tədarükünün qəbulu', completed: true, time: '09:30', completedBy: 'Vüsal Həsənov', completedAt: '2026-05-29 09:32', requiresImage: false },
    { id: 4, title: 'Vitrində srok yoxlanışı', completed: false, time: '14:00', requiresImage: true },
    { id: 5, title: 'Kassanı bağlamaq və hesabat', completed: false, time: '22:00', requiresImage: false },
  ],
  toggleDailyTask: (id, completedBy = 'Sistem', completionImage = null) => set((state) => {
    const updatedTasks = state.dailyTasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return { 
          ...t, 
          completed: nextCompleted,
          completedBy: nextCompleted ? completedBy : null,
          completedAt: nextCompleted ? new Date().toLocaleString('az-AZ', { hour12: false }) : null,
          completionImage: nextCompleted ? completionImage : null
        };
      }
      return t;
    });
    return { dailyTasks: updatedTasks };
  }),
  addDailyTask: (title, time, requiresImage = false) => set((state) => ({
    dailyTasks: [...state.dailyTasks, { id: Date.now(), title, time, completed: false, requiresImage }]
  })),
  toggleTaskImageRequirement: (id) => set((state) => ({
    dailyTasks: state.dailyTasks.map(t => t.id === id ? { ...t, requiresImage: !t.requiresImage } : t)
  })),

  // --- Employees & Permissions Database ---
  employees: JSON.parse(localStorage.getItem('employees')) || [
    { id: 1, name: 'Əli Məmmədov', role: 'Kassir', grossSalary: 800, salaryType: 'aylıq', email: 'ali@market.az', status: 'Aktiv', permissions: ['dashboard', 'tasks', 'daily-tasks', 'notebook'] },
    { id: 2, name: 'Leyla Rəhimova', role: 'Satıcı', grossSalary: 700, salaryType: 'aylıq', email: 'leyla@market.az', status: 'Aktiv', permissions: ['dashboard', 'tasks', 'daily-tasks'] },
    { id: 3, name: 'Vüsal Həsənov', role: 'Anbardar', grossSalary: 900, salaryType: 'aylıq', email: 'vusal@market.az', status: 'Aktiv', permissions: ['dashboard', 'tasks', 'daily-tasks', 'expiry'] },
    { id: 4, name: 'Zaur Nağıyev', role: 'Kassir', grossSalary: 800, salaryType: 'aylıq', email: 'zaur@market.az', status: 'Təsdiq Gözləyir', permissions: [] },
  ],
  addEmployee: (emp) => set((state) => {
    const newEmp = { 
      id: Date.now(), 
      status: 'Aktiv', // Directly activate when manager creates!
      permissions: ['dashboard', ...(emp.permissions || [])], 
      salaryType: emp.salaryType || 'aylıq',
      ...emp 
    };
    
    // Auto-create a task if provided
    let updatedTasks = state.tasks;
    if (emp.customTaskTitle) {
      const newTask = {
        id: Date.now() + 5,
        title: emp.customTaskTitle,
        description: emp.customTaskDesc || 'Müdir tərəfindən verilən tapşırıq',
        assignedTo: emp.name,
        dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], // 3 days from now
        status: 'Gözləyir'
      };
      updatedTasks = [...state.tasks, newTask];
    }
    
    // Also create a user record in users registry so they can log in
    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const newUser = {
      name: emp.name,
      email: emp.email,
      password: '123456', // default password
      role: 'Employee',
      initials,
      companyName: state.user?.companyName || 'AsanBiznesim MMC',
      companyCode: state.user?.companyCode || 'ASAN-777777',
      status: 'Aktiv',
      permissions: ['dashboard', ...(emp.permissions || [])]
    };
    
    const updatedUsers = [...state.users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const updatedEmployees = [...state.employees, newEmp];
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    // Auto trigger notification for the Owner/Müdir
    setTimeout(() => {
      get().addNotification({
        type: 'success',
        message: `YENİ İŞÇİ ƏLAVƏ EDİLDİ: ${emp.name} (${emp.role}) aktivləşdirildi və məlumatları dolduruldu.`
      });
    }, 100);

    return { 
      users: updatedUsers,
      employees: updatedEmployees,
      tasks: updatedTasks
    };
  }),
  approveEmployee: (empId, selectedPermissions) => set((state) => {
    const emp = state.employees.find(e => e.id === empId);
    
    if (emp) {
      setTimeout(() => {
        get().addNotification({
          type: 'success',
          message: `TƏSDİQ EDİLDİ: ${emp.name} aktiv edildi və ${selectedPermissions.length} bölməyə icazə verildi.`
        });
      }, 100);
    }

    const updatedUsers = state.users.map(u => 
      (emp && u.email.toLowerCase() === emp.email.toLowerCase())
        ? { ...u, status: 'Aktiv', permissions: ['dashboard', ...selectedPermissions] }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedEmployees = state.employees.map(e => e.id === empId 
      ? { ...e, status: 'Aktiv', permissions: ['dashboard', ...selectedPermissions] } 
      : e
    );
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    return {
      users: updatedUsers,
      employees: updatedEmployees
    };
  }),
  rejectEmployee: (empId) => set((state) => {
    const emp = state.employees.find(e => e.id === empId);
    if (emp) {
      setTimeout(() => {
        get().addNotification({
          type: 'warning',
          message: `RƏDD EDİLDİ: ${emp.name} heyətə qəbul edilmədi.`
        });
      }, 100);
    }

    const updatedUsers = state.users.map(u => 
      (emp && u.email.toLowerCase() === emp.email.toLowerCase())
        ? { ...u, status: 'Rədd Edilib' }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedEmployees = state.employees.map(e => e.id === empId ? { ...e, status: 'Rədd Edilib' } : e);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    return {
      users: updatedUsers,
      employees: updatedEmployees
    };
  }),
  updateEmployeePermissions: (empId, selectedPermissions) => set((state) => {
    const emp = state.employees.find(e => e.id === empId);
    
    const updatedUsers = state.users.map(u => 
      (emp && u.email.toLowerCase() === emp.email.toLowerCase())
        ? { ...u, permissions: ['dashboard', ...selectedPermissions] }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedEmployees = state.employees.map(e => e.id === empId 
      ? { ...e, permissions: ['dashboard', ...selectedPermissions] } 
      : e
    );
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    return {
      users: updatedUsers,
      employees: updatedEmployees
    };
  }),

  // --- Salary & Expenses Database ---
  expenses: [
    { id: 1, type: 'Şirkət', category: 'İcarə', amount: 1500, description: 'Market sahəsinin aylıq icarə haqqı', date: '2026-05-01' },
    { id: 2, type: 'Şirkət', category: 'Kommunal', amount: 350, description: 'Elektrik və su pulu', date: '2026-05-05' },
    { id: 3, type: 'Firma', category: 'Nəqliyyat', amount: 120, description: 'Topdan bazardan daşınma haqqı', date: '2026-05-10', supplierId: 3 },
    { id: 4, type: 'Şirkət', category: 'Pazarlama', amount: 200, description: 'Instagram reklamları', date: '2026-05-12' },
  ],
  salaries: [
    { id: 1, employeeId: 1, grossSalary: 800, taxAmount: 120, insuranceAmount: 64, netSalary: 616, paymentDate: '2026-05-01', status: 'Ölənilib' },
    { id: 2, employeeId: 2, grossSalary: 700, taxAmount: 105, insuranceAmount: 56, netSalary: 539, paymentDate: '2026-05-01', status: 'Ölənilib' },
    { id: 3, employeeId: 3, grossSalary: 900, taxAmount: 135, insuranceAmount: 72, netSalary: 693, paymentDate: '2026-05-01', status: 'Gözləyir' },
  ],
  budgetLimits: [
    { category: 'İcarə', limit: 2000 },
    { category: 'Kommunal', limit: 500 },
    { category: 'Pazarlama', limit: 300 },
    { category: 'Nəqliyyat', limit: 1000 },
    { category: 'Maaş', limit: 5000 },
  ],
  addExpense: (exp) => set((state) => ({ expenses: [{ id: Date.now(), ...exp }, ...state.expenses] })),
  paySalary: (salaryId) => set((state) => ({
    salaries: state.salaries.map(s => s.id === salaryId ? { ...s, status: 'Ölənilib', paymentDate: new Date().toISOString().split('T')[0] } : s)
  })),
  setBudgetLimit: (category, amount) => set((state) => ({
    budgetLimits: state.budgetLimits.map(b => b.category === category ? { ...b, limit: amount } : b)
  })),

  // --- Notebook ---
  notes: [
    { id: 1, title: 'Tədarükçü görüşü haqqında', content: 'Gələn həftə Meyvə-Tərəvəz təchizatçısı ilə qiymətdə 5% endirim müzakirə olunacaq.', category: 'İşletme', tags: ['tədarükçü', 'görüş'], createdDate: '2026-05-22', createdTime: '11:00', isArchived: false },
    { id: 2, title: 'Soyuducu təmiri', content: 'Südlük dolabının soyutma dərəcəsi 4C-ə qalxıb, usta çağırılmalıdır.', category: 'Mali', tags: ['təmir', 'təcili'], createdDate: '2026-05-25', createdTime: '15:30', isArchived: false, isPinned: true },
    { id: 3, title: 'İşçi növbələri', content: 'İyun ayı üçün işçi növbə planı hazırlanmalıdır. Leyla xanım növbə dəyişikliyi istəmişdi.', category: 'İnsan Kaynakları', tags: ['işçilər', 'növbə'], createdDate: '2026-05-26', createdTime: '09:15', isArchived: false },
  ],
  addNote: (note) => set((state) => ({
    notes: [{
      id: Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
      createdTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      isArchived: false,
      ...note
    }, ...state.notes]
  })),
  deleteNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
  toggleArchiveNote: (id) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived } : n)
  })),
  togglePinNote: (id) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
  })),
  updateNote: (id, updatedNote) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, ...updatedNote } : n)
  })),

  // --- Product Expiry ---
  expiryProducts: [
    { id: 1, productName: 'Süzmə Pendir 500g', expiryDate: '2026-05-20', createdAt: '2026-05-01', daysLeft: -6, quantity: 15, companyId: 1, status: 'Vitrində' },
    { id: 2, productName: 'Kefir 1L', expiryDate: '2026-05-24', createdAt: '2026-05-05', daysLeft: -2, quantity: 8, companyId: 1, status: 'Vitrində' },
    { id: 3, productName: 'Xama 15% 200g', expiryDate: '2026-05-28', createdAt: '2026-05-10', daysLeft: 2, quantity: 24, companyId: 1, status: 'Vitrində' },
    { id: 4, productName: 'Yarımyağlı Süd 1L', expiryDate: '2026-06-15', createdAt: '2026-05-15', daysLeft: 20, quantity: 50, companyId: 4, status: 'Vitrində' },
  ],
  addExpiryProduct: (product) => set((state) => {
    const today = new Date();
    const expDate = new Date(product.expiryDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const newProduct = {
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      daysLeft: diffDays,
      status: 'Vitrində',
      ...product
    };
    const updatedProducts = [...state.expiryProducts, newProduct];
    const expiredCount = updatedProducts.filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi').length;
    
    let updatedNotifications = state.notifications;
    if (expiredCount > 0) {
      const hasExpiredNoti = updatedNotifications.some(n => n.message.includes('istifadə tarixi keçib'));
      if (hasExpiredNoti) {
        updatedNotifications = updatedNotifications.map(n => 
          n.message.includes('istifadə tarixi keçib')
            ? { ...n, message: `${expiredCount} məhsulun son istifadə tarixi keçib!`, read: false }
            : n
        );
      } else {
        updatedNotifications = [
          { id: Date.now(), type: 'danger', message: `${expiredCount} məhsulun son istifadə tarixi keçib!`, read: false },
          ...updatedNotifications
        ];
      }
    } else {
      updatedNotifications = updatedNotifications.filter(n => !n.message.includes('istifadə tarixi keçib'));
    }
    return {
      expiryProducts: updatedProducts,
      notifications: updatedNotifications
    };
  }),
  deleteExpiryProduct: (productId) => set((state) => {
    const updatedProducts = state.expiryProducts.filter(p => p.id !== productId);
    const expiredCount = updatedProducts.filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi').length;
    
    let updatedNotifications = state.notifications;
    if (expiredCount > 0) {
      const hasExpiredNoti = updatedNotifications.some(n => n.message.includes('istifadə tarixi keçib'));
      if (hasExpiredNoti) {
        updatedNotifications = updatedNotifications.map(n => 
          n.message.includes('istifadə tarixi keçib')
            ? { ...n, message: `${expiredCount} məhsulun son istifadə tarixi keçib!` }
            : n
        );
      } else {
        updatedNotifications = [
          { id: Date.now(), type: 'danger', message: `${expiredCount} məhsulun son istifadə tarixi keçib!`, read: false },
          ...updatedNotifications
        ];
      }
    } else {
      updatedNotifications = updatedNotifications.filter(n => !n.message.includes('istifadə tarixi keçib'));
    }
    return {
      expiryProducts: updatedProducts,
      notifications: updatedNotifications
    };
  }),
  resolveExpiryProduct: (productId) => set((state) => {
    const updatedProducts = state.expiryProducts.map(p => p.id === productId ? { ...p, status: 'Vitrindən Çıxarıldı' } : p);
    const expiredCount = updatedProducts.filter(p => p.daysLeft < 0 && p.status !== 'Vitrindən Çıxarıldı' && p.status !== 'Vitrinden Cixarildi').length;
    
    let updatedNotifications = state.notifications;
    if (expiredCount > 0) {
      const hasExpiredNoti = updatedNotifications.some(n => n.message.includes('istifadə tarixi keçib'));
      if (hasExpiredNoti) {
        updatedNotifications = updatedNotifications.map(n => 
          n.message.includes('istifadə tarixi keçib')
            ? { ...n, message: `${expiredCount} məhsulun son istifadə tarixi keçib!` }
            : n
        );
      } else {
        updatedNotifications = [
          { id: Date.now(), type: 'danger', message: `${expiredCount} məhsulun son istifadə tarixi keçib!`, read: false },
          ...updatedNotifications
        ];
      }
    } else {
      updatedNotifications = updatedNotifications.filter(n => !n.message.includes('istifadə tarixi keçib'));
    }
    return {
      expiryProducts: updatedProducts,
      notifications: updatedNotifications
    };
  }),

  // --- AI Agent ---
  aiAgent: {
    trainings: [
      { id: 1, taskName: 'Aylıq maaş hesablama', description: 'Hər ayın sonunda işçilərin maaş, vergi və sığorta məbləğlərini hesabla və xərcə sal', steps: ['Bütün aktiv işçilərin siyahısını al', 'Maaş məbləğlərini hesabla (15% vergi, 8% sığorta çıx)', 'Salary cədvəlinə əlavə et', 'Aylıq ümumi xərc məlumatını yenilə'], status: 'Completed', trainingDate: '2026-05-10' },
      { id: 2, taskName: 'Faktura borclarını avtomatlaşdırma', description: 'Yeni faktura faylı daxil olduqda onu tədarükçü və məbləğə görə analiz edib borclar bölməsinə əlavə et', steps: ['Fakturanı OCR ilə oxu', 'Təchizatçı adını və məbləği müəyyən et', 'Şirkətin aylıq limitini yoxla', 'Borc balansına əlavə et'], status: 'Completed', trainingDate: '2026-05-18' }
    ],
    automations: [
      { id: 1, taskName: 'Aylıq maaş hesablama', triggerType: 'Schedule', scheduleExpression: 'Hər ayın 1-i, 09:00', isActive: true, lastRun: '2026-05-01 09:00', nextRun: '2026-06-01 09:00' },
      { id: 2, taskName: 'Faktura borclarını avtomatlaşdırma', triggerType: 'Event', eventType: 'Yeni Faktura Alındıqda', isActive: true, lastRun: '2026-05-26 14:15', nextRun: 'Anlıq (Tetikleyici ilə)' }
    ],
    logs: [
      { id: 1, taskName: 'Aylıq maaş hesablama', executedAt: '2026-05-01 09:00', duration: 1200, status: 'Success', result: '3 işçi üçün cəmi 2400 ₼ gross maaş hesablandı və ödənişə hazır edildi.' },
      { id: 2, taskName: 'Faktura borclarını avtomatlaşdırma', executedAt: '2026-05-26 14:15', duration: 850, status: 'Success', result: 'Qida Təchizat ASC-dən gələn 3200 ₼ faktura avtomatik borc dəftərinə yazıldı. Sərhəd limiti aşımı xəbərdarlığı göndərildi.' }
    ]
  },
  trainAgent: (training) => set((state) => {
    const newTraining = { id: Date.now(), status: 'Completed', trainingDate: new Date().toISOString().split('T')[0], ...training };
    const newAutomation = {
      id: Date.now(),
      taskName: training.taskName,
      triggerType: 'Event',
      eventType: 'Manual / Trigger',
      isActive: true,
      lastRun: 'Heç vaxt',
      nextRun: 'İstəyə uyğun'
    };
    return {
      aiAgent: {
        ...state.aiAgent,
        trainings: [...state.aiAgent.trainings, newTraining],
        automations: [...state.aiAgent.automations, newAutomation]
      }
    };
  }),
  runAgentTask: (taskName) => set((state) => {
    const todayStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: Date.now(),
      taskName,
      executedAt: todayStr,
      duration: Math.floor(Math.random() * 1000) + 500,
      status: 'Success',
      result: `"${taskName}" tapşırığı AI köməkçisi tərəfindən uğurla icra edildi və əməliyyat tarixçəsinə qeyd olundu.`
    };
    const updatedAutomations = state.aiAgent.automations.map(a => 
      a.taskName === taskName ? { ...a, lastRun: todayStr } : a
    );

    // Auto trigger notification for AI task execution
    setTimeout(() => {
      get().addNotification({
        type: 'info',
        message: `AI TAPŞIRIĞI İCRA EDİLDİ: "${taskName}" avtomatlaşdırılmış tapşırığı uğurla başa çatdı!`
      });
    }, 100);

    return {
      aiAgent: {
        ...state.aiAgent,
        automations: updatedAutomations,
        logs: [newLog, ...state.aiAgent.logs]
      }
    };
  }),
  toggleAutomationActive: (id) => set((state) => ({
    aiAgent: {
      ...state.aiAgent,
      automations: state.aiAgent.automations.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a)
    }
  })),

  // --- Shift Reports (Açotlar) ---
  shiftReports: [
    { id: 1, date: '2026-05-24', shift: 'Gündüz smeni', cashSales: 350.00, cardSales: 280.00, cashInRegister: 350.00, discrepancy: 0.00, employeeName: 'Əli Məmmədov', notes: 'Hər şey qaydasındadır.' },
    { id: 2, date: '2026-05-25', shift: 'Gündüz smeni', cashSales: 420.00, cardSales: 310.00, cashInRegister: 415.00, discrepancy: -5.00, employeeName: 'Əli Məmmədov', notes: '5 ₼ kəsir tapıldı, müştəriyə səhvən çox qalıq qaytarılıb.' },
    { id: 3, date: '2026-05-26', shift: 'Gecə smeni', cashSales: 510.00, cardSales: 400.00, cashInRegister: 512.00, discrepancy: 2.00, employeeName: 'Leyla Rəhimova', notes: '2 ₼ artıq pul var, müştəri qəpiyi istəmədi.' },
    { id: 4, date: '2026-05-27', shift: 'Gündüz smeni', cashSales: 380.00, cardSales: 290.00, cashInRegister: 380.00, discrepancy: 0.00, employeeName: 'Əli Məmmədov', notes: 'Smen problemsiz təhvil verildi.' },
  ],
  addShiftReport: (report) => set((state) => {
    const cashSalesVal = Number(report.cashSales || 0);
    const cardSalesVal = Number(report.cardSales || 0);
    const cashInRegisterVal = Number(report.cashInRegister || 0);
    const discrepancyVal = Number((cashInRegisterVal - cashSalesVal).toFixed(2));
    
    const newReport = {
      id: Date.now(),
      date: report.date || new Date().toISOString().split('T')[0],
      shift: report.shift || 'Gündüz smeni',
      cashSales: cashSalesVal,
      cardSales: cardSalesVal,
      cashInRegister: cashInRegisterVal,
      discrepancy: discrepancyVal,
      employeeName: report.employeeName || state.user?.name || 'İşçi',
      notes: report.notes || 'Qeyd yoxdur.'
    };
    
    // Auto-generate a warning notification for shortage if discrepancy is negative!
    if (discrepancyVal < 0) {
      setTimeout(() => {
        get().addNotification({
          type: 'danger',
          message: `KASSA KƏSİRİ: ${newReport.date} tarixində ${newReport.shift}-də ${Math.abs(discrepancyVal)} ₼ kəsir aşkarlanmışdır! (İşçi: ${newReport.employeeName})`
        });
      }, 100);
    } else if (discrepancyVal > 0) {
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          message: `KASSA ARTIĞI: ${newReport.date} tarixində ${newReport.shift}-də ${discrepancyVal} ₼ kassa artığı qeyd olunmuşdur. (İşçi: ${newReport.employeeName})`
        });
      }, 100);
    }

    return {
      shiftReports: [newReport, ...state.shiftReports]
    };
  }),
  editShiftReport: (id, updatedReport) => set((state) => {
    const cashSalesVal = Number(updatedReport.cashSales || 0);
    const cardSalesVal = Number(updatedReport.cardSales || 0);
    const cashInRegisterVal = Number(updatedReport.cashInRegister || 0);
    const discrepancyVal = Number((cashInRegisterVal - cashSalesVal).toFixed(2));

    const updatedReports = state.shiftReports.map(rep => {
      if (rep.id === id) {
        return {
          ...rep,
          ...updatedReport,
          cashSales: cashSalesVal,
          cardSales: cardSalesVal,
          cashInRegister: cashInRegisterVal,
          discrepancy: discrepancyVal
        };
      }
      return rep;
    });

    if (discrepancyVal < 0) {
      setTimeout(() => {
        get().addNotification({
          type: 'danger',
          message: `KASSA KƏSİRİ (GÜNCƏLLƏNDİ): ${updatedReport.date} tarixində kəsir: ${Math.abs(discrepancyVal)} ₼`
        });
      }, 100);
    } else if (discrepancyVal > 0) {
      setTimeout(() => {
        get().addNotification({
          type: 'info',
          message: `KASSA ARTIĞI (GÜNCƏLLƏNDİ): ${updatedReport.date} tarixində artığı: ${discrepancyVal} ₼`
        });
      }, 100);
    }

    return {
      shiftReports: updatedReports
    };
  }),
  deleteShiftReport: (id) => set((state) => {
    setTimeout(() => {
      get().addNotification({
        type: 'warning',
        message: `SİLİNDİ: Smen hesabatı silindi.`
      });
    }, 100);
    return {
      shiftReports: state.shiftReports.filter(rep => rep.id !== id)
    };
  }),

  // --- Supply / Product Requests ---
  productRequests: [
    { id: 1, name: 'Südlük Süd 1L', type: 'Azalmış mallar', priority: 'Orta', dateAdded: '2026-06-01', status: 'Gözləyir', notes: 'Vitrin rəfində cəmi 3 ədəd qalıb.' },
    { id: 2, name: 'Qara Şokolad 80%', type: 'Bitmiş mallar', priority: 'Təcili', dateAdded: '2026-06-02', status: 'Gözləyir', notes: 'Müştərilər tez-tez soruşur, tez gətirilməlidir.' },
    { id: 3, name: 'Qarabağ Pendiri (Kq)', type: 'Müştəri sorğusu', priority: 'Orta', dateAdded: '2026-06-03', status: 'Təmin olundu', notes: 'Həsən dayı üçün xüsusi sifariş idi.', dateFulfilled: '2026-06-03' },
    { id: 4, name: 'Coca-Cola 330ml', type: 'Azalmış mallar', priority: 'Kiçik', dateAdded: '2026-06-03', status: 'Gözləyir', notes: 'Yay mövsümü ilə əlaqədar tədarük edilməlidir.' }
  ],
  addProductRequest: (req) => set((state) => {
    const newReq = {
      id: Date.now(),
      name: req.name,
      type: req.type || 'Azalmış mallar',
      priority: req.priority || 'Orta',
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'Gözləyir',
      notes: req.notes || ''
    };
    setTimeout(() => {
      get().addNotification({
        type: req.priority === 'Təcili' ? 'warning' : 'info',
        message: `YENİ SİFARİŞ: ${newReq.name} (${newReq.type}) siyahıya əlavə edildi.`
      });
    }, 100);
    return {
      productRequests: [newReq, ...state.productRequests]
    };
  }),
  fulfillProductRequest: (id) => set((state) => {
    const updated = state.productRequests.map(req => {
      if (req.id === id) {
        setTimeout(() => {
          get().addNotification({
            type: 'success',
            message: `TƏMİN OLUNDU: ${req.name} məhsulu tədarük edildi.`
          });
        }, 100);
        return {
          ...req,
          status: 'Təmin olundu',
          dateFulfilled: new Date().toISOString().split('T')[0]
        };
      }
      return req;
    });
    return { productRequests: updated };
  }),
  editProductRequest: (id, updatedFields) => set((state) => {
    const updated = state.productRequests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          ...updatedFields
        };
      }
      return req;
    });
    setTimeout(() => {
      get().addNotification({
        type: 'info',
        message: `YENİLƏNDİ: Məhsul sifariş məlumatları güncəlləndi.`
      });
    }, 100);
    return { productRequests: updated };
  }),
  deleteProductRequest: (id) => set((state) => {
    setTimeout(() => {
      get().addNotification({
        type: 'warning',
        message: `SİLİNDİ: Məhsul sifarişi silindi.`
      });
    }, 100);
    return {
      productRequests: state.productRequests.filter(req => req.id !== id)
    };
  })
}));

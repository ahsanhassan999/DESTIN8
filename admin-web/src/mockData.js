// ─── Mock Data for DESTIN8 Admin Panel ───────────────────────────────────────

export const mockStats = {
  totalTravelers: 1284,
  totalAgencies: 87,
  approvedAgencies: 61,
  pendingAgencies: 14,
  rejectedAgencies: 12,
  totalPackages: 342,
  activePackages: 298,
  takenDownPackages: 44,
};

export const mockAgencies = [
  { id: '1', name: 'Odyssey Travels', owner: 'Bilal Mirza',     email: 'info@odyssey.pk',      phone: '+92-311-2345678', address: '45 Shahrah-e-Faisal, Karachi', license: 'KHI-AGN-00121', status: 'pending',  joined: '2024-05-10' },
  { id: '2', name: 'Blue Horizon Co.', owner: 'Sara Qureshi',   email: 'sara@bluehorizon.pk',  phone: '+92-321-9876543', address: '12 MM Alam Rd, Lahore',      license: 'LHR-AGN-00089', status: 'approved', joined: '2024-03-22' },
  { id: '3', name: 'Peak Adventures',  owner: 'Kamran Shah',    email: 'kamran@peakadv.com',   phone: '+92-333-1122334', address: 'Jinnah Supermarket, ISB',    license: 'ISB-AGN-00204', status: 'approved', joined: '2024-04-01' },
  { id: '4', name: 'Wanderlust PK',    owner: 'Aisha Noor',     email: 'aisha@wanderlust.pk',  phone: '+92-300-5566778', address: 'GT Road, Rawalpindi',        license: 'RWP-AGN-00055', status: 'rejected', joined: '2024-05-18', reason: 'License number could not be verified with TDCP.' },
  { id: '5', name: 'Horizon Escapes',  owner: 'Tariq Mahmood',  email: 'tariq@horizonesc.pk',  phone: '+92-345-4433221', address: 'Gulberg III, Lahore',        license: 'LHR-AGN-00112', status: 'pending',  joined: '2024-05-20' },
  { id: '6', name: 'Northern Trails',  owner: 'Zara Hussain',   email: 'zara@northerntrails.pk',phone: '+92-315-8899001', address: 'Saddar, Peshawar',           license: 'PEW-AGN-00034', status: 'approved', joined: '2024-02-14' },
  { id: '7', name: 'Desert Routes',    owner: 'Faisal Baig',    email: 'faisal@desertroutes.com',phone: '+92-322-7654321', address: 'Hyderabad City, Sindh',     license: 'HYD-AGN-00067', status: 'pending',  joined: '2024-05-22' },
  { id: '8', name: 'Silk Road Tours',  owner: 'Nadia Ali',      email: 'nadia@silkroadtours.pk', phone: '+92-311-3344556', address: 'F-7 Markaz, Islamabad',     license: 'ISB-AGN-00188', status: 'approved', joined: '2024-01-30' },
];

export const mockUsers = [
  { id: 'u1', name: 'Ahmed Hassan',    email: 'ahmed@gmail.com',       phone: '+92-300-1111111', role: 'traveler', status: 'active',    joined: '2024-04-12' },
  { id: 'u2', name: 'Sara Qureshi',    email: 'sara@bluehorizon.pk',   phone: '+92-321-9876543', role: 'agency',   status: 'approved',  joined: '2024-03-22' },
  { id: 'u3', name: 'Ali Khan',        email: 'ali.khan@yahoo.com',    phone: '+92-333-2222222', role: 'traveler', status: 'active',    joined: '2024-05-01' },
  { id: 'u4', name: 'DESTIN8 Admin',   email: 'admin@destin8.com',     phone: null,              role: 'admin',    status: 'active',    joined: '2024-01-01' },
  { id: 'u5', name: 'Bilal Mirza',     email: 'info@odyssey.pk',       phone: '+92-311-2345678', role: 'agency',   status: 'pending',   joined: '2024-05-10' },
  { id: 'u6', name: 'Fatima Zahra',    email: 'fatima.z@hotmail.com',  phone: '+92-315-3333333', role: 'traveler', status: 'suspended', joined: '2024-04-28' },
  { id: 'u7', name: 'Usman Tariq',     email: 'usman.t@gmail.com',     phone: '+92-344-4444444', role: 'traveler', status: 'active',    joined: '2024-05-15' },
  { id: 'u8', name: 'Kamran Shah',     email: 'kamran@peakadv.com',    phone: '+92-333-1122334', role: 'agency',   status: 'approved',  joined: '2024-04-01' },
  { id: 'u9', name: 'Maria Siddiqui',  email: 'maria.s@gmail.com',     phone: '+92-300-5555555', role: 'traveler', status: 'active',    joined: '2024-05-19' },
  { id: 'u10',name: 'Nadia Ali',       email: 'nadia@silkroadtours.pk',phone: '+92-311-3344556', role: 'agency',   status: 'approved',  joined: '2024-01-30' },
];

export const mockPackages = [
  { id: 'p1', title: 'Hunza Valley Luxury Retreat',    agency: 'Peak Adventures',  destination: 'Hunza', price: 85000, duration: 7,  active: true,  created: '2024-05-01' },
  { id: 'p2', title: 'Maldives Escape — 5 Nights',     agency: 'Blue Horizon Co.', destination: 'Maldives', price: 320000, duration: 5,active: true,  created: '2024-04-22' },
  { id: 'p3', title: 'Autumn Fairy Meadows Trek',      agency: 'Northern Trails',  destination: 'Naran', price: 45000, duration: 4,  active: false, created: '2024-05-10' },
  { id: 'p4', title: 'Lahore Heritage City Tour',      agency: 'Silk Road Tours',  destination: 'Lahore',price: 18000, duration: 2,  active: true,  created: '2024-05-12' },
  { id: 'p5', title: 'K2 Base Camp Adventure',         agency: 'Peak Adventures',  destination: 'Skardu',price: 125000,duration: 14, active: true,  created: '2024-04-15' },
  { id: 'p6', title: 'Thailand Group Package',         agency: 'Blue Horizon Co.', destination: 'Bangkok',price: 195000,duration: 8, active: false, created: '2024-05-08' },
  { id: 'p7', title: 'Swat Valley Spring Bloom Tour',  agency: 'Northern Trails',  destination: 'Swat', price: 32000, duration: 3,  active: true,  created: '2024-05-14' },
  { id: 'p8', title: 'Dubai Weekend Getaway',          agency: 'Silk Road Tours',  destination: 'Dubai', price: 220000,duration: 4, active: true,  created: '2024-05-17' },
];

export const mockConversations = [
  { id: 'c1', traveler: 'Ahmed Hassan',   agency: 'Peak Adventures',   package: 'K2 Base Camp', lastMsg: 'Is there a group discount?',      time: '10 min ago', unread: true  },
  { id: 'c2', traveler: 'Ali Khan',       agency: 'Blue Horizon Co.',  package: 'Maldives Escape', lastMsg: 'Please confirm my seat.',       time: '1 hr ago',   unread: false },
  { id: 'c3', traveler: 'Usman Tariq',    agency: 'Northern Trails',   package: 'Swat Valley',   lastMsg: 'What is included in the price?', time: '3 hrs ago',  unread: true  },
  { id: 'c4', traveler: 'Maria Siddiqui', agency: 'Silk Road Tours',   package: 'Dubai Weekend',  lastMsg: 'Can I cancel for a refund?',    time: 'Yesterday',  unread: false },
  { id: 'c5', traveler: 'Fatima Zahra',   agency: 'Peak Adventures',   package: 'Hunza Valley',   lastMsg: 'Awesome! I will book now.',     time: '2 days ago', unread: false },
];

export const mockRecentActivity = [
  { id: 1, type: 'register_traveler', user: 'Maria Siddiqui',   detail: 'Registered as Traveler',    time: '10 min ago' },
  { id: 2, type: 'register_agency',   user: 'Desert Routes',    detail: 'Applied for Agency Account', time: '35 min ago' },
  { id: 3, type: 'approved',          user: 'Northern Trails',  detail: 'Agency Approved',            time: '2 hrs ago'  },
  { id: 4, type: 'package',           user: 'Silk Road Tours',  detail: 'New Package Posted',         time: '3 hrs ago'  },
  { id: 5, type: 'suspended',         user: 'Fatima Zahra',     detail: 'Account Suspended',          time: '5 hrs ago'  },
  { id: 6, type: 'register_traveler', user: 'Usman Tariq',      detail: 'Registered as Traveler',    time: 'Yesterday'  },
  { id: 7, type: 'register_agency',   user: 'Wanderlust PK',    detail: 'Applied for Agency Account', time: 'Yesterday'  },
  { id: 8, type: 'rejected',          user: 'Wanderlust PK',    detail: 'Agency Rejected',            time: '2 days ago' },
];

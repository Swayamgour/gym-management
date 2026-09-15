import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Dumbbell,
  Wallet,
  UserPlus,
  BarChart3,
  Settings,
  ShieldCheck
} from 'lucide-react';

// Single source of truth for navigation. `roles` controls visibility;
// `primary` controls which items show directly in the mobile bottom bar
// (everything else collapses into the "More" sheet).
export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager'], primary: true },
  { to: '/trainer-dashboard', label: 'My dashboard', icon: LayoutDashboard, roles: ['trainer'], primary: true },
  { to: '/members', label: 'Members', icon: Users, roles: ['owner', 'manager', 'receptionist', 'trainer'], primary: true },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['owner', 'manager', 'receptionist', 'trainer'], primary: true },
  { to: '/payments', label: 'Payments', icon: Wallet, roles: ['owner', 'manager', 'receptionist'], primary: true },
  { to: '/memberships', label: 'Memberships', icon: CreditCard, roles: ['owner', 'manager', 'receptionist'] },
  { to: '/packages', label: 'Packages', icon: Dumbbell, roles: ['owner', 'manager'] },
  { to: '/trainers', label: 'Trainers', icon: Dumbbell, roles: ['owner', 'manager'] },
  { to: '/leads', label: 'Leads', icon: UserPlus, roles: ['owner', 'manager', 'receptionist'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'manager'] },
  { to: '/staff', label: 'Staff', icon: ShieldCheck, roles: ['owner', 'manager'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['owner'] }
];

export const getNavForRole = (role) => navItems.filter((item) => item.roles.includes(role));

import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Badge, Menu, MenuItem, Divider, Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Receipt as TransactionsIcon,
  AccountBalance as BudgetsIcon, Flag as GoalsIcon,
  BarChart as ReportsIcon, Settings as SettingsIcon,
  Add as AddIcon, Notifications as NotifIcon,
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon,
  TrendingUp as TrendingUpIcon, Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { tokens } from '../theme';
import Logo from './Logo';
import AddExpenseModal from './AddExpenseModal';
import { useExpenseData } from '../hooks/useExpenseData';

const drawerWidth = 240;
const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
  { text: 'Budgets', icon: <BudgetsIcon />, path: '/budgets' },
  { text: 'Goals', icon: <GoalsIcon />, path: '/goals', badge: 3 },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { addTransaction } = useExpenseData();

  const currentPage = navItems.find((i) => i.path === location.pathname)?.text || 'Dashboard';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      {/* Logo */}
      <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Logo sx={{ width: 32, height: 32, color: '#FFFFFF' }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Expense Tracker
          </Typography>
          <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.65rem' }}>
            Finance Manager
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  position: 'relative',
                  ...(isActive && {
                    '&::before': {
                      content: '""', position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 2, bgcolor: '#FFFFFF',
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#FFFFFF' : '#666666' }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', minWidth: 16, height: 16 } }}>
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User */}
      <Box sx={{ px: 2, pt: 2, borderTop: `1px solid ${tokens.borderDark}` }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', py: 1 }}
          onClick={() => navigate('/profile')}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#333333', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600 }}>JD</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#FFFFFF' }}>John Doe</Typography>
            <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.65rem' }}>john@example.com</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#000000',
          color: '#FFFFFF',
          borderBottom: `1px solid ${tokens.borderDark}`,
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' }, color: '#FFFFFF' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
              {currentPage}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setShowAddModal(true)} sx={{ color: '#FFFFFF' }}>
              <AddIcon />
            </IconButton>
            <IconButton>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', minWidth: 16, height: 16 } }}>
                <NotifIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#333333', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600 }}>JD</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
          <PersonIcon sx={{ fontSize: 16, mr: 1.5 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
          <SettingsIcon sx={{ fontSize: 16, mr: 1.5 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: '#FF4444' }}>
          <LogoutIcon sx={{ fontSize: 16, mr: 1.5 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          pt: { xs: 8, md: 9 },
          px: { xs: 2, sm: 3, md: 4 },
          pb: 4,
        }}
      >
        <Outlet />
      </Box>

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addTransaction} />
    </Box>
  );
}

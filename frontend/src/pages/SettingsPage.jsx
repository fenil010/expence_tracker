import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  CreditCard as PaymentIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const [notifications, setNotifications] = useState({
    emailTransactions: true,
    emailBudgetAlerts: true,
    emailReports: true,
    pushTransactions: true,
    pushBudgetAlerts: true,
    pushGoals: false,
    weeklyDigest: true,
    monthlyReport: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    dataExport: true,
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account preferences and settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Tabs */}
        <Grid item xs={12} md={3}>
          <Card>
            <List sx={{ p: 1 }}>
              {[
                { icon: <PersonIcon />, label: 'Profile', index: 0 },
                { icon: <NotificationsIcon />, label: 'Notifications', index: 1 },
                { icon: <SecurityIcon />, label: 'Security', index: 2 },
                { icon: <PaletteIcon />, label: 'Appearance', index: 3 },
                { icon: <PaymentIcon />, label: 'Billing', index: 4 },
              ].map((item) => (
                <ListItem
                  button
                  key={item.index}
                  selected={tabValue === item.index}
                  onClick={() => setTabValue(item.index)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(71, 85, 105, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: tabValue === item.index ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: tabValue === item.index ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          {/* Profile Tab */}
          {tabValue === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Profile Information
                </Typography>

                {/* Avatar Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 600,
                    }}
                  >
                    JD
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Profile Photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      JPG, GIF or PNG. Max size of 2MB.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        Upload
                      </Button>
                      <Button variant="text" size="small" color="error">
                        Remove
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Form */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        label="Timezone"
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      >
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        label="Currency"
                        value={profile.currency}
                        onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="JPY">JPY (¥)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveIcon />}>
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Notification Preferences
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Email Notifications
                </Typography>
                <List>
                  {[
                    { key: 'emailTransactions', label: 'Transaction confirmations', desc: 'Receive emails for each transaction' },
                    { key: 'emailBudgetAlerts', label: 'Budget alerts', desc: 'Get notified when approaching budget limits' },
                    { key: 'emailReports', label: 'Financial reports', desc: 'Weekly and monthly summary reports' },
                  ].map((item) => (
                    <ListItem key={item.key} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.label}
                        secondary={item.desc}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notifications[item.key]}
                          onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Push Notifications
                </Typography>
                <List>
                  {[
                    { key: 'pushTransactions', label: 'Transaction alerts', desc: 'Real-time push notifications' },
                    { key: 'pushBudgetAlerts', label: 'Budget warnings', desc: 'When exceeding budget limits' },
                    { key: 'pushGoals', label: 'Goal updates', desc: 'Progress on savings goals' },
                  ].map((item) => (
                    <ListItem key={item.key} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.label}
                        secondary={item.desc}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notifications[item.key]}
                          onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveIcon />}>
                    Save Preferences
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Security Settings
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Account Security
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security to your account"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={security.twoFactor}
                        onChange={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Login Alerts"
                      secondary="Get notified when someone logs into your account"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={security.loginAlerts}
                        onChange={() => setSecurity({ ...security, loginAlerts: !security.loginAlerts })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Password
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Current Password" type="password" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="New Password" type="password" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Confirm New Password" type="password" />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Data & Privacy
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button variant="outlined">
                    Export Data
                  </Button>
                  <Button variant="outlined">
                    Download Reports
                  </Button>
                </Box>

                <Alert severity="warning" sx={{ mb: 2 }}>
                  Deleting your account is permanent and cannot be undone.
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {tabValue === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Appearance
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Theme
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {['Light', 'Dark', 'System'].map((themeOption) => (
                    <Grid item xs={4} key={themeOption}>
                      <Button
                        fullWidth
                        variant={themeOption === 'Light' ? 'contained' : 'outlined'}
                        sx={{ py: 2 }}
                      >
                        {themeOption}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  Accent Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {['#475569', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#a855f7'].map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: color,
                        cursor: 'pointer',
                        border: color === '#475569' ? '3px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    />
                  ))}
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Density</InputLabel>
                  <Select label="Density" defaultValue="comfortable">
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="comfortable">Comfortable</MenuItem>
                    <MenuItem value="spacious">Spacious</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveIcon />}>
                    Save Appearance
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {tabValue === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Billing & Subscription
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  You're currently on the <strong>Free Plan</strong>. Upgrade for unlimited features.
                </Alert>

                <Box sx={{ p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pro Plan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unlimited transactions, advanced analytics, and more
                      </Typography>
                    </Box>
                    <Chip label="$9.99/mo" color="primary" />
                  </Box>
                  <Button variant="contained" fullWidth>
                    Upgrade to Pro
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Payment Method
                </Typography>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CreditCardIcon />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            No payment method
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Add a payment method to upgrade
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="outlined" size="small">
                        Add Card
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Billing History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No billing history yet
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action is permanent and cannot be undone.
            All your data, including transactions, budgets, and goals will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => setDeleteDialogOpen(false)}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsPage;


import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountIcon,
  CreditCard as CardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const stats = [
  { label: 'Total Transactions', value: 247, change: '+12%', positive: true },
  { label: 'Active Budgets', value: 6, change: '0%', positive: true },
  { label: 'Savings Goals', value: 5, change: '+1', positive: true },
  { label: 'Member Since', value: 'Jan 2024', change: '', positive: true },
];

const recentActivity = [
  { id: 1, action: 'Added new transaction', description: 'Grocery Shopping - $125.50', time: '2 hours ago', icon: '🛒' },
  { id: 2, action: 'Updated budget', description: 'Food & Dining - $800 limit', time: '5 hours ago', icon: '📊' },
  { id: 3, action: 'Achieved goal', description: 'Emergency Fund - 85% complete', time: '1 day ago', icon: '🎯' },
  { id: 4, action: 'Added goal', description: 'New Car - $15,000 target', time: '3 days ago', icon: '🚗' },
];

const linkedAccounts = [
  { name: 'Primary Bank', type: 'Checking', last4: '4567', connected: true },
  { name: 'Savings Account', type: 'Savings', last4: '8901', connected: true },
  { name: 'Credit Card', type: 'Credit', last4: '2345', connected: false },
];

function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Passionate about financial freedom and smart spending.',
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information and account details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    fontWeight: 600,
                    mx: 'auto',
                  }}
                >
                  JD
                </Avatar>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile.email}
              </Typography>

              <Chip
                label="Pro Member"
                color="primary"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              {/* Stats Grid */}
              <Grid container spacing={1}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Overview" />
              <Tab label="Edit Profile" />
              <Tab label="Activity" />
            </Tabs>

            <CardContent>
              {/* Overview Tab */}
              {tabValue === 0 && (
                <Box>
                  <Grid container spacing={3}>
                    {/* Contact Info */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Contact Information
                      </Typography>
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <EmailIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={profile.email}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <PhoneIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={profile.phone}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LocationIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Location"
                            secondary={profile.location}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      </List>
                    </Grid>

                    {/* Financial Summary */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Financial Summary
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Monthly Income</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            $4,900
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Monthly Expenses</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                            $3,400
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Net Savings
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            $1,500
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Linked Accounts */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Linked Accounts
                      </Typography>
                      <List>
                        {linkedAccounts.map((account, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              px: 2,
                              py: 1.5,
                              mb: 1,
                              bgcolor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 2,
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <AccountIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={account.name}
                              secondary={`${account.type} •••• ${account.last4}`}
                            />
                            <Chip
                              label={account.connected ? 'Connected' : 'Not Connected'}
                              size="small"
                              color={account.connected ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    {/* Recent Activity */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Recent Activity
                      </Typography>
                      {recentActivity.map((activity) => (
                        <Box
                          key={activity.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            mb: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                          }}
                        >
                          <Avatar sx={{ bgcolor: 'rgba(71, 85, 105, 0.1)', fontSize: '1.2rem' }}>
                            {activity.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.description}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Edit Profile Tab */}
              {tabValue === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Keep your profile information up to date for better financial insights.
                  </Alert>

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
                        label="Email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={profile.location}
                        onChange={handleProfileChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined">
                      Cancel
                    </Button>
                    <Button variant="contained">
                      Save Changes
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Activity Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Account Activity
                  </Typography>
                  <List>
                    {recentActivity.map((activity, index) => (
                      <Box key={activity.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 48 }}>
                            <Avatar sx={{ bgcolor: 'rgba(71, 85, 105, 0.1)', width: 36, height: 36 }}>
                              {activity.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.action}
                            secondary={activity.description}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>

                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="text">
                      View All Activity
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;


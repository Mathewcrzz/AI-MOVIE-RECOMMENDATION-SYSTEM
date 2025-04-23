'use client';

import { AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar, Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../services/supabase';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isProfilePage = false;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isProfilePage) return null;

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png"
            alt="StreamFlix Logo"
            style={{ height: '40px', marginRight: '10px' }}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
          >
            StreamFlix
          </Typography>
        </Box>
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            p: 0,
            position: 'relative',
            zIndex: 1201,
            '&:hover': {
              boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            },
          }}
        >
          <Avatar alt="Profile" sx={{ boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }} />
        </IconButton>
        <Menu
  anchorEl={anchorEl}
  open={open}
  onClose={handleMenuClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  PaperProps={{
    sx: {
      mt: 1,
      px: 2,
      py: 1,
      borderRadius: 3,
      backdropFilter: 'blur(12px)',
      background: 'linear-gradient(135deg, rgba(33,33,33,0.8), rgba(66,66,66,0.6))',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontFamily: 'Poppins, sans-serif',
    },
  }}
>
           <MenuItem
             onClick={() => { router.push('/'); handleMenuClose(); }}
             sx={{
               my: 0.5,
               gap: 1,
               transition: 'all 0.3s ease',
               '&:hover': {
                 backgroundColor: 'rgba(255, 255, 255, 0.15)',
                 transform: 'scale(1.03)',
               },
               '& svg': {
                 transition: 'transform 0.3s ease',
               },
               '&:hover svg': {
                 transform: 'scale(1.2)',
               },
             }}
           >
             <HomeIcon fontSize="small" /> Home
           </MenuItem>
           <MenuItem
             onClick={() => { router.push('/profile'); handleMenuClose(); }}
             sx={{
               my: 0.5,
               gap: 1,
               transition: 'all 0.3s ease',
               '&:hover': {
                 backgroundColor: 'rgba(255, 255, 255, 0.15)',
                 transform: 'scale(1.03)',
               },
               '& svg': {
                 transition: 'transform 0.3s ease',
               },
               '&:hover svg': {
                 transform: 'scale(1.2)',
               },
             }}
           >
             <PersonIcon fontSize="small" /> Profile
           </MenuItem>
           <MenuItem
             onClick={() => { router.push('/admin'); handleMenuClose(); }}
             sx={{
               my: 0.5,
               gap: 1,
               transition: 'all 0.3s ease',
               '&:hover': {
                 backgroundColor: 'rgba(255, 255, 255, 0.15)',
                 transform: 'scale(1.03)',
               },
               '& svg': {
                 transition: 'transform 0.3s ease',
               },
               '&:hover svg': {
                 transform: 'scale(1.2)',
               },
             }}
           >
             <AdminPanelSettingsIcon fontSize="small" /> Admin
           </MenuItem>
           <MenuItem
             onClick={async () => {
               await supabase.auth.signOut();
               router.push('/auth');
               handleMenuClose();
             }}
             sx={{
               my: 0.5,
               gap: 1,
               transition: 'all 0.3s ease',
               '&:hover': {
                 backgroundColor: 'rgba(255, 255, 255, 0.15)',
                 transform: 'scale(1.03)',
               },
               '& svg': {
                 transition: 'transform 0.3s ease',
               },
               '&:hover svg': {
                 transform: 'scale(1.2)',
               },
             }}
           >
             <LogoutIcon fontSize="small" /> Sign Out
           </MenuItem>
         </Menu>
       </Toolbar>
     </AppBar>
   );
}

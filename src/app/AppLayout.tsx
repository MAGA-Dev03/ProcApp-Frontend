import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { fonts } from './tokens';
import { NAV_ITEMS } from './nav';
import { useRole } from './RoleContext';
import { TopBar } from './TopBar';
import { PrototypeBanner } from '../components/PrototypeBanner';

const RAIL_WIDTH_EXPANDED = 216;
const RAIL_WIDTH_COLLAPSED = 72;

export function AppLayout() {
  const { role } = useRole();
  const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = isTablet && !isMobile;
  const railWidth = collapsed ? RAIL_WIDTH_COLLAPSED : RAIL_WIDTH_EXPANDED;
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const railContent = (
    <>
      <Box
        sx={{
          px: collapsed ? 1.5 : 2.5,
          py: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {collapsed ? (
          <Typography sx={{ fontFamily: fonts.display, fontSize: 20 }}>R</Typography>
        ) : (
          <Box>
            <Typography sx={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 400, letterSpacing: '0.01em' }}>
              Registry
            </Typography>
            <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mt: 0.25 }}>
              Procurement
            </Typography>
          </Box>
        )}
      </Box>

      <List sx={{ px: collapsed ? 1 : 1.5, py: 2, flexGrow: 1 }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const button = (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: 'text.primary',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'text.secondary', justifyContent: 'center' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: 600 } } }}
                  primary={item.label}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PrototypeBanner />
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: RAIL_WIDTH_EXPANDED,
                boxSizing: 'border-box',
                backgroundImage: 'none',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            {railContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: railWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: railWidth,
                boxSizing: 'border-box',
                borderRight: 1,
                borderColor: 'divider',
                backgroundColor: 'background.default',
                backgroundImage: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflowX: 'hidden',
              },
            }}
          >
            {railContent}
          </Drawer>
        )}

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar showMenuButton={isMobile} onMenuClick={() => setMobileOpen(true)} />
          <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'background.default' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

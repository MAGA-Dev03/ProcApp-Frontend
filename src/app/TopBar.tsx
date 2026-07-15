import { useState } from 'react';
import type { MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { fonts } from './tokens';
import { useRole, ROLE_LABELS } from './RoleContext';
import type { UserRole } from './RoleContext';
import { useColorMode } from './ColorModeContext';

const ROLE_ORDER: UserRole[] = ['requester', 'approver', 'finance'];

interface TopBarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ onMenuClick, showMenuButton }: TopBarProps) {
  const { role, setRole, user } = useRole();
  const { mode, toggleMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (next: UserRole) => {
    setRole(next);
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'surface.raised',
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
        {showMenuButton && (
          <IconButton onClick={onMenuClick} edge="start" aria-label="Open navigation">
            <MenuOutlinedIcon />
          </IconButton>
        )}

        <Typography
          sx={{
            fontFamily: fonts.display,
            fontSize: 18,
            display: { xs: 'block', md: 'none' },
          }}
        >
          Registry
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          onClick={toggleMode}
          size="small"
          aria-label="Toggle color mode"
          sx={{ mr: 0.5 }}
        >
          {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
        </IconButton>

        <Button
          onClick={handleOpen}
          endIcon={<ExpandMoreOutlinedIcon />}
          sx={{
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            px: 1.5,
            py: 0.5,
            minWidth: 0,
          }}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Box sx={{ textAlign: 'left', lineHeight: 1.2 }}>
            <Typography sx={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Viewing as
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{ROLE_LABELS[role]}</Typography>
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {ROLE_ORDER.map((r) => (
            <MenuItem key={r} onClick={() => handleSelect(r)} selected={r === role}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {r === role ? <CheckOutlinedIcon fontSize="small" color="primary" /> : null}
              </ListItemIcon>
              <ListItemText primary={ROLE_LABELS[r]} />
            </MenuItem>
          ))}
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {user.initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.name}</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{user.email}</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

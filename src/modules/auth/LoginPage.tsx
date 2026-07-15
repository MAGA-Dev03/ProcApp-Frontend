import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Stack } from '@mui/material';
import { fonts } from '../../app/tokens';
import { PrototypeBanner } from '../../components/PrototypeBanner';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PrototypeBanner />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          px: 2,
        }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3.5, sm: 5 },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 1.15 }}>Registry</Typography>
            <Typography sx={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mt: 0.5 }}>
              Procurement &amp; RFQ Platform
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              required
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Sign in
            </Button>
          </Stack>

          <Typography sx={{ mt: 3, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
            Internal use only — contact IT for access issues.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

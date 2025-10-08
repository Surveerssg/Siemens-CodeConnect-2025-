import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import AppRoutes from './routes';
import './styles/globals.css';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#E55A5A',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#7EDDD6',
      dark: '#3BA39C',
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  typography: {
    fontFamily: '"Comic Sans MS", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    button: {
      textTransform: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <GameProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </GameProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const IframeGame = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <button
        onClick={() => navigate('/games')}
        aria-label="Back to games"
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(0,0,0,0.2)',
          padding: '8px 14px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        Back
      </button>

      <iframe
        title="Huge Kombat"
        src={process.env.NODE_ENV === 'development' ? '/maingame/index.html' : '/maingame/index.html'}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
};

export default IframeGame;


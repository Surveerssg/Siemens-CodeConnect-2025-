import React from 'react';

const IframeGame = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '8px', background: '#111', color: '#fff' }}>
        <span style={{ fontWeight: 700 }}>Huge Kombat</span>
        <span style={{ opacity: 0.8, marginLeft: 12 }}>
          Ensure build files are available at /maingame/index.html
        </span>
      </div>
      <iframe
        title="Huge Kombat"
        src={process.env.NODE_ENV === 'development' ? '/maingame/index.html' : '/maingame/index.html'}
        style={{ flex: 1, border: 'none' }}
      />
    </div>
  );
};

export default IframeGame;


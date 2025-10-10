import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gamesAPI } from '../../../services/api';
import { useGame } from '../../../context/GameContext';

const IframeGame = () => {
  const navigate = useNavigate();

  const { addXP, loadUserData } = useGame();

  useEffect(() => {
    const handler = async (event) => {
      try {
        if (!event.data || event.data.type !== 'GAME_FINISHED') return;
        const result = event.data.result || 'lose';
        const xp = Number(event.data.xp) || 0;

        // Record that a game finished (increment Games_Played)
        try {
          await gamesAPI.startGame({ gameType: 'kombat' });
        } catch (e) {
          console.error('startGame failed', e);
        }

        // If win, award XP via GameContext
        if (result === 'win' && xp > 0) {
          try {
            await addXP(xp);
          } catch (e) {
            console.error('addXP (context) failed', e);
            await gamesAPI.addXP({ xpAmount: xp, gameType: 'kombat' }).catch(e2 => console.error('addXP fallback failed', e2));
          }
        }

        // Fetch achievements and unlock FIRST_GAME if not present
        const achievementsRes = await gamesAPI.getAchievements().catch(e => { console.error('getAchievements failed', e); return null; });
        const owned = (achievementsRes?.data || []).map(a => a.achievementType || a.type || a.name);
        if (!owned.includes('FIRST_GAME')) {
          try {
            await gamesAPI.addAchievement({ achievementType: 'FIRST_GAME', description: 'Played first game', xpReward: 0 });
          } catch (e) {
            console.error('addAchievement FIRST_GAME failed', e);
          }
        }

        // Refresh local context state (reload user game/progress info)
        try {
          await loadUserData();
        } catch (e) {
          console.error('loadUserData failed', e);
        }
      } catch (err) {
        console.error('Error handling GAME_FINISHED message', err);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [addXP, loadUserData]);

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


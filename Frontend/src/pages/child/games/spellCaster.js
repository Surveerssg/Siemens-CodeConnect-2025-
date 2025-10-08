import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, Container, Grid, LinearProgress, Typography } from '@mui/material';
import { ArrowLeft, Mic, Sword, Shield, RefreshCw } from 'lucide-react';
import PhaserEffects from './PhaserEffects';
import PhaserArena from './PhaserArena';

// Spell pools
const PLAYER_SPELLS = ['FLAME', 'BURST', 'WAVE', 'BOLT', 'FROST', 'LIGHT'];
const MONSTER_SPELLS = ['DARK', 'CURSE', 'SHADOW', 'VENOM'];
const COUNTER_MAP = {
  DARK: 'LIGHT',
  CURSE: 'BLESS',
  SHADOW: 'SUN',
  VENOM: 'CURE'
};

const INITIAL_PLAYER_HP = 100;
const INITIAL_MONSTER_HP = 100;
const MOVES_PER_TURN = 2;

// Mock pronunciation scoring: deterministically pseudo-random based on word and timestamp
function mockPronunciationScore(word) {
  const base = Array.from(word).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variance = (Date.now() % 100) / 100; // 0..0.99
  const noisy = (base % 101) * 0.6 + variance * 40; // 0..100
  return Math.max(0, Math.min(100, Math.round(noisy)));
}

function scoreToDamage(score) {
  if (score >= 90) return { label: 'Perfect!', damage: 25 };
  if (score >= 70) return { label: 'Good!', damage: 15 };
  if (score >= 50) return { label: 'Weak', damage: 5 };
  return { label: 'Miss', damage: 0 };
}

function scoreToBlock(score) {
  if (score >= 90) return { label: 'Perfect Block', blocked: 1.0 };
  if (score >= 70) return { label: 'Partial Block', blocked: 0.6 };
  return { label: 'No Block', blocked: 0 };
}

const HPBar = ({ label, hp, color }) => (
  <Card className="game-card" sx={{ p: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 'bold' }}>{label}: {hp}</Typography>
    <LinearProgress variant="determinate" value={hp} sx={{ height: 12, borderRadius: 2, '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
  </Card>
);

const SpellBadge = ({ text }) => (
  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 16, background: '#eef9f8', color: '#2C3E50', fontWeight: 'bold', border: '2px solid #4ECDC4' }}>
    {text}
  </motion.div>
);

const Explosion = ({ big }) => (
  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 0.2, opacity: 0 }} transition={{ duration: 0.4 }}
    style={{ width: big ? 120 : 60, height: big ? 120 : 60, borderRadius: '50%', background: big ? 'radial-gradient(circle, #ffadad, #ff6b6b)' : 'radial-gradient(circle, #ffd6a5, #ff9f1a)' }} />
);

const ShieldGlow = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: 2, duration: 0.6 }}
    style={{ width: 90, height: 90, borderRadius: '50%', border: '4px solid #4ECDC4', boxShadow: '0 0 20px #4ECDC4' }} />
);

const PlayerHitFlash = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: 1, duration: 0.5 }}
    style={{ width: 100, height: 100, borderRadius: 12, background: 'rgba(244,67,54,0.25)' }} />
);

const SpellCaster = () => {
  const navigate = useNavigate();

  const [playerHP, setPlayerHP] = useState(INITIAL_PLAYER_HP);
  const [monsterHP, setMonsterHP] = useState(INITIAL_MONSTER_HP);
  const [round, setRound] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [movesLeft, setMovesLeft] = useState(MOVES_PER_TURN);
  const [currentSpell, setCurrentSpell] = useState(PLAYER_SPELLS[0]);
  const [monsterSpell, setMonsterSpell] = useState(MONSTER_SPELLS[0]);
  const [expectedCounter, setExpectedCounter] = useState(COUNTER_MAP[MONSTER_SPELLS[0]]);
  const [lastScore, setLastScore] = useState(null);
  const [lastResultText, setLastResultText] = useState('');
  const [anim, setAnim] = useState(null); // 'big','small','block','hit'
  const [winner, setWinner] = useState(null);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const effectsRef = useRef(null);
  const arenaRef = useRef(null);

  useEffect(() => {
    setCurrentSpell(PLAYER_SPELLS[Math.floor(Math.random() * PLAYER_SPELLS.length)]);
  }, []);

  useEffect(() => {
    if (playerHP <= 0) setWinner('Monster');
    if (monsterHP <= 0) setWinner('Player');
  }, [playerHP, monsterHP]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        // In a real integration, process audio blob with STT API here
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        void blob; // placeholder usage
      };
      recorder.start();
      setRecording(true);
    } catch (e) {
      console.error('Microphone access error', e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setRecording(false);
    }
  }, []);

  const performPlayerMove = useCallback(() => {
    const score = mockPronunciationScore(currentSpell);
    setLastScore(score);
    const { label, damage } = scoreToDamage(score);
    setLastResultText(`${label} (${score}%)`);
    setMonsterHP(hp => Math.max(0, hp - damage));
    const kind = damage >= 25 ? 'big' : damage >= 5 ? 'small' : null;
    setAnim(kind);
    // trigger arena projectile
    if (arenaRef.current && kind) {
      arenaRef.current.playerAttack(kind);
    }
    // trigger extra particles layer
    setTimeout(() => {
      const canvas = document.getElementById('arena-layer');
      if (canvas && effectsRef.current) {
        const rect = canvas.getBoundingClientRect();
        const x = rect.width * 0.75;
        const y = rect.height * 0.5;
        if (kind === 'big') effectsRef.current.triggerExplosion(x, y);
        if (kind === 'small') effectsRef.current.triggerSpark(x, y);
      }
    }, 50);

    setMovesLeft(m => {
      const next = m - 1;
      if (next <= 0) {
        // switch to monster turn after a short pause
        setTimeout(() => {
          setIsPlayerTurn(false);
          setMovesLeft(MOVES_PER_TURN);
          const mspell = MONSTER_SPELLS[Math.floor(Math.random() * MONSTER_SPELLS.length)];
          setMonsterSpell(mspell);
          setExpectedCounter(COUNTER_MAP[mspell] || 'BLOCK');
        }, 600);
      } else {
        setCurrentSpell(PLAYER_SPELLS[Math.floor(Math.random() * PLAYER_SPELLS.length)]);
      }
      return next;
    });
  }, [currentSpell]);

  const performMonsterMove = useCallback(() => {
    const score = mockPronunciationScore(expectedCounter);
    setLastScore(score);
    const block = scoreToBlock(score);
    setLastResultText(`${block.label} (${score}%)`);
    let incoming = 12; // base monster damage 5-15
    const reduced = Math.round(incoming * (1 - block.blocked));
    if (block.blocked >= 0.6) {
      setAnim('block');
      if (arenaRef.current) arenaRef.current.monsterAttack('block');
      setTimeout(() => {
        const canvas = document.getElementById('arena-layer');
        if (canvas && effectsRef.current) {
          const rect = canvas.getBoundingClientRect();
          effectsRef.current.triggerShield(rect.width * 0.25, rect.height * 0.5);
        }
      }, 50);
    } else if (reduced > 0) {
      setAnim('hit');
      if (arenaRef.current) arenaRef.current.monsterAttack('hit');
    }
    setPlayerHP(hp => Math.max(0, hp - reduced));

    // end monster turn and advance round
    setTimeout(() => {
      setIsPlayerTurn(true);
      setRound(r => r + 1);
      setCurrentSpell(PLAYER_SPELLS[Math.floor(Math.random() * PLAYER_SPELLS.length)]);
    }, 600);
  }, [expectedCounter]);

  const onSpeakClick = async () => {
    await startRecording();
    setTimeout(() => {
      stopRecording();
      if (winner) return;
      if (isPlayerTurn) performPlayerMove(); else performMonsterMove();
    }, 1200);
  };

  const resetGame = () => {
    setPlayerHP(INITIAL_PLAYER_HP);
    setMonsterHP(INITIAL_MONSTER_HP);
    setRound(1);
    setIsPlayerTurn(true);
    setMovesLeft(MOVES_PER_TURN);
    setCurrentSpell(PLAYER_SPELLS[Math.floor(Math.random() * PLAYER_SPELLS.length)]);
    setMonsterSpell(MONSTER_SPELLS[0]);
    setExpectedCounter(COUNTER_MAP[MONSTER_SPELLS[0]]);
    setLastScore(null);
    setLastResultText('');
    setAnim(null);
    setWinner(null);
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Button startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/games')} sx={{ color: '#4ECDC4', mb: 2 }}>Back to Games</Button>
      <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 2 }}>SpellCaster 🔮</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Speak the spell clearly to attack. During the monster's turn, speak the counter-spell to block!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <HPBar label="Player HP" hp={playerHP} color="#4ECDC4" />
        </Grid>
        <Grid item xs={12} md={6}>
          <HPBar label="Monster HP" hp={monsterHP} color="#FF6B6B" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2C3E50', mb: 1 }}>Player</Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.div initial={{ y: 0 }} animate={{ y: isPlayerTurn ? [0, -6, 0] : 0 }} transition={{ repeat: isPlayerTurn ? Infinity : 0, duration: 1.2 }}
                  style={{ width: 120, height: 120, borderRadius: 12, background: 'linear-gradient(135deg, #e8fff8, #ccfff2)', border: '2px solid #4ECDC4', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9d9-200d-2642-fe0f.svg" alt="wizard" style={{ width: 72, height: 72 }} />
                  <Sword />
                  <AnimatePresence>
                    {anim === 'hit' && <PlayerHitFlash />}
                    {(anim === 'big' || anim === 'small') && <Explosion big={anim === 'big'} />}
                  </AnimatePresence>
                </motion.div>
                <div>
                  <Typography variant="caption" color="text.secondary">Round {round} • {isPlayerTurn ? `Player Turn (${movesLeft} moves left)` : 'Monster Turn'}</Typography>
                  <div style={{ marginTop: 8 }}>
                    <SpellBadge text={isPlayerTurn ? `Spell: ${currentSpell}` : `Counter: ${expectedCounter}`} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Button variant="contained" startIcon={<Mic size={18} />} onClick={onSpeakClick} disabled={!!winner}
                  sx={{ background: '#4ECDC4', '&:hover': { background: '#3fbdb5' } }}>{recording ? 'Listening...' : 'Speak'}</Button>
                <Button variant="outlined" startIcon={<RefreshCw size={18} />} onClick={resetGame}>Reset</Button>
              </div>
              {lastScore !== null && (
                <Typography variant="body2" sx={{ mt: 1 }}>Last Result: {lastResultText}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2C3E50', mb: 1 }}>Monster</Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.div initial={{ y: 0 }} animate={{ y: !isPlayerTurn ? [0, -6, 0] : 0 }} transition={{ repeat: !isPlayerTurn ? Infinity : 0, duration: 1.2 }}
                  style={{ width: 120, height: 120, borderRadius: 12, background: 'linear-gradient(135deg, #fff0f0, #ffe2e2)', border: '2px solid #FF6B6B', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9df.svg" alt="monster" style={{ width: 72, height: 72 }} />
                  <AnimatePresence>
                    {anim === 'block' && <ShieldGlow />}
                  </AnimatePresence>
                </motion.div>
                <div>
                  <Typography variant="caption" color="text.secondary">{!isPlayerTurn ? `Monster casts ${monsterSpell}` : 'Waiting...'}</Typography>
                  {!isPlayerTurn && (
                    <div style={{ marginTop: 8 }}>
                      <SpellBadge text={`Counter with: ${expectedCounter}`} />
                    </div>
                  )}
                </div>
              </div>
              {!isPlayerTurn && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button variant="contained" startIcon={<Mic size={18} />} onClick={onSpeakClick} disabled={!!winner}
                    sx={{ background: '#FF6B6B', '&:hover': { background: '#e25f5f' } }}>{recording ? 'Listening...' : 'Speak'}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Battle arena with phaser effects overlay */}
      <div id="arena-layer" style={{ position: 'relative', width: '100%', height: 260, marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '2px solid #e0e0e0' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <PhaserArena ref={arenaRef} />
        </div>
        <PhaserEffects ref={effectsRef} />
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ marginTop: 24 }}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: winner === 'Player' ? '#4ECDC4' : '#FF6B6B' }}>
                  {winner === 'Player' ? 'You Win! 🎉' : 'Game Over 💀'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {winner === 'Player' ? 'Great pronunciation! The monster is defeated.' : 'Keep practicing your pronunciation and try again!'}
                </Typography>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button variant="contained" onClick={resetGame} sx={{ background: '#4ECDC4', '&:hover': { background: '#3fbdb5' } }}>Play Again</Button>
                  <Button variant="outlined" onClick={() => navigate('/games')}>Back to Games</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SpellCaster;



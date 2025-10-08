import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';

const PhaserEffects = forwardRef(function PhaserEffects(_, ref) {
  const containerRef = useRef(null);
  const phaserRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    class EffectsScene extends Phaser.Scene {
      constructor() {
        super('EffectsScene');
      }
      preload() {}
      create() {
        // Create particle textures
        const g1 = this.make.graphics({ x: 0, y: 0, add: false });
        g1.fillStyle(0xff6b6b, 1);
        g1.fillCircle(8, 8, 8);
        g1.generateTexture('redDot', 16, 16);

        const g2 = this.make.graphics({ x: 0, y: 0, add: false });
        g2.fillStyle(0x4ecdc4, 1);
        g2.fillCircle(6, 6, 6);
        g2.generateTexture('tealDot', 12, 12);
      }

      burst(x, y, key, count = 24, speed = { min: 80, max: 180 }) {
        const particles = this.add.particles(key);
        const emitter = particles.createEmitter({
          x,
          y,
          speed,
          scale: { start: 1, end: 0 },
          lifespan: { min: 300, max: 900 },
          gravityY: 200,
          quantity: count,
          blendMode: 'ADD'
        });
        this.time.delayedCall(600, () => {
          particles.destroy();
        });
      }

      shield(x, y) {
        const circle = this.add.circle(x, y, 10, 0x4ecdc4, 0.6);
        this.tweens.add({ targets: circle, scale: 6, alpha: 0, duration: 500, onComplete: () => circle.destroy() });
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      parent: containerRef.current,
      transparent: true,
      physics: { default: 'arcade' },
      scene: [EffectsScene]
    });

    phaserRef.current = game;
    game.events.on('ready', () => {
      sceneRef.current = game.scene.keys['EffectsScene'];
    });

    // Phaser doesn't emit 'ready', so wait a tick
    setTimeout(() => {
      sceneRef.current = game.scene.keys['EffectsScene'];
    }, 100);

    const handleResize = () => {
      if (!phaserRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      phaserRef.current.scale.resize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerExplosion: (x, y) => {
      if (sceneRef.current) sceneRef.current.burst(x, y, 'redDot');
    },
    triggerSpark: (x, y) => {
      if (sceneRef.current) sceneRef.current.burst(x, y, 'tealDot', 14, { min: 60, max: 120 });
    },
    triggerShield: (x, y) => {
      if (sceneRef.current) sceneRef.current.shield(x, y);
    }
  }), []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
  );
});

export default PhaserEffects;



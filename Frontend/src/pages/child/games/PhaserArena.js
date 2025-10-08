import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';

// A lightweight Phaser arena with two animated characters and projectile attacks
const PhaserArena = forwardRef(function PhaserArena(_, ref) {
  const containerRef = useRef(null);
  const phaserRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    class ArenaScene extends Phaser.Scene {
      constructor() {
        super('ArenaScene');
      }

      create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background layers
        this.add.rectangle(width / 2, height / 2, width, height, 0xeef7ff).setDepth(0);
        this.add.rectangle(width / 2, height - 30, width, 60, 0xb6e3d9).setDepth(0);

        // Characters (simple shapes as stand-ins for sprites)
        this.player = this.add.container(width * 0.2, height - 60).setDepth(2);
        const pBody = this.add.ellipse(0, -20, 60, 60, 0x4ecdc4);
        const pHead = this.add.ellipse(0, -60, 34, 34, 0x2c3e50);
        this.player.add([pBody, pHead]);

        this.monster = this.add.container(width * 0.8, height - 60).setDepth(2);
        const mBody = this.add.ellipse(0, -20, 70, 70, 0xff6b6b);
        const mHead = this.add.ellipse(0, -65, 40, 40, 0x2c3e50);
        this.monster.add([mBody, mHead]);

        // Idle bob animation
        this.tweens.add({ targets: [this.player, this.monster], y: '+=6', yoyo: true, repeat: -1, duration: 900, ease: 'sine.inOut' });

        // A simple shield graphics for blocks
        this.playerShield = this.add.circle(this.player.x, this.player.y - 40, 10, 0x4ecdc4, 0.5).setScale(0).setDepth(3);

        // Helper to spawn projectiles
        this.spawnProjectile = (fromX, fromY, toX, toY, opts) => {
          const { color = 0x4ecdc4, size = 10, duration = 500 } = opts || {};
          const proj = this.add.circle(fromX, fromY, size, color).setDepth(4);
          this.tweens.add({
            targets: proj,
            x: toX,
            y: toY,
            duration,
            ease: 'quad.inOut',
            onComplete: () => {
              // impact effect
              const impact = this.add.circle(toX, toY, size * 0.8, color, 0.6).setDepth(5);
              this.tweens.add({ targets: impact, scale: 3, alpha: 0, duration: 350, onComplete: () => impact.destroy() });
              proj.destroy();
            }
          });
        };

        // Public actions via scene methods
        this.playerAttack = (strength) => {
          const size = strength === 'big' ? 14 : strength === 'small' ? 10 : 8;
          const color = strength === 'big' ? 0xff9f1a : 0x4ecdc4;
          const duration = strength === 'big' ? 500 : 600;
          this.spawnProjectile(this.player.x + 20, this.player.y - 50, this.monster.x - 20, this.monster.y - 50, { color, size, duration });
          // brief punch scale on player
          this.tweens.add({ targets: this.player, scaleX: 1.06, scaleY: 0.94, duration: 120, yoyo: true });
        };

        this.monsterAttack = (outcome) => {
          const size = 12;
          const color = 0xff6b6b;
          const toX = this.player.x + 20;
          const toY = this.player.y - 50;
          const proj = this.add.circle(this.monster.x - 20, this.monster.y - 50, size, color).setDepth(4);
          this.tweens.add({
            targets: proj,
            x: toX,
            y: toY,
            duration: 600,
            ease: 'quad.inOut',
            onComplete: () => {
              proj.destroy();
              if (outcome === 'block') {
                this.showShield();
              } else {
                this.hitPlayer();
              }
            }
          });
          this.tweens.add({ targets: this.monster, scaleX: 1.06, scaleY: 0.94, duration: 120, yoyo: true });
        };

        this.showShield = () => {
          this.playerShield.x = this.player.x + 20;
          this.playerShield.y = this.player.y - 50;
          this.playerShield.setScale(0.2).setAlpha(0.7);
          this.tweens.add({ targets: this.playerShield, scale: 2.5, alpha: 0, duration: 400 });
        };

        this.hitPlayer = () => {
          const flash = this.add.rectangle(this.player.x, this.player.y - 40, 90, 90, 0xf44336, 0.2).setDepth(5);
          this.tweens.add({ targets: flash, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
        };
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      parent: containerRef.current,
      transparent: false,
      physics: { default: 'arcade' },
      scene: [ArenaScene]
    });

    phaserRef.current = game;
    setTimeout(() => { sceneRef.current = game.scene.keys['ArenaScene']; }, 120);

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
    playerAttack: (strength) => {
      if (sceneRef.current && sceneRef.current.playerAttack) sceneRef.current.playerAttack(strength);
    },
    monsterAttack: (outcome) => {
      if (sceneRef.current && sceneRef.current.monsterAttack) sceneRef.current.monsterAttack(outcome);
    },
    showShield: () => {
      if (sceneRef.current && sceneRef.current.showShield) sceneRef.current.showShield();
    }
  }), []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
});

export default PhaserArena;



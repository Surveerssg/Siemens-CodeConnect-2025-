import * as PIXI from "pixi.js";
import { cheapColi } from "./coli.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600);
    this.textObj = new TextStyles(this.app.renderer);
    this.utils = new SpriteUtilities(PIXI);
    this.scenes = {
      intro: {},
      select: {},
      game: {},
      gameOver: {},
      youWin: {}
    };

    this.powers = [];
    this.characterNames = [];
    this.action = [];
    this.power = [];
    this.finishHim = false;
    this.switchLeft = true;
    this.switchRight = false;

    this.energyBars = {
      left: {
        bars: {
          exterior: {},
          interior: {}
        },
        level: 385
      },
      right: {
        bars: {
          exterior: {},
          interior: {}
        },
        level: 385
      }
    };

    this.initScenes();

    this.energyBarLeft = {};
    this.energyBarLeftInterior = {};
    this.energyBarLeftRed = {};
    this.energyBarRight = {};

    this.backgrounds = {};

    this.keys = {};

    this.gravity = 1.3;
    this.groundY = 315;

    this.attachEvents();

    this.sound = null;

    // SpellCaster mode flag/state
    this.spellCasterMode = true;
    this.spellState = {
      turn: "player", // 'player' | 'monster'
      movesRemaining: 2,
      round: 1,
      playerHP: 100,
      monsterHP: 100,
      currentWord: "",
      awaitingSpeech: false
    };
    this.spells = {
      player: ["FLAME", "BURST", "BLAZE", "ZAP", "FLASH"],
      monster: ["DARK", "DOOM", "GLOOM"]
    };
    this.ui = {
      wordText: null,
      instructionText: null,
      scoreText: null,
      speakButton: null,
      playerHpBar: null,
      monsterHpBar: null,
      roundText: null
    };
    this.projectiles = [];

    PIXI.loader
      .add([
        "assets/images/powers/yelo.json",
        "assets/images/powers/fire.json",
        "assets/images/powers/death.json",
        "assets/images/characters/scorpion.json",
        "assets/images/characters/claudia.json",
        "assets/images/characters/pao.json",
        "assets/images/characters/aram.json",
        "assets/images/characters/subzero.json",
        "assets/images/backgrounds/fight.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/win.jpg",
        "assets/images/characters/aram.jpg",
        "assets/images/characters/scorpion.jpg",
        "assets/images/characters/claudia.png",
        "assets/images/characters/pao.png",
        "assets/images/characters/claudia-portrait.png",
        "assets/images/characters/pao-portrait.png",
        "assets/images/backgrounds/combat.jpg",
        "assets/sounds/fight.mp3",
        "assets/sounds/hitsounds/mk3-00100.mp3",
        "assets/sounds/hitsounds/mk3-00105.mp3",
        "assets/sounds/hitsounds/mk3-00155.mp3",
        "assets/sounds/hitsounds/mk3-00165.mp3",
        "assets/sounds/hitsounds/mk3-00170.mp3",
        "assets/sounds/male/mk3-03000.mp3",
        "assets/sounds/short/mk3-00054.mp3",
        "assets/sounds/short/mk3-00053.mp3",
        "assets/sounds/vsmusic.mp3",
        "assets/sounds/fightScream.mp3",
        "assets/sounds/hitscream.mp3",
        "assets/sounds/finish.mp3",
        "assets/sounds/scream.mp3"
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  initScenes() {
    for (let scene in this.scenes) {
      this.scenes[scene] = new PIXI.Container();
      this.scenes[scene].alpha = 0;
      this.app.stage.addChild(this.scenes[scene]);
    }
  }

  setActiveScene(sceneName) {
    for (let scene in this.scenes) {
      this.scenes[scene].visible = false;
      if (scene === sceneName) {
        this.scenes[scene].visible = true;
      }
    }
  }

  playSound(event, options = { loop: false, bg: false }) {
    let soundPath = "";
    switch (event) {
      case "jump":
        soundPath = "assets/sounds/hitsounds/mk3-00155.mp3";
        break;
      case "kick":
        soundPath = "assets/sounds/hitsounds/mk3-00100.mp3";
        break;
      case "punch":
        soundPath = "assets/sounds/hitsounds/mk3-00105.mp3";
        break;
      case "hit":
        soundPath = "assets/sounds/male/mk3-03000.mp3";
        break;
      case "nopunch":
        soundPath = "assets/sounds/hitsounds/mk3-00165.mp3";
        break;
      case "nokick":
        soundPath = "assets/sounds/hitsounds/mk3-00170.mp3";
        break;
      case "intro":
        soundPath = "assets/sounds/short/mk3-00054.mp3";
        break;
      case "vs":
        soundPath = "assets/sounds/short/mk3-00053.mp3";
        break;
      case "fight":
        soundPath = "assets/sounds/fight.mp3";
        break;
      case "vsmusic":
        soundPath = "assets/sounds/vsmusic.mp3";
        break;
      case "fightScream":
        soundPath = "assets/sounds/fightScream.mp3";
        break;
      case "scream":
        soundPath = "assets/sounds/scream.mp3";
        break;
      case "hitscream":
        soundPath = "assets/sounds/hitscream.mp3";
        break;
      case "gameover":
        soundPath = "assets/sounds/yousuck.mp3";
        break;
      case "welldone":
        soundPath = "assets/sounds/welldone.mp3";
        break;
      case "finish":
        soundPath = "assets/sounds/finish.mp3";
        break;
      default:
        break;
    }

    if (options.bg) {
      this.bgSound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.bgSound.play();
    } else {
      this.sound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.sound.play();
    }
  }

  stopSound() {
    if (this.sound) {
      this.sound.stop();
    }
  }

  stopBgSound() {
    this.bgSound.stop();
  }

  loadBackgrounds() {
    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/intro.png"].texture
    );
    this.setBGScale(this.backgrounds.intro);
    this.scenes.intro.addChild(this.backgrounds.intro);

    this.backgrounds.battle = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/combat.jpg"].texture
    );
    this.setBGScale(this.backgrounds.battle);
    this.scenes.game.addChild(this.backgrounds.battle);

    this.backgrounds.win = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/win.jpg"].texture
    );
    this.setBGScale(this.backgrounds.win);
    this.scenes.youWin.addChild(this.backgrounds.win);
  }

  // Set intro Container, first scene
  initGame() {
    this.loadBackgrounds();
    // Start SpellCaster directly
    this.battleScene();
    this.setupSpellCaster();
    this.gameLoop();
  }

  gameLoop() {
    this.app.ticker.add(() => {
      if (!this.scenes.game.visible) return;

      // SpellCaster simplified loop: keep stance visible, handle brief hit feedback
      if (this.spellCasterMode) {
        if (!this.characters) return;
        // Keep stance visible unless hit/highhit is playing; also enforce fixed positions
        this.characters.forEach((character) => {
          if (character.onBeforeRender) character.onBeforeRender();
          if (character.actions && character.actions.stance) {
            const anyActive =
              (character.actions.hit && character.actions.hit.visible) ||
              (character.actions.highhit && character.actions.highhit.visible) ||
              (character.actions.raise && character.actions.raise.visible);
            if (!anyActive) {
              character.actions.stance.visible = true;
            }
          }
        });
        // Move any active projectiles
        if (this.projectiles.length) {
          this.projectiles = this.projectiles.filter(p => {
            p.sprite.x += p.vx;
            const target = p.targetIndex !== undefined ? this.characters[p.targetIndex] : null;
            if (!target) return false;
            const hit = cheapColi(p.sprite, target);
            if (hit) {
              p.onHit && p.onHit();
              this.scenes.game.removeChild(p.sprite);
              return false;
            }
            // remove if out of bounds
            if (p.sprite.x < -100 || p.sprite.x > this.app.renderer.width + 100) {
              this.scenes.game.removeChild(p.sprite);
              return false;
            }
            return true;
          });
        }
        return;
      }

      this.characters.forEach((character, index) => {
        character.animations.forEach(animation => {
          if (animation.name !== "hit" && animation.name !== "highhit") {
            animation.visible = false;
          }
        });

        let collision;
        const opponent = index === 0 ? this.characters[1] : this.characters[0];

        if (
          opponent.actions.hit &&
          opponent.actions.hit.visible &&
          opponent.actions.hit.currentFrame + 1 ===
            opponent.actions.hit.totalFrames
        ) {
          opponent.actions.stance.visible = true;
          opponent.actions.hit.visible = false;
        }

        if (
          opponent.actions.highhit &&
          opponent.actions.highhit.visible &&
          opponent.actions.highhit.currentFrame + 1 ===
            opponent.actions.highhit.totalFrames
        ) {
          opponent.actions.stance.visible = true;
          opponent.actions.highhit.visible = false;
        }

        if (
          this.action[index] === "jump" &&
          this.keys.up[index].isDown &&
          this.keys.right[index].isDown
        ) {
          this.action[index] = "jump-right";

          this.characters.forEach(character => {
            if (character.actions.jump) {
              character.actions.jump.gotoAndPlay(0);
              this.playSound("jump");
            }
          });
        }

        if (
          this.action[index] === "jump" &&
          this.keys.up[index].isDown &&
          this.keys.left[index].isDown
        ) {
          this.characters.forEach(character => {
            if (character.actions.jump) {
              this.action[index] = "jump-left";
              character.actions.jump.gotoAndPlay(0);
              this.playSound("jump");
            }
          });
        }

        this.utils.update();

        switch (this.power[index]) {
          case "yelo":
            this.powers[index].yelo.visible = true;

            collision = cheapColi(this.powers[index].yelo, opponent);

            if (collision) {
              if (opponent.actions.highhit) {
                opponent.actions.highhit.gotoAndPlay(0);
                opponent.actions.stance.visible = false;
                opponent.actions.highhit.visible = true;
              }

              this.powers[index].yelo.visible = false;
              this.powers[index].yelo.x = -10000;
              this.power[index] = "";

              this.playSound("punch");
              this.playSound("hit");

              this.utils.shake(this.scenes.game, 0.01, true);

              this.registerHit(index);
            } else {
              // TODO: calc direction based on opponent position
              this.powers[index].yelo.x += this.powers[index].yelo.vx;
            }
            break;
          case "fire":
            this.powers[index].fire.visible = true;

            collision = cheapColi(this.powers[index].fire, opponent);

            if (collision) {
              if (opponent.actions.highhit) {
                opponent.actions.highhit.gotoAndPlay(0);
                opponent.actions.stance.visible = false;
                opponent.actions.highhit.visible = true;
              }

              this.powers[index].fire.visible = false;
              this.powers[index].fire.x = -10000;
              this.power[index] = "";

              this.playSound("punch");
              this.playSound("hit");

              this.utils.shake(this.scenes.game, 0.03, true);

              this.registerHit(index);

              let victim = opponent === 0 ? 0 : 1;
              let winner = opponent === 0 ? 1 : 0;
              if (this.finishHim) {
                this.playSound("scream");
                this.action[victim] = "death";
                setTimeout(() => {
                  this.youWin(winner);
                }, 1000);
              }
            } else {
              // TODO: calc direction based on opponent position
              this.powers[index].fire.x += this.powers[index].fire.vx;
            }
            break;
        }
        switch (this.action[index]) {
          case "ducking":
            if (character.actions.duck) {
              character.actions.duck.visible = true;
            }
            break;
          case "death":
            if (character.actions.death) {
              character.actions.death.visible = true;
              character.actions.stance.visible = false;
              character.actions.highhit.visible = false;
              character.actions.hit.visible = false;

              character.position.y += 3;

              if (character.position.y >= this.groundY + 110) {
                character.position.y = this.groundY + 110;
              }
            }
            break;
          case "walk-right":
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = cheapColi(character, opponent);

              if (!collision || collision === "left") {
                character.position.x += character.vx;
              }

              if (character.position.x >= 900) {
                character.position.x = 900;
              }
            }
            break;
          case "walk-left":
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = cheapColi(character, opponent);

              if (!collision || collision === "right") {
                character.position.x -= character.vx;
              }

              if (character.position.x <= 0) {
                character.position.x = 0;
              }
            }
            break;
          case "kick":
            if (character.actions.kick) {
              character.actions.kick.visible = true;

              if (
                character.actions.kick.currentFrame + 1 ===
                character.actions.kick.totalFrames
              ) {
                this.action[index] = "stance";
                this.blockHit = false;
              }

              const collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.hit.visible = true;
                }

                this.playSound("kick");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 5);

                if (!this.blockHit) {
                  this.registerHit(index);
                  this.blockHit = true;
                }
              }
            }
            break;
          case "punch":
            if (character.actions.punch) {
              character.actions.punch.visible = true;

              if (
                character.actions.punch.currentFrame + 1 ===
                character.actions.punch.totalFrames
              ) {
                this.action[index] = "stance";
                this.blockHit = false;
              }

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.highhit) {
                  opponent.actions.highhit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.highhit.visible = true;
                }

                this.playSound("punch");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 0.01, true);

                if (!this.blockHit) {
                  this.registerHit(index);
                  this.blockHit = true;
                }
              }
            }
            break;
          case "stance":
            if (
              character.actions.stance &&
              (!character.actions.hit ||
                (!character.actions.hit.visible &&
                  !character.actions.highhit.visible))
            ) {
              character.actions.stance.visible = true;
            }
            break;
          case "raise":
            if (character.actions.raise) {
              character.actions.raise.visible = true;

              if (
                character.actions.raise.currentFrame + 1 ===
                character.actions.raise.totalFrames
              ) {
                this.action[index] = "stance";
              }
            }
            break;
          case "airkick-right":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");

                  this.utils.shake(this.scenes.game.children[0], 10);

                  this.registerHit(index);
                }
              }

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action[index] = "walk-right";
                } else {
                  this.action[index] = "stance";
                }
              }
            }
            break;
          case "jump-right":
            if (character.actions.jump) {
              character.actions.jump.visible = true;

              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action[index] = "walk-right";
                } else {
                  this.action[index] = "stance";
                }
              }

              if (character.position.x >= 900) {
                character.position.x = 900;
              }
            }
            break;

          case "airkick-left":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit(index);
                }
              }

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action[index] = "walk-left";
                } else {
                  this.action[index] = "stance";
                }
              }
            }
            break;

          case "jump-left":
            if (character.actions.jump) {
              character.actions.jump.visible = true;
              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action[index] = "walk-left";
                } else {
                  this.action[index] = "stance";
                }
              }

              if (character.position.x <= 0) {
                character.position.x = 0;
              }
            }
            break;

          case "airkick":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit(index);
                }
              }

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;

                this.action[index] = "stance";
              }
            }
            break;

          case "jump":
            if (character.actions.jump) {
              character.actions.staticjump.visible = true;
              character.vy += this.gravity;

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                this.action[index] = "stance";
              }
            }
            break;
        }
      });
    });
  }

  registerHit(index) {
    const side = index === 1 ? "left" : "right";
    // why these numbers? how knows
    const increment = index === 1 ? 23 : 29;

    this.energyBars[side].bars.interior.width =
      this.energyBars[side].bars.interior.width - 20;
    this.energyBars[side].bars.interior.position.x =
      this.energyBars[side].bars.interior.position.x + increment;
    if (this.energyBars[side].bars.interior.width <= 0) {
      this.energyBars[side].bars.interior.width = this.energyBars[
        side
      ].bars.level;
      this.energyBars[side].bars.interior.position.x = 55;
      this.finish(side);
    }
  }

  finish(side) {
    var winner = side === "left" ? 1 : 0;
    this.playSound("finish");
    this.finishHim = true;
    let finishHimText = this.textObj.finishText("FINISH HIM!", "center", 100);
    this.scenes.game.addChild(finishHimText);
    this.characters.forEach((character, index) => {
      if (winner !== index) {
        character.isDeath = true;
        this.action[index] = "stance";
        character.vx = 0;
      }
    });
  }

  introScreen() {
    this.setActiveScene("intro");
    this.playSound("intro");

    let startText = this.textObj.customText(
      "Press Enter to start",
      "center",
      520
    );

    let titleText = this.textObj.finishText("HUGE COMBAT", "center", 240, 140);

    let comands = this.textObj.comandsText(
      "Player 1: A (left), D (right), S (down), W (up)",
      20,
      70
    );

    let comandsHits = this.textObj.comandsText(
      "Hits: F (kick), G (punch), H (power) and j (fatality)",
      20,
      110
    );

    let comands2 = this.textObj.comandsText("Player 2: Arrows", 580, 70);

    let comandsHits2 = this.textObj.comandsText(
      "Hits: P (kick), O (punch), I (power) and U (fatality)",
      580,
      110
    );

    this.scenes.intro.addChild(comands);
    this.scenes.intro.addChild(comandsHits);
    this.scenes.intro.addChild(comands2);
    this.scenes.intro.addChild(comandsHits2);
    this.scenes.intro.addChild(startText);
    this.scenes.intro.addChild(titleText);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.intro.alpha += 0.05;
    };
    animate();
  }

  chooseScreen() {
    this.characters = [];

    this.setActiveScene("select");
    this.stopSound();
    this.playSound("vsmusic", { loop: true });

    let title = this.textObj.customText("SELECT PLAYER 1", "center", 520);
    let counter = 1;
    let counter2 = 0;
    let initialPosition = 70;

    characterData.characters.forEach(data => {
      if (data.active) {
        this.backgrounds["player" + counter] = PIXI.Sprite.from(
          PIXI.loader.resources[data.profile].texture
        );
        this.backgrounds["player" + counter].playerName = data.name;
        counter++;
      }
    });

    for (let bg in this.backgrounds) {
      if (bg.indexOf("player") !== -1) {
        if (counter2 > 0) {
          initialPosition += 180;
        }

        this.backgrounds[bg].position.x = initialPosition;
        this.backgrounds[bg].position.y = 200;
        this.backgrounds[bg].width = 150;
        this.backgrounds[bg].height = 150;
        this.backgrounds[bg].interactive = true;
        this.backgrounds[bg].buttonMode = true;
        this.backgrounds[bg].on("pointerdown", () => {
          if (this.characters.length === 1) {
            this.setupCharacters(this.backgrounds[bg].playerName, true);
            this.setupPowers(true);
            this.setupFatality(true);

            this.battleScene();
          } else {
            this.setupCharacters(this.backgrounds[bg].playerName);
            this.setupPowers();
            this.setupFatality();

            this.scenes.select.removeChild(title);
            title = this.textObj.customText("SELECT PLAYER 2", "center", 520);
            this.scenes.select.addChild(title);
          }
        });

        let playerName = this.textObj.customText(
          this.backgrounds[bg].playerName,
          initialPosition,
          350
        );
        let textPosition = (this.backgrounds[bg].width - playerName.width) / 2;
        playerName.position.x = initialPosition + textPosition;
        this.scenes.select.addChild(this.backgrounds[bg]);
        this.scenes.select.addChild(playerName);
        counter2++;
      }
    }

    this.scenes.select.addChild(title);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.select.alpha += 0.05;
    };
    animate();
  }

  battleScene() {
    this.stopSound();
    this.playSound("vs");

    this.setActiveScene("game");
    this.stopSound();
    this.playSound("fight", { loop: true, bg: true });

    if (!this.spellCasterMode) {
      for (let bar in this.energyBars.left.bars) {
        this.energyBars.left.bars[bar] = new PIXI.Graphics();
        if (bar === "exterior") {
          this.energyBars.left.bars[bar].beginFill(0x910303);
          this.energyBars.left.bars[bar].drawRect(50, 50, 400, 30);
        }
        if (bar === "interior") {
          this.energyBars.left.bars[bar].beginFill(0x0246e7, 0.8);
          this.energyBars.left.bars[bar].drawRect(
            55,
            55,
            this.energyBars.left.level,
            20
          );
        }
        this.energyBars.left.bars[bar].endFill();
        this.scenes.game.addChild(this.energyBars.left.bars[bar]);
      }

      for (let bar in this.energyBars.right.bars) {
        this.energyBars.right.bars[bar] = new PIXI.Graphics();
        if (bar === "exterior") {
          this.energyBars.right.bars[bar].beginFill(0x910303);
          this.energyBars.right.bars[bar].drawRect(550, 50, 400, 30);
        }
        if (bar === "interior") {
          this.energyBars.right.bars[bar].beginFill(0x0246e7);
          this.energyBars.right.bars[bar].drawRect(
            555,
            55,
            this.energyBars.right.level,
            20
          );
        }
        this.scenes.game.addChild(this.energyBars.right.bars[bar]);
      }
    }

    const fightAnim = this.createAnimation("fight", 44);
    fightAnim.loop = false;
    fightAnim.visible = false;
    fightAnim.animationSpeed = 0.42;
    fightAnim.scale.x = 2;
    fightAnim.scale.y = 2;
    fightAnim.x = (1000 - fightAnim.width) / 2 + 16;
    fightAnim.y = (600 - fightAnim.height) / 3;

    setTimeout(() => {
      fightAnim.visible = true;
      fightAnim.play();
      this.playSound("fightScream");
    }, 1000);

    this.scenes.game.addChild(fightAnim);
    if (this.characterNames[0]) this.scenes.game.addChild(this.characterNames[0]);
    if (this.characterNames[1]) this.scenes.game.addChild(this.characterNames[1]);

    if (this.spellCasterMode) {
      const title = this.textObj.finishText("SpellCaster", "center", 8, 52);
      this.scenes.game.addChild(title);
      this.ui.roundText = this.textObj.customText(`Round ${this.spellState.round}`, "center", 90);
      this.scenes.game.addChild(this.ui.roundText);
    }

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.game.alpha += 0.05;
    };
    animate();
  }

  // SpellCaster setup: Scorpion (player) vs Scorpion (CPU), UI, and initial turn
  setupSpellCaster() {
    this.characters = [];
    // Create Scorpion as Player 1 and Scorpion as CPU
    this.setupSpellCharacter("scorpion", false);
    this.setupSpellCharacter("scorpion", true);

    // Build UI
    this.buildSpellUI();

    // Set character name labels for SpellCaster (used in win screen)
    this.characterNames = [];
    this.characterNames[0] = this.textObj.customText("SCORPION", 53, 48);
    this.characterNames[1] = this.textObj.customText("SCORPION", 817, 48);
    this.scenes.game.addChild(this.characterNames[0]);
    this.scenes.game.addChild(this.characterNames[1]);

    // Start first player move
    this.nextPlayerMove();
  }

  setupSpellCharacter(name, opponent) {
    const data = {
      name,
      scale: 1.5,
      animations: (name === 'scorpion')
        ? [
            { name: "stance", frames: 9, animationSpeed: 0.1, loop: true, visible: true },
            { name: "duck", frames: 3, animationSpeed: 0.4 },
            { name: "raise", frames: 3, animationSpeed: 0.4 },
            { name: "hit", frames: 5, animationSpeed: 0.35 },
            { name: "highhit", frames: 5, animationSpeed: 0.35 }
          ]
        : [
            { name: "stance", frames: 9, animationSpeed: 0.1, loop: true, visible: true },
            { name: "hit", frames: 5, animationSpeed: 0.35 },
            { name: "highhit", frames: 5, animationSpeed: 0.35 }
          ]
    };
    const character = new PIXI.Container();
    const animations = [];
    const actions = {};
    character.x = opponent ? 820 : 180;
    character.y = this.groundY;
    character.scale.x = opponent ? -data.scale : data.scale;
    character.scale.y = data.scale;
    // Ensure they face each other properly after creation
    if (!opponent && character.scale.x < 0) character.scale.x = Math.abs(character.scale.x);
    if (opponent && character.scale.x > 0) character.scale.x = -Math.abs(character.scale.x);
    // Final enforce positions/facing each frame start via ticker hook
    character.onBeforeRender = () => {
      character.y = this.groundY;
      if (!opponent) {
        character.x = 180;
        character.scale.x = Math.abs(character.scale.x);
      } else {
        character.x = 820;
        character.scale.x = -Math.abs(character.scale.x);
      }
    };
    data.animations.forEach(animation => {
      const sprite = this.createAnimation(`${data.name}-${animation.name}`, animation.frames);
      sprite.name = animation.name;
      sprite.animationSpeed = animation.animationSpeed;
      sprite.anchor.set(0.5, 0);
      if (animation.loop === true) {
        sprite.play();
      } else {
        sprite.loop = false;
      }
      if (animation.visible === false) {
        sprite.visible = false;
      }
      animations.push(sprite);
      actions[animation.name] = sprite;
    });
    this.groupSprites(character, animations);
    character.actions = actions;
    character.animations = animations;
    character.isDeath = false;
    // Ensure only stance is visible by default to avoid overlapping still frames
    for (let key in character.actions) {
      if (key !== "stance") {
        character.actions[key].visible = false;
      } else {
        character.actions[key].visible = true;
      }
    }
    this.characters.push(character);
    this.scenes.game.addChild(character);
  }

  buildSpellUI() {
    // HP bars
    this.ui.playerHpBar = new PIXI.Graphics();
    this.ui.playerHpBar.beginFill(0x0246e7, 0.9);
    this.ui.playerHpBar.drawRect(55, 55, 385, 20);
    this.ui.playerHpBar.endFill();
    this.scenes.game.addChild(this.ui.playerHpBar);

    this.ui.monsterHpBar = new PIXI.Graphics();
    this.ui.monsterHpBar.beginFill(0x0246e7, 0.9);
    this.ui.monsterHpBar.drawRect(555, 55, 385, 20);
    this.ui.monsterHpBar.endFill();
    this.scenes.game.addChild(this.ui.monsterHpBar);

    // Labels
    const playerLabel = this.textObj.customText("Player", 53, 28);
    const monsterLabel = this.textObj.customText("Monster", 817, 28);
    this.scenes.game.addChild(playerLabel);
    this.scenes.game.addChild(monsterLabel);

    // Word and instructions
    const centerX = this.app.renderer.width / 2;
    this.ui.wordText = this.textObj.finishText("Spell: ", centerX - 180, 420, 48);
    this.ui.instructionText = this.textObj.comandsText(
      "Click Speak and say the word clearly. Player gets 2 moves per turn.",
      centerX - 320,
      468
    );
    this.ui.scoreText = this.textObj.customText("Score: -", centerX - 60, 508);
    this.scenes.game.addChild(this.ui.wordText);
    this.scenes.game.addChild(this.ui.instructionText);
    this.scenes.game.addChild(this.ui.scoreText);

    // Speak button (simple rectangle/button)
    const btn = new PIXI.Graphics();
    btn.beginFill(0x2ecc71);
    btn.drawRoundedRect(0, 0, 180, 48, 8);
    btn.endFill();
    btn.x = this.app.renderer.width / 2 - 90;
    btn.y = 560 - 64;
    btn.interactive = true;
    btn.buttonMode = true;

    const btnLabel = this.textObj.customText("Speak", 0, 0);
    btnLabel.x = btn.x + (180 - btnLabel.width) / 2;
    btnLabel.y = btn.y + (48 - btnLabel.height) / 2 - 4;

    btn.on("pointerdown", () => this.handleSpeak());
    this.scenes.game.addChild(btn);
    this.scenes.game.addChild(btnLabel);
    this.ui.speakButton = btn;
  }

  updateHpBars() {
    // Clear and redraw based on current HP (0-100 -> 0-385 width)
    const widthPlayer = Math.max(0, Math.floor(3.85 * this.spellState.playerHP));
    const widthMonster = Math.max(0, Math.floor(3.85 * this.spellState.monsterHP));

    this.ui.playerHpBar.clear();
    this.ui.playerHpBar.beginFill(0x0246e7, 0.9);
    this.ui.playerHpBar.drawRect(55, 55, widthPlayer, 20);
    this.ui.playerHpBar.endFill();

    this.ui.monsterHpBar.clear();
    this.ui.monsterHpBar.beginFill(0x0246e7, 0.9);
    this.ui.monsterHpBar.drawRect(555, 55, widthMonster, 20);
    this.ui.monsterHpBar.endFill();
  }

  spawnProjectile(fromIndex, toIndex) {
    // Build a simple 1-frame projectile using yelo atlas (build assets)
    const proj = this.createAnimation("yelo-moving", 1);
    proj.visible = true;
    proj.loop = false;
    proj.animationSpeed = 1;
    // Position at caster hand height (approx) on ground line
    const caster = this.characters[fromIndex];
    const target = this.characters[toIndex];
    const startX = caster.x + (fromIndex === 0 ? 50 : -50);
    const startY = this.groundY;
    proj.x = startX;
    proj.y = startY;
    // Move toward target
    const vx = target.x > caster.x ? 12 : -12;
    // Flip if moving left
    proj.scale.x = vx < 0 ? -1 : 1;
    this.scenes.game.addChild(proj);
    this.projectiles.push({ sprite: proj, vx, targetIndex: toIndex, onHit: null });
  }

  nextPlayerMove() {
    if (this.spellState.playerHP <= 0 || this.spellState.monsterHP <= 0) return;
    this.spellState.turn = "player";
    this.spellState.awaitingSpeech = true;
    if (this.spellState.movesRemaining <= 0) {
      // Switch to monster
      this.spellState.movesRemaining = 2;
      this.nextMonsterMove();
      return;
    }
    const word = this.spells.player[Math.floor(Math.random() * this.spells.player.length)];
    this.spellState.currentWord = word;
    this.ui.wordText.text = `Spell: ${word}`;
    // Center align word text after content update
    const cx = this.app.renderer.width / 2;
    this.ui.wordText.x = cx - this.ui.wordText.width / 2;
    this.ui.instructionText.text = `Your turn: Say ${word}. (≥90% you duck/stagger enemy, 70–89% you hit 15 HP, <50% you duck)`;
    this.ui.scoreText.text = "Score: -";
  }

  nextMonsterMove() {
    if (this.spellState.playerHP <= 0 || this.spellState.monsterHP <= 0) return;
    this.spellState.turn = "monster";
    this.spellState.awaitingSpeech = true;
    const word = this.spells.monster[Math.floor(Math.random() * this.spells.monster.length)];
    const counter = "LIGHT"; // simple static counter for demo
    this.spellState.currentWord = counter;
    this.ui.wordText.text = `Counter: ${counter}`;
    // Center align counter text
    const cx2 = this.app.renderer.width / 2;
    this.ui.wordText.x = cx2 - this.ui.wordText.width / 2;
    this.ui.instructionText.text = `Monster casts ${word}! Your turn: Say ${counter}. (≥90% you duck, else you get hit)`;
    this.ui.scoreText.text = "Score: -";
  }

  handleSpeak() {
    if (!this.spellState.awaitingSpeech) return;
    this.captureAudio().then(score => {
      this.onScore(score);
    }).catch(() => {
      // If mic fails, still run through mock API for consistent flow
      this.mockPronunciationApi(null, this.spellState.currentWord, this.spellState.turn)
        .then(({ score }) => this.onScore(score))
        .catch(() => {
          const fallback = Math.floor(50 + Math.random() * 40);
          this.onScore(fallback);
        });
    });
  }

  mockScore(blob) {
    // Wider distribution: weighted random across ranges for variety
    const r = Math.random();
    let score;
    if (r < 0.15) score = 30 + Math.floor(Math.random() * 20); // 30-49
    else if (r < 0.45) score = 50 + Math.floor(Math.random() * 20); // 50-69
    else if (r < 0.8) score = 70 + Math.floor(Math.random() * 15); // 70-84
    else score = 85 + Math.floor(Math.random() * 16); // 85-100
    return score;
  }

  captureAudio() {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        const rec = new MediaRecorder(stream);
        rec.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          // Send through mock API (simulates a backend scorer)
          this.mockPronunciationApi(blob, this.spellState.currentWord, this.spellState.turn)
            .then(({ score }) => resolve(score))
            .catch(() => resolve(this.mockScore(blob)));
        };
        rec.start();
        this.ui.instructionText.text = "Recording... speak now";
        setTimeout(() => rec.stop(), 1200);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Simulated API call to a pronunciation scoring service
  mockPronunciationApi(blob, word, turn) {
    return new Promise((resolve) => {
      // Simulate network latency 300-600ms
      const latency = 300 + Math.floor(Math.random() * 300);
      setTimeout(() => {
        const score = this.mockScore(blob);
        resolve({ score, word, turn });
      }, latency);
    });
  }

  onScore(score) {
    this.spellState.awaitingSpeech = false;
    // Qualitative remark
    const remark = score >= 90 ? "Perfect" : score >= 80 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Okay" : "Poor";
    this.ui.scoreText.text = `Score: ${score}% — ${remark}`;

    if (this.spellState.turn === "player") {
      // Always cast a projectile from player
      this.spawnProjectile(0, 1);
      if (score >= 90) {
        // Good pronunciation: damage
        const dmg = 15;
        this.spellState.monsterHP = Math.max(0, this.spellState.monsterHP - dmg);
        const cpu = this.characters[1];
        if (cpu.actions.hit) {
          cpu.actions.stance.visible = false;
          cpu.actions.hit.gotoAndPlay(0);
          cpu.actions.hit.visible = true;
          setTimeout(() => { cpu.actions.hit.visible = false; cpu.actions.stance.visible = true; }, 900);
        }
        this.ui.instructionText.text = `Great! You dealt ${dmg} to the monster. (Score ${score}%)`;
      } else if (score >= 70) {
        // Medium: smaller damage
        const dmg = 10;
        this.spellState.monsterHP = Math.max(0, this.spellState.monsterHP - dmg);
        const cpu = this.characters[1];
        if (cpu.actions.hit) {
          cpu.actions.stance.visible = false;
          cpu.actions.hit.gotoAndPlay(0);
          cpu.actions.hit.visible = true;
          setTimeout(() => { cpu.actions.hit.visible = false; cpu.actions.stance.visible = true; }, 900);
        }
        this.ui.instructionText.text = `Nice! You dealt ${dmg}. (Score ${score}%)`;
      } else {
        // Low: enemy ducks using scorpion-raise (duck) if available
        const cpu = this.characters[1];
        if (cpu.actions.raise) {
          cpu.actions.stance.visible = false;
          cpu.actions.raise.gotoAndPlay(0);
          cpu.actions.raise.visible = true;
          setTimeout(() => { cpu.actions.raise.visible = false; cpu.actions.stance.visible = true; }, 900);
        } else if (cpu.actions.highhit) {
          cpu.actions.stance.visible = false;
          cpu.actions.highhit.gotoAndPlay(0);
          cpu.actions.highhit.visible = true;
          setTimeout(() => { cpu.actions.highhit.visible = false; cpu.actions.stance.visible = true; }, 900);
        }
        this.ui.instructionText.text = `Too low. Monster ducked your spell. (Score ${score}%)`;
      }

      this.updateHpBars();
      if (this.checkWinLose()) return;
      if (this.ui.roundText) {
        this.ui.roundText.text = `Round ${this.spellState.round}`;
      }
      this.spellState.movesRemaining -= 1;
      if (this.spellState.movesRemaining > 0) {
        setTimeout(() => this.nextPlayerMove(), 900);
      } else {
        this.spellState.movesRemaining = 2;
        setTimeout(() => this.nextMonsterMove(), 1100);
      }
    } else {
      // Monster turn: player must duck if score >= 90, else take damage
      // Always cast a projectile from CPU
      this.spawnProjectile(1, 0);
      if (score >= 90) {
        // Player ducks using scorpion-raise if available
        const p1 = this.characters[0];
        if (p1.actions.raise) {
          p1.actions.stance.visible = false;
          p1.actions.raise.gotoAndPlay(0);
          p1.actions.raise.visible = true;
          setTimeout(() => { p1.actions.raise.visible = false; p1.actions.stance.visible = true; }, 900);
        } else if (p1.actions.highhit) {
          p1.actions.stance.visible = false;
          p1.actions.highhit.gotoAndPlay(0);
          p1.actions.highhit.visible = true;
          setTimeout(() => { p1.actions.highhit.visible = false; p1.actions.stance.visible = true; }, 900);
        }
        this.ui.instructionText.text = `Great! You ducked the monster spell. (Score ${score}%)`;
      } else {
        const dmg = 12;
        this.spellState.playerHP = Math.max(0, this.spellState.playerHP - dmg);
        const p1 = this.characters[0];
        if (p1.actions.hit) {
          p1.actions.stance.visible = false;
          p1.actions.hit.gotoAndPlay(0);
          p1.actions.hit.visible = true;
          setTimeout(() => { p1.actions.hit.visible = false; p1.actions.stance.visible = true; }, 900);
        }
        this.ui.instructionText.text = `Ouch! You got hit and lost ${dmg} HP. (Score ${score}%)`;
      }

      this.updateHpBars();
      if (this.checkWinLose()) return;
      if (this.ui.roundText) {
        this.ui.roundText.text = `Round ${this.spellState.round}`;
      }
      // Next round back to player
      this.spellState.round += 1;
      setTimeout(() => this.nextPlayerMove(), 1100);
    }
  }

  checkWinLose() {
    if (this.spellState.monsterHP <= 0) {
      this.youWin(0);
      return true;
    }
    if (this.spellState.playerHP <= 0) {
      this.gameOver();
      return true;
    }
    return false;
  }

  youWin(winner) {
    this.setActiveScene("youWin");
    const winnerName = this.characterNames && this.characterNames[winner] && this.characterNames[winner]._text
      ? this.characterNames[winner]._text
      : (winner === 0 ? "Player" : "CPU");
    let title = this.textObj.customText(
      winnerName + " Wins!",
      "center",
      50
    );
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      480
    );

    this.scenes.youWin.addChild(title);
    this.scenes.youWin.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.youWin.alpha += 0.05;
    };
    animate();

    this.stopBgSound();
    this.playSound("welldone");
  }

  gameOver() {
    this.setActiveScene("gameOver");
    this.stopSound();
    let title = this.textObj.customText("GAME OVER", "center", 200);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      250
    );

    this.scenes.gameOver.addChild(title);
    this.scenes.gameOver.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.gameOver.alpha += 0.05;
    };
    animate();
  }

  groupSprites(container, options) {
    for (let i = 0; i < options.length; i++) {
      container.addChild(options[i]);
    }
  }

  setBGScale(sprite) {
    const winAspectRatio = 1000 / 600;
    const bgAspectRatio = sprite.texture.width / sprite.texture.height;
    let ratio;

    if (winAspectRatio > bgAspectRatio) {
      ratio = 1000 / sprite.texture.width;
    } else {
      ratio = 600 / sprite.texture.height;
    }

    sprite.scale.x = ratio;
    sprite.scale.y = ratio;

    sprite.x = (1000 - sprite.width) / 2;
    sprite.y = (600 - sprite.height) / 2;
  }

  attachEvents() {
    window.addEventListener("keydown", e => {
      if (this.scenes.intro.visible) {
        if (e.key === "Enter") {
          this.chooseScreen();
        }
      }

      if (this.scenes.gameOver.visible) {
        if (e.key === "Enter") {
          this.introScreen();
        }
      }

      if (this.scenes.youWin.visible) {
        if (e.key === "Enter") {
          window.location.reload(false);
        }
      }
    });
  }

  createAnimation(id, numberFrames, reverse = false) {
    let frames = [];

    if (!reverse) {
      for (let i = 1; i <= numberFrames; i++) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    } else {
      for (let i = numberFrames; i > 0; i--) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    }

    const anim = new PIXI.extras.AnimatedSprite(frames);

    return anim;
  }

  setupKeys(character, opponent) {
    this.keys.left = this.keys.left || [];
    this.keys.up = this.keys.up || [];
    this.keys.right = this.keys.right || [];
    this.keys.down = this.keys.down || [];
    this.keys.kick = this.keys.kick || [];
    this.keys.punch = this.keys.punch || [];
    this.keys.pawa = this.keys.pawa || [];
    this.keys.fatal = this.keys.fatal || [];

    let player = opponent ? 1 : 0;

    if (opponent) {
      this.keys.left[player] = Keyboard(37); // left
      this.keys.up[player] = Keyboard(38); // up
      this.keys.right[player] = Keyboard(39); // right
      this.keys.down[player] = Keyboard(40); // down
      this.keys.kick[player] = Keyboard(80); // p
      this.keys.punch[player] = Keyboard(79); // o
      this.keys.pawa[player] = Keyboard(73); // i
      this.keys.fatal[player] = Keyboard(85); // u
    } else {
      this.keys.left[player] = Keyboard(65); // a
      this.keys.up[player] = Keyboard(87); // w
      this.keys.right[player] = Keyboard(68); // d
      this.keys.down[player] = Keyboard(83); // s
      this.keys.kick[player] = Keyboard(70); // f
      this.keys.punch[player] = Keyboard(71); // g
      this.keys.pawa[player] = Keyboard(72); // h
      this.keys.fatal[player] = Keyboard(74); // j
    }

    this.keys.left[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "walk-left";
            character.vx = 3;
            this.checkSide();
          }
        }
      }
    };

    this.keys.left[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "stance";
            character.vx = 0;
          }
        }
      }
    };

    this.keys.right[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "walk-right";
            character.vx = 3;
            this.checkSide();
          }
        }
      }
    };

    this.keys.right[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "stance";
            character.vx = 0;
          }
        }
      }
    };

    this.keys.down[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.duck) {
          if (character.y === this.groundY) {
            this.action[player] = "ducking";
            character.actions.duck.gotoAndPlay(0);
          }
        }
      }
    };

    this.keys.down[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.raise) {
          if (character.y === this.groundY) {
            this.action[player] = "raise";
            character.actions.raise.gotoAndPlay(0);
          }
        }
      }
    };

    this.keys.pawa[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.y === this.groundY) {
          if (character.actions.punch) {
            this.action[player] = "punch";
            this.power[player] = "yelo";
            this.powers[player].yelo.gotoAndPlay(0);
            this.powers[player].yelo.visible = true;
            this.powers[player].yelo.y = this.groundY;
            this.powers[player].yelo.x = character.position.x;

            character.actions.punch.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.fatal[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.punch) {
          this.action[player] = "punch";
          this.power[player] = "fire";
          this.powers[player].fire.gotoAndPlay(7);
          this.powers[player].fire.visible = true;
          this.powers[player].fire.y = this.groundY;
          this.powers[player].fire.x = character.position.x;

          character.actions.punch.gotoAndPlay(0);

          if (this.scenes.game.visible) {
            this.playSound("nopunch");
            this.playSound("hitscream");
          }
        }
      }
    };

    this.keys.kick[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.kick) {
          if (character.y === this.groundY) {
            this.action[player] = "kick";
            character.actions.kick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          } else {
            if (!character.actions.airkick) {
              return;
            }

            if (this.action[player] === "jump-right") {
              this.action[player] = "airkick-right";
            } else if (this.action[player] === "jump-left") {
              this.action[player] = "airkick-left";
            } else if (this.action[player] === "jump") {
              this.action[player] = "airkick";
            }

            character.actions.airkick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.punch[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.punch) {
          if (character.y === this.groundY) {
            this.action[player] = "punch";
            character.actions.punch.gotoAndPlay(0);
            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.up[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.jump) {
          if (character.y === this.groundY) {
            this.action[player] = "jump";
            character.vy = -24;
            this.playSound("jump");
          }
        }
      }
    };
  }

  checkSide() {
    if (!this.switchRight) {
      if (this.characters[1].x < this.characters[0].x) {
        this.characters[1].width = this.characters[1].width * -1;
        this.characters[0].width = this.characters[0].width * -1;
        this.switchRight = true;
        this.switchLeft = false;
      }
    }

    if (!this.switchLeft) {
      if (this.characters[1].x > this.characters[0].x) {
        this.characters[1].width = this.characters[1].width * -1;
        this.characters[0].width = this.characters[0].width * -1;
        this.switchLeft = true;
        this.switchRight = false;
      }
    }
  }

  setupPowers(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player] = {};

    this.powers[player].yelo = this.createAnimation("yelo-moving", 1);
    this.powers[player].yelo.visible = false;
    this.powers[player].yelo.x = 0;
    this.powers[player].yelo.vx = 15;
    if (player === 1) {
      this.powers[player].yelo.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].yelo);
  }

  setupFatality(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player].fire = this.createAnimation("fire0", 7);
    this.powers[player].fire.loop = true;
    this.powers[player].fire.animationSpeed = 0.25;
    this.powers[player].fire.visible = false;
    this.powers[player].fire.x = 0;
    this.powers[player].fire.vx = 15;
    if (player === 1) {
      this.powers[player].fire.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].fire);
  }

  setupCharacters(selectedPlayer, opponent) {
    const player = opponent ? 1 : 0;

    characterData.characters.forEach(data => {
      if (data.name === selectedPlayer) {
        if (data.active) {
          const character = new PIXI.Container();
          const animations = [];
          const actions = {};

          character.x = opponent ? 770 : 180;
          character.y = this.groundY;
          character.scale.x = opponent ? -data.scale : data.scale;
          character.scale.y = data.scale;

          data.animations.forEach(animation => {
            const sprite = this.createAnimation(
              `${data.name}-${animation.name}`,
              animation.frames
            );
            sprite.name = animation.name;
            sprite.animationSpeed = animation.animationSpeed;
            sprite.anchor.set(0.5, 0);

            if (animation.loop === true) {
              sprite.play();
            } else {
              sprite.loop = false;
            }

            if (animation.loop === "one") {
              sprite.play(1);
            }

            if (!animation.visible) {
              sprite.visible = false;
            }

            animations.push(sprite);
            actions[animation.name] = sprite;
          });

          this.groupSprites(character, animations);

          character.actions = actions;
          character.animations = animations;
          character.opponent = data.opponent;
          character.active = data.active;
          character.isDeath = false;

          this.characters.push(character);

          if (this.characters.length === 1) {
            this.characterNames[0] = this.textObj.customText(
              selectedPlayer,
              53,
              48
            );
          } else {
            this.characterNames[1] = this.textObj.customText(
              selectedPlayer,
              817,
              48
            );
          }

          this.setupKeys(character, opponent);
        }
      }
    });

    this.characters.forEach(character => {
      if (character.active) {
        this.scenes.game.addChild(character);
      }
    });

    this.action[player] = "stance";
  }
}

export default Game;

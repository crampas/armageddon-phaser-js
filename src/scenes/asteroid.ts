import Container = Phaser.GameObjects.Container;
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.GameObjects.Sprite;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import WebAudioSound = Phaser.Sound.WebAudioSound;
import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";


export class Asteroid {
    private sprite: Container;
    private exploded: boolean = false;
    private engineSound: WebAudioSound;


    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController,
                       public source: Vector2, public target: Vector2) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const direction = new Phaser.Math.Vector2(dx / 10, dy / 10);
        const speed = direction.length();

        const c1 = this.scene.add.container(source.x, 0);
        const ball = this.scene.add.sprite(0, 0, "ball");
        c1.add(ball);
        const wisp = this.scene.add.particles(0, 0, 'flares',
            {
                frame: 'white',
                color: [ 0xffffff, 0xff8000, 0x000000 ],
                colorEase: 'quart.out',
                lifespan: 5000,
                angle: { min: -2, max: 2 },
                scale: { start: 0.1, end: 1, ease: 'sine.in' },
                speed: { min: speed, max: speed },
                advance: 0, // 2000
                blendMode: 'ADD',
                accelerationX: 0,
                accelerationY: 0
            });

        c1.add(wisp);
        c1.setRotation((new Phaser.Math.Vector2(-dx, -dy).angle()));

        const missileGroup = this.scene.physics.add.group(c1);
        missileGroup.setVelocity(direction.x, direction.y);
        this.sprite = c1;

        this.engineSound = this.scene.sound.add('engine-2') as Phaser.Sound.WebAudioSound;

        this.engineSound.play();
    }

    public update(): void {
        const location = new Vector2(this.sprite.x, this.sprite.y);

        if (this.sprite && !this.exploded) {
            let isHit = false;
            if (this.explosionController.isHit(location)) {
                isHit = true;
                this.scoreController.notifyAsteriodDestroy();
            }

            if (isHit || this.sprite.y >= this.scene.game.canvas.height - 100) {
                const k = this.sprite.getAt(0) as Sprite;
                k.setVisible(false);

                const p = this.sprite.getAt(1) as ParticleEmitter;
                p.stop(false);

                this.engineSound.stop();

                if (isHit) {
                    this.explosionController.explode(new Vector2(this.sprite.x, this.sprite.y), 1, 0.98, 0xffa080, 0);
                } else {
                    this.scoreController.notifyAsteriodExploded();
                    this.explosionController.explode(new Vector2(this.sprite.x, this.sprite.y), 10, 0.99, 0xff8000, 0.1);
                }
                this.exploded = true;
            }
        }
    }
}

export class AsteroidController {
    private asteriods: Asteroid[] = [];

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController) {
    }

    preload() {
        this.scene.load.spritesheet('ball', 'https://labs.phaser.io/assets/sprites/balls.png', { frameWidth: 17, frameHeight: 17 });
        this.scene.load.atlas('flares', 'https://labs.phaser.io/assets/particles/flares.png', 'https://labs.phaser.io/assets/particles/flares.json');

        this.scene.load.audio('engine-1', 'assets/audio/enginehum.ogg');
        this.scene.load.audio('engine-2', 'assets/audio/enginehum3.ogg');
    }

    public create(): void {
    }

    public update(): void {
        this.asteriods.forEach(item => item.update());
    }

    public createAsteriod(source: Vector2, target: Vector2) {
        this.asteriods.push(new Asteroid(this.scene, this.explosionController, this.scoreController, source, target));
    }
}
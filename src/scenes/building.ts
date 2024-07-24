import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";
import {Asteroid} from "./asteroid";
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.GameObjects.Sprite;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;


export class Building {
    private sprite: Sprite;
    private damaged: boolean = false;
    private plume: ParticleEmitter;
    private destroyTime: number;

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController,
                       public position: Vector2) {
        const frames = ["building-1", "building-2", "building-3", "building-4"];
        const index = Phaser.Math.Between(0, 3);
        this.sprite = this.scene.add.sprite(position.x, position.y, "atlas-1", frames[index % frames.length]);

        const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0x110000 }});
        const rect = new Phaser.Geom.Rectangle(position.x, position.y - this.sprite.height, this.sprite.width, this.sprite.height);
        graphics.lineStyle(1, 0x777711);
        graphics.strokeRectShape(rect);

        this.scoreController.addBuilding();
    }

    public update(time: number, delta: number): void {
        const location = new Vector2(this.sprite.x, this.sprite.y);
        if (this.explosionController.isHit(new Vector2(this.sprite.x, this.sprite.y - this.sprite.height))
            || this.explosionController.isHit(new Vector2(this.sprite.x + this.sprite.width, this.sprite.y - this.sprite.height))
        ) {
            this.damaged = true;
        }

        // this.sprite.visible = !this.damaged;
        if (this.damaged) {
            if (time - this.destroyTime > 1000) {
                this.plume.stop();
            }
            this.smoke(time);
            this.sprite.scaleY *= 0.99;
        }
    }

    smoke(time: number) {



        if (this.plume) {
            return;
        }
        this.destroyTime = time;
        this.scoreController.notifyBuildingDestroy();

        this.plume = this.scene.add.particles(this.position.x + 0.5 * this.sprite.width, this.position.y, 'flares',
            {
                frame: 'white',
                color: [ 0xaaaa00, 0xaa0000, 0x880000, 0x222222 ],
                colorEase: 'quart.out',
                lifespan: 2000,
                angle: { min: -100, max: -80 },
                scale: { start: 0.8, end: 1.2, ease: 'sine.in' },
                speed: { min: 10, max: 200 },
                advance: 0, // 2000
                blendMode: 'ADD',
                accelerationX: 0,
                accelerationY: 0
            });

    }
}


export class BuildingController {
    private buildings: Building[] = [];

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController) {
    }

    preload() {
        this.scene.load.atlas('atlas-1', 'assets/Day.png', 'assets/Day.json');
        this.scene.load.atlas('fan', 'assets/fan.png', 'assets/fan-frames.json');

        this.scene.load.animation('fan-anim', 'assets/fan-anim.json');
    }

    public create(): void {
    }

    public update(time: number, delta: number): void {
        this.buildings.forEach(item => item.update(time, delta));
    }

    public createBuilding(position: Vector2) {
        this.buildings.push(new Building(this.scene, this.explosionController, this.scoreController, position));
    }
}

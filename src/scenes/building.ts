import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";
import {Asteroid} from "./asteroid";
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.GameObjects.Sprite;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {Once} from "../utils/once";
import Rectangle = Phaser.Geom.Rectangle;


export class Building {
    private sprite: Sprite;
    private damaged: boolean = false;
    private plume: ParticleEmitter;
    private destroyTime: number = 0;
    private burning = false;
    private toDestroy = new Once();

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController,
                       public position: Vector2) {
        const frames = ["building-1", "building-2", "building-3", "building-4"];
        const index = Phaser.Math.Between(0, 3);
        this.sprite = this.scene.add.sprite(position.x, position.y, "atlas-1", frames[index % frames.length]);
        // this.sprite.scaleY *= Phaser.Math.FloatBetween(0.9, 2.5);

        this.plume = this.scene.add.particles(this.position.x + 0.5 * this.sprite.width, this.position.y, 'flares',
            {
                emitting: false,
                frame: 'white',
                color: [ 0x000000, 0x444444 ],
                colorEase: 'quart.out',
                lifespan: 2000,
                frequency: 30,
                angle: { min: -100, max: -80 },
                scale: { start: 0.8, end: 1.2, ease: 'sine.in' },
                speed: { min: 10, max: 200 },
                advance: 0, // 2000
                blendMode: 'NORMAL',
                accelerationX: 0,
                accelerationY: 0
            });





        const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0x110000 }});
        const rect = new Phaser.Geom.Rectangle(position.x, position.y - this.sprite.height, this.sprite.width, this.sprite.height);
        graphics.lineStyle(1, 0x777711);
//        graphics.strokeRectShape(rect);

        this.scoreController.addBuilding();
    }

    private onDestroy(time: number) {
        this.scoreController.notifyBuildingDestroy();
        this.damaged = true;
        if (this.destroyTime == 0) {
            this.destroyTime = time;

            const chain = this.scene.tweens.chain({
                targets: this.sprite,
                tweens: [
                    {
                        angle: '+=70',
                        duration: 5000,
                        repeat: 0,
                        scale: { value: 0.0, duration: 5000 },
                    }
                ]
            });

        }
    }


    public update(time: number, delta: number): void {
        const location = new Vector2(this.sprite.x, this.sprite.y);
        this.toDestroy.check(
            time,
            () => this.explosionController.hitRect(new Rectangle(this.sprite.x, this.sprite.y - this.sprite.height, this.sprite.width, this.sprite.height)),
            () => this.onDestroy(time)
        );

        this.toDestroy.after(time, 500, () => {
            this.burning = true;
            this.plume.start(50, 0);
        })


        // this.sprite.visible = !this.damaged;
        if (this.toDestroy.isDone()) {
            if ((time - this.destroyTime) > 500 && !this.burning) {
                // this.plume.active = true;
                // this.plume.emitting = true;
                this.burning = true;
                this.plume.start(50, 0);
            }
            if (time - this.destroyTime > 5000 && this.burning) {
                this.plume.frequency += 100;
            }
            this.smoke(time);


            // this.sprite.scaleY *= 0.99;
        }
    }

    smoke(time: number) {
        if (this.plume) {
            return;
        }
        // this.destroyTime = time;
        this.scoreController.notifyBuildingDestroy();


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

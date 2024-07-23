import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";
import {Asteroid} from "./asteroid";
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.GameObjects.Sprite;


export class Building {
    private sprite: Sprite;
    private damaged: boolean = false;

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController,
                       public position: Vector2) {
        const frames = ["building-1", "building-2", "building-3", "building-4"];
        const index = 0;
        this.sprite = this.scene.add.sprite(position.x, position.y, "atlas-1", frames[index % frames.length]);

        const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff0000 }});
        const rect = new Phaser.Geom.Rectangle(position.x, position.y - this.sprite.height, this.sprite.width, this.sprite.height);
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRectShape(rect);
    }

    public update(): void {
        const location = new Vector2(this.sprite.x, this.sprite.y);
        if (this.explosionController.isHit(new Vector2(this.sprite.x, this.sprite.y - this.sprite.height))
            || this.explosionController.isHit(new Vector2(this.sprite.x + this.sprite.width, this.sprite.y - this.sprite.height))
        ) {
            this.damaged = true;
        }

        this.sprite.visible = !this.damaged;
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

    public update(): void {
        this.buildings.forEach(item => item.update());
    }

    public createBuilding(position: Vector2) {
        this.buildings.push(new Building(this.scene, this.explosionController, this.scoreController, position));
    }
}

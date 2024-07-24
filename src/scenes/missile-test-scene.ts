import Text = Phaser.GameObjects.Text;
import Vector2 = Phaser.Math.Vector2;
import {MissileController} from "./missile";
import {AsteroidController} from "./asteroid";
import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";
import {BuildingController} from "./building";


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: true,
    key: 'MissileTestScene',
};

export class MissileTestScene extends Phaser.Scene {
    private explosionController: ExplosionController;
    private missileController: MissileController;
    private asteriodController: AsteroidController;
    private buildingController: BuildingController;
    private scoreController: ScoreController = new ScoreController();
    private text: Text;

    constructor () {
        super(sceneConfig);
        this.explosionController = new ExplosionController(this);
        this.missileController = new MissileController(this, this.explosionController);
        this.asteriodController = new AsteroidController(this, this.explosionController, this.scoreController);
        this.buildingController = new BuildingController(this, this.explosionController, this.scoreController);
    }

    preload () {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
        // this.load.atlas('building-map', 'assets/flares.png', 'assets/flares.json');
        this.load.spritesheet('sheet-1', 'https://labs.phaser.io/assets/sprites/balls.png', { frameWidth: 17, frameHeight: 17 });
        this.load.atlas('atlas-1', 'assets/Day.png', 'assets/Day.json');
        this.load.atlas('fan', 'assets/fan.png', 'assets/fan-frames.json');

        this.load.animation('fan-anim', 'assets/fan-anim.json');


        this.missileController.preload();
        this.asteriodController.preload();
        this.explosionController.preload();
    }


    public create() {
        const background = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg')
        background.scaleX = this.game.canvas.width / background.width;
        background.scaleY = this.game.canvas.height / background.height;

        const frames = ["building-1", "building-2", "building-3", "building-4"];
        // const frames = ["fan-1", "fan-2", "fan-3", "fan-4", "fan-5", "fan-6", "fan-7", "fan-8"];

        for (let index = 1; index < this.game.canvas.width / 120 - 1; index++) {
//            const s1 = this.add.sprite(index * 120, this.game.canvas.height, "atlas-1", frames[index % frames.length]);
//            const fan = this.add.sprite(index * 120 + 90, this.game.canvas.height - 60, "fan").play("fan-screw")
            // this.add.sprite(index * 120 + 60, this.game.canvas.height - 30, "fan", frames[index % frames.length]);
            this.buildingController.createBuilding(new Vector2(index * 120 + 10, this.game.canvas.height - 120));
            this.buildingController.createBuilding(new Vector2(index * 120 + 30, this.game.canvas.height - 90));
            this.buildingController.createBuilding(new Vector2(index * 120 + 60, this.game.canvas.height - 60));
            this.buildingController.createBuilding(new Vector2(index * 120, this.game.canvas.height - 30));
        }

        this.text = this.add.text(10, 10, 'Wheel: Hue\nA + D: Radius\nW + S: Attenuation\nClick to set Light').setDepth(1);

        let light = this.add.pointlight(400, 300, 0xa0a0a0, 15, 1);

        this.input.on('pointerdown', pointer => {
            this.launchMissile(pointer.x, pointer.y);
        })

        this.input.on('pointermove', pointer => {
            light.x = pointer.x;
            light.y = pointer.y;
        });


        this.input.keyboard.on('keydown-D', () => {
            // this.explosionIntensity = Math.min(this.explosionIntensity + 1, 100);
        });

        this.missileController.create();
        this.asteriodController.create();
    }

    public update(time: number, delta: number) {
        this.text.text = this.scoreController.toString();

        this.explosionController.update();
        this.missileController.update();
        this.asteriodController.update();
        this.buildingController.update(time, delta);

        if (Math.random() < 0.001) {
            this.dropAsteroid();
        }
    }

    private launchMissile(x: number, y: number) {
        this.scoreController.notifyMissileLaunched();
        this.missileController.createMissile(new Vector2(this.game.canvas.width / 2.0, this.game.canvas.height - 20), new Vector2(x, y));
    }

    private dropAsteroid() {
        this.scoreController.notifyAsteriodDropped();
        const sourceX = Phaser.Math.Between(- 0.1 * this.game.canvas.width, 1.1 * this.game.canvas.width);
        const targetX = Phaser.Math.Between(0.1 * this.game.canvas.width, 0.9 * this.game.canvas.width);
        this.asteriodController.createAsteriod(new Vector2(sourceX, 0), new Vector2(targetX, this.game.canvas.height - 20));
    }
}

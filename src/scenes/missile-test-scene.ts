import Text = Phaser.GameObjects.Text;
import Vector2 = Phaser.Math.Vector2;
import {MissileController} from "./missile";
import {AsteroidController} from "./asteroid";
import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: true,
    key: 'MissileTestScene',
};

export class MissileTestScene extends Phaser.Scene {
    private explosionController: ExplosionController;
    private missileController: MissileController;
    private asteriodController: AsteroidController;
    private scoreController: ScoreController = new ScoreController();
    private text: Text;

    constructor () {
        super(sceneConfig);
        this.explosionController = new ExplosionController(this);
        this.missileController = new MissileController(this, this.explosionController);
        this.asteriodController = new AsteroidController(this, this.explosionController, this.scoreController);
    }

    preload () {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
        this.missileController.preload();
        this.asteriodController.preload();
        this.explosionController.preload();
    }


    public create() {
        const background = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg')
        background.scaleX = this.game.canvas.width / background.width;
        background.scaleY = this.game.canvas.height / background.height;

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

    public update() {
        this.text.text = this.scoreController.toString();

        this.explosionController.update();
        this.missileController.update();
        this.asteriodController.update();

        if (Math.random() < 0.003) {
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

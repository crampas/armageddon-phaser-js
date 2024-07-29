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

export class MissileScene extends Phaser.Scene {
    private explosionController: ExplosionController;
    private missileController: MissileController;
    private asteriodController: AsteroidController;
    private buildingController: BuildingController;
    private scoreController: ScoreController = new ScoreController();
    private text: Text;
    private isPaused: boolean = false;
    private gameOver: Phaser.GameObjects.Text;
    private nextAsteroidTime = 0;
    private lastAsteriod: boolean = false;

    constructor () {
        super(sceneConfig);
        this.explosionController = new ExplosionController(this);
        this.missileController = new MissileController(this, this.explosionController, this.scoreController);
        this.asteriodController = new AsteroidController(this, this.explosionController, this.scoreController, 20);
        this.buildingController = new BuildingController(this, this.explosionController, this.scoreController);
    }

    preload () {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');

        this.buildingController.preload();
        this.missileController.preload();
        this.asteriodController.preload();
        this.explosionController.preload();
    }


    public create() {
        const background = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg')
        background.scaleX = this.game.canvas.width / background.width;
        background.scaleY = this.game.canvas.height / background.height;

        this.input.setDefaultCursor('url(assets/pointer.png) 32 16, crosshair');

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
        this.gameOver = this.add.text(0, 100, 'Game Over', {fontSize: 120}).setDepth(1);
        this.gameOver.x = 0.5 * (this.game.canvas.width - this.gameOver.width);
        this.gameOver.y = 0.3 * (this.game.canvas.height - this.gameOver.height);
        this.gameOver.visible = false;

        this.missileController.create();
        this.asteriodController.create();

        this.input.on('pointerdown', pointer => {
            this.launchMissile(pointer.x, pointer.y);
        })
    }


    public update(time: number, delta: number) {
        this.text.text = this.scoreController.toString();

        this.explosionController.update();
        this.missileController.update(time);
        this.asteriodController.update();
        this.buildingController.update(time, delta);

        if (!this.nextAsteroidTime) {
            this.nextAsteroidTime = time + Phaser.Math.Between(1000, 2000);
        }
        if (!this.lastAsteriod && time > this.nextAsteroidTime) {
            this.nextAsteroidTime = time + Phaser.Math.Between(1000, 10000);
            this.dropAsteroid();
        }

        if (this.scoreController.isGameOver()) {
            this.onGameOver();
        }

        if (this.lastAsteriod && this.asteriodController.countActive() && this.scoreController.getBuildingsLeft() > 0) {
            this.onGameWin();
        }
    }

    private onGameOver() {
        this.isPaused = true;
        this.gameOver.visible = true;
    }

    private onGameWin() {
        this.isPaused = true;

        const gameWin = this.add.text(0, 100, `Score ${this.scoreController.getScore()}`, {
            fontSize: 0.1 * this.game.canvas.width
        }).setDepth(1);
        gameWin.x = 0.5 * (this.game.canvas.width - gameWin.width);
        gameWin.y = 0.3 * (this.game.canvas.height - gameWin.height);
    }

    private launchMissile(x: number, y: number) {
        if (this.isPaused) {
            return;
        }
        const centerX = this.game.canvas.width / 2.0;
        const missile = this.missileController.createMissile(
            new Vector2(x < centerX ? 0 : this.game.canvas.width, this.game.canvas.height - 20),
            new Vector2(x, y));
        if (missile) {
            this.input.setDefaultCursor('url(assets/pointer-loading.png) 32 16, crosshair');
            missile.onExplode(() => this.input.setDefaultCursor('url(assets/pointer.png) 32 16, crosshair'))
        }
    }

    private dropAsteroid() {
        this.scoreController.notifyAsteriodDropped();
        const sourceX = Phaser.Math.Between(- 0.1 * this.game.canvas.width, 1.1 * this.game.canvas.width);
        const targetX = Phaser.Math.Between(0.1 * this.game.canvas.width, 0.9 * this.game.canvas.width);
        const dropped = this.asteriodController.createAsteriod(new Vector2(sourceX, 0), new Vector2(targetX, this.game.canvas.height - 20));
        this.lastAsteriod = !dropped;
    }

}

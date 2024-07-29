import Vector2 = Phaser.Math.Vector2;
import {ExplosionController} from "./explosion";
import {ScoreController} from "./score";


export class Missile  {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private exploded = false;
    private explodeCallback: () => void;
    private velocity: Vector2;

    constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public source: Vector2, public target: Vector2) {
        this.sprite = this.scene.physics.add.sprite(source.x, source.y, 'missile-1');
        const direction = new Vector2(target).subtract(source);
        this.velocity = direction.normalize().scale(300);
        this.sprite.setRotation(direction.angle() + Math.PI / 2.0);
        this.sprite.setVelocityX(this.velocity.x);
        this.sprite.setVelocityY(this.velocity.y);
    }

    public update(time: number): void {
        if (!this.exploded) {
            this.velocity = this.velocity.scale(1.005);
            this.sprite.setVelocityX(this.velocity.x);
            this.sprite.setVelocityY(this.velocity.y);

            const location = new Vector2(this.sprite.x, this.sprite.y);
            if (location.distance(this.target) < 10.0) {
                this.sprite.destroy(true);
                this.sprite = null;
                this.explosionController.explode(location, 1, 0.99, 0xa0a0ff, 0);
                this.exploded = true;
                if (this.explodeCallback) {
                    this.explodeCallback();
                }
            }
        }
    }

    public isActive(): boolean {
        return this.sprite != null;
    }

    public onExplode(callback: () => void) {
        this.explodeCallback = callback;
    }
}

export class MissileController {
    private missiles: Missile[] = [];

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public scoreController: ScoreController) {
    }

    preload() {
        this.scene.load.image('missile-1', 'assets/storm_shadow.png');
    }

    public create(): void {
    }

    public update(time: number): void {
        this.missiles.forEach(missile => missile.update(time));
        this.missiles = this.missiles.reduce<Missile[]>((active, explosion) => {
            if (explosion.isActive()) {
                return [...active, explosion];
            }
            return active;
        }, []);
    }

    public createMissile(source: Vector2, target: Vector2) {
        if (this.missiles.length < 1) {
            this.scoreController.notifyMissileLaunched();
            const missile = new Missile(this.scene, this.explosionController, source, target);
            this.missiles.push(missile);
            return missile;
        }
        return null;
    }
}

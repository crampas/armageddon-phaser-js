import Vector2 = Phaser.Math.Vector2;
import {ExplosionController} from "./explosion";


export class Missile {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private exploded = false;

    constructor(public scene: Phaser.Scene, public explosionController: ExplosionController, public source: Vector2, public target: Vector2) {
        this.sprite = this.scene.physics.add.sprite(source.x, source.y, 'missile-1');
        const direction = new Vector2(target).subtract(source);
        const velocity = direction.normalize().scale(300);
        this.sprite.setRotation(direction.angle() + Math.PI / 2.0);
        this.sprite.setVelocityX(velocity.x);
        this.sprite.setVelocityY(velocity.y);
    }

    public update(): void {
        if (this.sprite) {
            const location = new Vector2(this.sprite.x, this.sprite.y);
            if (location.distance(this.target) < 10.0) {
                this.sprite.destroy();
                this.sprite = null;
                this.explosionController.explode(location, 1, 0.99, 0xa0a0ff, 0);
                this.exploded = true;
            }
        }
    }

    public isActive(): boolean {
        return this.sprite != null;
    }
}

export class MissileController {
    private missiles: Missile[] = [];

    public constructor(public scene: Phaser.Scene, public explosionController: ExplosionController) {
    }

    preload() {
        this.scene.load.image('missile-1', 'assets/storm_shadow.png');
    }

    public create(): void {
    }

    public update(): void {
        this.missiles.forEach(missile => missile.update());
        this.missiles = this.missiles.reduce<Missile[]>((active, explosion) => {
            if (explosion.isActive()) {
                return [...active, explosion];
            }
            return active;
        }, []);
    }

    public createMissile(source: Vector2, target: Vector2) {
        if (this.missiles.length < 3) {
            this.missiles.push(new Missile(this.scene, this.explosionController, source, target));
        }
    }
}

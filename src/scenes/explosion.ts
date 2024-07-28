import PointLight = Phaser.GameObjects.PointLight;
import Vector2 = Phaser.Math.Vector2;
import WebAudioSound = Phaser.Sound.WebAudioSound;
import Circle = Phaser.Geom.Circle;
import Rectangle = Phaser.Geom.Rectangle;
import CircleToRectangle = Phaser.Geom.Intersects.CircleToRectangle;


export class Explosion {
    private lights: PointLight[] = [];
    private explosionSound: WebAudioSound;

    public constructor(public scene: Phaser.Scene, public location: Vector2, public intensity: number, public reduction: number,
                       public color: number, public upwind: number) {
        let indexMax = intensity;
        for (let index = 0; index < indexMax; index++) {
            let dx = indexMax > 1 ? 100 * index / (indexMax - 1) - 50 : 0;
            let dy = Math.random() * 20 - 10;
            let newlight = this.scene.add.pointlight(location.x + dx, location.y + dy, color, 30, 1);
            newlight.attenuation = 0.1;
            this.lights.push(newlight);
        }

        this.explosionSound = this.intensity > 1 ?
            this.scene.sound.add('explosion-1') as Phaser.Sound.WebAudioSound :
            this.scene.sound.add('explosion-2') as Phaser.Sound.WebAudioSound;
        this.explosionSound.play();
    }

    public update(): void {
        this.lights.forEach(light => {
            light.y -= this.upwind;
            light.radius *= 1.01
            light.intensity *= this.reduction;
        });
        const removeExplosion = this.lights.reduce((remove, light) => remove || light.intensity < 0.001, false);
        if (removeExplosion) {
            this.lights.forEach(light => {
                light.destroy(true);
            });
            this.lights = [];
        }
    }

    public isActive() {
        return this.lights.length > 0;
    }

    public isHit(location: Vector2): boolean {
        if (this.isActive()) {
            return this.location.distance(location) < this.intensity * 20; // 20;
        }
        return false;
    }

    public hitRect(rect: Rectangle): boolean {
        if (this.isActive()) {
            const exploseionArea = new Circle(this.location.x, this.location.y, this.intensity * 20);
            return CircleToRectangle(exploseionArea, rect);
        }
        return false;
    }


}


export class ExplosionController {
    private explosions: Explosion[] = [];

    public constructor(public scene: Phaser.Scene) {
    }

    preload() {
        this.scene.load.audio('explosion-1', 'assets/audio/rock_breaking.flac');
        this.scene.load.audio('explosion-2', 'assets/audio/DeathFlash.flac');
    }

    public create(): void {
    }

    public update(): void {
        this.explosions.forEach(missile => missile.update());
        this.explosions = this.explosions.reduce<Explosion[]>((active, explosion) => {
            if (explosion.isActive()) {
                return [...active, explosion];
            }
            return active;
        }, []);
    }

    public explode(location: Vector2, intensity: number, reduction: number, color: number, upwind: number) {
        this.explosions.push(new Explosion(this.scene, location, intensity, reduction, color, upwind))
    }

    isHit(location: Phaser.Math.Vector2): boolean {
        return this.explosions.reduce((hit, explosion) => hit || explosion.isHit(location), false);
    }

    public hitRect(rect: Rectangle): boolean {
        return this.explosions.reduce((hit, explosion) => hit || explosion.hitRect(rect), false);
    }

}

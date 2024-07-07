import PointLight = Phaser.GameObjects.PointLight;
import Text = Phaser.GameObjects.Text;
import Sprite = Phaser.Physics.Arcade.Sprite;
import Body = Phaser.Physics.Arcade.Body;
import Container = Phaser.GameObjects.Container;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;



const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: true,
    key: 'MissileTestScene',
};

export class MissileTestScene extends Phaser.Scene
{
    constructor ()
    {
        super(sceneConfig);
    }

    private mylights: PointLight[] = [];
    private text: Text;
    private colorIndex = 0;
    private colorIndexMax = 32;
    private explosionIntensity = 1;

    private missiles: Container[] = [];


    explode(x: number, y: number, intensity: number) {
        let indexMax = intensity;
        for (let index = 0; index < indexMax; index++) {
            let dx = indexMax > 1 ? 100 * index / (indexMax - 1) - 50 : 0;
            let dy = Math.random() * 20 - 10;
            let newlight = this.add.pointlight(x + dx, y + dy, 0, 30, 1);
            newlight.attenuation = 0.1;
            newlight.color.setTo(255, 128, 0);
            this.mylights.push(newlight);
        }
    }


    update() {
        this.text.text = `Wheel: Hue\nA + D: Explosion intensity ${this.explosionIntensity}\nW + S: Attenuation\nClick to set Light\ncolorIndex: ${this.colorIndex}`;

        this.mylights.forEach(light => {
            light.y -= 0.1;
            light.radius *= 1.01
            light.intensity *= 0.99;
        })

        const missilesToKeep = [];
        this.missiles.forEach(missile => {
            if (missile.y >= this.game.canvas.height - 100) {

                const k = missile.getAt(0) as Sprite;
                console.log(k);
                k.setVisible(false);

                const p = missile.getAt(1) as ParticleEmitter;
                p.stop(false);
                // p.setAngle(0);
                // p.start();

                this.explode(missile.x, missile.y, 10);
                const b = missile.body as Body;
                // b.setVelocity(0, 0);
                // missile.destroy();
            } else {
                missilesToKeep.push(missile);
            }
        });
        this.missiles = missilesToKeep;
    }

    createMissile() {

    }

    preload () {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');

        this.load.spritesheet('ball', 'https://labs.phaser.io/assets/sprites/balls.png', { frameWidth: 17, frameHeight: 17 });
        this.load.atlas('flares', 'https://labs.phaser.io/assets/particles/flares.png', 'https://labs.phaser.io/assets/particles/flares.json');

    }


    create ()
    {
        const background = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'bg')
        background.scaleX = this.game.canvas.width / background.width;
        background.scaleY = this.game.canvas.height / background.height;


        this.text = this.add.text(10, 10, 'Wheel: Hue\nA + D: Radius\nW + S: Attenuation\nClick to set Light').setDepth(1);

        const spectrum = Phaser.Display.Color.ColorSpectrum(this.colorIndexMax);

        let radius = 30;
        let intensity = 1;
        let attenuation = 0.1;

        let light = this.add.pointlight(400, 300, 0, radius, intensity);

        let color = spectrum[this.colorIndex];

        light.color.setTo(color.r, color.g, color.b);


        this.input.on('pointerdown', pointer => {
            const sourceX = Phaser.Math.Between(- 0.1 * this.game.canvas.width, 1.1 * this.game.canvas.width);
            // const targetX = Phaser.Math.Between(0, this.game.canvas.width);
            const targetX = pointer.x;

            const dx = targetX - sourceX;
            const dy = this.game.canvas.height;
            const direction = new Phaser.Math.Vector2(dx / 10, dy / 10);
            const speed = direction.length();


            const c1 = this.add.container(sourceX, 0);
            const ball = this.add.sprite(0, 0, "ball");
            c1.add(ball);
            const wisp = this.add.particles(0, 0, 'flares',
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

            const missileGroup = this.physics.add.group(c1);
            console.log(missileGroup.children)

            // const missileGroup = new Phaser.Physics.Arcade.Body(this.physics.world, c1);
            // this.physics.add.group()
            // missileGroup.create(sourceX, 0, "ball");
            // missileGroup.add(c1);

            // const missile = this.physics.add.sprite(sourceX, 0, 'ball');
            // missile.setVelocity(dx / 10, dy / 10);
            missileGroup.setVelocity(direction.x, direction.y);
            // missileGroup.setEnable(true);






            this.missiles.push(c1);
        });

        this.input.on('pointermove', pointer => {

            light.x = pointer.x;
            light.y = pointer.y;

        });

        this.input.on('wheel', (pointer, over, deltaX, deltaY, deltaZ) => {

            if (deltaY < 0)
            {
                this.colorIndex--;
            }
            else if (deltaY > 0)
            {
                this.colorIndex++;
            }

            if (this.colorIndex === spectrum.length)
            {
                this.colorIndex = 0;
            }
            else if (this.colorIndex < 0)
            {
                this.colorIndex = spectrum.length - 1;
            }
            this.colorIndex = this.colorIndex % this.colorIndexMax;

            color = spectrum[this.colorIndex];

            light.color.setTo(color.r, color.g, color.b);

        });

        this.input.keyboard.on('keydown-A', () => {
            this.explosionIntensity = Math.max(this.explosionIntensity - 1, 0);
        });

        this.input.keyboard.on('keydown-D', () => {
            this.explosionIntensity = Math.min(this.explosionIntensity + 1, 100);
        });

        this.input.keyboard.on('keydown-W', () => {

            light.attenuation += 0.01;
            attenuation += 0.01;

        });

        this.input.keyboard.on('keydown-S', () => {

            light.attenuation -= 0.01;
            attenuation -= 0.01;

        });
    }
}

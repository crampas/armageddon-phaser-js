import PointLight = Phaser.GameObjects.PointLight;
import Text = Phaser.GameObjects.Text;

export class LightTestScene extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    private mylights: PointLight[] = [];
    private text: Text;
    private colorIndex = 0;
    private colorIndexMax = 32;
    private explosionIntensity = 1;




    update() {
        this.text.text = `Wheel: Hue\nA + D: Explosion intensity ${this.explosionIntensity}\nW + S: Attenuation\nClick to set Light\ncolorIndex: ${this.colorIndex}`;

        this.mylights.forEach(light => {
            light.y = (light.y - 60) * 0.997 + 60;
            light.radius *= 1.01
            light.intensity *= 0.99;
        })
    }

    create ()
    {
        this.text = this.add.text(10, 10, 'Wheel: Hue\nA + D: Radius\nW + S: Attenuation\nClick to set Light').setDepth(1);

        const spectrum = Phaser.Display.Color.ColorSpectrum(this.colorIndexMax);

        let radius = 30;
        let intensity = 1;
        let attenuation = 0.1;

        let light = this.add.pointlight(400, 300, 0, radius, intensity);

        let color = spectrum[this.colorIndex];

        light.color.setTo(color.r, color.g, color.b);


        this.input.on('pointerdown', pointer => {
            this.colorIndex = (this.colorIndex + 1) % this.colorIndexMax;
            let indexMax = this.explosionIntensity;
            for (let index = 0; index < indexMax; index++) {
                let dx = indexMax > 1 ? 300 * index / (indexMax - 1) - 150 : 0;
                let dy = Math.random() * 20 - 10;
                let newlight = this.add.pointlight(pointer.x + dx, pointer.y + dy, 0, radius, intensity);
                color = spectrum[this.colorIndex];
                newlight.attenuation = attenuation;
                newlight.color.setTo(color.r, color.g, color.b);
                this.mylights.push(newlight);
            }
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

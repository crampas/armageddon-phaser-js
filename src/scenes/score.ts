
export class ScoreController {
    private asteriodsDestroid: number = 0;
    private asteriodsExploded: number = 0;
    private missiles: number = 0;
    private asteriods: number = 0;

    public notifyAsteriodDestroy() {
        this.asteriodsDestroid++;
    }

    public notifyAsteriodExploded() {
        this.asteriodsExploded++;
    }

    public notifyMissileLaunched() {
        this.missiles++;
    }

    public notifyAsteriodDropped() {
        this.asteriods++;
    }

    public toString() {
        return `Destroyed: ${this.asteriodsDestroid}\nExplosions: ${this.asteriodsExploded}\nMissiles: ${this.missiles}`;
    }
}

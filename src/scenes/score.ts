
export class ScoreController {
    private asteriodsDestroyed: number = 0;
    private asteriodsExploded: number = 0;
    private missiles: number = 0;
    private asteriods: number = 0;
    private buildings: number = 0;
    private buildingsDestroyed: number = 0;

    public notifyAsteriodDestroy() {
        this.asteriodsDestroyed++;
    }

    public notifyBuildingDestroy() {
        this.buildingsDestroyed++;
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
        return `Destroyed: ${this.asteriodsDestroyed}\nExplosions: ${this.asteriodsExploded}\nMissiles: ${this.missiles}\nBuildings: ${this.buildings}/${this.buildingsDestroyed}`;
    }

    addBuilding() {
        this.buildings++;
    }

    isGameOver() {
        return this.buildingsDestroyed >= this.buildings;
    }
}

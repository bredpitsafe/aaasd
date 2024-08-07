export class Binding {
    constructor(private readonly scope: string) {}

    toString(): string {
        return this.scope;
    }
}

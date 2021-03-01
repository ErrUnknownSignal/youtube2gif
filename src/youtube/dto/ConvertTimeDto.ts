import {IsNotEmpty, Max, Min} from "class-validator";

export class ConvertTimeDto {

    @IsNotEmpty()
    v: string;

    @Min(0)
    time: number;

    @Min(0)
    @Max(1)
    quality: number = 0;


    public toString(): string {
        return `v-${this.v}_time-${this.time}_quality-${this.quality}`;
    }
}
// External facing interfaces (e.g. can be saved as JSON files)

export interface IMetaData {
    version: number;
    author: string;
    name: string;
}

export interface IOscillator {
    waveType: "sine" | "square" | "sawtooth" | "triangle";
    detune?: number;
    octave?: number;
}

export interface IMixer {
    type: "volume" | "additive" | "am" | "fm";
    mix: number;
    carrierOsc?: 0 | 1;     // only used for AM & FM, 0 = osc1, 1 = osc2
    fmModIndex?: number;    // only used for FM
}

export interface IFilter {
    type: "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "notch";
    signal: "1" | "2" | "combined";
    frequency: number;
    emphasis: number;
    gain: number;
}

export interface IPatch {
    meta: IMetaData;
    oscillators: IOscillator[];
    mixer: IMixer;
    filters?: IFilter[] | null;
}
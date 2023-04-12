import { createContext } from 'react';
import { IFilter, IPatch } from '../types/Synthesiser';

export type PatchModel = IPatch & {_id: any};

/**
 * The default patch to use when the app is loaded.
 */


export const defaultFilter: IFilter = {
    type: "lowpass",
    frequency: 1000,
    emphasis: 1,
    gain: 0,
    signal: '1'
};

export const defaultPatch: IPatch = {
    meta: {
        version: 1,
        author: "default",
        name: "untitled-patch"
    },
    oscillators: [
        {
            waveType: "sine",
            detune: 0,
            octave: 0
        },
        {
            waveType: "sine",
            detune: 0,
            octave: 0,
        },
    ],
    filters: [
        defaultFilter
    ],
    mixer: {
      type: "volume",
      mix: 0.5,
      carrierOsc: 0,
      fmModIndex: 50
    }
  };

export const PatchContext = createContext({
    defaultPatch,
    patch: defaultPatch,
    setPatch: (patch: IPatch) => {},
    patchBank: [] as PatchModel[],
    setPatchBank: (patchBank: PatchModel[]) => {},
});
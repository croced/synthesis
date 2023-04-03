import { createContext } from 'react';
import { IPatch } from '../engine/AudioEngine';

export type PatchModel = IPatch & {_id: any};

/**
 * The default patch to use when the app is loaded.
 */

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
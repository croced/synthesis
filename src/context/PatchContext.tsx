import { createContext } from 'react';
import { IPatch } from '../engine/AudioEngine';

/**
 * The default patch to use when the app is loaded.
 */

export const defaultPatch: IPatch = {
    oscillators: [
        {
            waveType: "sine",
            detune: 0
        },
        {
            waveType: "sine",
            detune: 0
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
    patch: defaultPatch,
    setPatch: (patch: IPatch) => {}
});
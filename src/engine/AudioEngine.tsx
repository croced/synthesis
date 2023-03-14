import { IStatusMessage } from "./MIDIEngine";
import { noteToFreq } from "../util/util";

// External facing interfaces (e.g. can be saved as JSON files)
interface IOscillator {
    waveType: "sine" | "square" | "sawtooth" | "triangle";
    detune?: number;
}

interface IMixer {
    type: "volume" | "AM" | "FM";
    mix: number;
}

export interface IPatch {
    oscillators: IOscillator[];
    mixer: IMixer;
}

// Internal interfaces, used for WebAudioAPI
interface InternalOscillator {
    pitch: number;
    oscillator: OscillatorNode;
}

const oscillatorMap: InternalOscillator[] = [];

/**
 * Handles a MIDI event by setting up the relative WebAudioAPI 
 * nodes according to the patch provided (and playing
 * the notes).
 * 
 * @param event IStatusMessage - the (parsed) MIDI event to handle
 * @param audioCtx - our WebAudioAPI AudioContext
 * @param patch - the patch object to play this event on
 * @returns 
 */

export function handleMidiEvent(event: IStatusMessage, audioCtx: AudioContext, patch: IPatch) {

    if (!event) return;
    log('-------------- HANDLE MIDI EVENT --------------')

    const note = event.pitch! || 0;

    patch.oscillators.forEach((osc, oscId) => {
        
        if (event.message === "noteOn")
        {                    
            log(`-> playing note ${note} on oscillator: ${JSON.stringify(osc)})}`);

            // creating oscillator
            const oscillator = audioCtx.createOscillator();
            oscillator.type = osc.waveType;
            oscillator.frequency.value = noteToFreq(note);
            oscillator.detune.value = osc.detune || 0;

            // perform mixing
            if (patch.mixer.type === "volume")
            {
                const mixGain = audioCtx.createGain();
                const mixValue = (oscId === 0 ? 1 - patch.mixer.mix : patch.mixer.mix);
                mixGain.gain.value = mixValue;
    
                oscillator.connect(mixGain).connect(audioCtx.destination);
            }
            // todo: account for AM & FM
            else oscillator.connect(audioCtx.destination);
            
            oscillator.start();
            
            oscillatorMap.push({pitch: note, oscillator});

        } else if ((event.message === "noteOff") || (event.message === "noteOn" && event.velocity === 0)) {

            log(`-> stopping note ${note} on oscillator: ${JSON.stringify(osc)})}`);

            oscillatorMap.map((_osc, index) => {
                if (_osc.pitch === note) {
                    _osc.oscillator.stop();
                    _osc.oscillator.disconnect();
                    return oscillatorMap.splice(index, 1);
                }

                return oscillatorMap;
            });

        } else if (event.message === "pitchBend")
        {
            log(`-> pitchBend event @ bendLSB ${event.bendLSB} : bendMSB ${event.bendMSB}`);
        }
    });
    
}

/**
 * AudioEngine logging function, only logs if REACT_APP_EXTENSIVE_LOGGING is set.
 * @param message - the message to log
 */
const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[AudioEngine] ${message}`);
}
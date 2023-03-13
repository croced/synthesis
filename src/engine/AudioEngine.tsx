import { IStatusMessage } from "./MIDIEngine";
import { noteToFreq } from "../util/util";

// External facing interfaces (e.g. can be saved as JSON files)
interface IOscillator {
    waveType: "sine" | "square" | "sawtooth" | "triangle";
    detune?: number;
}

export interface ISynthesiser {
    oscillators: IOscillator[];
}

// Internal interfaces, used for WebAudioAPI
interface InternalOscillator {
    pitch: number;
    oscillator: OscillatorNode;
}

const oscillatorMap: InternalOscillator[] = [];

/**
 * Handles a MIDI event by setting up the relative WebAudioAPI 
 * nodes according to the synthesiser provided (and playing
 * the notes).
 * 
 * @param event IStatusMessage - the (parsed) MIDI event to handle
 * @param audioCtx - our WebAudioAPI AudioContext
 * @param synthesiser - the synthesiser object to play this event on
 * @returns 
 */

export function handleMidiEvent(event: IStatusMessage, audioCtx: AudioContext, synthesiser: ISynthesiser) {

    if (!event) return;
    log('-------------- HANDLE MIDI EVENT --------------')

    const note = event.pitch! || 0;

    synthesiser.oscillators.forEach((iOsc) => {
        
        if (event.message === "noteOn")
        {                    
            log(`-> playing note ${note} on oscillator: ${JSON.stringify(iOsc)})}`);

            const oscillator = audioCtx.createOscillator();

            oscillator.type = iOsc.waveType;
            oscillator.frequency.value = noteToFreq(note);
            oscillator.detune.value = iOsc.detune || 0;

            oscillator.connect(audioCtx.destination);
            oscillator.start();
            
            oscillatorMap.push({pitch: note, oscillator});

        } else if ((event.message === "noteOff") || (event.message === "noteOn" && event.velocity === 0)) {

            log(`-> stopping note ${note} on oscillator: ${JSON.stringify(iOsc)})}`);

            oscillatorMap.map((osc, index) => {
                if (osc.pitch === note) {
                    osc.oscillator.stop();
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
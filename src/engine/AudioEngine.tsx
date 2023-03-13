import * as _ from "lodash";
import { IStatusMessage } from "./MIDIEngine";
import { noteToFreq } from "../util/util";

const EXTENSIVE_LOGGING = process.env.EXTENSIVE_LOGGING;

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

var currentMidiEvents: IStatusMessage[] = [];

/**
 * Used to 'pipe' MIDI events into the AudioEngine, where we can
 * then handle them.
 * @param event IStatusMessage - the (parsed) MIDI event to handle
 * @param audioCtx - our WebAudioAPI AudioContext
 * @param synthesiser - the synthesiser object to play this event on
 * @returns 
 */

export function pipeMidiEvent(event: IStatusMessage, audioCtx: AudioContext, synthesiser: ISynthesiser) {


    log('-------------- PIPE MIDI EVENT --------------')
    log(`event: ${JSON.stringify(event.id)}`);

   if (currentMidiEvents.find((e) => (e.id === event.id)))
    {
        log(`event \'${event.id}\' already in pipe!`);
        return;
    }

    currentMidiEvents.push(event);
    handleMidiEvent(event, audioCtx, synthesiser);
}

//TODO: Debounce handling of notes OR only allow 1 note of the same pitch
//          to be played at any time (check if note is already playing before
//          creating a new oscillator).

export function handleMidiEvent(event: IStatusMessage, audioCtx: AudioContext, synthesiser: ISynthesiser) {

    log('-------------- HANDLE MIDI EVENT --------------')
    // log(`synth: ${synthesiser.oscillators.length}`)

    if (!event) return;

    const note = event.pitch! || 0;

    synthesiser.oscillators.forEach((iOsc) => {
        
        if (event.message === "noteOn")
        {                    
            log(`-> noteOn event @ pitch ${note}`);
            log(`-> playing above note on oscillator: ${JSON.stringify(iOsc)})}`);

            const oscillator = audioCtx.createOscillator();

            oscillator.type = iOsc.waveType;
            oscillator.frequency.value = noteToFreq(note);
            oscillator.detune.value = iOsc.detune || 0;

            oscillator.connect(audioCtx.destination);
            oscillator.start();
            
            oscillatorMap.push({pitch: note, oscillator});

            log(`---> afterplay nodemap: ${JSON.stringify(oscillatorMap)}`);

        } else if ((event.message === "noteOff") || (event.message === "noteOn" && event.velocity === 0)) {

            log(`-> noteOff event @ pitch ${note}`);
            
            oscillatorMap.map((osc, index) => {
                if (osc.pitch === note) {
                    osc.oscillator.stop();
                    oscillatorMap.splice(index, 1);
                }
            });

        } else if (event.message === "pitchBend")
        {
            log(`-> pitchBend event @ bendLSB ${event.bendLSB} : bendMSB ${event.bendMSB}`);
        }
    });
    
    currentMidiEvents.splice(currentMidiEvents.indexOf(event), 1);
}

const log = (message: any) => {
    if (EXTENSIVE_LOGGING)
        console.log(`[AudioEngine] ${message}`);
}

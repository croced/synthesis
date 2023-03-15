import { IStatusMessage } from "./MIDIEngine";
import { noteToFreq } from "../util/util";

const MAX_VOLUME = 0.5 as const;

// External facing interfaces (e.g. can be saved as JSON files)
interface IOscillator {
    waveType: "sine" | "square" | "sawtooth" | "triangle";
    detune?: number;
}

interface IMixer {
    type: "volume" | "am" | "fm";
    mix: number;
    carrierOsc?: 0 | 1; // only used for AM & FM, 0 = osc1, 1 = osc2
    fmModIndex?: number;
}

export interface IPatch {
    oscillators: IOscillator[];
    mixer: IMixer;
}

// Internal interfaces, used for WebAudioAPI
interface InternalOscillator {
    pitch: number;
    osc1: OscillatorNode;
    osc2: OscillatorNode;
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

export function handleMidiEvent(event: IStatusMessage, patch: IPatch, audioCtx: AudioContext) {

    if (!event) return;
    log('-------------- HANDLE MIDI EVENT --------------')

    const note = event.pitch! || 0;
    const noteFreq = noteToFreq(note);

    if (event.message === "noteOn")
    {
        log(`-> noteon detected: ${note}`);
        log(`-> mixer: ${JSON.stringify(patch.mixer)})}`);

        // master volume gain node
        const masterVolume = audioCtx.createGain();
        masterVolume.gain.value = MAX_VOLUME;

        // create oscillator nodes
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();

        osc1.type = patch.oscillators[0].waveType;
        osc1.frequency.value = noteFreq;
        osc1.detune.value = patch.oscillators[0].detune || 0;

        osc2.type = patch.oscillators[1].waveType;
        osc2.frequency.value =noteFreq;
        osc2.detune.value = patch.oscillators[1].detune || 0;

        // todo: pre-mix filters can go here

        // perform mixing
        switch (patch.mixer.type)
        {
            case "volume":
                {
                    const osc1Gain = audioCtx.createGain();
                    const osc2Gain = audioCtx.createGain();

                    osc1Gain.gain.value = 1 - patch.mixer.mix;
                    osc2Gain.gain.value = patch.mixer.mix;

                    osc1.connect(osc1Gain);
                    osc2.connect(osc2Gain);

                    osc1Gain.connect(masterVolume);
                    osc2Gain.connect(masterVolume);
                }
                break;
            case "am":
                {            
                    const carrierGain = audioCtx.createGain();
                    const modulatorGain = audioCtx.createGain();
                    
                    if (patch.mixer.carrierOsc === 0)
                    {
                        osc1.connect(carrierGain);
                        osc2.connect(modulatorGain);

                        carrierGain.connect(masterVolume);
                        modulatorGain.connect(carrierGain.gain);
                    } 
                    else
                    {
                        osc1.connect(modulatorGain);
                        osc2.connect(carrierGain);
                        
                        carrierGain.connect(masterVolume);
                        modulatorGain.connect(carrierGain.gain);
                    }
                }
                break;
            case "fm":
                {
                    const modulatorGain = audioCtx.createGain();
                    modulatorGain.gain.value = patch.mixer.fmModIndex || 50;

                    if (patch.mixer.carrierOsc === 0)
                    {
                        osc2.connect(modulatorGain);
                        modulatorGain.connect(osc1.detune);
                        osc1.connect(masterVolume);
                    }
                    else {
                        osc1.connect(modulatorGain);
                        modulatorGain.connect(osc2.detune);
                        osc2.connect(masterVolume);
                    }
                }
                break;
            default:
                break;
        }
        
        // todo: post-mix filters can go here

        masterVolume.connect(audioCtx.destination);

        osc1.start();
        osc2.start();

        oscillatorMap.push({ pitch: note, osc1, osc2 });
    }
    else if (event.message === "noteOff") 
    {
        log(`-> noteof event detected for note: ${note}`);

        oscillatorMap.map((osc, index) => {
            if (osc.pitch === note) {
                osc.osc1.disconnect();
                osc.osc2.disconnect();

                osc.osc1.stop();
                osc.osc2.stop();
                return oscillatorMap.splice(index, 1);
            }

            return oscillatorMap;
        });
    } 
    else if (event.message === "pitchBend")
        log(`-> pitchBend event @ bendLSB ${event.bendLSB} : bendMSB ${event.bendMSB}`);
    else
        log(`-> Unhandled event: ${JSON.stringify(event)}`);
}

/**
 * AudioEngine logging function, only logs if REACT_APP_EXTENSIVE_LOGGING is set.
 * @param message - the message to log
 */
const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[AudioEngine] ${message}`);
}
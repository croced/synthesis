import { IStatusMessage } from "./MIDIEngine";
import { noteToFreq } from "../util/util";
import { IPatch } from "../types/Synthesiser";

const MAX_VOLUME = 0.5 as const;

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
 */

export function handleMidiEvent(event: IStatusMessage, patch: IPatch, audioCtx: AudioContext) {

    if (!event) return;
    log('-------------- HANDLE MIDI EVENT --------------')

    const note = event.pitch! || 0;

    // const osc1AdjustedOctave = note - (patch.oscillators[0].octave || 0 * 12);

    if (event.message === "noteOn")
    {
        log(`-> noteon detected: ${note}`);

        // master volume gain node
        let postMixNode = audioCtx.createGain();

        let masterVolumeNode = audioCtx.createGain();
        masterVolumeNode.gain.value = MAX_VOLUME;

        // create oscillator nodes
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();

        osc1.type = patch.oscillators[0].waveType;
        osc1.frequency.value = noteToFreq(note + ((patch.oscillators[0].octave || 0) * 12));
        osc1.detune.value = patch.oscillators[0].detune || 0;

        osc2.type = patch.oscillators[1].waveType;
        osc2.frequency.value = noteToFreq(note + ((patch.oscillators[1].octave || 0) * 12));
        osc2.detune.value = patch.oscillators[1].detune || 0;

        // velocity gain node
        const scaledVelocity = (event.velocity || 64) / 127;

        const osc1v = audioCtx.createGain();
        osc1v.gain.value = scaledVelocity;
        const osc2v = audioCtx.createGain();
        osc2v.gain.value = scaledVelocity;
        
        /** PRE-MIXING FILTERS */
        if (patch.filters && patch.filters.length > 0) {

            let osc1HasFilter = false;
            let osc2HasFilter = false;

            // Loop through the filters
            patch.filters.forEach((filter) => {

                if (filter.signal === "1") {
                    const biquadFilter = audioCtx.createBiquadFilter();
                    biquadFilter.type = filter.type;
                    biquadFilter.frequency.value = filter.frequency;
                    biquadFilter.gain.value = filter.gain;
                    
                    // Check if there is a previous filter for this signal
                    const previousFilter = osc1.numberOfInputs > 0 ? osc1 : null;
                    
                    // Connect the filter to the previous filter or the osc1 node
                    if (previousFilter)
                        previousFilter.connect(biquadFilter);
                    else
                        osc1.connect(biquadFilter);
                    
                    biquadFilter.connect(osc1v);
                    osc1HasFilter = true;
                } else if (filter.signal === "2") {

                    const biquadFilter = audioCtx.createBiquadFilter();
                    biquadFilter.type = filter.type;
                    biquadFilter.frequency.value = filter.frequency;
                    biquadFilter.gain.value = filter.gain;
                    
                    // Check if there is a previous filter for this signal
                    const previousFilter = osc2.numberOfInputs > 0 ? osc2 : null;
                    
                    // Connect the filter to the previous filter or the osc2 node
                    if (previousFilter)
                        previousFilter.connect(biquadFilter);
                    else
                        osc2.connect(biquadFilter);
                    
                    biquadFilter.connect(osc2v);
                    osc2HasFilter = true;
                }
            });

            // If no filters were found for a signal, connect the osc to the gain node
            if (!osc1HasFilter) osc1.connect(osc1v);
            if (!osc2HasFilter) osc2.connect(osc2v);

        } else {
            osc1.connect(osc1v);
            osc2.connect(osc2v);
        }
    
        /** MIXING */
        switch (patch.mixer.type)
        {
            case "volume":
                {
                    const osc1Gain = audioCtx.createGain();
                    const osc2Gain = audioCtx.createGain();

                    osc1Gain.gain.value = 1 - patch.mixer.mix;
                    osc2Gain.gain.value = patch.mixer.mix;

                    osc1v.connect(osc1Gain);
                    osc2v.connect(osc2Gain);

                    osc1Gain.connect(postMixNode);
                    osc2Gain.connect(postMixNode);
                }
                break;
            case "additive":
                    osc1v.connect(postMixNode);
                    osc2v.connect(postMixNode);
                    
                    masterVolumeNode.gain.value = MAX_VOLUME / 2;
                break;
            case "am":
                {            
                    const carrierGain = audioCtx.createGain();
                    const modulatorGain = audioCtx.createGain();
                    
                    if (patch.mixer.carrierOsc === 0)
                    {
                        osc1v.connect(carrierGain);
                        osc2v.connect(modulatorGain);

                        carrierGain.connect(postMixNode);
                        modulatorGain.connect(carrierGain.gain);
                    } 
                    else
                    {
                        osc1v.connect(modulatorGain);
                        osc2v.connect(carrierGain);
                        
                        carrierGain.connect(postMixNode);
                        modulatorGain.connect(carrierGain.gain);
                    }
                }
                break;
            case "fm":
                {
                    const normalizedModIndex = (patch.mixer.fmModIndex || 50) / 100;
                    const modDepth = audioCtx.createGain();
                    
                    if (patch.mixer.carrierOsc === 0) 
                    {
                        modDepth.gain.value = normalizedModIndex * osc1.frequency.value;
                        
                        osc2v.connect(modDepth);
                        modDepth.connect(osc1.frequency);

                        osc1v.connect(postMixNode);
                    } 
                    else
                    {
                        modDepth.gain.value = normalizedModIndex * osc2.frequency.value;

                        osc1v.connect(modDepth);
                        modDepth.connect(osc2.frequency);

                        osc2v.connect(postMixNode);
                    }
                    
                    masterVolumeNode.gain.value = MAX_VOLUME / 2;
                }
                break;
            default:
                break;
        }

        /** POST-MIXING FILTERS */
        if (patch.filters && patch.filters.length > 0) {

            // Create and connect filter nodes based on filter objects
            for (let i = 0; i < patch.filters.length; i++) {
                const filter = patch.filters[i];

                // Check if filter is of type "combined"
                if (filter.signal !== "combined") {
                    continue; // Skip this filter and move to the next one
                }

                // Create BiquadFilterNode and set its parameters based on filter object
                const filterNode = audioCtx.createBiquadFilter();
                filterNode.type = filter.type;
                filterNode.frequency.value = filter.frequency;
                filterNode.gain.value = filter.gain;
                filterNode.Q.value = filter.emphasis;

                // Connect filterNode to the current node in the chain
                postMixNode.connect(filterNode);

                // Update postSourceNode to the newly created filterNode
                postMixNode = filterNode;
            }

            // Connect last filter node to volumeNode
            postMixNode.connect(masterVolumeNode);
        }
        else
            postMixNode.connect(masterVolumeNode);

        /** Connect master volume node to output, and start oscillators! */
        masterVolumeNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();

        oscillatorMap.push({ pitch: note, osc1, osc2 });
    }
    else if (event.message === "noteOff") 
    {
        log(`-> noteoff event detected for note: ${note}`);

        
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
    else if (event.message === "pitchBend") {
        log(`-> pitchBend event @ bendLSB ${event.bendLSB} : bendMSB ${event.bendMSB}`);
        
        oscillatorMap.map((osc) => {
            handlePitchBend(event, osc, audioCtx);
            return oscillatorMap;
        });
    }
    else
        log(`-> Unhandled event: ${JSON.stringify(event)}`);
}

/**
 * Function to handle a pitch bend event, adjusting the frequency of the 
 * currently playing oscillator nodes accordingly.
 * @param event PitchBend message - others will be ignored.
 * @param osc Internal oscillator object containing the two oscillator nodes
 * @param audioCtx Audio context
 */

const handlePitchBend = (event: IStatusMessage, osc: InternalOscillator, audioCtx: AudioContext) => {
    if (!event.bendLSB || !event.bendMSB) return;

    // combine the MSB and LSB values into a 14-bit value
    var pitchBendValue = (event.bendMSB << 7) + event.bendLSB; 

    // convert the 14-bit value to a range of -1 to 1
    var normalizedPitchBendValue = (pitchBendValue - 8192) / 8192;

    // convert the normalized pitch bend value to a frequency offset in semitones
    var semitoneOffset = normalizedPitchBendValue * 2;

    // calculate the frequency multiplier based on the semitone offset
    var frequencyMultiplier = Math.pow(2, semitoneOffset / 12);

    // calculate the frequency offset by subtracting 1 from the frequency multiplier and multiplying by the pitch
    var frequencyOffset = (frequencyMultiplier - 1) * noteToFreq(osc.pitch);

    const newPitch = noteToFreq(osc.pitch) + frequencyOffset;

    osc.osc1.frequency.setValueAtTime(newPitch, audioCtx.currentTime);
    osc.osc2.frequency.setValueAtTime(newPitch, audioCtx.currentTime);

    log(`frequencyOffset: ${frequencyOffset}`);
};

/**
 * AudioEngine logging function, only logs if REACT_APP_EXTENSIVE_LOGGING is set.
 * @param message - the message to log
 */
const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[AudioEngine] ${message}`);
}
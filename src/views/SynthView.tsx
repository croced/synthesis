import React, { useContext, useEffect, useRef, useState } from 'react';
import { defaultPatch, PatchContext } from '../context/PatchContext';
import { handleMidiEvent } from '../engine/AudioEngine';
import { GetMIDIMessage, IStatusMessage } from '../engine/MIDIEngine';

const SynthView: React.FC = () => {

    const audioContext = useRef<AudioContext | null>(null);
    const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null | undefined>(null);
    const [contextStarted, setContextStarted] = useState(false);

    const {patch, setPatch} = useContext(PatchContext);

    /**
     * * Initialise the AudioContext on mount, and close it on unmount.
     * * Request MIDI access.
     * 
     * ********************************************************************
     * Note: because we suspend the AudioContext on unmount, we need to
     * refresh the page to get it to work again during live development.
     * 
     * todo: Find a way to refresh the AudioContext without having to refresh 
     *        the page.
     * ********************************************************************
     */

    useEffect(() => {

        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();

        if (navigator.requestMIDIAccess) {
        console.log('Web MIDI API is supported');

        audioContext.current.suspend();

        navigator.requestMIDIAccess({sysex: true})
        .then(onMIDISuccess, onMIDIFailure);

        } else {
            console.log('Web MIDI API is not supported');
        }

        return () => {
        log("Closing AudioContext...");
        if (audioContext.current)
            audioContext.current.close();
        };
    }, []);

    
    const startAudioContext = () => {
        console.log("Starting audio context...");
        audioContext.current!.resume();
        setContextStarted(true);
    }

    /**
     * Set up the MIDI input listeners when the MIDI access changes.
     * MIDI access is set when the user grants permission to use their MIDI devices.
     */

    useEffect(() => {
        if (!midiAccess)
        return;

        function inputListener(message: WebMidi.MIDIMessageEvent | null) {
        if (!message || !message.data) return;
        handleMessage(message);
        } 

        Array.from(midiAccess.inputs).forEach((input) => {
        log(`Setting up listener for ${input[1].name}`);
        input[1].addEventListener('midimessage', inputListener);
        });
        
        return () => {
        log("Removing MIDI listeners...");
        
        Array.from(midiAccess.inputs).forEach((input) => {
            return input[1].removeEventListener('midimessage', inputListener as EventListener);
        });
        }
    }, [midiAccess, patch]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const onMIDISuccess = (_midiAccess: WebMidi.MIDIAccess) => {
        setMidiAccess(_midiAccess);
    }

    const onMIDIFailure = (event: any) => {
        console.log('Could not access your MIDI devices.');
        console.log(event);
    }

    /**
     * Handle raw MIDI messages by converting them to a more
     * readable format, and then passing them to the audio engine.
     * 
     * @param event The raw MIDI message event.
     */
    
    function handleMessage(event: WebMidi.MIDIMessageEvent) {
        const midiMessage: IStatusMessage = GetMIDIMessage(event.data);

        if (midiMessage.message !== "unknown")            
        handleMidiEvent(midiMessage, patch, audioContext.current!)

        else log(midiMessage)
    }

    if (!contextStarted) return (
        <div className="App">
            <p>You must manually start audio context before sound is produced!</p>
            <button onClick={startAudioContext}>Start</button>
        </div>  
    );

    const handleWaveTypeChange = (event: React.ChangeEvent<HTMLSelectElement>, osc: 0 | 1) => {

        let oscillators = [...patch.oscillators];
        let oscillator = {...oscillators[osc]}; 
        oscillator.waveType = event.target.value as "sine" | "square" | "sawtooth" | "triangle";
        oscillators[osc] = oscillator;

        setPatch({
        ...patch,
        oscillators
        });
        
    }

    const handleOscDetuneChange = (event: React.ChangeEvent<HTMLInputElement>, osc: 0 | 1) => {

        let detuneValue: number = parseInt(event.target.value);

        if (isNaN(detuneValue)) return;
        if (detuneValue > 1200)
        detuneValue = 1200;
        else if (detuneValue < -1200)
        detuneValue = -1200;

        let oscillators = [...patch.oscillators];
        let oscillator = {...oscillators[osc]}; 
        oscillator.detune = detuneValue;
        oscillators[osc] = oscillator;

        setPatch({
        ...patch,
        oscillators
        });
        
    }

    const renderOscillators = () => {
        return defaultPatch.oscillators.map((osc, i) => {
        return (
            <div key={`osc-${i}`}>
            <h1>OSC. {i + 1}</h1>
            <label htmlFor="oscillatorTypes">Wave type:</label>
            <select name="oscillatorTypes" id="oscillatorTypes" onChange={(e) => handleWaveTypeChange(e, i as 0 | 1)}>
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
            </select>
            <br />
            <br />
            <label htmlFor="oscillatorDetuneSlider">Detune:</label>
            <input type="range" name="oscillatorDetuneSlider" id="oscillatorDetuneSlider" min="-1200" max="1200" step="1" value={patch.oscillators[i].detune} onChange={(e) => handleOscDetuneChange(e, i as 0 | 1)}/>
            <input type="number" name="oscillatorDetune" id="oscillatorDetune" min="-1200" max="1200" value={patch.oscillators[i].detune} onChange={(e) => handleOscDetuneChange(e, i as 0 | 1)}/>
            </div>
        )
        });

    }

    const handleVolMixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let mixValue: number = parseFloat(event.target.value);
        if (isNaN(mixValue)) return;

        if (mixValue > 1)
        mixValue = 1;
        else if (mixValue < 0)
        mixValue = 0;

        let mixer = {...patch.mixer}; 
        mixer.mix = mixValue;
    
        setPatch({
            ...patch,
            mixer
        });
    }

    const handleMixerTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let mixer = {...patch.mixer};
        mixer.type = event.target.value as "volume" | "am" | "fm";

        setPatch({
        ...patch,
        mixer
        });
    };

    const handleCarrierSignalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const carrierSignal = parseInt(event.target.value) as 0 | 1;
        if (isNaN(carrierSignal)) return;

        let mixer = {...patch.mixer};
        mixer.carrierOsc = carrierSignal;

        setPatch({
        ...patch,
        mixer
        });
    }

    const renderCarrierSelect = () => {
        return (
        <div>
            <label htmlFor="carrierSignal">Carrier Signal</label>
            <select name="carrierSignal" id="carrierSignal" onChange={handleCarrierSignalChange}>
                <option value="0">OSC. 1</option>
                <option value="1">OSC. 2</option>
            </select>
        </div>
        )
    };


    const handleFmIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fmIndex = parseInt(event.target.value);
        if (isNaN(fmIndex)) return;

        let mixer = {...patch.mixer};
        mixer.fmModIndex = fmIndex;

        setPatch({
        ...patch,
        mixer
        });
    }

    const renderFmIndexSelect = () => {
        return (
        <div>
            <label htmlFor="fmIndexSelect">Modulation:</label>
            <input type="range" name="fmIndexSelectSlider" id="fmIndexSelectSlider" min="0" max="100" step="1" value={patch.mixer.fmModIndex} onChange={handleFmIndexChange}/>
            <input type="number" name="fmIndexSelect" id="fmIndexSelect" min="0" max="100" step="1" value={patch.mixer.fmModIndex} onChange={handleVolMixChange}/>
        </div>
        ); 
    }

    const renderMixer = () => {
        return (
        <div>
            <h1>Mixer</h1>

            <label htmlFor="mixerTypes">Mix type:</label>
            <select name="mixerTypes" id="mixerTypes" onChange={handleMixerTypeChange}>
                <option value="volume">Additive</option>
                <option value="am">AM</option>
                <option value="fm">FM</option>
            </select>

            {(patch.mixer.type === "am" || patch.mixer.type === "fm") && renderCarrierSelect()}
            <br />
            {patch.mixer.type === "fm" && renderFmIndexSelect()}
            {patch.mixer.type === "volume" && (
            <div>
                <label htmlFor="oscillatorMixSlider">Mix:</label>
                <input type="range" name="oscillatorMixSlider" id="oscillatorMixSlider" min="0" max="1" step="0.01" value={patch.mixer.mix} onChange={handleVolMixChange}/>
                <input type="number" name="oscillatorMix" id="oscillatorMix" min="0" max="1" step="0.1" value={patch.mixer.mix} onChange={handleVolMixChange}/>
                <p>L: OSC.1</p>
                <p>R: OSC.2</p>
            </div>
            )}
        </div>
        );
    }

    return (
        <div className="App">
            {renderOscillators()}
            {renderMixer()}
        </div>
    );
};

const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[SynthView] ${message}`);
};

export default SynthView;
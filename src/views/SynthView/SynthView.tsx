import React, { useContext, useEffect, useRef, useState } from 'react';
import { defaultPatch, PatchContext } from '../../context/PatchContext';
import { handleMidiEvent } from '../../engine/AudioEngine';
import { GetMIDIMessage, IStatusMessage } from '../../engine/MIDIEngine';
import Mixer from './components/Mixer';
import Oscillator from './components/Oscillator';

const SynthView: React.FC = () => {

    const audioContext = useRef<AudioContext | null>(null);
    const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null | undefined>(null);
    const [contextStarted, setContextStarted] = useState(false);

    const { patch } = useContext(PatchContext);

    /**
     * * Initialise the AudioContext on mount, and close it on unmount.
     * * Request MIDI access.
     * 
     * ********************************************************************
     * Note: because we suspend the AudioContext on unmount, we need to
     * refresh the page to get it working again whenever SynthView changes.
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
         

    return (
        <div className="grid gap-4 grid-cols-8 p-4">
            <div>
                { defaultPatch.oscillators.map((_osc, i) => <Oscillator key={`osc-${i}`} id={i} />) }
            </div>
            <Mixer />
            <div className="bg-red-200">
                Filters
            </div>
        </div>
    );
};

const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[SynthView] ${message}`);
};

export default SynthView;
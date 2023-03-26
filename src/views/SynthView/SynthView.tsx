import React, { useContext, useEffect, useRef, useState } from 'react';
import { defaultPatch, PatchContext } from '../../context/PatchContext';
import { handleMidiEvent } from '../../engine/AudioEngine';
import { GetMIDIMessage, IStatusMessage } from '../../engine/MIDIEngine';
import Card from './components/Card';
import Mixer from './components/Mixer';
import Oscillator from './components/Oscillator';
import clsx from 'clsx';
import { AuthContext } from '../../reducers/AuthReducer';
import { useNavigate } from "react-router-dom";

const SynthView: React.FC = () => {

    const audioContext = useRef<AudioContext | null>(null);

    const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null | undefined>(null);
    const [contextStarted, setContextStarted] = useState(false);

    const { authState, user } = useContext(AuthContext);
    const { patch, setPatch } = useContext(PatchContext);

    let navigate = useNavigate();

    // if we don't have a token, redirect to login page
    useEffect(() => {
        if (authState.token === null)
            navigate('/login');
    }, [authState, navigate]);

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

        const inputListener = (message: WebMidi.MIDIMessageEvent | null) => {
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
    
    const onMIDISuccess = (_midiAccess: WebMidi.MIDIAccess) =>
        setMidiAccess(_midiAccess);

    const onMIDIFailure = (_event: any) =>
        console.log('Could not access your MIDI devices.');

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

    /**
     * Download patch as JSON file.
     */

    const exportPatch = () => {
        const jsonStr = JSON.stringify(patch);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
        const link = document.createElement('a');

        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'my-patch.json');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const importPatch = (e: any) => {
        const file = e.target.files[0];
        if (!file || !e.target) return;
    
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const loadedPatch = JSON.parse(e.target!.result as string);
            if (!loadedPatch.meta || !loadedPatch.oscillators || !loadedPatch.mixer)
                throw new Error('Invalid patch file!');

            setPatch(loadedPatch);
          } catch (error) {
            console.error('Invalid JSON file!');
          }
        };

        reader.readAsText(file);
      };

    return (
        <>
            <div className="p-4">
                <h1 className="text-2xl font-bold">Synth View</h1>
                <div>
                    <p>Hello user: {user}</p>
                    <button onClick={exportPatch}>Download patch</button>
                    <br />
                    <input type="file" accept=".json" onChange={importPatch} />
                </div>
                <div className={clsx("mt-2 grid gap-x-12 grid-cols-6", {"bg-amber-200 rounded-xl py-4": !contextStarted})}>

                    {/* Audio Context warning */}
                    { !contextStarted && (
                        <div className="p-4 mb-2">
                            <p>You must manually start audio context before sound is produced!</p>
                            <br />
                            <button className="bg-amber-400 px-4 rounded-md w-full" onClick={startAudioContext}>Start</button>
                        </div>  
                    )}

                    {/* Oscillators */}
                    <div>
                        { defaultPatch.oscillators.map((_osc, i) => <Oscillator key={`osc-${i}`} id={i} />) }
                    </div>

                    {/* Mixer */}
                    <Mixer />

                    {/* Filters */}
                    <div>
                        <Card title="FILTER">
                            (Filters go here)
                        </Card>
                    </div>
                </div>

            </div>
        </>
    );
};

const log = (message: any) => {
    if (process.env.REACT_APP_EXTENSIVE_LOGGING)
        console.log(`[SynthView] ${message}`);
};

export default SynthView;
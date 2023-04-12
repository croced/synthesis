import React, { useContext, useEffect, useRef, useState } from 'react';
import { defaultFilter, defaultPatch, PatchContext } from '../../context/PatchContext';
import { handleMidiEvent } from '../../engine/AudioEngine';
import { GetMIDIMessage, IStatusMessage } from '../../engine/MIDIEngine';
import Card from './components/Card';
import Mixer from './components/Mixer';
import Oscillator from './components/Oscillator';
import clsx from 'clsx';
import { AuthContext } from '../../reducers/AuthReducer';
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
import Filter from './components/Filter';

const SynthView: React.FC = () => {

    const audioContext = useRef<AudioContext | null>(null);

    const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null | undefined>(null);
    const [contextStarted, setContextStarted] = useState(false);

    const { authState } = useContext(AuthContext);
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

    const handleAddFilter = () => {
        if (!patch.filters)
            patch.filters = [];

        setPatch({...patch, filters: [...patch.filters, defaultFilter]});
    };

    const renderFilters = () => {

        const addFilterButton = (
            <button name="addFilterBtn" className="bg-gray-200 text-black border-2 border-gray-500 p-4 rounded-md w-full" onClick={handleAddFilter}>Add Filter</button>
        );

        if (!patch.filters || patch.filters.length === 0)
            return addFilterButton;

        return (
            <div>
                <div className='flex flex-col'>
                    { patch.filters.map((_filter, i) => <Filter key={`filter-${i}`} id={i} />) }
                </div>
                {addFilterButton}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-row flex-grow">                
                <div className={clsx("flex w-full", {"bg-amber-200 rounded-xl py-4": !contextStarted})}>

                    {/* Audio Context warning & Sidebar */}
                    { 
                        !contextStarted ? (
                            <div className="p-4 mb-2">
                                <p>You must manually start audio context before sound is produced!</p>
                                <br />
                                <button className="bg-amber-400 px-4 rounded-md w-full" onClick={startAudioContext}>Start</button>
                            </div>  
                        ) : <Sidebar />
                    }

                    <div className="flex flex-row gap-8 p-8 w-full">
                        {/* Oscillators */}
                        <div className='w-full'>
                            { defaultPatch.oscillators.map((_osc, i) => <Oscillator key={`osc-${i}`} id={i} />) }
                        </div>

                        {/* Mixer */}
                        <div className='w-full'>
                            <Mixer />
                        </div>

                        {/* Filters */}
                        <div className='w-full'>
                            {renderFilters()}
                        </div>
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
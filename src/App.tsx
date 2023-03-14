import React, { useEffect, useRef, useState } from 'react';
import { IPatch, handleMidiEvent } from './engine/AudioEngine';
import { GetMIDIMessage } from './engine/MIDIEngine';

const initialPatch: IPatch = {
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
      mix: 0.5
    }
};

const App: React.FC = () => {

  const audioContext = useRef<AudioContext | null>(null);
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);

  const [contextStarted, setContextStarted] = useState(false);

  const [patch, setPatch] = useState<IPatch>(initialPatch);
  
  /**
   * Initialise the AudioContext on mount, and close it on unmount.
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

  /**
   * Set up the MIDI input listeners when the MIDI access changes.
   * MIDI access is set when the user grants permission to use their MIDI devices.
   */

  const prevSynth = useRef();

  useEffect(() => {
    if (!midiAccess)
      return;

    function inputListener(message: any) {
      parseMessage(message);
    } 

    Array.from(midiAccess.inputs).forEach((input) => {
      log(`Setting up listener for ${input[1].name}`);
      input[1].addEventListener('midimessage', inputListener);
    });
    
    return () => {
      log("tes");
      log("Removing MIDI listeners...");
      
      Array.from(midiAccess.inputs).forEach((input) => {
        input[1].removeEventListener('midimessage', inputListener);
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

  function parseMessage(event: { data: any; }) {
    const midiMessage = GetMIDIMessage(event.data);

    if (midiMessage.message !== "unknown")            
      handleMidiEvent(midiMessage, audioContext.current!, patch)

    else log(midiMessage)
  }

  const startAudioContext = () => {
      console.log("Starting audio context...");
      audioContext.current!.resume();
      setContextStarted(true);
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
    console.log(patch.oscillators.length);

    return initialPatch.oscillators.map((osc, i) => {
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
      mixer = mixer;
  
      setPatch({
        ...patch,
        mixer
      });

  }

  const renderMixer = () => {
    return (
      <div>
        <h1>Mixer</h1>
        <label htmlFor="oscillatorMixSlider">Mix:</label>
        <input type="range" name="oscillatorMixSlider" id="oscillatorMixSlider" min="0" max="1" step="0.01" value={patch.mixer.mix} onChange={handleVolMixChange}/>
        <input type="number" name="oscillatorMix" id="oscillatorMix" min="0" max="1" step="0.1" value={patch.mixer.mix} onChange={handleVolMixChange}/>
        <p>L: OSC.1</p>
        <p>R: OSC.2</p>
      </div>
    );
  }

  return (
      <div className="App">
        {renderOscillators()}
        {renderMixer()}
      </div>
  );
}

const log = (message: any) => {
  if (process.env.REACT_APP_EXTENSIVE_LOGGING)
      console.log(`[App] ${message}`);
} 

export default App;

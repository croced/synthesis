import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";
import { Basic } from 'react-dial-knob';
import Card from "./Card";

interface Props {
    id: number;
};

const Oscillator: React.FC<Props> = ({ id }) => {
    const {patch, setPatch} = useContext(PatchContext);

    const handleWaveTypeChange = (event: React.ChangeEvent<HTMLSelectElement>, osc: 0 | 1) => {
        let oscillators = [...patch.oscillators];
        let oscillator = {...oscillators[osc]}; 
        oscillator.waveType = event.target.value as "sine" | "square" | "sawtooth" | "triangle";
        oscillators[osc] = oscillator;

        setPatch({
            ...patch,
            oscillators
        });
    };

    const handleOscDetuneChange = (e: any, osc: 0 | 1) => {
        let detuneValue: number = parseInt(e);
        if (isNaN(detuneValue)) detuneValue = 0;

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

    const handleOscOctaveChange = (e: any, osc: 0 | 1) => {
        let octaveValue: number = parseInt(e);
        if (isNaN(octaveValue)) octaveValue = 0;

        if (octaveValue > 3)
            octaveValue = 3;
        else if (octaveValue < -3)
            octaveValue = -3;

        let oscillators = [...patch.oscillators];
        let oscillator = {...oscillators[osc]}; 
        oscillator.octave = octaveValue;
        oscillators[osc] = oscillator;

        setPatch({
            ...patch,
            oscillators
        });  
    }

    return (
        <Card title={`OSC. ${id + 1}`}>
            <div className="flex">
                <div className="w-full mr-4">
                    <label htmlFor="oscillatorTypes">Type:</label>
                    <div className="flex">
                        <select name="oscillatorTypes" id="oscillatorTypes" value={patch.oscillators[id].waveType} onChange={(e) => handleWaveTypeChange(e, id as 0 | 1)}>
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-x-4">
                    <div>
                        <label htmlFor="oscillatorOctaveSlider">Octave:</label>
                        <Basic
                            diameter={40}
                            min={-3}
                            max={3}
                            step={1}
                            value={patch.oscillators[id].octave || 0}
                            onValueChange={(e) => handleOscOctaveChange(e, id as 0 | 1)}
                            ariaLabelledBy={'oscillatorOctaveSlider'}
                        />
                        <input type="number" className="mt-2 rounded-md" name="oscillatorOctave" id="oscillatorOctave" min="-3" max="3" value={patch.oscillators[id].octave} onChange={(e) => handleOscOctaveChange(e.target.value, id as 0 | 1)}/>
                    </div>
                    <div>
                    <label htmlFor="oscillatorDetuneSlider">Detune:</label>
                        <Basic
                            diameter={40}
                            min={-1200}
                            max={1200}
                            step={1}
                            value={patch.oscillators[id].detune || 0}
                            onValueChange={(e) => handleOscDetuneChange(e, id as 0 | 1)}
                            ariaLabelledBy={'oscillatorDetuneSlider'}
                        />
                        <input type="number" className="mt-2 rounded-md" name="oscillatorDetune" id="oscillatorDetune" min="-1200" max="1200" value={patch.oscillators[id].detune} onChange={(e) => handleOscDetuneChange(e.target.value, id as 0 | 1)}/>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default Oscillator;
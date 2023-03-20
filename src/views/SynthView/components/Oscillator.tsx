import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";
import { Basic } from 'react-dial-knob';

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

    return (
        <div className="bg-gray-200 px-4 mb-4 rounded-lg border-gray-400 border-2">
            <h1 className="pt-2 text-xl font-bold">OSC. {id + 1}</h1>

            <div className="flex">
                <div className="mt-2 w-3/4">
                    <label htmlFor="oscillatorTypes">Type:</label>
                    <div className="flex">
                        <select name="oscillatorTypes" id="oscillatorTypes" onChange={(e) => handleWaveTypeChange(e, id as 0 | 1)}>
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 pb-4">
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
    );
}

export default Oscillator;
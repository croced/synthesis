import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";

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

    return (
        <div>
            <h1>OSC. {id + 1}</h1>
            <label htmlFor="oscillatorTypes">Wave type:</label>
            <select name="oscillatorTypes" id="oscillatorTypes" onChange={(e) => handleWaveTypeChange(e, id as 0 | 1)}>
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
            </select>
            <br />
            <br />
            <label htmlFor="oscillatorDetuneSlider">Detune:</label>
            <input type="range" name="oscillatorDetuneSlider" id="oscillatorDetuneSlider" min="-1200" max="1200" step="1" value={patch.oscillators[id].detune} onChange={(e) => handleOscDetuneChange(e, id as 0 | 1)}/>
            <input type="number" name="oscillatorDetune" id="oscillatorDetune" min="-1200" max="1200" value={patch.oscillators[id].detune} onChange={(e) => handleOscDetuneChange(e, id as 0 | 1)}/>
        </div>
    );
}

export default Oscillator;
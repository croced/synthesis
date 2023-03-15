import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";

const Mixer: React.FC = () => {
    const {patch, setPatch} = useContext(PatchContext);

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
        );
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
    };

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

export default Mixer;
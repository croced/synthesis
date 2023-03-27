import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";
import Card from "./Card";

const Mixer: React.FC = () => {
    const {patch, setPatch} = useContext(PatchContext);

    const handleVolMixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let mixValue: number = parseFloat(event.target.value);
        if (isNaN(mixValue)) mixValue = 0.5;

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
        mixer.type = event.target.value as "volume" | "additive" | "am" | "fm";

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
            <div className="mt-2">
                <label htmlFor="carrierSignal">Carrier Signal</label>
                <div>
                    <select name="carrierSignal" id="carrierSignal" onChange={handleCarrierSignalChange}>
                        <option value="0">OSC. 1</option>
                        <option value="1">OSC. 2</option>
                    </select>
                </div>
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

    const renderVol = () => {
        return (
            <div className="mt-2">
                <label htmlFor="oscillatorMixSlider">Mix: { Math.ceil(patch.mixer.mix * 100) }%</label>

                <div>
                    <input type="range" className="w-full" name="oscillatorMixSlider" id="oscillatorMixSlider" min="0" max="1" step="0.01" value={patch.mixer.mix} onChange={handleVolMixChange}/>
                    <div className="mb-4">
                        <p className="float-left leading-3">OSC.1</p>
                        <p className="float-right leading-3">OSC.2</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderFM = () => {
        return (
            <div className="mt-2">
                <label htmlFor="fmIndexSelect">Modulation:</label>
                <div className="flex">
                    <div className="w-3/4">
                        <input type="range" name="fmIndexSelectSlider" id="fmIndexSelectSlider" min="0" max="100" step="1" value={patch.mixer.fmModIndex} onChange={handleFmIndexChange}/>
                    </div>
                    <input type="number" name="fmIndexSelect" id="fmIndexSelect" min="0" max="100" step="1" value={patch.mixer.fmModIndex} onChange={handleFmIndexChange}/>
                </div>
              
            </div>
        );
    };

    return (
        <Card title="MIXER">
            <div>
                <label htmlFor="mixerTypes">Mix type:</label>
                <div>
                    <select name="mixerTypes" id="mixerTypes" onChange={handleMixerTypeChange} value={patch.mixer.type}>
                        <option value="volume">Volume</option>
                        <option value="additive">Additive</option>
                        <option value="am">AM</option>
                        <option value="fm">FM</option>
                    </select>
                </div>
            </div>

            <div>
                {(patch.mixer.type === "am" || patch.mixer.type === "fm") && renderCarrierSelect()}
                {patch.mixer.type === "fm" && renderFM()}
                {patch.mixer.type === "volume" && renderVol()}
            </div>
        </Card>
    );
}

export default Mixer;
import React, { useContext } from "react";
import { PatchContext } from "../../../context/PatchContext";
import { Basic } from 'react-dial-knob';
import Card from "./Card";

interface Props {
    id: number;
};

const Filter: React.FC<Props> = ({ id }) => {
    const {patch, setPatch} = useContext(PatchContext);

    const handleSignalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let filters = [...patch.filters!];
        let filter = {...filters[id]}; 

        filter.signal = event.target.value as "1" | "2" | "combined";
        filters[id] = filter;

        setPatch({
            ...patch,
            filters
        });
    }

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let filters = [...patch.filters!];
        let filter = {...filters[id]}; 

        filter.type = event.target.value as "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "notch";
        filters[id] = filter;

        setPatch({
            ...patch,
            filters
        });
    };

    const handleFreqChange = (e: any) => {
        let freqVal: number = parseInt(e);
        if (isNaN(freqVal)) freqVal = 0;

        if (freqVal > 20000)
            freqVal = 20000;
        else if (freqVal < 20)
            freqVal = 20;

        let filters = [...patch.filters!];
        let filter = {...filters[id]}; 

        filter.frequency = freqVal;
        filters[id] = filter;

        setPatch({
            ...patch,
            filters
        });  
    };

    const handleEmphasisChange = (e: any) => {
        let qVal: number = parseInt(e);
        if (isNaN(qVal)) qVal = 0;

        if (qVal > 20)
            qVal = 20;
        else if (qVal < 0)
            qVal = 0;

        let filters = [...patch.filters!];
        let filter = {...filters[id]}; 

        filter.emphasis = qVal;
        filters[id] = filter;

        setPatch({
            ...patch,
            filters
        });  
    };

    const handleGainChange = (e: any) => {
        let gainVal: number = parseInt(e);
        if (isNaN(gainVal)) gainVal = 0;

        if (gainVal > 40)
            gainVal = 40;
        else if (gainVal < -40)
            gainVal = -40;

        let filters = [...patch.filters!];
        let filter = {...filters[id]}; 

        filter.gain = gainVal;
        filters[id] = filter;

        setPatch({
            ...patch,
            filters
        });  
    }

    const removeFilter = () => {
        let filters = [...patch.filters!];
        filters.splice(id, 1);

        setPatch({
            ...patch,
            filters
        });
    }

    return (
        <Card title={`FILTER. ${id + 1}`} onClose={removeFilter}>
            <div className="flex">
                <div className="flex flex-col w-full">
                    <div className="w-full mr-4">
                        <label htmlFor="filterSignal">Signal:</label>
                        <div className="flex">
                            <select name="filterSignal" id="filterSignal" value={patch.filters![id].signal} onChange={(e) => handleSignalChange(e)}>
                                <option value="1">OSC. 1</option>
                                <option value="2">OSC. 2</option>
                                <option value="combined">Combined</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full mr-4">
                        <label htmlFor="filterTypes">Type:</label>
                        <div className="flex">
                            <select name="filterTypes" id="filterTypes" value={patch.filters![id].type} onChange={(e) => handleTypeChange(e)}>
                                <option value="lowpass">lowpass</option>
                                <option value="highpass">highpass</option>
                                <option value="bandpass">bandpass</option>
                                <option value="lowshelf">lowshelf</option>
                                <option value="highshelf">highshelf</option>
                                <option value="notch">notch</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-x-4">
                    <div>
                        <label htmlFor="filterFrequency">Freq:</label>
                        <Basic
                            diameter={40}
                            min={20}
                            max={20000}
                            step={1}
                            value={patch.filters![id].frequency || 1000}
                            onValueChange={(e) => handleFreqChange(e)}
                            ariaLabelledBy={'filterFrequency'}
                        />
                        <input type="number" className="mt-2 rounded-md" name="filterFrequency" id="filterFrequency" min="20" max="20000" value={patch.filters![id].frequency} onChange={(e) => handleFreqChange(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="filterEmphasis">Emph:</label>
                        <Basic
                            diameter={40}
                            min={1}
                            max={20}
                            step={1}
                            value={patch.filters![id].emphasis || 0}
                            onValueChange={(e) => handleEmphasisChange(e)}
                            ariaLabelledBy={'filterEmphasis'}
                        />
                        <input type="number" className="mt-2 rounded-md" name="filterDetune" id="filterDetune" min="1" max="20" value={patch.filters![id].emphasis} onChange={(e) => handleEmphasisChange(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="filterGain">Gain:</label>
                        <Basic
                            diameter={40}
                            min={-40}
                            max={40}
                            step={1}
                            value={patch.filters![id].gain || 50}
                            onValueChange={(e) => handleGainChange(e)}
                            ariaLabelledBy={'filterGain'}
                        />
                        <input type="number" className="mt-2 rounded-md" name="filterGain" id="filterGain" min="-40" max="40" value={patch.filters![id].gain} onChange={(e) => handleGainChange(e.target.value)}/>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default Filter;
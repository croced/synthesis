import { useContext, useRef, useState } from 'react';
import { PatchContext } from '../../context/PatchContext';

const Sidebar: React.FC = () => {

    const { patch, setPatch } = useContext(PatchContext);

    const inputRef = useRef<any>();

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

    const handleMasterVolChange = (e: any) => {

    }

    const handleFileClick = (e: any) => {
        inputRef.current.click();
    }

    return (
        <div className="relative w-1/4 py-2 px-2 bg-gray-200 border-r-2 border-gray-500">

            <div>
                <label htmlFor="oscillatorMixSlider">Master Volume: { Math.ceil(0.5 * 100) }%</label>
                <div>
                    {/* todo: implement this properly (make AudioEngine a hook?) */}
                    <input type="range" className="w-full" name="masterVolSlider" id="masterVolSlider" min="0" max="1" step="0.01" value={0.5} onChange={handleMasterVolChange}/>
                </div>
            </div>

            <div className="flex w-full flex-col gap-y-2 absolute bottom-0 mb-2 pr-4">
                <button name="exportPatchBtn" className="bg-white text-black border-2 border-black px-4 rounded-md w-full" onClick={exportPatch}>Download Patch</button>
                <button name="importPatchBtn" className="bg-white text-black border-2 border-black px-4 rounded-md w-full" onClick={handleFileClick}>Import Patch</button>

                {/* hidden, but used to trigger the file input */}
                <input type="file" accept=".json" ref={inputRef} className="hidden" onChange={importPatch} />
            </div>
        </div>
    );
}

export default Sidebar;
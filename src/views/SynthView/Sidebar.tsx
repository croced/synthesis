import clsx from 'clsx';
import { useContext, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { PatchContext } from '../../context/PatchContext';

const Sidebar: React.FC = () => {

    const { patch, setPatch, defaultPatch } = useContext(PatchContext);

    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [currentPatchName, setCurrentPatchName] = useState<string>("untitled-patch");
    const [currentPatchNameVal, setCurrentPatchNameVal] = useState<string>("untitled-patch");

    const [patchBankIndex, setPatchBankIndex] = useState<number>(-1);

    const inputRef = useRef<any>();

    const exportPatch = () => {
        const jsonStr = JSON.stringify(patch);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
        const link = document.createElement('a');

        link.setAttribute('href', dataUri);
        link.setAttribute('download', `${currentPatchName || 'untitled-patch'}.json`);

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

    const onExportCancel = () => {
        setCurrentPatchNameVal("");
        setShowExportModal(false);
    }

    const onExportSubmit = () => {
        exportPatch();
        setCurrentPatchName(currentPatchNameVal);
        setShowExportModal(false);
    }

    const handleTestPatchClick = () => {
        setPatchBankIndex(0);
        setCurrentPatchName("test-patch");
        setPatch({"meta":{"version":1},"oscillators":[{"waveType":"sine","detune":0},{"waveType":"square","detune":-498}],"mixer":{"type":"additive","mix":0.5,"carrierOsc":0,"fmModIndex":50}});
    }

    const handlePatchReset = () => {
        setPatchBankIndex(-1);
        setCurrentPatchName("untitled-patch");
        setPatch(defaultPatch);
    }

    return (
        <>
            <Modal isOpen={showExportModal} onClose={onExportCancel} onSubmit={onExportSubmit}>
                <div className="sm:flex sm:items-start">
                    <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                            className="text-lg leading-6 font-medium text-gray-900"
                            id="modal-headline"
                        >
                            Enter patch name
                        </h3>
                        <div className="mt-2">
                            <input
                                type="text"
                                value={currentPatchNameVal}
                                onChange={(e) => setCurrentPatchNameVal(e.target.value)}
                                placeholder='untitled-patch'
                                className="border border-gray-300 p-2 rounded-md w-full"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            <div className="relative w-1/2 py-2 px-2 bg-gray-200 border-r-2 border-gray-500">

                {/* master volume */}
                <div>
                    <label htmlFor="oscillatorMixSlider">Master Volume: { Math.ceil(0.5 * 100) }%</label>
                    <div>
                        {/* todo: implement this properly (make AudioEngine a hook?) */}
                        <input type="range" className="w-full" name="masterVolSlider" id="masterVolSlider" min="0" max="1" step="0.01" value={0.5} onChange={handleMasterVolChange}/>
                    </div>
                </div>

                {/* patch selector */}
                <div className='mt-4 w-full bg-white py-8 px-4 rounded-md border-2 border-black'>
                    <div className='flex flex-col'>
                        <div className="items-center">
                            <p>{currentPatchName || "untitled-patch"}</p>
                        </div>
                        <p className='mt-4 font-bold'>My Patch Bank</p>
                        <p className="hover:cursor-pointer" onClick={handlePatchReset}>(reset)</p>
                        <div className='flex gap-x-12 mt-4'>
                            <div>
                                <p className={clsx('hover:cursor-pointer', {'underline': patchBankIndex === 0})}>
                                    <span onClick={handleTestPatchClick}>001: test-patch</span>
                                </p>
                                <p>
                                    <span className='text-gray-500'>002: flute</span>
                                </p>
                                <p>
                                    <span className='text-gray-500'>003: string ensemble</span>
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className='text-gray-500'>004: chime</span>
                                </p>
                                <p>
                                    <span className='text-gray-500'>005: swarm</span>
                                </p>
                                <p>
                                    <span className='text-gray-500'>006: kick-1</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* patch import/export controls */}
                <div className="flex mt-4 w-full flex-col gap-y-2 mb-2 pr-4">
                    <button name="exportPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full" onClick={() => setShowExportModal(true)}>Download Patch</button>
                    <button name="importPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full" onClick={handleFileClick}>Import Patch</button>
                    <button name="exportPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full">Publish Patch</button>

                    {/* hidden, but used to trigger the file input */}
                    <input type="file" accept=".json" ref={inputRef} className="hidden" onChange={importPatch} />
                </div>
            </div>
        </>
    );
}

export default Sidebar;
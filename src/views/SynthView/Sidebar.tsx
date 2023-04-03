import axios from 'axios';
import clsx from 'clsx';
import { useContext, useEffect, useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { PatchContext } from '../../context/PatchContext';
import { IPatch } from '../../engine/AudioEngine';
import { AuthContext } from '../../reducers/AuthReducer';

type PatchModel = IPatch & {_id: any};

const Sidebar: React.FC = () => {

    const { patch, setPatch, defaultPatch } = useContext(PatchContext);
    const { user } = useContext(AuthContext);

    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

    const [currentPatchName, setCurrentPatchName] = useState<string>("untitled-patch");
    const [currentPatchNameVal, setCurrentPatchNameVal] = useState<string>("untitled-patch");

    const [patchBank, setPatchBank] = useState<PatchModel[]>([]);
    const [patchBankIndex, setPatchBankIndex] = useState<number>(-1);

    const inputRef = useRef<any>();

    useEffect(() => {
        (async () => {

            if (!user) return;

            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getPatches/${user}`);
                if (res.data.patches)
                {
                    setPatchBank(res.data.patches);
                } else console.log('User has no patches! Patch bank will be lonely...');
            } 
            catch (err: any) {
                console.log("Something went wrong!");
            }
        })();
    }, []);

    useEffect(() => {
        console.log(`My patch bank:`, patchBank);
    }, [patchBank]);
    
    const exportPatch = () => {

        // todo: find a better way to set the metadata?
        const patchJson = {
            ...patch,
            meta: {
                version: 1,
                author: "synthesis",
                name: currentPatchNameVal || "untitled-patch"
            }
        };

        const jsonStr = JSON.stringify(patchJson);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
        const link = document.createElement('a');

        link.setAttribute('href', dataUri);
        link.setAttribute('download', `${currentPatchNameVal || 'untitled-patch'}.json`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const publishPatch = async () => {

        // todo: find a better way to do set the metadata/
        const patchJson = {
            ...patch,
            meta: {
                version: 1,
                author: "synthesis",
                name: currentPatchNameVal || "untitled-patch"
            }
        };

        const patchStr = JSON.stringify(patchJson);

        if (!patchStr)
        {
            console.log("Patch is empty!"); // shouldn't ever happen
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/publishPatch`, {
                patch: patchStr,
            });

            console.log("Patch published!", res.data.patch);

            setPatchBank([...patchBank, res.data.patch]);
            setPatchBankIndex(patchBank.length + 1);
        } 
        catch (err: any) {
           console.log("Something went wrong!");
        }

    };

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

    const renderPatchBank = () => {
        
        const savedPatches = patchBank.map((patch, index) => {
            return (
                <div className='flex gap-x-4' key={`patch-${patch._id}`}>
                    <p key={index} className={clsx('hover:cursor-pointer', {'underline': patchBankIndex === index + 1})}>
                            <span onClick={() => {
                                setPatchBankIndex(index + 1);
                                setPatch(patch);
                            }}>{index + 1}: {patch.meta.name}</span>
                    </p>
                    <Link to={`/patches/${patch._id}`}>(info)</Link>
                </div>
            )
        });
        
        return (
            <div className='flex gap-x-12 mt-4'>
                <div>
                    {/* <p className={clsx('hover:cursor-pointer', {'underline': patchBankIndex === 0})}>
                        <span onClick={handleTestPatchClick}>001: test-patch</span>
                    </p> */}
                    {/* <p>
                        <span className='text-gray-500'>002: flute</span>
                    </p>
                    <p>
                        <span className='text-gray-500'>003: string ensemble</span>
                    </p> */}

                    {savedPatches}
                </div>
                {/* <div>
                    <p>
                        <span className='text-gray-500'>004: chime</span>
                    </p>
                    <p>
                        <span className='text-gray-500'>005: swarm</span>
                    </p>
                    <p>
                        <span className='text-gray-500'>006: kick-1</span>
                    </p>
                </div> */}
            </div>
        )
    }

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

    const onPublishCancel = () => {
        setCurrentPatchNameVal("");
        setShowPublishModal(false);
    }

    const onPublishSubmit = async () => {
        await publishPatch();
        setCurrentPatchName(currentPatchNameVal);
        setShowPublishModal(false);
    };

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

            <Modal isOpen={showPublishModal} onClose={onPublishCancel} onSubmit={onPublishSubmit}>
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
                            <p>{patch.meta.name || "untitled-patch"}</p>
                        </div>
                        <p className='mt-4 font-bold'>My Patch Bank</p>
                        <p className="hover:cursor-pointer" onClick={handlePatchReset}>(reset)</p>
                        { renderPatchBank() }
                    </div>
                </div>

                {/* patch import/export controls */}
                <div className="flex mt-4 w-full flex-col gap-y-2 mb-2 pr-4">
                    <button name="exportPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full" onClick={() => setShowExportModal(true)}>Download Patch</button>
                    <button name="importPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full" onClick={handleFileClick}>Import Patch</button>
                    <button name="exportPatchBtn" className="bg-white text-black border-2 border-black p-4 rounded-md w-full" onClick={() => setShowPublishModal(true)}>Publish Patch</button>

                    {/* hidden, but used to trigger the file input */}
                    <input type="file" accept=".json" ref={inputRef} className="hidden" onChange={importPatch} />
                </div>
            </div>
        </>
    );
}

export default Sidebar;
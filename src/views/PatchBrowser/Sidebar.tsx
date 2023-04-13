import axios from 'axios';
import { useContext, useEffect} from 'react';
import { Link } from 'react-router-dom';
import usePatchBank, { PatchContext } from '../../context/PatchContext';
import { AuthContext } from '../../reducers/AuthReducer';

const Sidebar: React.FC = () => {

    const { patchBank, removeFromPatchBank } = usePatchBank();
    const { user } = useContext(AuthContext);

    const renderPatchBank = () => {
        
        if (!patchBank) return <p>(Empty)</p>;

        const savedPatches = patchBank.map((patch, index) => {
            return (
                <div className='relative flex flex-row gap-x-4' key={`patch-${patch._id}`}>
                    <p key={index} className='hover:cursor-pointer'>
                            <span>{index + 1}: {patch.meta.name}</span>
                    </p>
                    <div className='absolute right-0 flex flex-row'>
                        <Link to={`/patches/${patch._id}`}>(info)</Link>
                        {
                            patch.meta.author !== user ? (
                                <p className="hover:cursor-pointer" onClick={() => removeFromPatchBank(patch._id)}>(remove)</p>
                            ) : null
                        }
                    </div>
                  
                </div>
            )
        });
        
        return (
            <div className='flex flex-col'>
                {savedPatches}
            </div>
        )
    }

    return (
        <>
            <div className="relative w-1/3 py-2 px-2 bg-gray-200 border-r-2 border-gray-500">
                <p className='mt-4 font-bold'>My Patch Bank</p>

                {/* patch selector */}
                <div className='mt-2 w-full bg-white py-4 px-4 rounded-md border-2 border-black'>
                    <div className='flex flex-col'>
                        { renderPatchBank() }
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
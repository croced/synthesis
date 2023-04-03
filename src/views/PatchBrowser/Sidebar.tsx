import axios from 'axios';
import { useContext, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { PatchContext } from '../../context/PatchContext';
import { AuthContext } from '../../reducers/AuthReducer';

const Sidebar: React.FC = () => {

    const { patchBank, setPatchBank } = useContext(PatchContext);
    const { user } = useContext(AuthContext);

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
    }, [user, setPatchBank]);

    const renderPatchBank = () => {
        
        if (!patchBank) return <p>(Empty)</p>;

        const savedPatches = patchBank.map((patch, index) => {
            return (
                <div className='flex gap-x-4' key={`patch-${patch._id}`}>
                    <p key={index} className='hover:cursor-pointer'>
                            <span>{index + 1}: {patch.meta.name}</span>
                    </p>
                    <Link to={`/patches/${patch._id}`}>(info)</Link>
                </div>
            )
        });
        
        return (
            <div className='flex gap-x-12'>
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
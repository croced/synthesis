import clsx from 'clsx';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatchContext, PatchModel } from '../context/PatchContext';

interface PatchCardProps {
    patch: PatchModel;
}

const PatchCard: React.FC<PatchCardProps> = ({patch}) => {

    const {patchBank, setPatchBank, setPatch} = useContext(PatchContext);

    let navigate = useNavigate();

    const handleAddPatch = (patch: PatchModel) => {

        if (patchInBank(patch)) return;

        setPatchBank([...patchBank, patch]);
    };

    const handlePlayPatch = (patch: PatchModel) => {
        setPatch(patch);
        navigate('/');
    }

    const patchInBank = (patch: PatchModel) => {
        let matchFound = false;
        patchBank.map((p) => {
            if (p._id === patch._id) {
                matchFound = true;
                return;
            };
        });

        return matchFound;
    };

    return (
        <div className='p-2 bg-gray-200 border-2 border-gray-500 rounded-md'>
            <div className='flex relative'>
                <div className='lex flex-col'>
                    <p className='font-bold'>{patch.meta.name}</p>
                    <p className='text-gray-600'>Example patch description...</p>
                </div>
                <div className='flex absolute right-0'>
                    <div>
                        <p>Created: <span className='text-gray-600'>03/04/2023</span></p>
                        <p>Author: <span className='text-gray-600'>{patch.meta.author}</span></p>
                    </div>
                    <div className='ml-4'>
                        <p 
                            className={clsx('hover:cursor-pointer', { 'hover:cursor-default text-gray-600': patchInBank(patch) })}
                            onClick={() => handleAddPatch(patch)}
                        >
                            {patchInBank(patch) ? '(Patch in bank)' : '(Add to my bank)'}
                        </p>
                        <p className='hover:cursor-pointer' onClick={() => handlePlayPatch(patch)}>(Play patch)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatchCard;
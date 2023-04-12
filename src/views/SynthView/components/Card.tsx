import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
}

const Card: React.FC<CardProps> = ({title, onClose, children}) => {

    return (
        <div className="bg-gray-200 h-fit pb-4 mb-4 rounded-lg border-gray-500 border-2">
            <div className='relative flex flex-row'>
                <h1 className="pt-2 px-4 pb-2 text-xl font-bold">{title}</h1>
                { onClose && (
                    <div className='absolute right-0 mt-2 mr-2'>
                        <button className='bg-gray-200 px-2 rounded-md' onClick={onClose}>X</button>
                    </div>
                )}
            </div>
            <div className="flex-grow border-t-2 border-gray-500"></div>

            <div className='px-4 mt-2'>
                { children }
            </div>
        </div>
    );

}

export default Card;
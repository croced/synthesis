import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({title, children}) => {

    return (
        <div className="bg-gray-200 h-fit pb-4 mb-4 rounded-lg border-gray-500 border-2">
            <h1 className="pt-2 px-4 pb-2 text-xl font-bold">{title}</h1>
            <div className="flex-grow border-t-2 border-gray-500"></div>

            <div className='px-4 mt-2'>
                { children }
            </div>
        </div>
    );

}

export default Card;
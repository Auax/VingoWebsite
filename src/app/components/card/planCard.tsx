import React from 'react';

interface PlanCardProps {
    title: string;
    description: string;
    bgA?: string;
    bgB?: string;
}

const PlanCard = ({title, description, bgA = '#151515', bgB = '#3b3b3b'}: PlanCardProps) => {
    return (
        <div className="flex flex-col w-full h-full p-8 rounded-3xl"
             style={{background: `linear-gradient(0deg, ${bgA}, ${bgB})`}}>
            <h2 className={`font-bold text-2xl`}>{title}</h2>
            <p>{description}</p>


        </div>
    );
};

export default PlanCard;
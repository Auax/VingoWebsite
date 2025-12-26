import React from 'react';
import Link from "next/link";

const Card = (props: {
    title: string;
    year: string;
    description: string;
    link: string;

    bgColor: string;
    textColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    bgDarkColor: string;
    textDarkColor: string;
    buttonDarkBgColor: string;
    buttonDarkTextColor: string;
}) => {
    return (
        <div className={`${props.bgColor} dark:${props.bgDarkColor} p-8 rounded-3xl flex flex-col`}>
            <h2 className={`${props.textColor} dark:${props.textDarkColor} font-bold text-2xl`}>{props.title}</h2>
            <span className={`${props.textColor} dark:${props.textDarkColor} text-md`}>{props.year}</span>
            <hr className="border-black/20 mt-2"/>
            <p className={`${props.textColor} dark:${props.textDarkColor} text-md mt-3`}>{props.description}</p>
            <Link href={props.link} target="_blank"
                  className={`${props.buttonTextColor} ${props.buttonBgColor} dark:${props.buttonDarkBgColor} dark:${props.buttonDarkTextColor} font-bold text-white px-6 py-2 self-start rounded-lg mt-6`}>View
                on GitHub</Link>
        </div>
    );
};

export default Card;
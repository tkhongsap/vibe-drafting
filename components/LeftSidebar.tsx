import React, { useState } from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import { BellIcon } from './icons/BellIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const NavItem: React.FC<{ children: React.ReactNode; active?: boolean; onClick: () => void; }> = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-5 p-3 rounded-full hover:bg-slate-800 transition-colors duration-200 w-fit ${active ? 'font-bold' : ''}`}>
        {children}
    </button>
);

const navItemsList = [
    { name: 'Home', icon: <HomeIcon className="w-7 h-7" /> },
    { name: 'Explore', icon: <HashtagIcon className="w-7 h-7" /> },
    { name: 'Notifications', icon: <BellIcon className="w-7 h-7" /> },
    { name: 'Profile', icon: <UserIcon className="w-7 h-7" /> },
];

export const LeftSidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('Home');

    return (
        <aside className="w-[275px] h-screen sticky top-0 px-2 py-1 flex-col justify-between hidden sm:flex">
            <div>
                <div className="p-3">
                    <SparklesIcon className="w-8 h-8 text-blue-500" />
                </div>
                <nav className="flex flex-col gap-1 mt-2">
                    {navItemsList.map((item) => (
                        <NavItem
                            key={item.name}
                            active={activeItem === item.name}
                            onClick={() => setActiveItem(item.name)}
                        >
                            {item.icon}
                            <span className="text-xl">{item.name}</span>
                        </NavItem>
                    ))}
                </nav>
                <button className="w-[90%] mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors duration-200">
                    Post
                </button>
            </div>
            <div className="py-4">
                 <button className="flex items-center gap-3 p-3 rounded-full w-full hover:bg-slate-800">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                    <div className="text-left leading-tight">
                        <p className="font-bold text-slate-200">Your Name</p>
                        <p className="text-sm text-slate-500">@yourhandle</p>
                    </div>
                </button>
            </div>
        </aside>
    );
};

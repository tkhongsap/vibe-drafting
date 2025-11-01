import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import { BellIcon } from './icons/BellIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import type { View } from '../types';
import type { User } from '../shared/schema';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface LeftSidebarProps {
    user: User;
    onLogout: () => void;
    // FIX: Changed type from string to the specific 'View' type for better type safety.
    currentView: View;
    // FIX: Changed callback signature to use 'View' type, resolving the mismatch with the parent's state setter.
    setView: (view: View) => void;
}

const NavItem: React.FC<{ children: React.ReactNode; active?: boolean; onClick: () => void; }> = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-5 p-3 rounded-full hover:bg-slate-800 transition-colors duration-200 w-fit ${active ? 'font-bold' : ''}`}>
        {children}
    </button>
);

// FIX: Added 'as const' to have TypeScript infer the narrowest possible types for keys, making them compatible with the 'View' type.
const navItemsList = [
    { name: 'Home', key: 'home', icon: <HomeIcon className="w-7 h-7" /> },
    { name: 'Explore', key: 'explore', icon: <HashtagIcon className="w-7 h-7" /> },
    { name: 'Notifications', key: 'notifications', icon: <BellIcon className="w-7 h-7" /> },
    { name: 'History', key: 'history', icon: <DocumentDuplicateIcon className="w-7 h-7" /> },
    { name: 'Profile', key: 'profile', icon: <UserIcon className="w-7 h-7" /> },
] as const;

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, onLogout, currentView, setView }) => {

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
                            active={currentView === item.key}
                            onClick={() => setView(item.key)}
                        >
                            {item.icon}
                            <span className="text-xl">{item.name}</span>
                        </NavItem>
                    ))}
                    <NavItem onClick={onLogout}>
                        <LogoutIcon className="w-7 h-7" />
                        <span className="text-xl">Logout</span>
                    </NavItem>
                </nav>
                <button className="w-[90%] mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors duration-200">
                    Post
                </button>
            </div>
            <div className="py-4">
                 <button className="flex items-center gap-3 p-3 rounded-full w-full hover:bg-slate-800">
                    <div className="w-10 h-10 rounded-full flex-shrink-0" aria-label="User avatar">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt={user.firstName || user.email || 'User'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">
                            {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                    </div>
                    <div className="text-left leading-tight">
                        <p className="font-bold text-slate-200">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email || 'User'}
                        </p>
                        <p className="text-sm text-slate-500">{user.email || ''}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
};
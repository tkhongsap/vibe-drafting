import React from 'react';

export const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
    {...props}
    >
    <path 
        fillRule="evenodd" 
        d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 0v7.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75v-7.5a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75zM8 8a1 1 0 00-1 1v.006a1 1 0 002 0V9a1 1 0 00-1-1z" 
        clipRule="evenodd" 
    />
  </svg>
);

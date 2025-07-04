
import React from 'react';

type IconName = 'summary' | 'speakers' | 'mindmap' | 'download' | 'upload' | 'audio' | 'processing' | 'combined' | 'checkCircle' | 'xCircle';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'summary':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7V3z" />
          <path d="M9 16h2" /><path d="M9 12h4" /><path d="M9 8h4" />
        </svg>
      );
    case 'speakers':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
          <rect width="18" height="18" x="3" y="4" rx="2" /><circle cx="12" cy="10" r="2" />
          <line x1="8" x2="8" y1="2" y2="4" /><line x1="16" x2="16" y1="2" y2="4" />
        </svg>
      );
    case 'mindmap':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M12 3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
          <path d="M5 11a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
          <path d="M17 11a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
          <path d="M12 8v8" /><path d="M8.5 14h7" />
        </svg>
      );
    case 'combined':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 14h.01"></path>
            <path d="M13 18h.01"></path>
            <path d="M9 18h.01"></path>
            <path d="m13 14-.83-1.11a.5.5 0 0 0-.84.02L10.5 14H9"></path>
            <path d="m14 18-1-1-1.5 1.5"></path>
        </svg>
      );
    case 'download':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      );
    case 'upload':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        );
    case 'audio':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 19c-3.3 0-6-2.7-6-6V7c0-3.3 2.7-6 6-6s6 2.7 6 6v6c0 3.3-2.7 6-6 6Z"/><path d="M12 19v2"/><path d="M12 5v-2"/>
            </svg>
        );
    case 'processing':
        return(
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
        );
    case 'checkCircle':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      );
    case 'xCircle':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;

'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useMobile } from '@/hooks/useMobile';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({ 
  title, 
  showBackButton = true, 
  onBackClick,
  rightAction 
}: MobileHeaderProps) {
  const { isCapacitor, goBack } = useCapacitor();
  const { isMobile } = useMobile();

  if (!isMobile && !isCapacitor) {
    return null;
  }

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      goBack();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}
      </div>
      
      {rightAction && (
        <div className="flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
}
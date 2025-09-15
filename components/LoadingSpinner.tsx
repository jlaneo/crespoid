import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="w-12 h-12 border-4 border-notion-border rounded-full animate-spin" style={{ borderTopColor: '#2563EB' }}></div>
            <p className="text-notion-text-light font-semibold text-lg">{message}</p>
        </div>
    );
};
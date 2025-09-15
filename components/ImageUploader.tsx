import React, { useState, useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
    onIdentify: (file: File) => void;
    isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onIdentify, isLoading }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleIdentifyClick = () => {
        if (selectedFile) {
            onIdentify(selectedFile);
        }
    };
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
            <div
                className="w-full h-72 border-2 border-notion-border rounded-lg flex items-center justify-center text-notion-text-light hover:border-notion-accent hover:bg-notion-surface transition-all duration-300 cursor-pointer bg-notion-surface/50 mb-6 relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                />
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-4">
                        <CameraIcon className="mx-auto h-12 w-12 mb-2 text-notion-text-light" />
                        <p className="font-semibold text-notion-text">Haz clic o arrastra una imagen aquí</p>
                        <p className="text-sm">Sube una foto para identificar un animal.</p>
                    </div>
                )}
            </div>
            <button
                onClick={handleIdentifyClick}
                disabled={!selectedFile || isLoading}
                className="bg-notion-accent text-white font-bold text-lg py-3 px-12 rounded-md hover:bg-blue-700 disabled:bg-notion-border disabled:text-notion-text-light disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? 'Procesando...' : 'Identificar Animal'}
            </button>
        </div>
    );
};
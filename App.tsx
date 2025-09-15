import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FactSheet } from './components/FactSheet';
import { AnimalData } from './types';
import { identifyAnimal, generateAnimalImage } from './services/geminiService';
import { ApiKeyForm } from './components/ApiKeyForm';

// Helper to check if API key is configured.
const isApiKeyConfigured = (): boolean => {
    return !!(process.env.GEMINI_API_KEY);
};


const App: React.FC = () => {
    const [animalData, setAnimalData] = useState<AnimalData | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(isApiKeyConfigured());
    const [isImageAiGenerated, setIsImageAiGenerated] = useState<boolean>(true);

    const handleApiKeySubmit = (apiKey: string) => {
        sessionStorage.setItem('gemini-api-key', apiKey);
        
        // Polyfill the process.env for the current session without a page reload
        if (typeof (window as any).process === 'undefined') {
            (window as any).process = { env: {} };
        }
        (window as any).process.env.GEMINI_API_KEY = apiKey;
        
        // Clear previous errors and update the state to show the app instantly
        setError(null);
        setApiKeyReady(true);
    };
    
    const fileToDataAndBase64 = (file: File): Promise<{ base64: string, dataUrl: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, dataUrl });
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleIdentify = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setAnimalData(null);
        setGeneratedImageUrl('');
        setIsImageAiGenerated(true);
        
        try {
            setStatusMessage('Procesando imagen...');
            const { base64: base64Image, dataUrl: userImageUrl } = await fileToDataAndBase64(file);
            
            setStatusMessage('Identificando especie...');
            const data = await identifyAnimal(base64Image, file.type);
            setAnimalData(data);

            try {
                setStatusMessage('Generando foto del animal...');
                const imageUrl = await generateAnimalImage(
                    data.identification.commonName
                );
                setGeneratedImageUrl(imageUrl);
                setIsImageAiGenerated(true);
            } catch (imageGenError) {
                console.warn('AI image generation failed. Falling back to user-uploaded image.', imageGenError);
                setGeneratedImageUrl(userImageUrl);
                setIsImageAiGenerated(false);
            }

        } catch (err) {
            if (err instanceof Error && err.message.includes('API Key de Gemini no es válida')) {
                 sessionStorage.removeItem('gemini-api-key');
                 if ((window as any).process?.env) {
                    delete (window as any).process.env.GEMINI_API_KEY;
                 }
                 setError(err.message + " Por favor, configúrala de nuevo.");
                 setApiKeyReady(false);
            } else if (err instanceof Error) {
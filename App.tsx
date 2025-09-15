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
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleIdentify = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setAnimalData(null);
        setGeneratedImageUrl('');
        
        try {
            setStatusMessage('Identificando especie...');
            const base64Image = await fileToBase64(file);
            const data = await identifyAnimal(base64Image, file.type);
            setAnimalData(data);

            setStatusMessage('Generando foto del hábitat...');
            const imageUrl = await generateAnimalImage(data.identification.commonName, data.habitatAndBehavior.specificHabitat.text);
            setGeneratedImageUrl(imageUrl);

        } catch (err) {
            if (err instanceof Error && err.message.includes('API Key de Gemini no es válida')) {
                 sessionStorage.removeItem('gemini-api-key');
                 // Also clear the polyfilled env variable
                 if ((window as any).process?.env) {
                    delete (window as any).process.env.GEMINI_API_KEY;
                 }
                 setError(err.message + " Por favor, configúrala de nuevo.");
                 setApiKeyReady(false);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    }, []);
    
    const resetState = () => {
        setAnimalData(null);
        setGeneratedImageUrl('');
        setError(null);
        setIsLoading(false);
        setStatusMessage('');
    }

    if (!apiKeyReady) {
        return (
            <div className="min-h-screen bg-notion-bg flex flex-col items-center justify-center p-4">
                {error && (
                     <div className="text-center bg-red-900/50 border border-red-700 p-4 rounded-lg max-w-lg mx-auto mb-6">
                        <p className="text-red-300">{error}</p>
                     </div>
                )}
                <ApiKeyForm onApiKeySubmit={handleApiKeySubmit} />
            </div>
        );
    }
    
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner message={statusMessage} />;
        }
        if (error) {
            return (
                <div className="text-center bg-red-900/50 border border-red-700 p-6 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-2 text-red-300">
                        Error al procesar
                    </h2>
                    <p className="text-red-300">
                        {error}
                    </p>
                    <button
                        onClick={resetState}
                        className="mt-6 bg-notion-accent text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Intentar de Nuevo
                    </button>
                </div>
            );
        }
        if (animalData) {
            return (
                <div className="w-full">
                     <div className="text-center">
                        <button
                            onClick={resetState}
                            className="mb-4 bg-notion-surface border border-notion-border text-notion-text font-bold py-2 px-6 rounded-md hover:bg-notion-border transition-colors"
                        >
                            Identificar Otro Animal
                        </button>
                    </div>
                    <FactSheet data={animalData} imageUrl={generatedImageUrl} />
                </div>
            );
        }
        return <ImageUploader onIdentify={handleIdentify} isLoading={isLoading} />;
    };

    return (
        <div className="min-h-screen bg-notion-bg flex flex-col items-center p-4 sm:p-6 md:p-10">
            <header className="w-full max-w-4xl text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-notion-text">
                    BioScan
                </h1>
                <p className="text-lg text-notion-text-light mt-2">
                    Sube una foto y descubre todo sobre cualquier especie animal.
                </p>
            </header>

            <main className="w-full flex-grow flex flex-col items-center justify-center">
                {renderContent()}
            </main>

            <footer className="w-full max-w-4xl text-center text-notion-text-light mt-12 text-sm">
                <p>© 2025 BioScan. Creado por JL Arias con tecnologia AI.</p>
            </footer>
        </div>
    );
};

export default App;
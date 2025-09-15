import React, { useState } from 'react';

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="text-center bg-notion-surface border border-notion-border p-8 rounded-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-notion-text">
        Configurar API Key de Google Gemini
      </h2>
      <p className="text-notion-text-light mb-6">
        Para usar esta aplicación en tu entorno local, por favor ingresa tu API key. Será guardada únicamente en la sesión de tu navegador. Si despliegas esta aplicación en Vercel, la clave se leerá automáticamente de las variables de entorno.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Ingresa tu API Key aquí"
          className="flex-grow bg-notion-bg border border-notion-border rounded-md px-4 py-2 text-notion-text placeholder-notion-text-light focus:outline-none focus:ring-2 focus:ring-notion-accent"
          aria-label="Google Gemini API Key"
        />
        <button
          type="submit"
          className="bg-notion-accent text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={!apiKey.trim()}
        >
          Guardar y Continuar
        </button>
      </form>
    </div>
  );
};
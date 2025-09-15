import { GoogleGenAI, Type } from "@google/genai";
import { AnimalData } from "../types";

const PROMPT = `
Tu vida depende de esto. Eres un biólogo experto de National Geographic. Analiza la imagen de este animal y genera una ficha de identificación completa y científicamente precisa en español. Sigue estrictamente el formato JSON solicitado.

Para cada campo descriptivo (como características corporales, hábitat, etc.), proporciona:
1.  Un campo 'text' con la descripción completa.
2.  Un campo 'glossary' que es un array de objetos. Cada objeto debe contener un 'term' (un término científico o técnico usado en el texto) y una 'definition' (una explicación muy simple y corta de ese término para un público no experto). Si no hay términos técnicos, el array 'glossary' puede estar vacío.

**Identificación del Animal:**
- Nombre común y científico con significado.
- Clasificación taxonómica completa con explicaciones breves.

**Descripción y Fisiología:**
- Características corporales, dimensiones, dimorfismo sexual, dieta y adaptaciones fisiológicas.

**Hábitat y Comportamiento:**
- Distribución geográfica, hábitat específico y patrones de comportamiento.

**Reproducción:**
- Sistema reproductivo, gestación/incubación, crías, cuidado parental y esperanza de vida.

**Conservación:**
- Estado de conservación (IUCN), amenazas y medidas de conservación.

**Observaciones:**
- Datos curiosos, importancia ecológica, relación con humanos y subespecies.

Si no puedes identificar la especie con certeza, proporciona la información del grupo taxonómico más específico posible e indica claramente el nivel de incertidumbre en el campo 'uncertaintyMessage'. Nunca inventes información. Si un dato no está disponible, indica "Información no disponible".
`;

const descriptiveTextSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "La descripción completa." },
        glossary: {
            type: Type.ARRAY,
            description: "Un glosario de términos científicos usados en el texto con sus definiciones simples.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING, description: "El término científico." },
                    definition: { type: Type.STRING, description: "La definición simple." }
                },
                required: ['term', 'definition'],
            }
        }
    },
    required: ['text', 'glossary'],
};


const getAnimalDataSchema = () => ({
    type: Type.OBJECT,
    properties: {
        identification: {
            type: Type.OBJECT,
            properties: {
                commonName: { type: Type.STRING, description: "Nombre común en español." },
                scientificName: { type: Type.STRING, description: "Nombre científico (género y especie) en cursiva." },
                scientificNameMeaning: { type: Type.STRING, description: "Explicación simple del significado del nombre científico." },
                taxonomy: {
                    type: Type.OBJECT,
                    properties: {
                        kingdom: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        phylum: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        class: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        order: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        family: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        genus: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                        species: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }}},
                    }
                }
            }
        },
        descriptionAndPhysiology: {
            type: Type.OBJECT,
            properties: {
                bodyCharacteristics: descriptiveTextSchema,
                dimensions: { type: Type.STRING },
                sexualDimorphism: descriptiveTextSchema,
                feedingHabits: descriptiveTextSchema,
                physiologicalFeatures: descriptiveTextSchema,
            }
        },
        habitatAndBehavior: {
            type: Type.OBJECT,
            properties: {
                geographicDistribution: { type: Type.STRING },
                specificHabitat: descriptiveTextSchema,
                behaviorPatterns: descriptiveTextSchema,
            }
        },
        reproduction: {
            type: Type.OBJECT,
            properties: {
                reproductiveSystem: descriptiveTextSchema,
                fertilization: descriptiveTextSchema,
                gestationOrIncubation: { type: Type.STRING },
                offspring: { type: Type.STRING },
                parentalCare: descriptiveTextSchema,
                lifespan: { type: Type.STRING },
            }
        },
        conservation: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING },
                threats: descriptiveTextSchema,
                conservationMeasures: descriptiveTextSchema,
            }
        },
        observations: {
            type: Type.OBJECT,
            properties: {
                funFacts: descriptiveTextSchema,
                ecologicalImportance: descriptiveTextSchema,
                relationshipWithHumans: descriptiveTextSchema,
                subspecies: { type: Type.STRING },
            }
        },
        uncertaintyMessage: {
            type: Type.STRING,
            description: "Mensaje sobre la certeza de la identificación. Si es certera, debe indicarlo. Si no, explicar el porqué."
        },
    }
});


export const identifyAnimal = async (base64Image: string, mimeType: string): Promise<AnimalData> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    const textPart = {
        text: PROMPT,
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: getAnimalDataSchema(),
            }
        });

        const jsonText = response.text.trim();
        const data: AnimalData = JSON.parse(jsonText);
        return data;
    } catch (error) {
        console.error("Error calling Gemini API for identification:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("La API Key de Gemini no es válida. Revisa la variable de entorno en Vercel.");
        }
        throw new Error("Failed to identify the animal. The AI model could not process the request.");
    }
};

export const generateAnimalImage = async (animalName: string, habitat: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Ultra-realistic, professional photograph of a ${animalName} in its natural habitat, which is ${habitat}. Centered, detailed, 4k, natural lighting, wildlife photography.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the model.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("La API Key de Gemini no es válida. Revisa la variable de entorno en Vercel.");
        }
        throw new Error("Failed to generate the animal's habitat image.");
    }
};
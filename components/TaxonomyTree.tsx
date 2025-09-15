import React from 'react';
import { AnimalData } from '../types';

interface TaxonomyTreeProps {
    taxonomy: AnimalData['identification']['taxonomy'];
}

type TaxonomyLevel = keyof AnimalData['identification']['taxonomy'];

const taxonomyLevels: TaxonomyLevel[] = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
const levelTranslations: Record<TaxonomyLevel, string> = {
    kingdom: 'Reino',
    phylum: 'Filo',
    class: 'Clase',
    order: 'Orden',
    family: 'Familia',
    genus: 'Género',
    species: 'Especie',
}

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({ taxonomy }) => {
    return (
        <div className="space-y-1">
            {taxonomyLevels.map((level, index) => {
                const item = taxonomy[level];
                if (!item || !item.name) return null;

                return (
                    <div key={level} className="flex items-start py-2 border-b border-notion-border last:border-b-0">
                        <div className="w-1/3 font-semibold text-notion-text-light pr-4 text-right">
                           {levelTranslations[level]}
                        </div>
                        <div className="w-2/3">
                            <p className="font-medium text-notion-text italic">{item.name}</p>
                            <p className="text-notion-text-light text-sm">{item.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
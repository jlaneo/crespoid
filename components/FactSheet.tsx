import React, { useRef } from 'react';
import { AnimalData, DescriptiveText } from '../types';
import { Section } from './Section';
import { TaxonomyTree } from './TaxonomyTree';
import { DownloadIcon } from './icons/DownloadIcon';
import { Tooltip } from './Tooltip';

const GlossaryText: React.FC<{ content?: DescriptiveText }> = ({ content }) => {
    if (!content || !content.text) {
        return <>{content?.text || 'Información no disponible'}</>;
    }

    if (!content.glossary || content.glossary.length === 0) {
        return <>{content.text}</>;
    }

    const sortedGlossary = [...content.glossary].sort((a, b) => b.term.length - a.term.length);
    const termsRegex = new RegExp(`\\b(${sortedGlossary.map(g => g.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = content.text.split(termsRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;
                const lowerPart = part.toLowerCase();
                const glossaryItem = sortedGlossary.find(g => g.term.toLowerCase() === lowerPart);

                if (glossaryItem) {
                    return (
                        <Tooltip key={`${glossaryItem.term}-${index}`} definition={glossaryItem.definition}>
                            {part}
                        </Tooltip>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </>
    );
};

interface FactSheetProps {
    data: AnimalData;
    imageUrl: string;
}

export const FactSheet: React.FC<FactSheetProps> = ({ data, imageUrl }) => {
    const factSheetRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = () => {
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        if (factSheetRef.current && jsPDF && html2canvas) {
            html2canvas(factSheetRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#191919', // Use notion-bg color
                 onclone: (document: any) => {
                    // Hide tooltips before rendering PDF to prevent them from being captured
                    document.querySelectorAll('.relative.inline-block > div').forEach((el: any) => {
                        el.style.visibility = 'hidden';
                    });
                }
            }).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${data.identification.commonName.replace(/\s/g, '_')}_ficha.pdf`);
            });
        }
    };

    const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 py-3 border-b border-notion-border last:border-b-0">
            <p className="font-semibold text-notion-text-light">{label}</p>
            <div className="col-span-2 text-notion-text">{children}</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto my-10">
            <div className="text-right mb-4">
                <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center bg-notion-surface border border-notion-border text-notion-text font-bold py-2 px-4 rounded-md hover:bg-notion-border transition-colors duration-300"
                >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Descargar PDF
                </button>
            </div>
            <div ref={factSheetRef} className="bg-notion-surface p-8 sm:p-12 rounded-lg shadow-2xl">
                <header className="text-left mb-8">
                    <h1 className="text-5xl font-extrabold text-notion-text tracking-tight">
                        {data.identification.commonName}
                    </h1>
                    <p className="text-2xl text-notion-text-light italic mt-2">
                        {data.identification.scientificName}
                    </p>
                </header>

                {data.uncertaintyMessage && data.uncertaintyMessage.toLowerCase().includes('no') === false && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-md relative mb-8" role="alert">
                        <strong className="font-bold">Nota de Identificación: </strong>
                        <span className="block sm:inline">{data.uncertaintyMessage}</span>
                    </div>
                )}
                
                <div className="w-full aspect-[4/3] rounded-md overflow-hidden shadow-lg mb-10">
                    {imageUrl ? (
                        <img src={imageUrl} alt={`AI-generated image of a ${data.identification.commonName} in its habitat`} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-notion-border flex items-center justify-center">
                            <p className="text-notion-text-light">Generando imagen...</p>
                        </div>
                     )}
                </div>

                <Section title="Identificación y Taxonomía">
                    <InfoRow label="Nombre Científico">{data.identification.scientificNameMeaning}</InfoRow>
                    <div className="pt-4">
                        <TaxonomyTree taxonomy={data.identification.taxonomy} />
                    </div>
                </Section>
                
                <Section title="Descripción y Fisiología">
                    <InfoRow label="Características"><GlossaryText content={data.descriptionAndPhysiology.bodyCharacteristics} /></InfoRow>
                    <InfoRow label="Dimensiones">{data.descriptionAndPhysiology.dimensions}</InfoRow>
                    <InfoRow label="Dimorfismo Sexual"><GlossaryText content={data.descriptionAndPhysiology.sexualDimorphism} /></InfoRow>
                    <InfoRow label="Alimentación"><GlossaryText content={data.descriptionAndPhysiology.feedingHabits} /></InfoRow>
                    <InfoRow label="Adaptaciones"><GlossaryText content={data.descriptionAndPhysiology.physiologicalFeatures} /></InfoRow>
                </Section>

                <Section title="Hábitat y Comportamiento">
                    <InfoRow label="Distribución">{data.habitatAndBehavior.geographicDistribution}</InfoRow>
                    <InfoRow label="Hábitat"><GlossaryText content={data.habitatAndBehavior.specificHabitat} /></InfoRow>
                    <InfoRow label="Comportamiento"><GlossaryText content={data.habitatAndBehavior.behaviorPatterns} /></InfoRow>
                </Section>

                <Section title="Reproducción">
                    <InfoRow label="Sistema Reproductivo"><GlossaryText content={data.reproduction.reproductiveSystem} /></InfoRow>
                    <InfoRow label="Fecundación"><GlossaryText content={data.reproduction.fertilization} /></InfoRow>
                    <InfoRow label="Gestación/Incubación">{data.reproduction.gestationOrIncubation}</InfoRow>
                    <InfoRow label="Crías">{data.reproduction.offspring}</InfoRow>
                    <InfoRow label="Cuidado Parental"><GlossaryText content={data.reproduction.parentalCare} /></InfoRow>
                    <InfoRow label="Esperanza de Vida">{data.reproduction.lifespan}</InfoRow>
                </Section>
                
                <Section title="Conservación">
                     <InfoRow label="Estado (IUCN)">{data.conservation.status}</InfoRow>
                     <InfoRow label="Amenazas"><GlossaryText content={data.conservation.threats} /></InfoRow>
                     <InfoRow label="Medidas"><GlossaryText content={data.conservation.conservationMeasures} /></InfoRow>
                </Section>
                
                <Section title="Observaciones Adicionales">
                    <InfoRow label="Datos Curiosos"><GlossaryText content={data.observations.funFacts} /></InfoRow>
                    <InfoRow label="Importancia Ecológica"><GlossaryText content={data.observations.ecologicalImportance} /></InfoRow>
                    <InfoRow label="Relación con Humanos"><GlossaryText content={data.observations.relationshipWithHumans} /></InfoRow>
                    <InfoRow label="Subespecies">{data.observations.subspecies}</InfoRow>
                </Section>
            </div>
        </div>
    );
};
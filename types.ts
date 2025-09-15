
export interface DescriptiveText {
  text: string;
  glossary: {
    term: string;
    definition: string;
  }[];
}

export interface AnimalData {
  identification: {
    commonName: string;
    scientificName: string;
    scientificNameMeaning: string;
    taxonomy: {
      kingdom: { name: string; description: string };
      phylum: { name: string; description: string };
      class: { name: string; description: string };
      order: { name: string; description: string };
      family: { name: string; description: string };
      genus: { name: string; description: string };
      species: { name: string; description: string };
    };
  };
  descriptionAndPhysiology: {
    bodyCharacteristics: DescriptiveText;
    dimensions: string;
    sexualDimorphism: DescriptiveText;
    feedingHabits: DescriptiveText;
    physiologicalFeatures: DescriptiveText;
  };
  habitatAndBehavior: {
    geographicDistribution: string;
    specificHabitat: DescriptiveText;
    behaviorPatterns: DescriptiveText;
  };
  reproduction: {
    reproductiveSystem: DescriptiveText;
    fertilization: DescriptiveText;
    gestationOrIncubation: string;
    offspring: string;
    parentalCare: DescriptiveText;
    lifespan: string;
  };
  conservation: {
    status: string;
    threats: DescriptiveText;
    conservationMeasures: DescriptiveText;
  };
  observations: {
    funFacts: DescriptiveText;
    ecologicalImportance: DescriptiveText;
    relationshipWithHumans: DescriptiveText;
    subspecies: string;
  };
  uncertaintyMessage: string;
}
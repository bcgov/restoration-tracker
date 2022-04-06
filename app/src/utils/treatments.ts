import { IGetTreatmentItem } from 'interfaces/useProjectApi.interface';

export const groupTreatmentsByYear = (treatments: IGetTreatmentItem[]): Record<string, string> => {
  const treatmentsByYearSet: { [key: string]: Set<string> } = {};

  treatments.forEach((item) => {
    if (!treatmentsByYearSet[item.treatment_year]) {
      treatmentsByYearSet[item.treatment_year] = new Set();
      treatmentsByYearSet[item.treatment_year].add(item.treatment_name);
    } else {
      treatmentsByYearSet[item.treatment_year].add(item.treatment_name);
    }
  });

  const treatmentsByYearArray: Record<string, string> = {};

  Object.entries(treatmentsByYearSet).forEach(([key, value]) => {
    treatmentsByYearArray[key] = Array.from(value).filter(Boolean).sort().join(', ');
  });

  return treatmentsByYearArray;
};

export const getFormattedTreatmentStringsByYear = (treatmentsByYear: Record<string, string>): string[] => {
  return Object.entries(treatmentsByYear).map(([key, value]) => {
    return [key, value].filter(Boolean).join(' - ');
  });
};

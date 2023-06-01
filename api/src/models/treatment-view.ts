import { Feature } from 'geojson';

export interface ITreatmentUnit {
  id: string;
  type: string;
  width: number;
  length: number;
  area: number;
  comments: string;
  geometry: Feature;
}

export class GetTreatmentData {
  treatmentList: ITreatmentUnit[];

  constructor(treatmentData?: any) {
    const obj = {};

    treatmentData.forEach((item: any) => {
      if (!obj[item.id]) {
        obj[item.id] = {
          id: item.id,
          type: item.type,
          width: item.width,
          length: item.length,
          area: item.area,
          reconnaissance_conducted: item.reconnaissance_conducted,
          comments: item.comments,
          geometry: item.geojson[0], // Assuming only 1 feature per treatment unit
          treatments: [
            {
              treatment_name: item.treatment_name,
              treatment_year: item.treatment_year,
              implemented: item.implemented
            }
          ]
        };
      } else {
        obj[item.id].treatments.push({
          treatment_name: item.treatment_name,
          treatment_year: item.treatment_year,
          implemented: item.implemented
        });
      }
    });

    this.treatmentList = Object.values(obj);
  }
}

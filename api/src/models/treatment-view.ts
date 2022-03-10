export class GetTreatmentData {
  treatmentList: any;

  constructor(treatmentData?: any) {
    this.treatmentList = Object.values(
      treatmentData.reduce((obj: any, item: any) => {
        if (!obj[item.id]) {
          obj[item.id] = {
            ...item,
            treatments: [{ treatment_name: item.treatment_name, treatment_year: item.treatment_year }]
          };
        } else {
          obj[item.id].treatments.push({ treatment_name: item.treatment_name, treatment_year: item.treatment_year });
        }

        delete obj[item.id].treatment_name;
        delete obj[item.id].treatment_year;

        return obj;
      }, {})
    );
  }
}

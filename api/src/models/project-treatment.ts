export class GetTreatmentFeatureTypes {
  feature_type_id: number;
  name: string;
  description: string;
  record_effective_date: string;
  record_end_date: string;
  revision_count: number;

  constructor(obj?: any) {
    this.feature_type_id = obj.feature_type_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
    this.record_effective_date = obj?.record_effective_date || null;
    this.record_end_date = obj?.record_end_date || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

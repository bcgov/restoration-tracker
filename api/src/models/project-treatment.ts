import { Feature, Geometry } from 'geojson';
import { z } from 'zod';

export class GetTreatmentFeatureTypes {
  feature_type_id: number;
  name: string;
  description: string;

  constructor(obj?: any) {
    this.feature_type_id = obj.feature_type_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
  }
}

export class GetTreatmentTypes {
  treatment_type_id: number;
  name: string;
  description: string;

  constructor(obj?: any) {
    this.treatment_type_id = obj.treatment_type_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
  }
}

export interface ITreatmentUnitInsertOrExists {
  treatment_unit_id: number;
  revision_count: number;
}

export interface ITreatmentDataInsertOrExists {
  treatment_id: number;
  revision_count: number;
}

export interface ITreatmentTypeInsertOrExists {
  treatment_treatment_type_id: number;
  revision_count: number;
}

export type ValidTreatmentFeature = Feature<Geometry, ValidTreatmentFeatureProperties>;
export const ValidTreatmentFeatureProperties = (
  treatmentFeatureTypes: GetTreatmentFeatureTypes[],
  treatmentUnitTypes: GetTreatmentTypes[]
) =>
  z.object({
    TU_ID: TU_ID_SCHEMA,
    Year: YEAR_SCHEMA,
    Fe_Type: FE_TYPE_SCHEMA(treatmentFeatureTypes),
    Width_m: WIDTH_M_SCHEMA,
    Length_m: LENGTH_M_SCHEMA,
    Area_m2: AREA_M2_SCHEMA,
    Recce: RECCE_SCHEMA,
    Treatments: TREATMENTS_SCHEMA(treatmentUnitTypes),
    Implement: IMPLEMENT_SCHEMA,
    Comments: COMMENTS_SCHEMA
  });
export type ValidTreatmentFeatureProperties = z.infer<ReturnType<typeof ValidTreatmentFeatureProperties>>;

export const TU_ID_SCHEMA = z.preprocess(
  (input) => {
    const result = z.union([z.number().transform(String), z.string()]).safeParse(input);
    return result.success ? result.data : input;
  },
  z
    .string({
      errorMap: () => ({
        message: 'Must be a number or alphanumeric/text.'
      })
    })
    .trim()
    .min(1, 'Must be a number or alphanumeric/text.')
    .max(10, 'Must be a number or alphanumeric/text. Must be less than 300 characters long.')
);

export const YEAR_SCHEMA = z.coerce
  .number({
    errorMap: () => ({ message: 'Must be a 4 digit number.' })
  })
  .gte(1900, {
    message: 'Must be a 4 digit number. Must be greater than 1900'
  })
  .lte(2200, { message: 'Must be a 4 digit number. Must be less than 2200' });

export const FE_TYPE_SCHEMA = (treatmentFeatureTypes: GetTreatmentFeatureTypes[]) => {
  const errorMessage = `Must be one of: [ ${treatmentFeatureTypes.map((item) => item.name).join(', ')} ].`;
  return z.preprocess(
    (item) => String(item).toLowerCase().trim(),
    z
      .string()
      .refine((feType) => treatmentFeatureTypes.some((type) => type.name.toLowerCase() === feType), {
        message: errorMessage
      })
      .transform(
        // Transform known feature names into their corresponding ids
        (feType) => treatmentFeatureTypes.find((type) => type.name.toLowerCase() === feType)?.feature_type_id as number
      )
  );
};

export const WIDTH_M_SCHEMA = z
  .union([
    z.literal('').transform(() => null),
    z.literal(undefined).transform(() => null),
    z.coerce
      .number({
        errorMap: () => ({ message: 'Must be empty, or a positive number.' })
      })
      .gte(0, { message: 'Must be empty, or a positive number.' })
      .nullable(),
    z.nan().transform(() => null)
  ])
  .nullable();

export const LENGTH_M_SCHEMA = z
  .union([
    z.literal('').transform(() => null),
    z.literal(undefined).transform(() => null),
    z.coerce
      .number({
        errorMap: () => ({ message: 'Must be empty, or a positive number.' })
      })
      .gte(0, { message: 'Must be empty, or a positive number.' })
      .nullable(),
    z.nan().transform(() => null)
  ])
  .nullable();

export const AREA_M2_SCHEMA = z
  .number({
    errorMap: () => ({ message: 'Must be a positive number.' })
  })
  .gte(0, { message: 'Must be a positive number.' });

export const RECCE_SCHEMA = z
  .preprocess(
    (item) => String(item).toLowerCase().trim(),
    z.union(
      [
        z.literal('').transform(() => null),
        z.literal('undefined').transform(() => null),
        z.enum(['yes', 'no', 'not applicable'])
      ],
      {
        errorMap: () => ({
          message: 'Must be empty, or one of: [ Yes, No, Not Applicable ].'
        })
      }
    )
  )
  .nullable();

export const TREATMENTS_SCHEMA = (treatmentUnitTypes: GetTreatmentTypes[]) => {
  const errorMessage = `Must be one or more of: [ ${treatmentUnitTypes
    .map((item) => item.name)
    .join(', ')} ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").`;

  return z.preprocess(
    (item) =>
      String(item)
        .toLowerCase()
        .trim()
        .split(';')
        .filter(Boolean)
        .map((item) => item.trim()),
    z
      .array(z.string())
      .min(1, { message: errorMessage })
      .refine(
        // Check that all incoming treatment unit names are known valid treatment names
        (treatmentUnits) =>
          treatmentUnits.every((treatmentUnit) =>
            treatmentUnitTypes.map((type) => type.name.toLowerCase()).includes(treatmentUnit)
          ),
        {
          message: errorMessage
        }
      )
      .transform(
        // Transform incoming treatment unit names into their corresponding ids
        (treatmentUnits) =>
          treatmentUnits.map(
            (treatmentUnit) =>
              treatmentUnitTypes.find((type) => type.name.toLowerCase() === treatmentUnit)?.treatment_type_id as number
          )
      )
  );
};

export const IMPLEMENT_SCHEMA = z
  .preprocess(
    (item) => String(item).toLowerCase().trim(),
    z.union(
      [
        z.literal('').transform(() => null),
        z.literal('undefined').transform(() => null),
        z.enum(['yes', 'no', 'partial'])
      ],
      {
        errorMap: () => ({
          message: 'Must be empty, or one of: [ Yes, No, Partial ].'
        })
      }
    )
  )
  .nullable();

export const COMMENTS_SCHEMA = z
  .union(
    [
      z.literal('').transform(() => null),
      z.literal(undefined).transform(() => null),
      z
        .string({ errorMap: () => ({ message: 'Must be alphanumeric/text.' }) })
        .max(3000, 'Must be alphanumeric/text. Must be less than 3000 characters long.')
    ],
    { invalid_type_error: 'Must be alphanumeric/text.' }
  )
  .nullable();

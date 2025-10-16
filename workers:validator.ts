// workers/validator.ts
import Ajv from 'ajv';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

const ajv = new Ajv({ allErrors: true });

const validatorOutputSchema = {
    type: "object",
    properties: {
        valid: { type: "boolean" },
        errors: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        impact: { type: "string", enum: ["low", "medium", "high"] }
    },
    required: ["valid", "errors", "warnings", "impact"]
};

const visaPathSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1 },
        country_id: { type: "string" },
        type: { type: "string", enum: ["work", "study", "family", "retirement", "entrepreneur", "investor", "digital_nomad", "special"] },
        fees: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    label: { type: "string" },
                    amount: { type: ["number", "null"] },
                    currency: { type: "string", minLength: 3, maxLength: 3 }
                },
                required: ["label", "amount", "currency"]
            }
        },
        processing_time_range: {
            type: "object",
            properties: {
                min_days: { type: ["number", "null"] },
                max_days: { type: ["number", "null"] }
            }
        },
        last_verified_at: { type: "string", format: "date-time" }
    },
    required: ["name", "country_id", "type", "last_verified_at"],
    additionalProperties: true
};

ajv.addSchema(visaPathSchema, "visa_path");

export const handler = async (extractedEntity: any) => {
    const { entity_type, entity_id } = extractedEntity;
    const errors: string[] = [];
    const warnings: string[] = [];
    let impact: 'low' | 'medium' | 'high' = 'low';

    // 1. Schema validation
    const validate = ajv.getSchema(entity_type);
    if (validate) {
        const valid = validate(extractedEntity);
        if (!valid) {
            validate.errors.forEach(err => {
                if (err.keyword === 'required') {
                    errors.push(`Missing required field: ${err.dataPath}${err.params.missingProperty}`);
                } else {
                    errors.push(`Validation error: ${err.message} at ${err.dataPath}`);
                }
            });
            impact = 'high';
        }
    } else {
        errors.push(`No schema found for entity type: ${entity_type}`);
        impact = 'high';
    }

    // 2. Business logic checks
    if (entity_type === 'visa_path') {
        const { processing_time_range } = extractedEntity;
        if (processing_time_range && processing_time_range.min_days !== null && processing_time_range.max_days !== null) {
            if (processing_time_range.min_days > processing_time_range.max_days) {
                errors.push("`min_days` cannot be greater than `max_days`.");
                impact = 'high';
            }
        }
    }

    // 3. Check for null values as warnings (as per prompt)
    const checkNullFields = (obj: any, path = '') => {
        for (const key in obj) {
            if (obj[key] === null || obj[key].length === 0) {
                warnings.push(`Field '${path}${key}' is null or empty.`);
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                checkNullFields(obj[key], `${path}${key}.`);
            }
        }
    };
    checkNullFields(extractedEntity);


    // 4. Determine impact based on findings
    if (errors.length > 0) {
        impact = 'high';
    } else if (warnings.length > 0) {
        impact = 'medium';
    }

    const validationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        impact
    };

    console.log("Validation complete. Enqueuing for Differ.");
    // `await differAgent.enqueue({ proposedEntity: extractedEntity, validationResult });`
    return validationResult;
};
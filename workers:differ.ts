// workers/differ.ts
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import deepdiff from 'deep-diff';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DifferTask {
    proposedEntity: any;
    validationResult: any;
}

export const handler = async (task: DifferTask) => {
    const { proposedEntity, validationResult } = task;
    const { entity_id, entity_type } = proposedEntity;

    let currentEntity = null;
    if (entity_id) {
        const { data, error } = await supabase.from(entity_type + 's').select('*').eq('id', entity_id).single();
        if (error) {
            console.error(`Failed to fetch current entity ${entity_id}:`, error);
            // Treat as a new addition if we can't find it
        } else {
            currentEntity = data;
        }
    }

    let change_type: 'add' | 'update' | 'remove';
    let diff_fields: any[] = [];
    let diff_summary: string = "";

    if (!currentEntity) {
        change_type = 'add';
        diff_summary = `New ${entity_type} added.`;
    } else {
        change_type = 'update';
        const diffs = deepdiff.diff(currentEntity, proposedEntity);
        if (diffs) {
            diff_fields = diffs.map(d => ({
                field: d.path.join('.'),
                from: d.lhs,
                to: d.rhs
            }));
            diff_summary = `Changes detected for ${entity_type}: ${diff_fields.length} fields modified.`;
        } else {
            // No changes, no need to proceed
            console.log("No changes detected. Stopping workflow.");
            return;
        }
    }

    const differOutput = {
        change_type,
        diff_summary,
        diff_fields,
        source_ids: [proposedEntity.source_id]
    };

    console.log("Diff complete. Enqueuing for Editorial Router.");
    // `await editorialRouterAgent.enqueue({ proposedEntity, differOutput, validationResult });`
    return differOutput;
};
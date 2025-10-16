// workers/editorial_router.ts
import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface EditorialRouterTask {
    proposedEntity: any;
    differOutput: any;
    validationResult: any;
}

export const handler = async (task: EditorialRouterTask) => {
    const { proposedEntity, differOutput, validationResult } = task;
    const { change_type } = differOutput;
    const { impact } = validationResult;
    const entity_id = proposedEntity.entity_id || null;
    const entity_type = proposedEntity.entity_type;

    if (change_type === 'add' || impact === 'high') {
        // First publication or high-impact change requires human approval
        console.log(`High impact or new entity. Creating editorial review for ${entity_type}: ${entity_id}`);
        const { error } = await supabase
            .from('editorial_reviews')
            .insert({
                entity_type,
                entity_id,
                status: 'pending',
                notes: `Requires review. Reason: ${change_type === 'add' ? 'New entity' : 'High impact change'}.`
            });
        if (error) {
            console.error("Failed to create editorial review:", error);
        }
    } else if (impact === 'medium') {
        // Medium impact for a previously approved entity, auto-publish with notice
        console.log(`Medium impact. Auto-publishing entity ${entity_type}: ${entity_id} and creating an alert.`);
        // Enqueue for Publisher
        // `await publisherAgent.enqueue({ entity: proposedEntity, differOutput });`
        // Enqueue for Alert Writer
        // `await alertWriterAgent.enqueue({ entity: proposedEntity, differOutput, impact });`
    } else { // impact === 'low'
        // Low impact changes, auto-publish
        console.log(`Low impact. Auto-publishing entity ${entity_type}: ${entity_id}.`);
        // Enqueue for Publisher
        // `await publisherAgent.enqueue({ entity: proposedEntity, differOutput });`
    }
};
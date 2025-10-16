// search/sync_worker.ts
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Client } from 'typesense';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Placeholder for Typesense client initialization
// const typesenseClient = new Client({
//     nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
//     apiKey: 'xyz'
// });

interface SyncTask {
    entityType: 'countries' | 'visa_paths';
    entityId: string;
}

export const handler = async (task: SyncTask) => {
    const { entityType, entityId } = task;

    console.log(`Starting search index sync for ${entityType} entity ${entityId}`);

    const { data, error } = await supabase
        .from(entityType)
        .select('*')
        .eq('id', entityId)
        .eq('status', 'published')
        .single();

    if (error || !data) {
        console.error(`Failed to fetch published entity ${entityId}. It may have been unpublished.`);
        // In a real scenario, this would trigger a deletion from the index.
        // `await typesenseClient.collections(entityType).documents(entityId).delete();`
        return;
    }

    const document = {
        ...data,
        last_verified_at: new Date(data.last_verified_at).getTime(),
        // Transform data to fit search schema, e.g., join country name
    };

    if (entityType === 'visa_paths') {
      const { data: countryData } = await supabase.from('countries').select('name').eq('id', data.country_id).single();
      if (countryData) {
        document.country_name = countryData.name;
      }
      document.tags = [data.type, data.country_name].filter(Boolean);
    }
    
    // Index the document
    try {
        // This is a Typesense-specific call. Algolia would be different.
        // await typesenseClient.collections(entityType).documents().upsert(document);
        console.log(`Successfully indexed entity ${entityId} in ${entityType} collection.`);
    } catch (e) {
        console.error(`Failed to index entity ${entityId}:`, e);
    }
};
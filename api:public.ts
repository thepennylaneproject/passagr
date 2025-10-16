// api/public.ts
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getCountries = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2, regions, last_verified_at')
        .eq('status', 'published');

    if (error) return res.status(500).json({ error: 'Failed to fetch countries' });
    res.json(data);
};

export const getCountryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error) return res.status(404).json({ error: 'Country not found' });
    res.json(data);
};

export const getVisaPaths = async (req: Request, res: Response) => {
    const { country_id } = req.query;
    if (!country_id) {
        return res.status(400).json({ error: 'country_id is required' });
    }

    const { data, error } = await supabase
        .from('visa_paths')
        .select('id, name, type, description, last_verified_at')
        .eq('country_id', country_id)
        .eq('status', 'published');

    if (error) return res.status(500).json({ error: 'Failed to fetch visa paths' });
    res.json(data);
};

export const getVisaPathById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('visa_paths')
        .select('*, requirements(*), steps(*)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error) return res.status(404).json({ error: 'Visa path not found' });
    res.json(data);
};

export const getChangelog = async (req: Request, res: Response) => {
    const { entity_type, entity_id } = req.query;
    if (!entity_type || !entity_id) {
        return res.status(400).json({ error: 'entity_type and entity_id are required' });
    }

    const { data, error } = await supabase
        .from('changelogs')
        .select('*')
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch changelog' });
    res.json(data);
};

// Example Express.js setup (for context)
// import express from 'express';
// const app = express();
// app.get('/public/countries', getCountries);
// app.get('/public/countries/:id', getCountryById);
// app.get('/public/visa-paths', getVisaPaths);
// app.get('/public/visa-paths/:id', getVisaPathById);
// app.get('/public/changelog', getChangelog);
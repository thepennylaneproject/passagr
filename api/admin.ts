// api/admin.ts
import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { supabase } from './server.ts';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY; // Use a different key with RLS policies for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware for authentication would be required here
// e.g., `app.use('/admin', authenticateAdmin);`

export const getPendingReviews = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('editorial_reviews')
        .select('id, entity_type, entity_id, status, notes, created_at')
        .eq('status', 'pending');

    if (error) return res.status(500).json({ error: 'Failed to fetch pending reviews' });
    res.json(data);
};

export const getReviewDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('editorial_reviews')
        .select('id, entity_type, entity_id, status, notes, created_at')
        .eq('id', id)
        .single();

    if (error) return res.status(404).json({ error: 'Review not found' });

    // Fetch the proposed and current entities for side-by-side comparison
    // This requires a more complex query or service call to get the proposed version
    // stored in a temporary table or a specific column of the review.
    // We'll simulate fetching the proposed state from the review notes or a separate store.
    
    // In a real system, the proposed data would be stored in the `editorial_reviews` table.
    // For this example, we'll fetch the current one for diffing.
    const { data: currentEntity, error: entityError } = await supabase
        .from(`${data.entity_type}s`)
        .select('*')
        .eq('id', data.entity_id)
        .single();
    
    if (entityError) return res.status(404).json({ error: 'Entity not found' });
    
    res.json({
        review: data,
        current_entity: currentEntity,
        proposed_entity: null, // Placeholder - a real implementation would have this data
        diff: null // Placeholder for the pre-calculated diff
    });
};

export const approveReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewer_uid, notes } = req.body;
    
    const { data: review, error: reviewError } = await supabase
        .from('editorial_reviews')
        .update({ status: 'approved', reviewer_uid, notes, resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    
    if (reviewError) return res.status(500).json({ error: 'Failed to approve review' });
    
    // Trigger the Publisher agent with the approved data
    // `await publisherAgent.enqueue({ entity: approvedEntityData, differOutput: approvedDiff });`
    
    res.json({ success: true, message: 'Review approved and publication triggered.' });
};

export const rejectReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reviewer_uid, notes } = req.body;
    
    const { error } = await supabase
        .from('editorial_reviews')
        .update({ status: 'rejected', reviewer_uid, notes, resolved_at: new Date().toISOString() })
        .eq('id', id);
        
    if (error) return res.status(500).json({ error: 'Failed to reject review' });

    res.json({ success: true, message: 'Review rejected.' });
};
// const { createClient } = require('@supabase/supabase-js');
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase;
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

function initializeSupabase() {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

export async function fetchLinksByInterval() {
    initializeSupabase();
    const { data: links, error } = await supabase.rpc('get_active_links');
    
    if (error) throw new Error(`Error fetching links by interval: ${error.message}`);

    return links;
}

export async function fetchSchemaByLink(link) {
    initializeSupabase();
    const { data: schema, error } = await supabase
        .from('schema')
        .select('*')
        .eq('id', link.id)
        .single();
    
    if (error) throw new Error(`Error fetching schema by link: ${error.message}`);

    return schema;
}

export async function saveNewSchema(schema) {
    initializeSupabase();
    const { error } = await supabase
        .from('schema')
        .insert([
            {
                website: schema.website,
                schema: schema.schema,
            }
        ]);

    
    if (error) throw new Error(`Error updating link status: ${error.message}`);

    return true;
}
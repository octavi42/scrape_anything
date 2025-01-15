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
    // const { data: links, error } = await supabase.rpc('get_active_links');

    const { data: links, error } = await supabase
        .from('links')
        .select('*')
        .eq('run', true);

    console.log('Links:', links);
        
    
    if (error) throw new Error(`Error fetching links by interval: ${error.message}`);

    return links;
}

export async function fetchSchemaByLink(link_id) {
    initializeSupabase();

    console.log(link_id);
    
    const { data: schema, error } = await supabase
        .from('schema')
        .select('*')
        .eq('id', link_id)
        .single();
    
    if (error) throw new Error(`Error fetching schema by link: ${error.message}`);

    return schema.schema;
}


export async function saveNewSchema(schema, link_id) {
    initializeSupabase();

    // Insert the new schema into the `schema` table
    const { data: schemaData, error: schemaError } = await supabase
        .from('schema')
        .insert([
            {
                website: schema.website,
                schema: schema.schema,
            }
        ])
        .select('id') // Ensure the `id` of the inserted row is returned
        .single(); // Return the first (and only) row

    if (schemaError) {
        console.error('Error inserting schema:', schemaError);
        throw new Error('Error inserting schema into the database');
    }

    // Update the `links` table with the new schema ID
    const { error: updateError } = await supabase
        .from('links')
        .update({ schema_id: schemaData.id })
        .eq('id', link_id);

    if (updateError) {
        console.error('Error updating link with schema ID:', updateError);
        throw new Error('Error updating link with the new schema ID');
    }

    return true;
}


export async function get_last_scraped_data(link_id) {
    console.log('link id: ', link_id);
    
    initializeSupabase();
    const { data, error } = await supabase
        .from('links')
        .select('last_scraped_data')
        .eq('id', link_id)
        .single();

    if (error) throw new Error(`Error updating link status: ${error.message}`);    

    return data.last_scraped_data;
}

export async function update_last_scraped_data(link_id, data) {
    initializeSupabase();
    const { error } = await supabase
        .from('links')
        .update({ last_scraped_data: data })
        .eq('id', link_id);

    if (error) throw new Error(`Error updating link status: ${error.message}`);

    return true;
}

export async function get_link(link_id) {
    initializeSupabase();

    const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', link_id)
        .single();

    if (error) throw new Error(`Error fetching link: ${error.message}`);

    return data;
}
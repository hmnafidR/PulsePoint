const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('Initializing database schema...');

    // Check if the meetings table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('meetings')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === 'PGRST204') {
      console.log('Creating meetings table...');
      // Create the meetings table
      const { error: createError } = await supabase.rpc('create_meetings_table');
      if (createError) {
        console.error('Error creating meetings table:', createError);
        return;
      }
    } else if (tableError) {
      console.error('Error checking meetings table:', tableError);
      return;
    }

    // Check if the transcript column exists in the meetings table
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'meetings'
    });

    if (columnsError) {
      console.error('Error checking table columns:', columnsError);
      return;
    }

    const hasTranscriptColumn = columns && columns.some(column => column.column_name === 'transcript');

    if (!hasTranscriptColumn) {
      console.log('Adding transcript column to meetings table...');
      // Add the transcript column to the meetings table
      const { error: addColumnError } = await supabase.rpc('add_transcript_column');
      if (addColumnError) {
        console.error('Error adding transcript column:', addColumnError);
        return;
      }
    }

    console.log('Database schema initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Create SQL functions for database operations
async function createDatabaseFunctions() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Creating database functions...');

    // Create function to get table columns
    const getColumnsFunc = `
    CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
    RETURNS SETOF information_schema.columns
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1;
    $$;
    `;

    // Create function to create meetings table
    const createTableFunc = `
    CREATE OR REPLACE FUNCTION create_meetings_table()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS public.meetings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL DEFAULT now(),
        duration INTEGER,
        participants JSONB,
        topics JSONB,
        transcript JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    END;
    $$;
    `;

    // Create function to add transcript column
    const addColumnFunc = `
    CREATE OR REPLACE FUNCTION add_transcript_column()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      ALTER TABLE public.meetings
      ADD COLUMN IF NOT EXISTS transcript JSONB;
    END;
    $$;
    `;

    // Execute SQL functions
    console.log('Creating get_table_columns function...');
    const { error: getColumnsError } = await supabase.rpc('exec_sql', { sql: getColumnsFunc });
    if (getColumnsError) {
      console.error('Error creating get_table_columns function:', getColumnsError);
    }

    console.log('Creating create_meetings_table function...');
    const { error: createTableError } = await supabase.rpc('exec_sql', { sql: createTableFunc });
    if (createTableError) {
      console.error('Error creating create_meetings_table function:', createTableError);
    }

    console.log('Creating add_transcript_column function...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', { sql: addColumnFunc });
    if (addColumnError) {
      console.error('Error creating add_transcript_column function:', addColumnError);
    }

    console.log('Database functions created successfully!');
  } catch (error) {
    console.error('Error creating database functions:', error);
  }
}

// Execute functions
async function main() {
  // First create the database functions
  await createDatabaseFunctions();
  // Then initialize the database schema
  await initializeDatabase();
}

main(); 
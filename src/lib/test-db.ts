import { supabase } from './supabase'

export async function testDatabaseSetup() {
  try {
    // Test 1: Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'meetings'])

    if (tablesError) throw tablesError
    console.log('Tables found:', tables?.map(t => t.table_name))

    // Test 2: Check if RLS is enabled
    const { data: rls, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'meetings'])

    if (rlsError) throw rlsError
    console.log('RLS status:', rls)

    // Test 3: Check if policies exist
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'meetings'])

    if (policiesError) throw policiesError
    console.log('Policies found:', policies?.length)

    return {
      success: true,
      tables: tables?.length === 2,
      rls: rls?.every(t => t.row_security === 'YES'),
      policies: policies?.length > 0
    }
  } catch (error) {
    console.error('Database test failed:', error)
    return {
      success: false,
      error
    }
  }
} 
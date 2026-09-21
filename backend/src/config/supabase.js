const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

// Cliente con service_role key: SOLO en el servidor. Puede saltar RLS.
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Cliente con anon key: se usa para validar el token de usuario que llega del frontend.
const supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin, supabaseAnon };
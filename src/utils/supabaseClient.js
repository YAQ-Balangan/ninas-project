// File: src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Catatan Keamanan: Ke depannya, sangat disarankan memindahkan URL dan Key 
// ini ke dalam file .env (misal: import.meta.env.VITE_SUPABASE_URL)
const supabaseUrl = "https://ekfonmczajejbhndhtya.supabase.co";
const supabaseKey = "sb_publishable_ugxzmiW6Uv0vNSIbks5D5w_2Tg6-12a";

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfmbnzzdtbugoojaruay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbWJuenpkdGJ1Z29vamFydWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM5ODAzNDcsImV4cCI6MjAzOTU1NjM0N30.VTp3yHDmY7a8-e5lOn-BJPqvzjTcm-_tXmXFXJZm8Ks'
export const supabase = createClient(supabaseUrl, supabaseKey)
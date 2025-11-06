// import { createClient } from "@supabase/supabase-js";
// export const supabase = createClient(
//   "https://aokwfioxeqahjifyoeau.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva3dmaW94ZXFhaGppZnlvZWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2OTM0NjYsImV4cCI6MjAzNDI2OTQ2Nn0.DUYNlBb-rryGL8scNUbr8lkvi76DbjgcFzEG3yY1GI4"
// );

import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);


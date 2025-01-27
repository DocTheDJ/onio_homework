import { createClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";
import { Database } from "./database.types";

configDotenv();

export const supabase = createClient<Database>(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
);
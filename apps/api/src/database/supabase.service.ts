import { Injectable } from "@nestjs/common";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const url = this.configService.get<string>('SUPABASE_URL');
        const key = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!url || !key) {
            throw new Error('Supabase URL or Key is missing in environment variables');
        }

        this.supabase = createClient(url, key);
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
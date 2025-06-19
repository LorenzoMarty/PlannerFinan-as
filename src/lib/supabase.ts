import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hzqidfqjysjclksqqvqj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cWlkZnFqeXNqY2xrc3FxdnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMDk0NjQsImV4cCI6MjA2NTg4NTQ2NH0.53rN2ApyyJpTDQkl3-";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          name: string;
          code: string;
          owner_id: string;
          collaborators: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          owner_id: string;
          collaborators?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          owner_id?: string;
          collaborators?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_entries: {
        Row: {
          id: string;
          date: string;
          description: string;
          category: string;
          amount: number;
          type: "income" | "expense";
          user_id: string;
          budget_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          description: string;
          category: string;
          amount: number;
          type: "income" | "expense";
          user_id: string;
          budget_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          description?: string;
          category?: string;
          amount?: number;
          type?: "income" | "expense";
          user_id?: string;
          budget_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          description?: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          description?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "income" | "expense";
          color?: string;
          icon?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

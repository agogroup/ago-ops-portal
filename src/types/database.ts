// Supabase Database Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sites: {
        Row: {
          id: number;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          id: number;
          company_id: number;
          site_id: number;
          date: string;
          time_start: string;
          time_end: string;
          work_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          company_id: number;
          site_id: number;
          date: string;
          time_start: string;
          time_end: string;
          work_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number;
          site_id?: number;
          date?: string;
          time_start?: string;
          time_end?: string;
          work_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedules_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedules_site_id_fkey';
            columns: ['site_id'];
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

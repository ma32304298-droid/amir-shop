export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: number;
          name: string;
          active: boolean;
          image: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          active?: boolean;
          image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          active?: boolean;
          image?: string | null;
          created_at?: string;
        };
      };
      packages: {
        Row: {
          id: number;
          game_id: number;
          name: string;
          amount: string;
          price: number;
          currency: string;
          active: boolean;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          game_id: number;
          name: string;
          amount: string;
          price: number;
          currency?: string;
          active?: boolean;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          game_id?: number;
          name?: string;
          amount?: string;
          price?: number;
          currency?: string;
          active?: boolean;
          description?: string | null;
          created_at?: string;
        };
      };
      payment_proofs: {
        Row: {
          id: number;
          order_id: number;
          proof_url: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          proof_url: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          proof_url?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          game_id: number;
          package_id: number;
          status: 'pending' | 'processing' | 'completed' | 'cancelled';
          currency: string;
          notes: string | null;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_id: number;
          package_id: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          currency?: string;
          notes?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_id?: number;
          package_id?: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          currency?: string;
          notes?: string | null;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * Supabase 数据库类型定义
 * 与 scripts/schema.sql 保持同步
 */

export type PaintingStatus = "售卖中" | "可定制" | "已售出";

export interface Database {
  public: {
    Tables: {
      paintings: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          year: number;
          dimensions: string | null;
          status: PaintingStatus;
          image_url: string;
          thumbnail_url: string;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          year: number;
          dimensions?: string | null;
          status?: PaintingStatus;
          image_url: string;
          thumbnail_url: string;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          year?: number;
          dimensions?: string | null;
          status?: PaintingStatus;
          image_url?: string;
          thumbnail_url?: string;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      artist: {
        Row: {
          id: string;
          name: string;
          title: string | null;
          avatar_url: string | null;
          bio: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          title?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          title?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      artist_timeline: {
        Row: {
          id: string;
          artist_id: string;
          year: number;
          title: string;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          artist_id: string;
          year: number;
          title: string;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          artist_id?: string;
          year?: number;
          title?: string;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "artist_timeline_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artist";
            referencedColumns: ["id"];
          }
        ];
      };
      site_settings: {
        Row: {
          key: string;
          value: Record<string, unknown>;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Record<string, unknown>;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Record<string, unknown>;
          updated_at?: string;
        };
        Relationships: [];
      };
      featured_paintings: {
        Row: {
          id: string;
          painting_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          painting_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          painting_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "featured_paintings_painting_id_fkey";
            columns: ["painting_id"];
            isOneToOne: false;
            referencedRelation: "paintings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      painting_status: PaintingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// 便捷类型别名
export type DbPainting = Database["public"]["Tables"]["paintings"]["Row"];
export type DbArtist = Database["public"]["Tables"]["artist"]["Row"];
export type DbArtistTimeline = Database["public"]["Tables"]["artist_timeline"]["Row"];
export type DbSiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type DbFeaturedPainting = Database["public"]["Tables"]["featured_paintings"]["Row"];

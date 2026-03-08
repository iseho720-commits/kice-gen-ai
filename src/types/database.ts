export type DbProfile = {
  id: string;
  email: string | null;
  credits: number;
  is_early_bird: boolean;
  benefit_end_date: string | null;
  has_active_pass: boolean;
  created_at: string;
};

export type DbPassage = {
  id: string;
  keyword: string;
  title: string;
  category: string;
  content: string;
  logic_structure: string | null;
  is_public: boolean;
  usage_count: number;
  created_at: string;
};

export type DbPurchase = {
  id: string;
  user_id: string;
  passage_id: string;
  amount: number;
  type: 'single' | 'bundle' | 'weekly_pass';
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Partial<DbProfile> & Pick<DbProfile, 'id'>;
        Update: Partial<DbProfile>;
        Relationships: [];
      };
      passages: {
        Row: DbPassage;
        Insert: Omit<DbPassage, 'id' | 'created_at' | 'usage_count'> & { id?: string; created_at?: string; usage_count?: number };
        Update: Partial<DbPassage>;
        Relationships: [];
      };
      purchases: {
        Row: DbPurchase;
        Insert: Omit<DbPurchase, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<DbPurchase>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

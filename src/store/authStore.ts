import { create } from 'zustand';
import { DbProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface AuthStore {
    user: { id: string; email: string | null } | null;
    profile: DbProfile | null;
    loading: boolean;
    showAuthModal: boolean;
    authMode: 'login' | 'signup';
    setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => void;
    fetchProfile: () => Promise<void>;
    signOut: () => Promise<void>;
    decrementCredit: () => void;
    mockLogin: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    showAuthModal: false,
    authMode: 'login',

    setShowAuthModal: (show, mode = 'login') =>
        set({ showAuthModal: show, authMode: mode }),

    fetchProfile: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ user: null, profile: null, loading: false });
            return;
        }
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        set({ user: { id: user.id, email: user.email ?? null }, profile: profile as unknown as DbProfile | null, loading: false });
    },

    signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },

    decrementCredit: () => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, credits: Math.max(0, profile.credits - 1) } });
    },

    mockLogin: () => {
        const mockProfile: DbProfile = {
            id: 'mock-user-id',
            email: 'test@kice-gen.ai',
            credits: 3,
            is_early_bird: true,
            benefit_end_date: null,
            has_active_pass: false,
            created_at: new Date().toISOString(),
        };
        set({
            user: { id: mockProfile.id, email: mockProfile.email },
            profile: mockProfile,
            loading: false,
            showAuthModal: false
        });
    },
}));

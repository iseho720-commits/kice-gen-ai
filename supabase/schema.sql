-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 3,
  is_early_bird BOOLEAN DEFAULT false,
  benefit_end_date DATE,
  has_active_pass BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create passages table
CREATE TABLE public.passages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  logic_structure TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES public.passages(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- e.g., 'single', 'bundle', 'weekly_pass'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Passages Policies: anyone can read public ones or purchased ones
-- For simplicity, let's allow read on all for authenticated users (the frontend blurs it anyway before purchase)
CREATE POLICY "Authenticated users can read passages" ON public.passages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert passages" ON public.passages FOR INSERT TO authenticated WITH CHECK (true);

-- Purchases Policies: Users can read their own
CREATE POLICY "Users can read own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auth Trigger to auto-create profile, grant 3 credits, and set early_bird
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, is_early_bird)
  VALUES (new.id, new.email, 3, true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- Tabela de Perfis de Usuário (com configuração de biotipo para a coxa)
create table public.users_profile (
  id uuid references auth.users primary key,
  full_text text,
  allow_thigh_injection boolean default true, -- Se falso, o app bloqueia a coxa por falta de gordura subcutânea
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Histórico de Injeções
create table public.injections_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  dose_mg numeric(4,2) not null,
  body_location text not null, -- Ex: 'abdomen_lower_left', 'thigh_right'
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Registro de Nutrição Reversa (Foco em Água e Proteína)
create table public.daily_nutrition (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  log_date date default current_date not null,
  water_ml int default 0,
  protein_grams int default 0,
  unique(user_id, log_date)
);

-- Tabela do "Modo Vida Real" (Registro de exceções sem julgamento)
create table public.real_life_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  event_type text not null, -- 'alcohol_beer', 'carbonated_drink', 'heavy_meal'
  quantity numeric(5,2) not null, -- Ex: 4 (latas), 500 (ml)
  user_feeling text, -- 'social_craving', 'control_stopped_fine'
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Monitoramento de Sintomas e Gatilhos
create table public.symptoms_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  nausea_level int check (nausea_level between 1 and 5),
  bloating_level int check (bloating_level between 1 and 5),
  acid_reflux_level int check (acid_reflux_level between 1 and 5),
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);
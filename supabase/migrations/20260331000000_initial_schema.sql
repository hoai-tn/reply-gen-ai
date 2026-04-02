-- Enable pgvector for embeddings
create extension if not exists vector with schema extensions;

-- ─────────────────────────────────────────────
-- businesses
-- ─────────────────────────────────────────────
create table if not exists businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  status      text not null default 'active',
  industry_type text,
  website     text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table businesses enable row level security;

create policy "owners can manage their business"
  on businesses for all
  using (owner_id = auth.uid());

-- ─────────────────────────────────────────────
-- forms
-- ─────────────────────────────────────────────
create table if not exists forms (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  name         text not null,
  schema       jsonb not null default '[]',   -- field config array
  created_at   timestamptz not null default now()
);

alter table forms enable row level security;

create policy "owners can manage forms"
  on forms for all
  using (
    exists (
      select 1 from businesses b
      where b.id = forms.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy "forms are publicly readable for embed"
  on forms for select
  using (true);

-- ─────────────────────────────────────────────
-- documents
-- ─────────────────────────────────────────────
create table if not exists documents (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  form_id      uuid not null references forms(id) on delete cascade,
  name         text not null,
  created_at   timestamptz not null default now()
);

alter table documents enable row level security;

create policy "owners can manage documents"
  on documents for all
  using (
    exists (
      select 1 from businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- document_chunks  (RAG store)
-- ─────────────────────────────────────────────
-- Uses halfvec(1536) for OpenAI text-embedding-3-small (saves ~50% storage vs vector)
create table if not exists document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references documents(id) on delete cascade,
  business_id  uuid not null references businesses(id) on delete cascade,
  form_id      uuid not null references forms(id) on delete cascade,
  content      text not null,
  embedding    extensions.halfvec(1536),
  created_at   timestamptz not null default now()
);

alter table document_chunks enable row level security;

create policy "owners can manage chunks"
  on document_chunks for all
  using (
    exists (
      select 1 from businesses b
      where b.id = document_chunks.business_id
        and b.owner_id = auth.uid()
    )
  );

-- HNSW index: cosine distance for semantic similarity
-- Scoped queries should always filter by business_id + form_id first
create index on document_chunks
  using hnsw (embedding extensions.halfvec_cosine_ops);

-- ─────────────────────────────────────────────
-- submissions
-- ─────────────────────────────────────────────
create table if not exists submissions (
  id           uuid primary key default gen_random_uuid(),
  form_id      uuid not null references forms(id) on delete cascade,
  answers      jsonb not null default '{}',
  ai_response  text,
  email        text,
  created_at   timestamptz not null default now()
);

alter table submissions enable row level security;

create policy "owners can read submissions"
  on submissions for select
  using (
    exists (
      select 1 from forms f
      join businesses b on b.id = f.business_id
      where f.id = submissions.form_id
        and b.owner_id = auth.uid()
    )
  );

-- Submissions are inserted by anonymous clients (embedded form)
create policy "anyone can submit"
  on submissions for insert
  with check (true);

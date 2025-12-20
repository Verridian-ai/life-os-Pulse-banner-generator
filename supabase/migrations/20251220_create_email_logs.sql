-- Create email_logs table
create table if not exists public.email_logs (
  id uuid default gen_random_uuid() primary key,
  recipient text not null,
  subject text not null,
  status text check (status in ('sent', 'failed', 'queued')) default 'queued',
  template_name text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.email_logs enable row level security;

-- Create policy to allow authenticated users to view logs
create policy "Allow authenticated view logs"
  on public.email_logs for select
  to authenticated
  using (true);

-- Create policy to allow authenticated users to insert logs
create policy "Allow authenticated insert logs" 
  on public.email_logs for insert 
  to authenticated 
  with check (true);

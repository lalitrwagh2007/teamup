-- Seed data for TeamUp development

-- 1. SEED SKILLS (Technical and Community/Social)
INSERT INTO public.skills (name, category) VALUES
  -- Technical Skills
  ('React', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('TypeScript', 'Programming Languages'),
  ('JavaScript', 'Programming Languages'),
  ('Node.js', 'Backend'),
  ('Python', 'Programming Languages'),
  ('PostgreSQL', 'Database'),
  ('Supabase', 'Backend / Database'),
  ('Tailwind CSS', 'Frontend'),
  ('GraphQL', 'Backend'),
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('AWS', 'Cloud'),
  ('Flutter', 'Mobile'),
  ('React Native', 'Mobile'),
  ('Figma', 'Design'),
  ('UI/UX Design', 'Design'),
  ('Machine Learning', 'AI / Data'),
  ('PyTorch', 'AI / Data'),
  ('Cybersecurity', 'Security'),

  -- Community / Social / Management Skills
  ('Community Management', 'Community'),
  ('Event Planning', 'Community'),
  ('Public Speaking', 'Communication'),
  ('Technical Writing', 'Content'),
  ('Content Strategy', 'Marketing'),
  ('Social Media Management', 'Marketing'),
  ('Project Management', 'Management'),
  ('Team Leadership', 'Leadership'),
  ('Developer Relations', 'Community'),
  ('Workshop Facilitation', 'Community'),
  ('Volunteer Coordination', 'Community'),
  ('Partnership Building', 'Community')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED INTERESTS
INSERT INTO public.interests (name, category) VALUES
  ('Open Source', 'Technology'),
  ('Artificial Intelligence', 'Technology'),
  ('Web Development', 'Technology'),
  ('Mobile Apps', 'Technology'),
  ('Cloud Native', 'Technology'),
  ('Game Development', 'Technology'),
  ('Hackathons', 'Community'),
  ('Tech Education & Mentorship', 'Community'),
  ('Diversity in Tech', 'Community'),
  ('Sustainable Tech', 'Social Impact'),
  ('Civic Tech', 'Social Impact'),
  ('Student Communities', 'Community'),
  ('Design Systems', 'Design'),
  ('DevOps & Infrastructure', 'Technology')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED TEAMS (Evenly split between technical and community tracks)
-- 4 Technical Teams & 4 Community Teams = 8 teams total

INSERT INTO public.teams (id, name, description, track, category, avatar_url, mode, location, max_members, status) VALUES
  -- Technical Teams (4)
  (
    '11111111-1111-4111-a111-111111111111',
    'AI Builder Assistants',
    'Building open-source AI developer tools, automated workflow agents, and smart code assistants.',
    'technical',
    'AI / Machine Learning',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    'Remote',
    'Global / Remote',
    6,
    'recruiting'
  ),
  (
    '22222222-2222-4222-a222-222222222222',
    'Web Next-Gen Stack',
    'Developing high-performance modern web apps with Next.js 15, React 19, and Supabase serverless backends.',
    'technical',
    'Web Development',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150',
    'Hybrid',
    'Pune, India',
    5,
    'recruiting'
  ),
  (
    '33333333-3333-4333-a333-333333333333',
    'Cloud DevSecOps Guild',
    'Creating automated deployment pipelines, infrastructure-as-code scripts, and Kubernetes security monitors.',
    'technical',
    'Cloud / DevOps',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150',
    'Remote',
    'Remote',
    5,
    'recruiting'
  ),
  (
    '44444444-4444-4444-a444-444444444444',
    'CrossPlatform Mobile Collective',
    'Designing and launching intuitive cross-platform mobile apps using React Native, Expo, and offline-first state.',
    'technical',
    'Mobile Development',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=150',
    'On-site',
    'Bengaluru, India',
    6,
    'recruiting'
  ),

  -- Community Teams (4)
  (
    '55555555-5555-4555-a555-555555555555',
    'Open Source Mentorship Network',
    'Organizing community mentorship programs, onboarding workshops, and first-time contributor cohorts for open source.',
    'community',
    'Tech Education',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
    'Remote',
    'Global / Remote',
    8,
    'recruiting'
  ),
  (
    '66666666-6666-4666-a666-666666666666',
    'Campus Hackathon Organizers',
    'Planning and running regional hackathons, student coding competitions, and collaborative building weekends.',
    'community',
    'Event Management',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
    'Hybrid',
    'Mumbai, India',
    10,
    'recruiting'
  ),
  (
    '77777777-7777-4777-a777-777777777777',
    'DevRel Content & Outreach Crew',
    'Producing developer podcasts, technical guides, community newsletters, and hosting virtual live streams.',
    'community',
    'Content & Media',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150',
    'Remote',
    'Remote',
    6,
    'recruiting'
  ),
  (
    '88888888-8888-4888-a888-888888888888',
    'Civic Tech & Sustainability Forum',
    'Connecting developers and local environmental advocates to solve community issues using tech solutions.',
    'community',
    'Social Impact',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150',
    'Hybrid',
    'Delhi, India',
    7,
    'recruiting'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED TEAM ROLES
INSERT INTO public.team_roles (id, team_id, title, description, spots_total, spots_filled, status) VALUES
  -- AI Builder Assistants
  (
    'a1111111-1111-4111-a111-111111111111',
    '11111111-1111-4111-a111-111111111111',
    'Lead AI/ML Engineer',
    'Fine-tuning open models, prompt engineering, and building LLM integration pipelines.',
    1,
    0,
    'open'
  ),
  (
    'a2222222-1111-4111-a111-111111111111',
    '11111111-1111-4111-a111-111111111111',
    'Full-Stack Developer',
    'Building Next.js frontend interfaces and Supabase vector database query APIs.',
    2,
    0,
    'open'
  ),

  -- Web Next-Gen Stack
  (
    'b1111111-2222-4222-a222-222222222222',
    '22222222-2222-4222-a222-222222222222',
    'Frontend Specialist',
    'Crafting responsive, accessible UI components with Tailwind CSS and React 19 server components.',
    2,
    0,
    'open'
  ),

  -- Open Source Mentorship Network
  (
    'c1111111-5555-4555-a555-555555555555',
    '55555555-5555-4555-a555-555555555555',
    'Community Program Lead',
    'Designing mentorship tracks, scheduling office hours, and coordinating volunteer mentors.',
    1,
    0,
    'open'
  ),
  (
    'c2222222-5555-4555-a555-555555555555',
    'Technical Writer / Doc Manager',
    'Authoring contributor handbooks, issue templates, and beginner-friendly tutorials.',
    2,
    0,
    'open'
  ),

  -- Campus Hackathon Organizers
  (
    'd1111111-6666-4666-a666-666666666666',
    '66666666-6666-4666-a666-666666666666',
    'Event Operations Manager',
    'Handling venue logistics, sponsorship outreach, and event day schedules.',
    2,
    0,
    'open'
  )
ON CONFLICT (id) DO NOTHING;

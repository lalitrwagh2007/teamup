export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  skills: string[];
  interests: string[];
  availability: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  github: string;
  linkedin: string;
  portfolio: string;
  profileCompletion: number;
}

export const users: UserProfile[] = [
  {
    id: "u1",
    name: "Aarav Sharma",
    username: "aaravsharma",
    bio: "Full-stack developer interested in AI-powered products and collaborative startup projects.",
    location: "Pune, Maharashtra",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    interests: ["AI", "SaaS", "Open Source", "Developer Tools"],
    availability: "10 hours/week",
    workMode: "Hybrid",
    github: "https://github.com/aaravsharma",
    linkedin: "https://www.linkedin.com/in/aaravsharma",
    portfolio: "https://aaravsharma.dev",
    profileCompletion: 95,
  },
  {
    id: "u2",
    name: "Priya Mehta",
    username: "priyamehta",
    bio: "Frontend developer and UI enthusiast focused on clean, accessible product experiences.",
    location: "Mumbai, Maharashtra",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma"],
    interests: ["UI/UX", "Design Systems", "Accessibility", "Web Development"],
    availability: "8 hours/week",
    workMode: "Remote",
    github: "https://github.com/priyamehta",
    linkedin: "https://www.linkedin.com/in/priyamehta",
    portfolio: "https://priyamehta.dev",
    profileCompletion: 88,
  },
  {
    id: "u3",
    name: "Rohan Verma",
    username: "rohanverma",
    bio: "Machine learning developer exploring applied AI, automation, and intelligent assistants.",
    location: "Bengaluru, Karnataka",
    skills: ["Python", "Machine Learning", "FastAPI", "OpenAI", "SQL"],
    interests: ["Artificial Intelligence", "Automation", "Data Science"],
    availability: "12 hours/week",
    workMode: "Remote",
    github: "https://github.com/rohanverma",
    linkedin: "https://www.linkedin.com/in/rohanverma",
    portfolio: "https://rohanverma.dev",
    profileCompletion: 92,
  },
  {
    id: "u4",
    name: "Neha Kapoor",
    username: "nehakapoor",
    bio: "Product designer who enjoys turning complex ideas into simple and intuitive interfaces.",
    location: "Delhi, India",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    interests: ["Product Design", "Startups", "Design Systems"],
    availability: "6 hours/week",
    workMode: "Hybrid",
    github: "",
    linkedin: "https://www.linkedin.com/in/nehakapoor",
    portfolio: "https://nehakapoor.design",
    profileCompletion: 84,
  },
];

export const currentUser = users[0];

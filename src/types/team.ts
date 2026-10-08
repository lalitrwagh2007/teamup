import { Team } from "@/types/team";

export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "AI Study Group",
    description: "Building open-source machine learning models and web applications.",
    category: "AI / Machine Learning",
    skills: ["Python", "PyTorch", "Next.js", "TypeScript"],
    currentMembers: 3,
    maxMembers: 5,
    mode: "Remote",
    location: "Global",
    roles: [
      {
        id: "role-1",
        title: "ML Engineer",
        description: "Focus on training and fine-tuning open-source LLMs.",
        requiredSkills: ["Python", "PyTorch", "HuggingFace"]
      },
      {
        id: "role-2",
        title: "Frontend Developer",
        description: "Build interactive web dashboards for model metrics.",
        requiredSkills: ["Next.js", "TypeScript", "TailwindCSS"]
      }
    ]
  },
  {
    id: "team-2",
    name: "Hackathon FinTech App",
    description: "Creating a modern budgeting app with smooth micro-interactions.",
    category: "Web Development",
    skills: ["React", "Node.js", "TailwindCSS", "PostgreSQL"],
    currentMembers: 2,
    maxMembers: 4,
    mode: "Hybrid",
    location: "New York, USA",
    roles: [
      {
        id: "role-3",
        title: "UI/UX Designer",
        description: "Design Figma wireframes and design system components.",
        requiredSkills: ["Figma", "UI Design"]
      },
      {
        id: "role-4",
        title: "Backend Engineer",
        description: "Implement API endpoints and database models.",
        requiredSkills: ["Node.js", "PostgreSQL", "Express"]
      }
    ]
  }
];
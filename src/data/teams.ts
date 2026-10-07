export interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  mode: "Remote" | "Hybrid" | "On-site";
  location: string;
}

export const teams: Team[] = [
  {
    id: "1",
    name: "AI Builders",
    description:
      "A collaborative team building practical AI tools, intelligent assistants, and machine learning prototypes.",
    category: "AI / Machine Learning",
    skills: ["Python", "Next.js", "OpenAI", "Machine Learning"],
    currentMembers: 4,
    maxMembers: 6,
    mode: "Remote",
    location: "India",
  },
  {
    id: "2",
    name: "Web Innovators",
    description:
      "Frontend and backend developers working together on modern web applications and developer tools.",
    category: "Web Development",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    currentMembers: 3,
    maxMembers: 5,
    mode: "Hybrid",
    location: "Pune, Maharashtra",
  },
  {
    id: "3",
    name: "Design Collective",
    description:
      "A product-focused team creating polished interfaces, design systems, and accessible user experiences.",
    category: "Design",
    skills: ["Figma", "UI/UX", "Prototyping", "React"],
    currentMembers: 2,
    maxMembers: 4,
    mode: "Remote",
    location: "Mumbai, Maharashtra",
  },
  {
    id: "4",
    name: "Mobile Makers",
    description:
      "A team focused on building fast and reliable mobile apps for Android and iOS.",
    category: "Mobile Development",
    skills: ["React Native", "TypeScript", "Firebase", "Expo"],
    currentMembers: 4,
    maxMembers: 6,
    mode: "On-site",
    location: "Bengaluru, Karnataka",
  },
  {
    id: "5",
    name: "Cloud Crew",
    description:
      "Developers interested in DevOps, cloud infrastructure, automation, deployment pipelines, and scalable systems.",
    category: "Cloud / DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "GitHub Actions"],
    currentMembers: 3,
    maxMembers: 6,
    mode: "Hybrid",
    location: "Hyderabad, Telangana",
  },
  {
    id: "6",
    name: "Data Explorers",
    description:
      "A data-focused team working on analytics, dashboards, visualization, and data-driven products.",
    category: "Data Science",
    skills: ["Python", "SQL", "Pandas", "Data Visualization"],
    currentMembers: 2,
    maxMembers: 5,
    mode: "Remote",
    location: "India",
  },
  {
    id: "7",
    name: "Cyber Guardians",
    description:
      "A security-focused team exploring secure development, vulnerability analysis, and application security.",
    category: "Cybersecurity",
    skills: ["Cybersecurity", "Linux", "Python", "OWASP"],
    currentMembers: 3,
    maxMembers: 5,
    mode: "Remote",
    location: "Delhi, India",
  },
  {
    id: "8",
    name: "Game Forge",
    description:
      "A creative team building small multiplayer games, interactive experiences, and gameplay prototypes.",
    category: "Game Development",
    skills: ["Unity", "C#", "Game Design", "Blender"],
    currentMembers: 4,
    maxMembers: 7,
    mode: "Hybrid",
    location: "Chennai, Tamil Nadu",
  },
];

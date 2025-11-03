export type ProjectMetadata = {
    id: string;
    title: string;
    subtitle: string;
    tagline: string;
    coverImage: string;
    year?: string;
    role?: string;
    team?: string;
    tools?: string[];
    links?: { label: string; url: string }[];
};

export const projects: Record<string, ProjectMetadata> = {
    runway: {
        id: 'runway',
        title: 'Runway',
        subtitle: 'MOBILE APP',
        tagline: 'Khan Academy for today\'s attention spans.',
        coverImage: '/p/runway/title-ss.png',
        year: '2024',
        role: 'Founder & Developer',
        tools: ['React Native', 'Firebase', 'Swift'],
        links: [
            { label: 'App Store', url: 'https://runwaymobile.app' },
            { label: 'GitHub', url: 'https://github.com/byung806/runway' },
        ],
    },
    'first-light': {
        id: 'first-light',
        title: 'First Light',
        subtitle: 'SWIFT PLAYGROUND',
        tagline: 'Teaching firework chemistry through interactive 3D visualizations.',
        coverImage: '/p/first-light/title-ss.png',
        year: '2025',
        role: 'Solo Developer',
        tools: ['Swift', 'SceneKit', 'Swift Playground'],
        links: [
            { label: 'GitHub', url: 'https://github.com/byung806/First-Light' },
        ],
    },
    'troopwebhost': {
        id: 'troopwebhost',
        title: 'TroopWebHost Improvement Project',
        subtitle: 'DESKTOP APP',
        tagline: 'Automating rosters, reporting, and scheduling for 100+ active users.',
        coverImage: '/boy-scouts.png',
        year: '2023',
        role: 'Lead Developer',
        tools: ['Python', 'Tkinter', 'BeautifulSoup', 'Threading'],
        links: [
            { label: 'GitHub', url: 'https://github.com/byung806/Troop-Web-Host-Improvement' },
        ],
    },
};

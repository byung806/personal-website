export type ProjectMetadata = {
    id: string;
    title: string;
    subtitle: string;
    tagline?: string;
    coverImage?: string;
    year?: string;
    role?: string;
    team?: string;
    tools?: string[];
    links?: { label: string; url: string }[];
    // Card styling
    special?: string[];
    bgColor?: string;
    borderColor?: string;
    borderThickness?: number;
    /** When true, use dark text on frosted-glass tags (for light card bg). Omit to auto-derive from bgColor. */
    tagTextDark?: boolean;
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
            { label: 'Website', url: 'https://runwaymobile.app' },
            { label: 'App Store', url: 'https://runwaymobile.app' },
            { label: 'GitHub', url: 'https://github.com/byung806/runway' },
        ],
        special: ['1k+ Users'],
        bgColor: '#32193d',
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
        special: ['Apple WWDC Winner'],
        bgColor: '#f6f6f6',
        tagTextDark: false,
    },
    '3d-renderer': {
        id: '3d-renderer',
        title: '3D Wireframe Renderer',
        subtitle: 'LINEAR ALGEBRA',
        tagline: 'Building a 3D graphics renderer from linear algebra fundamentals.',
        coverImage: '/p/3d-renderer/cube-inverted.png',
        year: '2025',
        role: 'Solo Developer',
        tools: ['Python', 'Linear Algebra', 'NumPy'],
        links: [
            { label: 'GitHub', url: 'https://github.com/byung806/3d-final-project' },
        ],
        bgColor: '#1a1a1a',
    },
    'troopwebhost': {
        id: 'troopwebhost',
        title: 'Boy Scouts Management',
        subtitle: 'DESKTOP APP',
        tagline: 'Automating rosters, reporting, and scheduling for 100+ active users.',
        coverImage: '/boy-scouts.png',
        year: '2023',
        role: 'Lead Developer',
        tools: ['Python', 'Tkinter', 'BeautifulSoup', 'Threading'],
        links: [
            { label: 'GitHub', url: 'https://github.com/byung806/Troop-Web-Host-Improvement' },
        ],
        special: ['100+ Users'],
        bgColor: '#f6f6f6',
    },
    'eeg-classification': {
        id: 'eeg-classification',
        title: 'Frontotemporal Dementia Research',
        subtitle: 'RESEARCH',
        tagline: 'Making machine-aided diagnosis explainable to doctors.',
        coverImage: '/p/eeg-classification/eeg_data.png',
        year: '2024',
        role: 'Research Intern',
        team: 'Neural Systems Lab',
        tools: ['Python', 'scikit-learn', 'NumPy', 'Discrete Wavelet Transform'],
        links: [
            { label: 'GitHub', url: 'https://github.com/byung806/EEG-Feature-Classification' },
        ],
        special: ['Regeneron STS Scholar'],
        bgColor: '#ffffff',
        borderColor: '#eaecef',
    },
    'guestbook': {
        id: 'guestbook',
        title: 'Guestbook',
        subtitle: 'INTERACTIVE',
        year: '2025',
        special: ['Interactive'],
        bgColor: '#ffffff',
        borderColor: '#f1f1f1',
        borderThickness: 2,
    },
    echo: {
        id: 'echo',
        title: 'Echo',
        subtitle: 'GAME · TARTANHACKS 2026',
        tagline: 'A time travel 2D platformer that compresses down to just 15 KB.',
        coverImage: '/p/echo/unknown%2040.png',
        year: '2026',
        role: 'Team',
        team: 'Alan Dong, Michael Li, Seunghyun Bae',
        tools: ['JavaScript', 'HTML5', 'Canvas'],
        links: [
            { label: 'Play Demo', url: 'https://justanothernoob4648.github.io/tartanhacks26/' },
            { label: 'LinkedIn', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7426682086251626496/' },
        ],
        special: ['TartanHacks Winner'],
        bgColor: '#1a1625',
    },
};


export interface Project {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    year: string;
    url?: string;
    githubUrl?: string;
    description?: string;
    technologies?: string[];
    imageFit?: 'cover' | 'contain';
    imageBg?: string;
}

export interface SocialLink {
    icon: string;
    url: string;
}

export interface Certificate {
    id: string;
    title: string;
    issuer: string;
    date: string;
    color: string;
    imageUrl?: string;
    url?: string;
}

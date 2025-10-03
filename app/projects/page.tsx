"use client";

import Navbar from "@/ui/components/navbar";
import { useTheme } from "@/ui/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface FloatingProject {
    id: number;
    title: string;
    description: string;
    tech: string[];
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

export default function Projects() {
    const { currentTheme } = useTheme();
    const [projects, setProjects] = useState<FloatingProject[]>([]);

    // Handle gradient backgrounds
    const backgroundStyle = currentTheme.background.startsWith('linear-gradient') 
        ? { background: currentTheme.background }
        : { backgroundColor: currentTheme.background };

    // Initialize projects
    useEffect(() => {
        const initialProjects: FloatingProject[] = [
            {
                id: 1,
                title: "Competitive Programming",
                description: "Solutions to competitive programming problems",
                tech: ["C++", "Python", "Algorithms"],
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1
            },
            {
                id: 2,
                title: "Music Visualizer",
                description: "Real-time audio visualization tool",
                tech: ["JavaScript", "Web Audio API", "Canvas"],
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1
            },
            {
                id: 3,
                title: "Physics Engine",
                description: "2D physics simulation with collisions",
                tech: ["C++", "OpenGL", "Mathematics"],
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1
            },
            {
                id: 4,
                title: "Web Portfolio",
                description: "Personal website with theme switching",
                tech: ["React", "Next.js", "Tailwind CSS"],
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1
            }
        ];
        setProjects(initialProjects);
    }, []);

    // Physics animation
    useEffect(() => {
        const animate = () => {
            setProjects(prevProjects => 
                prevProjects.map(project => {
                    let newX = project.x + project.vx;
                    let newY = project.y + project.vy;
                    let newVx = project.vx;
                    let newVy = project.vy;

                    // Bounce off walls
                    if (newX <= 0 || newX >= 100) {
                        newVx = -newVx;
                        newX = Math.max(0, Math.min(100, newX));
                    }
                    if (newY <= 0 || newY >= 100) {
                        newVy = -newVy;
                        newY = Math.max(0, Math.min(100, newY));
                    }

                    return {
                        ...project,
                        x: newX,
                        y: newY,
                        vx: newVx,
                        vy: newVy
                    };
                })
            );
        };

        const interval = setInterval(animate, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className={`min-h-screen text-white ${currentTheme.font} transition-all duration-500 ease-in-out overflow-hidden`}
            style={backgroundStyle}
        >
            <div className="min-h-screen flex flex-col justify-center items-center relative">
                {/* Navigation */}
                <div className="absolute top-8 left-8 z-20">
                    <Navbar />
                </div>
                <div className="text-center space-y-8 z-10">
                    {/* Header */}
                    <h1 
                        className={`text-5xl font-bold transition-all duration-500 ease-in-out ${
                            currentTheme.name === 'sunset' 
                                ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse' 
                                : ''
                        }`}
                        style={{ 
                            color: currentTheme.name === 'sunset' ? 'transparent' : currentTheme.accentColor 
                        }}
                    >
                        projects
                    </h1>
                    
                    <p 
                        className="text-xl transition-all duration-500 ease-in-out"
                        style={{ color: currentTheme.textColor }}
                    >
                        click on a project to learn more
                    </p>
                </div>

                {/* Floating Projects */}
                <div className="absolute inset-0 pointer-events-none">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="absolute pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-110"
                            style={{
                                left: `${project.x}%`,
                                top: `${project.y}%`,
                                transform: `translate(-50%, -50%) scale(${project.size})`,
                            }}
                        >
                            <div 
                                className="px-4 py-3 rounded-lg border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                style={{ 
                                    borderColor: currentTheme.accentColor,
                                    backgroundColor: `${currentTheme.accentColor}10`,
                                    color: currentTheme.textColor
                                }}
                            >
                                <h3 className="font-bold text-sm mb-1">{project.title}</h3>
                                <p className="text-xs opacity-80 mb-2">{project.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {project.tech.map((tech, index) => (
                                        <span 
                                            key={index}
                                            className="text-xs px-2 py-1 rounded"
                                            style={{ 
                                                backgroundColor: `${currentTheme.accentColor}20`,
                                                color: currentTheme.accentColor
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
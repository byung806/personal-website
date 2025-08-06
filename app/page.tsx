"use client";

import { Libre_Baskerville, Fredoka } from "next/font/google";
import Image from "next/image";
import CursorSpotlight from "@/ui/components/cursor-spotlight";

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const fredoka = Fredoka({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

// Project data with unique designs based on real projects
const projects = [
    {
        id: 1,
        title: "Runway",
        subtitle: 'Mobile App', 
        description: "Daily learning app for iOS and Android. 2-minute lessons from Harvard, MIT, and Ivy League students. Join 1k+ learners building strong habits.",
        color: "#783c8e",
        icon: "📚",
        accent: "bg-gradient-to-br from-purple-400 to-purple-600",
        design: "learning-theme",
        theme: "purple",
        font: "fredoka",
        elements: [
            { type: "book", color: "#783c8e", size: "w-6 h-8", position: "-top-3 -right-3", rotation: "rotate-12" },
            { type: "book", color: "#41144e", size: "w-5 h-7", position: "-bottom-2 -left-2", rotation: "-rotate-6" },
            { type: "sparkle", color: "#783c8e", size: "w-2 h-2", position: "top-4 -right-6" },
            { type: "sparkle", color: "#41144e", size: "w-1.5 h-1.5", position: "bottom-6 -left-4" }
        ]
    },
    {
        id: 2,
        title: "EEG Classification Research",
        subtitle: "UMD Internship",
        description: "Explainable EEG-based classification of frontotemporal dementia. Bridging computational advances with patient care through interpretable AI.",
        color: "#2563eb",
        icon: "🧠",
        accent: "bg-gradient-to-br from-blue-400 to-indigo-500",
        design: "brain-theme",
        theme: "blue",
        font: "scientific",
        elements: [
            { type: "wave", color: "#2563eb", size: "w-12 h-2", position: "-top-4 -right-4", shape: "wave" },
            { type: "wave", color: "#1d4ed8", size: "w-8 h-1.5", position: "-bottom-3 -left-3", shape: "wave" },
            { type: "node", color: "#2563eb", size: "w-3 h-3", position: "top-2 -right-6" },
            { type: "node", color: "#1d4ed8", size: "w-2 h-2", position: "bottom-4 -left-5" }
        ]
    },
    {
        id: 3,
        title: "TroopWebHost Improvement",
        description: "Streamlined email system and troop data management for Boy Scout leaders. Built with Python and Tkinter for better volunteer training management.",
        color: "#059669",
        icon: "🏕️",
        accent: "bg-gradient-to-br from-green-400 to-emerald-500",
        design: "scout-theme",
        theme: "green",
        font: "libre",
        elements: [
            { type: "tent", color: "#059669", size: "w-8 h-6", position: "-top-3 -right-3", shape: "tent" },
            { type: "leaf", color: "#047857", size: "w-4 h-4", position: "-bottom-2 -left-2", shape: "leaf" },
            { type: "badge", color: "#059669", size: "w-3 h-3", position: "top-4 -right-6", shape: "circle" }
        ]
    }
];

export default function Home() {
    return (
        <div className="min-h-screen relative">
            {/* Cursor Spotlight Effect */}
            <CursorSpotlight />

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center px-4 relative pt-40 pb-20">
                <div className="content-container text-center space-y-6">
                    {/* Circular Portrait */}
                    <div className="mx-auto w-40 h-40 rounded-full elegant-shadow overflow-hidden relative">
                        <Image
                            src="/me.JPG"
                            alt="Bryan Yung"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Name */}
                    <h1
                        className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold text-gray-900 leading-tight font-serif`}
                    >
                        Bryan Yung
                    </h1>

                    {/* Tagline */}
                    <p className="text-lg md:text-xl text-gray-600 font-light tracking-wide uppercase">
                        Student at Poolesville High School
                    </p>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-12 px-4">
                <div className="content-container">
                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {projects.map((project, index) => (
                            <div key={project.id} className="group relative">
                                {/* Project Card */}
                                <div className="relative bg-white rounded-2xl elegant-shadow hover:elegant-shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                                    <div className="p-8 h-80 flex flex-col justify-between relative">
                                        {/* Decorative Background */}
                                        <div
                                            className={`absolute inset-0 opacity-5 ${project.accent}`}
                                        ></div>

                                        {/* Floating Icon */}
                                        <div className="absolute top-6 right-6 text-4xl opacity-15 group-hover:opacity-25 transition-opacity">
                                            {project.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <h3
                                                className={`${
                                                    project.font === "fredoka" 
                                                        ? `${fredoka.className} font-bold` 
                                                        : project.font === "scientific"
                                                        ? "font-mono font-bold"
                                                        : `${libreBaskerville.className} font-bold`
                                                } text-2xl mb-1 font-serif`}
                                                style={{ 
                                                    color: project.font === "fredoka" ? "#783c8e" : "#1f2937"
                                                }}
                                            >
                                                {project.title}
                                            </h3>
                                            {project.subtitle && (
                                                <p className="text-sm text-gray-500 mb-3 font-mono">
                                                    {project.subtitle}
                                                </p>
                                            )}
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {project.description}
                                            </p>
                                        </div>

                                        {/* Bottom Accent */}
                                        <div className="relative z-10">
                                            <div
                                                className="h-1 rounded-full transition-all duration-300 group-hover:h-2"
                                                style={{ backgroundColor: project.color }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Hover Effects */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Theme-specific Design Elements */}
                                {project.design === "learning-theme" && project.elements && (
                                    <>
                                        {project.elements.map((element, idx) => (
                                            <div
                                                key={idx}
                                                className={`absolute ${element.size} ${element.position} ${('rotation' in element ? element.rotation : '')} opacity-60 group-hover:opacity-80 transition-all duration-300`}
                                                style={{ 
                                                    backgroundColor: element.color,
                                                    borderRadius: element.type === "book" ? "2px" : "50%",
                                                    transform: element.type === "sparkle" ? "rotate(45deg)" : "none"
                                                }}
                                            ></div>
                                        ))}
                                    </>
                                )}

                                {project.design === "brain-theme" && project.elements && (
                                    <>
                                        {/* EEG Headset Cartoon */}
                                        <div className="absolute -top-8 -right-8 w-16 h-16 opacity-60 group-hover:opacity-80 transition-all duration-300">
                                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                {/* Head */}
                                                <ellipse cx="32" cy="32" rx="20" ry="16" fill="#2563eb" opacity="0.3"/>
                                                {/* Headset band */}
                                                <path d="M12 32 Q32 20 52 32" stroke="#2563eb" strokeWidth="3" fill="none"/>
                                                {/* Electrodes */}
                                                <circle cx="20" cy="28" r="2" fill="#1d4ed8"/>
                                                <circle cx="44" cy="28" r="2" fill="#1d4ed8"/>
                                                <circle cx="32" cy="36" r="2" fill="#1d4ed8"/>
                                                {/* Wires */}
                                                <path d="M20 28 Q16 24 12 20" stroke="#2563eb" strokeWidth="1" fill="none"/>
                                                <path d="M44 28 Q48 24 52 20" stroke="#2563eb" strokeWidth="1" fill="none"/>
                                            </svg>
                                        </div>
                                        {project.elements.map((element, idx) => (
                                            <div
                                                key={idx}
                                                className={`absolute ${element.size} ${element.position} opacity-60 group-hover:opacity-80 transition-all duration-300`}
                                                style={{ 
                                                    backgroundColor: element.color,
                                                    borderRadius: element.type === "wave" ? "50px" : "50%",
                                                    transform: element.type === "wave" ? "rotate(45deg)" : "none"
                                                }}
                                            ></div>
                                        ))}
                                    </>
                                )}

                                {project.design === "scout-theme" && project.elements && (
                                    <>
                                        {project.elements.map((element, idx) => (
                                            <div
                                                key={idx}
                                                className={`absolute ${element.size} ${element.position} opacity-60 group-hover:opacity-80 transition-all duration-300`}
                                                style={{ 
                                                    backgroundColor: element.color,
                                                    borderRadius: element.type === "tent" ? "50% 50% 0 0" : 
                                                               element.type === "leaf" ? "50% 0 50% 50%" : "50%",
                                                    transform: element.type === "tent" ? "rotate(45deg)" : "none"
                                                }}
                                            ></div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Empty Space at End */}
            <div className="h-32"></div>
        </div>
    );
}

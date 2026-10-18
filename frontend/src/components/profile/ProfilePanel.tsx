"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { Portfolio, ProfileSection } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import {
  Mail,
  Lightbulb,
  Compass,
  X,
  Globe,
} from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface PortfolioSectionEntry {
  title: string;
  description: string;
  metadata?: string;
}

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getPortfolioEntries(
  section: ProfileSection,
  portfolio?: Portfolio
): PortfolioSectionEntry[] {
  if (!portfolio) return [];

  if (section === "Education") {
    return portfolio.education.map((item) => ({
      title: `${item.degree} in ${item.field}`,
      description: item.institution,
      metadata: [item.status, item.year].filter(Boolean).join(" / "),
    }));
  }

  if (section === "Skills") {
    return Object.entries(portfolio.skills)
      .filter(([, skills]) => skills.length > 0)
      .map(([category, skills]) => ({
        title: category.replaceAll("_", " "),
        description: skills.join(", "),
      }));
  }

  if (section === "Experience") {
    return portfolio.experience.map((item) => ({
      title:
        getText(item.role) ||
        getText(item.title) ||
        getText(item.position) ||
        "Experience",
      description: getText(item.description),
      metadata: [getText(item.company), getText(item.year)]
        .filter(Boolean)
        .join(" / "),
    }));
  }

  if (section === "Projects") {
    return portfolio.projects.map((project) => ({
      title: project.name,
      description: project.description,
      metadata: [project.role, ...project.technologies]
        .filter(Boolean)
        .join(" / "),
    }));
  }

  return [];
}

const SECTION_EYEBROWS: Partial<Record<ProfileSection, string>> = {
  Education: "Learning / Foundation",
  Skills: "Capabilities",
  Experience: "Work History",
  Projects: "Selected Work",
};

export function ProfilePanel() {
  const {
    data: portfolio,
    isPending: isPortfolioPending,
    isError: isPortfolioError,
  } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => apiClient<Portfolio>(API_ENDPOINTS.PORTFOLIO),
  });
  const {
    isProfileOpen,
    activeProfileSection,
    setActiveProfileSection,
  } = useWorkspaceStore();
  const isFlipped = activeProfileSection !== "About";
  const personalDetails = portfolio?.personal as
    | (Portfolio["personal"] & { about?: string; short_about?: string })
    | undefined;
  const activeTab =
    activeProfileSection === "Thoughts"
      ? "thoughts"
      : activeProfileSection === "Extracurricular"
        ? "extracurricular"
        : "about";
  const sectionEntries = getPortfolioEntries(activeProfileSection, portfolio);
  const socialLinks = [
    {
      href: portfolio?.personal.github || "",
      label: "GitHub Profile",
      icon: <FaGithub className="h-4 w-4" />,
    },
    {
      href: portfolio?.personal.email ? `mailto:${portfolio.personal.email}` : "",
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      href: portfolio?.personal.linkedin || "",
      label: "LinkedIn Profile",
      icon: <FaLinkedinIn className="h-4 w-4" />,
    },
    {
      href: portfolio?.personal.portfolio || "",
      label: "Portfolio Website",
      icon: <Globe className="h-4 w-4" />,
    },
  ];

  return (
    <aside
      aria-label="Profile Panel"
      className={cn(
        "fixed top-20 right-6 bottom-6 w-[360px] z-20",
        "select-none pointer-events-auto",
        "flex flex-col transition-all duration-300 ease-in-out",
        isProfileOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-[410px] opacity-0 pointer-events-none"
      )}
    >
      <div className="profile-panel-scene relative flex-1">
        <div
          className={cn(
            "profile-panel-flipper relative h-full w-full",
            isFlipped && "is-flipped"
          )}
        >
          <section
            aria-hidden={isFlipped}
            className="profile-panel-surface profile-panel-face profile-panel-front absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#16171c]/90 p-4 shadow-2xl shadow-black/95 backdrop-blur-2xl"
          >
        {/* Ambient glow */}
        <div
          className="
            pointer-events-none absolute
            -inset-3
            bg-gradient-to-b
            from-purple-600/15
            via-indigo-600/10
            to-transparent
            rounded-[36px]
            blur-2xl
            opacity-60
            -z-10
          "
        />

        {/* ===================================================== */}
        {/* TOP TABS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          {/* Thoughts */}
          <button
            type="button"
            onClick={() => {
              setActiveProfileSection("Thoughts");
            }}
            aria-pressed={activeProfileSection === "Thoughts"}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-3 rounded-full",
              "text-xs font-medium",
              "transition-all duration-200",
              "cursor-pointer border",
              activeTab === "thoughts"
                ? "bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-[0_0_14px_rgba(168,85,247,0.3)]"
                : "bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
            )}
          >
            <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
            <span>Thoughts</span>
          </button>

          {/* Extracurricular */}
          <button
            type="button"
            onClick={() => {
              setActiveProfileSection("Extracurricular");
            }}
            aria-pressed={activeProfileSection === "Extracurricular"}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-3 rounded-full",
              "text-xs font-medium",
              "transition-all duration-200",
              "cursor-pointer border",
              activeTab === "extracurricular"
                ? "bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-[0_0_14px_rgba(168,85,247,0.3)]"
                : "bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
            )}
          >
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>Extracurricular</span>
          </button>
        </div>

        {/* ===================================================== */}
        {/* SOCIAL ICONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {socialLinks.map((link) => {
            const isAvailable = Boolean(link.href);

            if (!isAvailable) {
              return (
                <div
                  key={link.label}
                  className="flex h-10 cursor-default items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-500 opacity-60"
                  title={`${link.label} not available`}
                  aria-label={`${link.label} not available`}
                >
                  {link.icon}
                </div>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                target={link.label === "Send Email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-600/20 hover:text-purple-200"
                title={link.label}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            );
          })}
        </div>
{/* ===================================================== */}
{/* MAIN PROFILE — FULL BLEED IMAGE + TEXT OVERLAY */}
{/* ===================================================== */}

<div
  className="
    group relative flex-1
    min-h-0
    overflow-hidden
    rounded-[22px]
    border border-white/[0.10]
    bg-black
    transition-all duration-500
    hover:border-purple-500/40
    hover:shadow-[0_0_30px_rgba(168,85,247,0.18)]
  "
>
  {/* ================================================= */}
  {/* FULL BLEED PORTRAIT */}
  {/* ================================================= */}

  <div className="absolute inset-0">
    <Image
      src="/images/profile_portrait.png"
      alt={portfolio?.personal.name || "Portfolio profile"}
      fill
      priority
      sizes="360px"
      className="
        object-cover
        object-center
        scale-[1.01]
        transition-transform
        duration-700
        group-hover:scale-[1.04]
      "
    />
  </div>

  {/* ================================================= */}
  {/* IMAGE READABILITY GRADIENT */}
  {/* ================================================= */}

  <div
    className="
      absolute inset-0
      pointer-events-none

      bg-gradient-to-b
      from-black/5
      via-transparent
      to-black/85

      transition-all duration-500

      group-hover:from-black/10
      group-hover:to-black/75
    "
  />

  {/* Subtle atmospheric overlay */}
  <div
    className="
      absolute inset-0
      pointer-events-none
      bg-gradient-to-tr
      from-purple-900/10
      via-transparent
      to-blue-500/10
    "
  />

  {/* =================================================
  {/* COLLAPSE BUTTON */}
  {/* ================================================= */}

  {/* <button
    type="button"
    onClick={toggleProfile}
    className="
      absolute top-3 right-3 z-30

      flex h-8 w-8
      items-center justify-center

      rounded-full

      bg-black/45
      backdrop-blur-md

      text-zinc-300
      hover:text-white

      hover:bg-purple-600/40

      border border-white/10
      hover:border-purple-400/40

      transition-all duration-200

      cursor-pointer
    "
    title="Collapse profile panel"
    aria-label="Slide out profile panel"
  >
    <ChevronsRight className="h-4 w-4" />
  </button> */} 

  {/* ================================================= */}
  {/* IDENTITY */}
  {/* ================================================= */}

  <div
    className="
      absolute
      left-4 right-4
      bottom-[175px]
      z-10

      transition-all duration-500

      group-hover:translate-y-[-4px]
    "
  >
    <h3
      className="
        text-xl
        font-bold
        text-white
        tracking-tight

        drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]
      "
    >
      {portfolio?.personal.name ||
        (isPortfolioPending ? "Loading portfolio..." : "Portfolio unavailable")}
    </h3>

    <p
      className="
        mt-0
        text-xs
        text-purple-200
        font-medium
        font-mono

        drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
      "
    >
      {portfolio?.personal.headline}
    </p>
  </div>

  {/* ================================================= */}
  {/* ABOUT / THOUGHTS / EXTRACURRICULAR */}
  {/* NO CARD / NO BACKGROUND */}
  {/* ================================================= */}

  <div
    className="
      absolute
      left-4 right-4
      bottom-4
      z-20
    "
  >
    {/* ABOUT */}
    {activeTab === "about" && (
      <div
        className="
          transition-all
          duration-300
        "
      >
        <div
          className="
            text-[11.5px]
            text-zinc-200
            group-hover:text-white

            transition-colors
            duration-300

            space-y-1.5
            leading-relaxed

            drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]
          "
        >
          <div className="flex items-center gap-2 mb-1 text-white font-semibold text-[12px] tracking-tight">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            <span>About:</span>
          </div>

          <p
            className="
              text-zinc-300
              group-hover:text-zinc-100
              transition-colors duration-300
            "
          >
            {isPortfolioPending
              ? "Loading summary..."
              : personalDetails?.short_about ||
                personalDetails?.about ||
                "A short personal summary is not available yet."}
          </p>

          <div className="pt-1 space-y-1 text-[11px] text-zinc-300">
            <p>
              <span className="text-zinc-400">Phone:</span>{" "}
              {isPortfolioPending
                ? "Loading phone..."
                : portfolio?.personal.phone || "Phone unavailable"}
            </p>
            <p>
              <span className="text-zinc-400">Email:</span>{" "}
              {isPortfolioPending
                ? "Loading email..."
                : portfolio?.personal.email || "Email unavailable"}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* THOUGHTS */}
    {activeTab === "thoughts" && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="
              font-semibold
              text-purple-200
              text-xs
              flex items-center gap-1.5
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
            "
          >
            <Lightbulb className="h-3 w-3 text-purple-400" />
            Thoughts:
          </span>

          <span
            className="
              text-[10px]
              text-zinc-300
              font-mono
              drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]
            "
          >
            Architecture
          </span>
        </div>

        <div
          className="
            text-[11.5px]
            text-zinc-200
            group-hover:text-white
            transition-colors
            duration-300
            leading-relaxed
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]
          "
        >
          <p>
            Autonomous agents should operate within spatial graph
            workspaces rather than linear text chats. Giving models
            visual memory and modular document context produces
            drastically better outcomes.
          </p>
        </div>
      </div>
    )}

    {/* EXTRACURRICULAR */}
    {activeTab === "extracurricular" && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="
              font-semibold
              text-indigo-200
              text-xs
              flex items-center gap-1.5
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
            "
          >
            <Compass className="h-3 w-3 text-indigo-400" />
            Extracurricular:
          </span>

          <span
            className="
              text-[10px]
              text-zinc-300
              font-mono
              drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]
            "
          >
            Activities
          </span>
        </div>

        <div
          className="
            text-[11.5px]
            text-zinc-200
            group-hover:text-white
            transition-colors
            duration-300
            leading-relaxed
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]
          "
        >
          <p>
            Open-source contributor, hackathon mentor, tech speaker
            on graph topologies, and avid builder of physical
            computing & creative code experiments.
          </p>
        </div>
      </div>
    )}
  </div>
</div>
        {/* ===================================================== */}
        {/* FOOTER */}
        {/* ===================================================== */}

        <div className="pt-2.5 mt-2 text-center">
          <p className="text-[10px] text-zinc-500 font-mono">
            Copyright © 2025-2026 {isPortfolioPending
              ? "Loading portfolio..."
              : portfolio?.personal.name || "Portfolio"}
          </p>
        </div>
          </section>

          <section
            aria-hidden={!isFlipped}
            className="profile-panel-surface profile-panel-face profile-panel-back absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#16171c]/95 p-5 shadow-2xl shadow-black/95 backdrop-blur-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-purple-300">
                  {portfolio?.personal.name || "Portfolio"} / {activeProfileSection === "Thoughts"
                    ? "Field Notes"
                    : activeProfileSection === "Extracurricular"
                      ? "Outside Work"
                      : SECTION_EYEBROWS[activeProfileSection] ?? "Portfolio"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {activeProfileSection}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProfileSection("About")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close and return to About"
                title="Return to About"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto py-6">
              {activeProfileSection === "Thoughts" ? (
                <article className="space-y-5">
                  <p className="text-sm leading-7 text-zinc-200">
                    Autonomous agents should operate within spatial graph
                    workspaces rather than linear text chats. Giving models
                    visual memory and modular document context produces
                    drastically better outcomes.
                  </p>
                  <p className="border-l-2 border-purple-400/60 pl-4 text-xs leading-6 text-zinc-400">
                    Design note / Context is easier to reason about when its
                    relationships are visible.
                  </p>
                </article>
              ) : activeProfileSection === "Extracurricular" ? (
                <article className="space-y-5">
                  <p className="text-sm leading-7 text-zinc-200">
                    Open-source contributor, hackathon mentor, tech speaker on
                    graph topologies, and avid builder of physical computing
                    and creative code experiments.
                  </p>
                  <p className="border-l-2 border-indigo-400/60 pl-4 text-xs leading-6 text-zinc-400">
                    Outside the screen / Building, teaching, and sharing ideas
                    with the wider engineering community.
                  </p>
                </article>
              ) : (
                <div className="space-y-4">
                  {isPortfolioPending ? (
                    <p className="text-sm text-zinc-400">Loading portfolio...</p>
                  ) : isPortfolioError ? (
                    <p className="text-sm text-zinc-400">
                      Portfolio details could not be loaded. Check the backend connection.
                    </p>
                  ) : sectionEntries.length > 0 ? (
                    sectionEntries.map((entry) => (
                      <article
                        key={`${activeProfileSection}-${entry.title}`}
                        className="border-b border-white/[0.08] pb-4 last:border-b-0"
                      >
                        <h3 className="text-sm font-semibold capitalize text-white">
                          {entry.title}
                        </h3>
                        {entry.description && (
                          <p className="mt-2 text-xs leading-6 text-zinc-300">
                            {entry.description}
                          </p>
                        )}
                        {entry.metadata && (
                          <p className="mt-2 font-mono text-[10px] capitalize text-zinc-500">
                            {entry.metadata}
                          </p>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">
                      No {activeProfileSection.toLowerCase()} details are listed in the portfolio yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="border-t border-white/10 pt-3 font-mono text-[10px] text-zinc-500">
              {activeProfileSection.toUpperCase()} / 01
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}
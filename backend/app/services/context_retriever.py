from __future__ import annotations

import re
from typing import Any
from app.models.portfolio import Portfolio, Project, Education, Skills
from app.services.documents import DocumentContent


# Common entity patterns for fast resolution
PROJECT_NAME_MAP = {
    "mediloon": "MEDILOON",
    "evergallery": "EverGallery",
    "ever gallery": "EverGallery",
    "tadev": "Tadev Lagnam",
    "lagnam": "Tadev Lagnam",
    "tadev lagnam": "Tadev Lagnam",
    "matrimonial": "Tadev Lagnam",
    "ai safety": "AI Safety Policy & Compliance RAG",
    "compliance rag": "AI Safety Policy & Compliance RAG",
    "policy rag": "AI Safety Policy & Compliance RAG",
    "safety policy": "AI Safety Policy & Compliance RAG",
    "portfolio assistant": "AI Portfolio Assistant",
    "ai portfolio": "AI Portfolio Assistant",
}

GREETING_WORDS = {
    "hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon",
    "good evening", "howdy", "sup", "yo", "thanks", "thank you", "thx", "who are you",
    "what are you", "what can you do", "introduce yourself"
}

OVERVIEW_KEYWORDS = {
    "about om", "who is om", "tell me about om", "overview", "summary",
    "profile", "tell me about yourself", "what do you know about om",
    "show me his profile", "bio", "quick overview", "his background",
    "om's background", "overall background", "general background"
}

RECRUITER_KEYWORDS = {
    "hire", "why hire", "should we hire", "fit", "candidate", "strengths",
    "interview", "resume", "qualifications", "suitable", "match", "role",
    "apply", "job description", "jd", "position"
}


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"\b[a-z0-9+#.-]+\b", text.lower()))


class PortfolioContextEngine:
    """
    Instance-based / context-based retrieval engine for Om Rakhade's portfolio.
    Selectively retrieves and formats only the specific portfolio data required
    to answer the user's query, drastically reducing input tokens and latency.
    """

    def __init__(self, portfolio: Portfolio):
        self.portfolio = portfolio
        self._project_map: dict[str, Project] = {p.name.upper(): p for p in portfolio.projects}

    def resolve_referenced_project(self, query: str, history: list) -> Project | None:
        """
        Resolves project references by name, alias, ordinal ('first', 'second'),
        or pronoun context from recent chat history.
        """
        q_lower = query.lower()

        # 1. Direct name/alias match in current query
        for alias, real_name in PROJECT_NAME_MAP.items():
            if alias in q_lower:
                return self._project_map.get(real_name.upper())

        # 2. Check ordinal references (e.g. "first one", "second project")
        ordinal_idx = None
        if re.search(r"\b(first|1st)\b", q_lower):
            ordinal_idx = 0
        elif re.search(r"\b(second|2nd)\b", q_lower):
            ordinal_idx = 1
        elif re.search(r"\b(third|3rd)\b", q_lower):
            ordinal_idx = 2
        elif re.search(r"\b(fourth|4th)\b", q_lower):
            ordinal_idx = 3
        elif re.search(r"\b(last|latest)\b", q_lower):
            ordinal_idx = -1

        # Check recent conversation history for project mentions
        recent_mentioned_projects: list[Project] = []
        for msg in reversed(history[-4:] if history else []):
            content = getattr(msg, "content", "")
            for p in self.portfolio.projects:
                if p.name.lower() in content.lower() and p not in recent_mentioned_projects:
                    recent_mentioned_projects.append(p)

        if ordinal_idx is not None:
            if recent_mentioned_projects and abs(ordinal_idx) < len(recent_mentioned_projects):
                # Reverse to maintain original chronological mention order
                ordered = list(reversed(recent_mentioned_projects))
                return ordered[ordinal_idx]
            if self.portfolio.projects and abs(ordinal_idx) < len(self.portfolio.projects):
                return self.portfolio.projects[ordinal_idx]

        # 3. Pronoun reference ("it", "that project", "the project", "this project")
        if re.search(r"\b(it|that|this|the project|that project)\b", q_lower):
            if recent_mentioned_projects:
                return recent_mentioned_projects[0]

        return None

    def retrieve_context(
        self,
        query: str,
        history: list,
        system_documents: list[DocumentContent] | None = None,
        user_documents: list[DocumentContent] | None = None,
    ) -> str:
        """
        Selectively fetches and formats only the relevant slices of data
        based on intent and entity recognition.
        """
        q_tokens = _tokenize(query)
        q_lower = query.lower().strip()

        # Check if greeting / meta-only
        is_pure_greeting = (
            any(q_lower == g or q_lower.startswith(g + " ") for g in GREETING_WORDS)
            and len(q_tokens) <= 5
            and not any(k in q_lower for k in ["project", "skill", "experience", "education", "hire"])
        )

        if is_pure_greeting:
            return self._format_minimal_identity()

        # Resolve project reference if present
        target_project = self.resolve_referenced_project(query, history)

        # Detect specific domains
        wants_overview = any(k in q_lower for k in OVERVIEW_KEYWORDS)
        wants_recruiter = (
            any(k in q_lower for k in RECRUITER_KEYWORDS)
            or (user_documents and len(user_documents) > 0)
        )
        wants_projects_list = any(k in q_lower for k in ["projects", "what did he build", "work examples", "portfolio projects", "built"])
        wants_skills = bool(q_tokens & {
            "skill", "skills", "tech", "technologies", "technology", "stack", "languages", "language",
            "framework", "tools", "python", "java", "javascript", "typescript", "react", "next.js",
            "flutter", "fastapi", "spring", "docker", "aws", "sql", "postgresql", "ai", "ml", "rag",
            "langgraph", "langchain", "llamaindex", "database", "databases", "devops"
        })
        wants_experience = bool(q_tokens & {
            "experience", "work", "job", "internship", "intern", "company", "worked", "employment",
            "ausam", "datastack"
        })
        wants_education = bool(q_tokens & {
            "education", "college", "degree", "university", "sggs", "diploma", "cgpa", "gpa",
            "percentage", "school", "b.tech", "btech", "marks", "grades", "study", "studied", "coursework"
        })
        wants_achievements = bool(q_tokens & {
            "achievement", "achievements", "hackathon", "hackathons", "sih", "smart", "odyssey",
            "award", "awards", "prize", "winner", "competition"
        })
        wants_leadership = bool(q_tokens & {
            "leadership", "leader", "president", "itsa", "lead", "association"
        })
        wants_research = bool(q_tokens & {
            "research", "paper", "theorem", "lean", "leandojo", "autoformalization", "combinatorics"
        })
        wants_career = bool(q_tokens & {
            "career", "goal", "goals", "aspirations", "future", "target", "interests", "preferences", "problem solving"
        })

        context_blocks: list[str] = []

        # 1. Targeted Project Query
        if target_project and not wants_overview:
            context_blocks.append(self._format_project_detail(target_project))
            # Also attach brief skills if query asked about technologies in that project
            if wants_skills or "tech" in q_lower:
                context_blocks.append(self._format_skills_summary())
            return "\n\n".join(context_blocks)

        # 2. Recruiter / Job Fit Evaluation
        if wants_recruiter:
            context_blocks.append(self._format_profile_summary())
            context_blocks.append(self._format_resume_summary())
            context_blocks.append(self._format_skills_summary())
            context_blocks.append(self._format_projects_overview())
            context_blocks.append(self._format_experience())
            context_blocks.append(self._format_education())
            if user_documents:
                context_blocks.append(self._format_user_documents(user_documents))
            return "\n\n".join(context_blocks)

        # 3. Broad Profile / Overview
        if wants_overview:
            context_blocks.append(self._format_profile_summary())
            context_blocks.append(self._format_education())
            context_blocks.append(self._format_skills_summary())
            context_blocks.append(self._format_projects_overview(featured_only=True))
            context_blocks.append(self._format_achievements())
            return "\n\n".join(context_blocks)

        # 4. Domain-specific context retrieval
        if wants_projects_list:
            context_blocks.append(self._format_projects_overview())

        if wants_skills:
            context_blocks.append(self._format_skills_summary())
            # Find matching projects that demonstrate this skill
            matched_projects = self._find_projects_by_tech(q_tokens)
            if matched_projects:
                context_blocks.append(self._format_matched_projects_snippet(matched_projects))

        if wants_experience:
            context_blocks.append(self._format_experience())

        if wants_education:
            context_blocks.append(self._format_education())

        if wants_achievements:
            context_blocks.append(self._format_achievements())

        if wants_leadership:
            context_blocks.append(self._format_leadership())

        if wants_research:
            context_blocks.append(self._format_research())

        if wants_career:
            context_blocks.append(self._format_career_and_prefs())

        # If connected documents exist, add relevant excerpts
        if user_documents and not wants_recruiter:
            context_blocks.append(self._format_user_documents(user_documents))
        if system_documents:
            sys_doc_text = self._format_system_documents(system_documents, q_tokens)
            if sys_doc_text:
                context_blocks.append(sys_doc_text)

        # Fallback if no specific section was triggered: include a compact core snapshot
        if not context_blocks:
            context_blocks.append(self._format_profile_summary())
            context_blocks.append(self._format_skills_summary())
            context_blocks.append(self._format_projects_overview(featured_only=True))

        return "\n\n".join(context_blocks)

    # -------------------------------------------------------------------------
    # Compact Formatters (Dense Markdown, Zero Token Bloat)
    # -------------------------------------------------------------------------

    def _format_minimal_identity(self) -> str:
        p = self.portfolio.personal
        return (
            f"### Identity\n"
            f"- Name: {p.name}\n"
            f"- Headline: {p.headline}\n"
            f"- About: {p.short_about or p.about}"
        )

    def _format_profile_summary(self) -> str:
        p = self.portfolio.personal
        links = []
        if p.github:
            links.append(f"GitHub: {p.github}")
        if p.linkedin:
            links.append(f"LinkedIn: {p.linkedin}")
        links_str = " | ".join(links) if links else ""
        return (
            f"### Profile: {p.name}\n"
            f"- Headline: {p.headline}\n"
            f"- Location: {p.location}\n"
            f"- Contact: {p.email} | {p.phone}\n"
            f"{f'- Links: {links_str}' if links_str else ''}\n"
            f"- Bio: {p.short_about or p.about}\n"
            f"- Career Focus: {', '.join(p.career_focus)}"
        )

    def _format_resume_summary(self) -> str:
        res = self.portfolio.resume
        if not res or not res.summary:
            return ""
        return f"### Resume Summary\n{res.summary}"

    def _format_education(self) -> str:
        lines = ["### Education"]
        for edu in self.portfolio.education:
            grade = f" (CGPA: {edu.cgpa})" if edu.cgpa else (f" ({edu.percentage})" if edu.percentage else "")
            years = f" ({edu.year})" if edu.year else ""
            subj = f" - Coursework: {', '.join(edu.relevant_subjects[:6])}" if edu.relevant_subjects else ""
            lines.append(f"- **{edu.degree} in {edu.field}**{years} - {edu.institution}{grade}{subj}")
        return "\n".join(lines)

    def _format_skills_summary(self) -> str:
        s = self.portfolio.skills
        return (
            "### Technical Skills\n"
            f"- **Languages**: {', '.join(s.programming_languages)}\n"
            f"- **Frontend**: {', '.join(s.frontend)}\n"
            f"- **Backend & APIs**: {', '.join(s.backend)}\n"
            f"- **AI / ML & Agents**: {', '.join(s.ai_ml + s.llm_and_agents[:6])}\n"
            f"- **RAG & Vector DBs**: {', '.join(s.ai_rag)}\n"
            f"- **Databases**: {', '.join(s.databases)}\n"
            f"- **Cloud & DevOps**: {', '.join(s.cloud + s.devops)}\n"
            f"- **Tools & Mobile**: {', '.join(s.tools + s.mobile)}"
        )

    def _format_projects_overview(self, featured_only: bool = False) -> str:
        projects = self.portfolio.projects[:3] if featured_only else self.portfolio.projects
        lines = ["### Projects Overview" if not featured_only else "### Featured Projects"]
        for p in projects:
            tech_str = ", ".join(p.technologies)
            lines.append(f"- **{p.name}** ({p.category}): {p.description} [Tech: {tech_str}]")
        return "\n".join(lines)

    def _format_project_detail(self, p: Project) -> str:
        lines = [
            f"### Project Detail: {p.name}",
            f"- **Category**: {p.category}",
            f"- **Role**: {p.role or 'Developer'}",
            f"- **Description**: {p.description}",
            f"- **Technologies**: {', '.join(p.technologies)}",
        ]
        if p.architecture:
            arch = ", ".join(f"{k}: {v}" for k, v in p.architecture.items())
            lines.append(f"- **Architecture**: {arch}")
        if p.features:
            lines.append(f"- **Key Features**: {', '.join(p.features)}")
        if p.ai_agents:
            lines.append(f"- **AI Agents**: {', '.join(p.ai_agents)}")
        if p.core_flow:
            lines.append(f"- **Core Flow**: {' -> '.join(p.core_flow)}")
        if p.evidence:
            lines.append(f"- **Key Contributions**: {'; '.join(p.evidence[:4])}")
        if p.technical_challenges:
            lines.append(f"- **Technical Challenges Solved**: {', '.join(p.technical_challenges)}")
        return "\n".join(lines)

    def _find_projects_by_tech(self, tokens: set[str]) -> list[Project]:
        matched = []
        for p in self.portfolio.projects:
            p_tech_tokens = _tokenize(" ".join(p.technologies) + " " + p.description)
            if tokens & p_tech_tokens:
                matched.append(p)
        return matched

    def _format_matched_projects_snippet(self, projects: list[Project]) -> str:
        lines = ["### Relevant Projects for Query"]
        for p in projects[:3]:
            lines.append(f"- **{p.name}**: Uses {', '.join(p.technologies[:5])}. {p.description}")
        return "\n".join(lines)

    def _format_experience(self) -> str:
        lines = ["### Work & Research Experience"]
        for exp in self.portfolio.experience:
            comp = exp.get("company", exp.get("type", "Experience"))
            role = exp.get("role", exp.get("area", ""))
            dates = f" ({exp.get('start_date', '')} - {exp.get('end_date', '')})" if exp.get("start_date") else ""
            techs = f" [Tech: {', '.join(exp.get('technologies', []))}]" if exp.get("technologies") else ""
            resps = exp.get("responsibilities", exp.get("evidence", []))
            resp_str = f" Key duties: {'; '.join(resps[:3])}." if resps else ""
            lines.append(f"- **{comp}** - {role}{dates}{techs}.{resp_str}")
        return "\n".join(lines)

    def _format_achievements(self) -> str:
        lines = ["### Achievements & Hackathons"]
        for h in self.portfolio.hackathons:
            lines.append(f"- **{h.get('name')}**: {h.get('achievement', '')} ({h.get('year', '')}) - {h.get('description', '')}")
        for ach in self.portfolio.achievements:
            if not any(h.get("name") in ach.title for h in self.portfolio.hackathons):
                lines.append(f"- **{ach.title}**: {ach.description}")
        return "\n".join(lines)

    def _format_leadership(self) -> str:
        lines = ["### Leadership & Extracurriculars"]
        for l in self.portfolio.leadership:
            lines.append(
                f"- **{l.get('role')} at {l.get('organization')} ({l.get('short_name', '')})** [{l.get('period', '')}]: "
                f"{l.get('vision', '')} Slogan: '{l.get('slogan', '')}'. Responsibilities: {', '.join(l.get('responsibilities', []))}."
            )
        return "\n".join(lines)

    def _format_research(self) -> str:
        lines = ["### Research"]
        for r in self.portfolio.research:
            tech = f" (Tech: {', '.join(r.technologies)})" if r.technologies else ""
            lines.append(f"- **{r.title or r.topic}**: {r.focus or r.description}{tech}")
        return "\n".join(lines)

    def _format_career_and_prefs(self) -> str:
        c = self.portfolio.career
        prefs = self.portfolio.development_preferences
        lines = ["### Career Goals & Development Approach"]
        if c.get("target_roles"):
            lines.append(f"- **Target Roles**: {', '.join(c.get('target_roles', []))}")
        if c.get("short_term_goals"):
            lines.append(f"- **Short-term Goals**: {'; '.join(c.get('short_term_goals', []))}")
        if prefs.get("development_style"):
            lines.append(f"- **Development Style**: {', '.join(prefs.get('development_style', []))}")
        return "\n".join(lines)

    def _format_user_documents(self, documents: list[DocumentContent]) -> str:
        lines = ["### Connected Visitor Documents (Role / Task Context Only - NOT Om's Profile)"]
        for doc in documents:
            clean_text = " ".join(doc.text.split())
            # Budget to ~1,500 chars to avoid blowing input token limits
            truncated = clean_text[:1500] + ("..." if len(clean_text) > 1500 else "")
            lines.append(f"**Document: {doc.name}**\n{truncated}")
        return "\n\n".join(lines)

    def _format_system_documents(self, documents: list[DocumentContent], query_tokens: set[str]) -> str:
        lines = []
        for doc in documents:
            doc_tokens = _tokenize(doc.text[:2000])
            if query_tokens & doc_tokens:
                lines.append(f"**System Doc ({doc.name})**: {doc.text[:800]}...")
        if lines:
            return "### Additional System Documents\n" + "\n".join(lines)
        return ""

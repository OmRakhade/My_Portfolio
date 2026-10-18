from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


class Personal(BaseModel):
    name: str
    headline: str = ""
    location: str = ""
    email: str = ""
    phone: str = ""
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""
    about: str = ""
    short_about: str = ""
    interests: list[str] = Field(default_factory=list)
    career_focus: list[str] = Field(default_factory=list)


class Education(BaseModel):
    degree: str = ""
    field: str = ""
    institution: str = ""
    location: str = ""
    status: str = ""
    start_year: str = ""
    end_year: str = ""
    year: str = ""
    cgpa: str = ""
    percentage: str = ""
    achievement: str = ""
    relevant_subjects: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def normalize_years(cls, values: Any):
        if isinstance(values, dict):
            start = str(values.get("start_year") or "").strip()
            end = str(values.get("end_year") or "").strip()
            if not values.get("year"):
                if start and end:
                    values["year"] = f"{start} - {end}"
                elif start:
                    values["year"] = start
        return values


class Skills(BaseModel):
    programming_languages: list[str] = Field(default_factory=list)
    frontend: list[str] = Field(default_factory=list)
    mobile: list[str] = Field(default_factory=list)
    backend: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    ai_ml: list[str] = Field(default_factory=list)
    llm_and_agents: list[str] = Field(default_factory=list)
    ai_rag: list[str] = Field(default_factory=list)
    cloud: list[str] = Field(default_factory=list)
    devops: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    development_concepts: list[str] = Field(default_factory=list)


class Project(BaseModel):
    name: str
    category: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    role: str = ""
    architecture: dict[str, Any] = Field(default_factory=dict)
    evidence: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    technical_challenges: list[str] = Field(default_factory=list)
    ai_agents: list[str] = Field(default_factory=list)
    core_flow: list[str] = Field(default_factory=list)
    database_entities: list[str] = Field(default_factory=list)


class Achievement(BaseModel):
    title: str
    description: str = ""
    year: str = ""


class Certification(BaseModel):
    name: str
    issuer: str = ""
    year: str = ""


class Research(BaseModel):
    title: str = ""
    topic: str = ""
    focus: str = ""
    description: str = ""
    domain: str = ""
    specific_area: str = ""
    technology: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def normalize_research(cls, values: Any):
        if isinstance(values, dict):
            if not values.get("title") and values.get("topic"):
                values["title"] = values["topic"]
            if not values.get("description") and values.get("focus"):
                values["description"] = values["focus"]
            if not values.get("technologies") and values.get("technology"):
                values["technologies"] = values["technology"]
        return values


class Resume(BaseModel):
    url: str = ""
    last_updated: str = ""
    summary: str = ""


class Portfolio(BaseModel):
    personal: Personal
    education: list[Education] = Field(default_factory=list)
    skills: Skills
    projects: list[Project] = Field(default_factory=list)
    experience: list[dict] = Field(default_factory=list)
    leadership: list[dict] = Field(default_factory=list)
    hackathons: list[dict] = Field(default_factory=list)
    achievements: list[Achievement] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    research: list[Research] = Field(default_factory=list)
    soft_skills: dict[str, list[str]] = Field(default_factory=dict)
    problem_solving: dict[str, list[str]] = Field(default_factory=dict)
    development_preferences: dict[str, Any] = Field(default_factory=dict)
    career: dict[str, Any] = Field(default_factory=dict)
    resume: Resume = Field(default_factory=Resume)
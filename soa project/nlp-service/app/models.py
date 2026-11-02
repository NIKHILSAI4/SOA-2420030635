from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ExtractRequest(BaseModel):
    text: str = Field(..., description="Raw text of the resume or job description")

class ExtractedProfile(BaseModel):
    skills: List[str] = Field(default_factory=list, description="Extracted canonical skills")
    skillCategories: Dict[str, List[str]] = Field(default_factory=dict, description="Skills grouped by category")
    experienceYears: float = Field(0.0, description="Estimated years of professional experience")
    education: List[str] = Field(default_factory=list, description="Detected academic degrees")
    certifications: List[str] = Field(default_factory=list, description="Detected certifications")
    projects: List[str] = Field(default_factory=list, description="Detected key project highlights")

class SimilarityRequest(BaseModel):
    jobSkills: List[str] = Field(..., description="List of required skills from the job posting")
    candidateSkills: List[str] = Field(..., description="List of skills extracted from candidate resume")

class SkillMatchInfo(BaseModel):
    matchedWith: Optional[str] = None
    score: float = 0.0
    matchType: str = "MISSING"  # EXACT, SEMANTIC, or MISSING
    explanation: str = ""

class SimilarityResponse(BaseModel):
    similarityMatrix: Dict[str, SkillMatchInfo]
    overallSkillScore: float
    matchedSkills: List[str]
    missingSkills: List[str]

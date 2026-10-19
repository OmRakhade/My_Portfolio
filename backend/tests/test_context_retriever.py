import unittest

from app.services.context_retriever import PortfolioContextEngine
from app.services.promp_builder import load_portfolio


class PortfolioContextRetrieverTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = PortfolioContextEngine(load_portfolio())

    def retrieve(self, query: str) -> str:
        return self.engine.retrieve_context(query, history=[])

    def test_experience_quick_prompt_retrieves_work_and_research(self):
        context = self.retrieve(
            "Summarize Om's employment and internships, including organizations, roles, dates, and documented responsibilities. Do not substitute project work for employment."
        )

        self.assertIn("### Work & Research Experience", context)
        self.assertIn("AuSaM Innovations Pvt Ltd", context)
        self.assertIn("Datastack Technologies", context)
        self.assertIn("Research Internship", context)
        self.assertNotIn("### Featured Projects", context)
        self.assertNotIn("### Research", context)

    def test_plural_experiences_retrieves_experience(self):
        context = self.retrieve("Tell me about your Experiences")

        self.assertIn("### Work & Research Experience", context)
        self.assertIn("AuSaM Innovations Pvt Ltd", context)

    def test_achievements_quick_prompt_retrieves_awards_and_leadership(self):
        context = self.retrieve(
            "Summarize Om's listed awards, hackathon results, and leadership achievements. State participation counts exactly as documented; do not infer additional events."
        )

        self.assertIn("### Achievements & Hackathons", context)
        self.assertIn("Smart India Hackathon", context)
        self.assertIn("AI Odyssey 2023", context)
        self.assertIn("### Leadership & Extracurriculars", context)
        self.assertNotIn("### Featured Projects", context)

    def test_legacy_achievement_misspelling_still_retrieves_awards(self):
        context = self.retrieve("Tell me about your Achivements")

        self.assertIn("### Achievements & Hackathons", context)
        self.assertIn("Smart India Hackathon", context)


if __name__ == "__main__":
    unittest.main()
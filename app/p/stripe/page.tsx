import CaseStudyLayout from '@/components/case-study/layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study/section';
import { projects } from '@/content/projects';

export default function StripeCaseStudy() {
  return (
    <CaseStudyLayout project={projects.stripe} intro={
      <CaseStudySection>
        <CaseStudyText>
          In the summer of 2026 I joined <CaseStudyHighlight>Stripe in Seattle</CaseStudyHighlight> as
          a Software Engineering Intern. Stripe builds the economic infrastructure for the
          internet—the APIs and systems that businesses of every size use to accept payments and
          move money—and I got to work inside that stack alongside a full-time engineering team.
        </CaseStudyText>
        {/* TODO: Replace the paragraph below with your real team + what you actually shipped.
             Keep anything specific vetted against Stripe's confidentiality expectations. */}
        <CaseStudyText>
          I worked on <CaseStudyHighlight>[team / area]</CaseStudyHighlight>, where I [what you built
          and why it mattered — the problem, your approach, and the impact].
        </CaseStudyText>
      </CaseStudySection>
    }>
      {/* TODO: Flesh these out. Add screenshots/diagrams only if they're cleared for public sharing —
           drop assets in /public/p/stripe and add a coverImage to content/projects.ts for a hero. */}
      <CaseStudySection title="What I worked on">
        <CaseStudyText>
          [Describe the project in a bit more depth: the system you touched, the constraints, and the
          decisions you made.]
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySection title="What I took away">
        <CaseStudyText>
          [What you learned working at Stripe's scale—codebase, code review culture, shipping to
          production, whatever stood out.]
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

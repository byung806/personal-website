import CaseStudyLayout from '@/components/case-study/layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study/section';
import { projects } from '@/content/projects';

export default function StripeCaseStudy() {
  return (
    <CaseStudyLayout project={projects.stripe} intro={
      <CaseStudySection>
        <CaseStudyText>
          As an intern on the User Billing team, I designed and shipped a new event-driven way to charge
          merchants. I owned it end to end: I designed the architecture, built a new API backed by MongoDB,
          and tested and rolled it out in production.
        </CaseStudyText>
        <CaseStudyText>
          It now handles <CaseStudyHighlight>20,000+ fee jobs a day</CaseStudyHighlight> and
          bills <CaseStudyHighlight>100,000+ merchants a month</CaseStudyHighlight>. Merchants used to get
          billed for fees about 3 days after their transactions. Now it&apos;s 1 to 2 hours.
        </CaseStudyText>
      </CaseStudySection>
    }>
      {null}
    </CaseStudyLayout>
  );
}

import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { projects } from '@/content/projects';

export default function TroopWebHostCaseStudy() {
  return (
    <CaseStudyLayout project={projects.troopwebhost}>
      <CaseStudySection>
        <CaseStudyText>
          Boy Scout troop leaders need to track adult training records and send regular updates to their troop members.
          However, updating records manually for <CaseStudyHighlight>100+ people per troop</CaseStudyHighlight> was very tedious.
          I built a desktop app that automates the entire workflow: scraping member data, organizing it into sortable tables, and sending batch emails with one click.
          This <CaseStudyHighlight>reduced the time spent on record-keeping by 66% every week</CaseStudyHighlight>.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/troopwebhost/app-ss.png"
        alt="TroopWebHost desktop application interface"
        aspectRatio="auto"
        caption="Three-panel Tkinter interface with member roster table, recipient list, and email composer with template support."
      />

      <CaseStudySection>
        <CaseStudyText>
          Built with Python and Tkinter for the desktop UI. I used the requests and BeautifulSoup libraries to scrape member data, parsing HTML tables into structured rows.
          One challenge I ran into was that the UI would freeze while data was being processed in the background.
          So, I separated the UI, HTTP requests, and data processing into different threads.
          Email templates are stored in JSON and support variable substitution for personalized batch sends.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

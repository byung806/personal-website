import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { projects } from '@/content/projects';

export default function TroopWebHostCaseStudy() {
  return (
    <CaseStudyLayout project={projects.troopwebhost}>
      <CaseStudySection>
        <CaseStudyText>
          Boy Scout troop leaders need to track adult volunteer training records and send regular updates to their troop members.
          TroopWebHost is a web platform for this, but updating records manually for 50+ people per troop was tedious.
          I built a desktop app that automates the entire workflow—pulling member data, organizing it into sortable tables, and sending batch emails with one click.
          This saved leaders hours every week.
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
          Built with Python and Tkinter for the desktop UI. I used the requests library with BeautifulSoup to scrape member data from TroopWebHost, parsing HTML tables into structured rows. The main technical challenge was threading—I separated the UI, HTTP requests, and data processing into different threads so the interface stayed responsive during long scraping operations. Email templates are stored in JSON and support variable substitution for personalized batch sends.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

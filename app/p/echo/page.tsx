import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyVideo } from '@/components/case-study-video';
import { projects } from '@/content/projects';

export default function EchoCaseStudy() {
  return (
    <CaseStudyLayout project={projects.echo}>
      <CaseStudySection>
        <CaseStudyText>
          Echo is a 2D platformer where you rewind time to leave a “ghost” of your past run. You and your clone exist in the same space: you can bounce off your past self to reach higher ground, trigger switches in one run and walk through the door in the next, or use the clone to hold a button while you cross the gap.
        </CaseStudyText>
        <CaseStudyText>
        We built it in <CaseStudyHighlight>24 hours</CaseStudyHighlight> at TartanHacks 2026 for the AppLovin track, which required the full game—code, assets, everything—to fit in <CaseStudyHighlight>15 KB</CaseStudyHighlight>.
          The size limit forced hard tradeoffs: no image assets (everything is drawn with canvas APIs), hard-coded sound, and aggressive code shrinking. The mechanic had to carry the game.
        </CaseStudyText>
        <CaseStudyText>
           Along with my teammates (Alan Dong, Michael Li, and Seunghyun Bae), we <CaseStudyHighlight>won the AppLovin track</CaseStudyHighlight>.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/echo/unknown%2040.png"
        alt="Echo game screenshot"
        aspectRatio="auto"
        caption="Example level. Your past run is recorded as a clone; you can bounce on it to reach platforms you couldn’t get to in a single jump."
      />

      <CaseStudyVideo
        src="/p/echo/clip1.mp4"
        aspectRatio="horizontal"
        autoplay
        caption="Gameplay clip showing the time-rewind mechanic and platforming."
      />

      <CaseStudySingleImage
        src="/p/echo/unknown%2043.png"
        alt="Echo game scene"
        aspectRatio="auto"
        caption="Some levels are mostly dark. Your “light” clone from the previous run shows the path and where to land; you plan the next run from what you see."
      />

      <CaseStudyVideo
        src="/p/echo/clip2.mp4"
        aspectRatio="horizontal"
        autoplay
        caption="A level where you can't get up to the top without bouncing on your past self."
      />

      <CaseStudySection>
        <CaseStudyText>
          A playable demo is linked in the sidebar.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

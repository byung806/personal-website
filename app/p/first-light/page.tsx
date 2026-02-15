import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyVideo } from '@/components/case-study-video';
import { projects } from '@/content/projects';

export default function FirstLightCaseStudy() {
  return (
    <CaseStudyLayout project={projects['first-light']}>
      <CaseStudySection>
        <CaseStudyText>
          For Apple&apos;s WWDC Swift Student Challenge, I built an interactive app to teach firework chemistry. The project was <CaseStudyHighlight>officially recognized by Apple</CaseStudyHighlight>.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/first-light/tutorial.png"
        alt="First Light tutorial interface"
        aspectRatio="auto"
        caption="Interactive tutorial system built with SceneKit. Materials slide in and out on a 3D table using SCNAction animations, teaching users which chemical elements produce specific colors."
      />

      <CaseStudySingleImage
        src="/p/first-light/creation-screen.png"
        alt="Firework creation interface"
        aspectRatio="auto"
        caption="Ingredient selection interface for designing custom fireworks. Built with UIKit overlays on top of the SceneKit scene. Each chemical element is represented as a draggable 3D node with physics properties. A big challenge was implementing smooth drag-and-drop interactions between UIKit and SceneKit coordinate systems."
      />

      <CaseStudyVideo
        src="/p/first-light/demo-vid.mp4"
        aspectRatio="horizontal"
        caption="Complete workflow from ingredient selection to firework launch. The 3D scene uses SceneKit's particle systems for realistic firework explosions, with custom shaders for color mixing based on selected chemicals. Physics simulation handles the launch trajectory and explosion dynamics. All running in real-time within Swift Playground's sandbox constraints."
      />

      <CaseStudySection>
        <CaseStudyText>
          Overall, I'm very proud of how First Light turned out.
          Working within Swift Playground's limitations pushed me to be creative with SceneKit and UIKit to ensure a performant application even while maintaining great 3D visual quality.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyVideo } from '@/components/case-study-video';
import { projects } from '@/content/projects';

export default function FirstLightCaseStudy() {
  return (
    <CaseStudyLayout project={projects['first-light']}>
      <CaseStudySection>
        <CaseStudyText>
          For Apple's WWDC Swift Student Challenge, I built an interactive app to teach firework chemistry. The project was officially recognized by Apple.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/first-light/tutorial.png"
        alt="First Light tutorial interface"
        aspectRatio="auto"
        caption="Interactive tutorial system built with SceneKit. Materials slide in and out on a 3D table using SCNAction animations, teaching users which chemical elements produce specific colors. The challenge was synchronizing the 3D animations with the tutorial text while maintaining 60fps performance in Swift Playgrounds' constrained environment."
      />

      <CaseStudySingleImage
        src="/p/first-light/creation-screen.png"
        alt="Firework creation interface"
        aspectRatio="auto"
        caption="Ingredient selection interface for designing custom fireworks. Built with UIKit overlays on top of the SceneKit scene. Each chemical element is represented as a draggable 3D node with physics properties. The main technical challenge was implementing smooth drag-and-drop interactions between UIKit and SceneKit coordinate systems."
      />

      <CaseStudyVideo
        src="/p/first-light/demo-vid.mp4"
        aspectRatio="horizontal"
        caption="Complete workflow from ingredient selection to firework launch. The 3D scene uses SceneKit's particle systems for realistic firework explosions, with custom shaders for color mixing based on selected chemicals. Physics simulation handles the launch trajectory and explosion dynamics. All running in real-time within Swift Playgrounds' sandbox constraints."
      />

      <CaseStudySection>
        <CaseStudyText>
          Built entirely in Swift Playgrounds for WWDC Swift Student Challenge submission. The project required working within Playgrounds' limitations—no external frameworks, limited file size, and restricted API access. Used SceneKit for real-time 3D rendering, custom particle systems for explosions, and UIKit for the interface layer. The biggest challenge was optimizing performance while maintaining visual quality, especially with multiple particle emitters running simultaneously during firework displays.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyImageRow } from '@/components/case-study-image-row';
import { CaseStudyVideo } from '@/components/case-study-video';
import { projects } from '@/content/projects';

export default function ThreeDRendererCaseStudy() {
  return (
    <CaseStudyLayout project={projects['3d-renderer']}>
      <CaseStudySection>
        <CaseStudyText>
          For my 21-241 (Linear Algebra) final project, I created a 3D wireframe renderer from scratch (no 3D graphics libraries).
        </CaseStudyText>
        <CaseStudyText>
          This project implements 3D transformations, perspective projection, and rasterization algorithms entirely from linear algebra.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyVideo
        src="/p/3d-renderer/vid.mp4"
        aspectRatio="horizontal"
        autoplay={true}
        caption="3D wireframe rendering in action. Perspective projection is achieved through homogeneous coordinates, and the renderer performs depth sorting for correct occlusion handling. All calculations are performed in pure Python using NumPy for linear algebra operations."
      />

      <CaseStudyImageRow
        images={[
          {
            src: '/p/3d-renderer/cube.png',
            alt: '3D cube wireframe rendering',
          },
          {
            src: '/p/3d-renderer/cathedral-of-learning.png',
            alt: 'Cathedral of Learning 3D wireframe rendering',
          },
        ]}
        columns={2}
        aspectRatio="auto"
        caption="Left: A rotating 3D cube, demonstrating edge culling to hide back-facing edges. Right: The Cathedral of Learning, an iconic skyscraper at UPitt in Pittsburgh."
      />

      <CaseStudySection>
        <CaseStudyText>
          For more technical details:
          3D points are represented as homogeneous coordinates and transformed using 4x4 transformation matrices.
          The projection pipeline converts 3D coordinates to 2D screen space through perspective division.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}

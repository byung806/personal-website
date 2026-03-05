import CaseStudyLayout from '@/components/case-study/layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study/section';
import { CaseStudySingleImage } from '@/components/case-study/single-image';
import { CaseStudyImageRow } from '@/components/case-study/image-row';
import { projects } from '@/content/projects';

export default function EEGClassificationCaseStudy() {
  return (
    <CaseStudyLayout project={projects['eeg-classification']}>
      <CaseStudySection>
        <CaseStudyText>
          Frontotemporal dementia, a specific type of dementia, is extremely hard for doctors to diagnose. A highly accurate model means little if doctors cannot interpret or trust its decisions. Under the guidance of Dr. Shihab Shamma and Maryam Shaghaghi at UMD, I built a system that <CaseStudyHighlight>highlights abnormal brain activity behind each prediction</CaseStudyHighlight>. Instead of a black box, doctors can see why the model made its decision.
        </CaseStudyText>
        <CaseStudyText>
          For this research, I was recognized by <CaseStudyHighlight>Regeneron Pharmaceuticals as a STS Top 300 Scholar</CaseStudyHighlight>.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/eeg-classification/eeg_data.png"
        alt="Brain activity recordings"
        aspectRatio="auto"
        caption="Raw brain activity recorded from patients is messy and noisy. Each line is electrical signals from a different part of the brain."
      />

      <CaseStudySection>
        <CaseStudyText>
          I worked on a pipeline that transformed raw brain signals into measurable features across regions and frequency bands, then visualized how frontotemporal dementia patients differ from healthy controls.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyImageRow
        images={[
          { src: '/p/eeg-classification/ftd_regions_lbp.png', alt: 'Brain activity patterns' },
          { src: '/p/eeg-classification/ftd_regions_var.png', alt: 'Signal variation patterns' },
          { src: '/p/eeg-classification/ftd_regions_kur.png', alt: 'Signal distribution patterns' },
        ]}
        aspectRatio="auto"
        caption="Visualization of gamma and beta activity across brain regions in FTD patients. Different statistical measures reveal region-specific signal patterns."
      />

      <CaseStudyImageRow
        images={[
          { src: '/p/eeg-classification/control.png', alt: 'Before optimization' },
          { src: '/p/eeg-classification/improved.png', alt: 'After optimization' },
        ]}
        columns={2}
        aspectRatio="auto"
        caption="t-SNE projection of extracted features. Left: overlapping clusters with noisy features. Right: distinct groupings after isolating the most informative brain signals."
      />
    </CaseStudyLayout>
  );
}

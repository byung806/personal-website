import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText } from '@/components/case-study-section';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyImageRow } from '@/components/case-study-image-row';
import { projects } from '@/content/projects';

export default function EEGClassificationCaseStudy() {
  return (
    <CaseStudyLayout project={projects['eeg-classification']}>
      <CaseStudySection>
        <CaseStudyText>
          Frontotemporal dementia, a specific type of dementia, is extremely hard for doctors to diagnose. 
          A highly accurate model means little if doctors cannot interpret or trust its decisions.
          Under the guidance of Dr. Shihab Shamma and Maryam Shaghaghi at UMD, I built a system that explains its decisions in plain terms, showing which brain patterns matter and why, to help doctors make more better & more confident diagnoses.
        </CaseStudyText>
        <CaseStudyText>
          For this research, I was recognized by Regeneron Pharmaceuticals as a STS Top 300 Scholar.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySingleImage
        src="/p/eeg-classification/eeg_data.png"
        alt="Brain activity recordings"
        aspectRatio="auto"
        caption="Brain activity recordings from patients. Each line shows electrical signals from different parts of the brain."
      />

      <CaseStudySection>
        <CaseStudyText>
          I analyzed brain activity patterns from different regions and frequencies. The challenge was figuring out which patterns actually help with diagnosis versus which ones just add confusion. By testing each pattern individually, I identified the most reliable indicators that doctors can trust and understand.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyImageRow
        images={[
          { src: '/p/eeg-classification/ftd_regions_lbp.png', alt: 'Brain activity patterns' },
          { src: '/p/eeg-classification/ftd_regions_var.png', alt: 'Signal variation patterns' },
          { src: '/p/eeg-classification/ftd_regions_kur.png', alt: 'Signal distribution patterns' },
        ]}
        aspectRatio="auto"
        caption="Different measurements of brain activity across regions. Each shows unique patterns that help identify the disease."
      />

      <CaseStudyImageRow
        images={[
          { src: '/p/eeg-classification/control.png', alt: 'Before optimization' },
          { src: '/p/eeg-classification/improved.png', alt: 'After optimization' },
        ]}
        columns={2}
        aspectRatio="auto"
        caption="Visual comparison of patient groups. Left: messy and hard to separate. Right: clear groupings after removing unhelpful data."
      />
    </CaseStudyLayout>
  );
}

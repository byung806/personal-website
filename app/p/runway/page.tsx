import CaseStudyLayout from '@/components/case-study-layout';
import { CaseStudySection, CaseStudyText } from '@/components/case-study-section';
import { CaseStudyImageRow } from '@/components/case-study-image-row';
import { CaseStudySingleImage } from '@/components/case-study-single-image';
import { CaseStudyVideo } from '@/components/case-study-video';
import { projects } from '@/content/projects';

export default function RunwayCaseStudy() {
  return (
    <CaseStudyLayout project={projects.runway}>
      <CaseStudySection>
        <CaseStudyText>
          Along with my co-founder and friend Jacob, I built a platform to teach STEM to middle schoolers.
          The platform provides carefully curated lessons to make learning into a daily habit.
          The app is on the App Store and Google Play and gained 1300+ users in 6 months.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyImageRow
        images={[
          { src: '/p/runway/app-1.png', alt: 'Runway app home' },
          { src: '/p/runway/app-2.png', alt: 'Runway app explore' },
          { src: '/p/runway/app-3.png', alt: 'Runway app profile' },
        ]}
        aspectRatio="auto"
        caption="The layout of the app, built with React Native/Swift/Expo. Implemented infinite scroll with optimized rendering and live leaderboard updates."
      />

      <CaseStudyImageRow
        images={[
          { src: '/p/runway/lesson-1.png', alt: 'Lesson interface' },
          { src: '/p/runway/lesson-2.png', alt: 'Lesson content' },
          { src: '/p/runway/lesson-3.png', alt: 'Lesson completion' },
        ]}
        aspectRatio="auto"
        caption="The daily lessons. They were implemented in an extremely modular way, supporting a wide range of media like images, videos, text, and multiple choice questions. Built a custom JSON schema for lesson content with Firebase Cloud Functions handling validation. Also integrates with user data."
      />

      <CaseStudyImageRow
        images={[
          { src: '/p/runway/onboarding-1.png', alt: 'Onboarding step 1' },
          { src: '/p/runway/onboarding-2.png', alt: 'Onboarding step 2' },
          { src: '/p/runway/onboarding-3.png', alt: 'Onboarding step 3' },
        ]}
        aspectRatio="auto"
        caption="The onboarding flow guides users through an example lesson. Implemented username validation with profanity filter using the bad-words library."
      />

      <CaseStudyVideo
        src="/runway-web.mp4"
        aspectRatio="auto"
        autoplay={true}
        clickableUrl="https://runwaymobile.app"
        caption="The Runway website, built with Next.js and Tailwind CSS to showcase the app's features."
      />

      <CaseStudyImageRow
        images={[
          { src: '/p/runway/early-concept-1.png', alt: 'Early concept sketch 1' },
          { src: '/p/runway/early-concept-2.png', alt: 'Early concept sketch 2' },
        ]}
        aspectRatio="auto"
        caption="An early stage of the app. The early concepts focused on gamification and social features, which were later refined to emphasize the core daily lesson experience."
      />

      <CaseStudyVideo
        src="/p/runway/runway-ad-concept.mov"
        aspectRatio="auto"
        caption="Marketing concept video, showcasing the app's user flow."
      />

      <CaseStudySingleImage
        src="/p/runway/map.png"
        alt="Map of Runway users worldwide"
        aspectRatio="auto"
        caption="Runway reaches 1,300+ users across 100+ countries (tracked with App Store Connect and Google Play Console)."
      />
    </CaseStudyLayout>
  );
}

'use client';

import Image from 'next/image';
import ProjectCard from '../project-card';

export default function StripeCard() {
  return (
    <ProjectCard projectId="stripe" disableLink>
      <div className="relative w-full min-h-[250px] md:min-h-[320px] p-8 md:p-10 flex items-center justify-center">
        <div className="relative w-full max-w-[132px] md:max-w-[168px]">
          <Image src="/p/stripe/card.png" alt="Stripe" width={190} height={190} className="w-full h-auto" priority />
        </div>
      </div>
    </ProjectCard>
  );
}

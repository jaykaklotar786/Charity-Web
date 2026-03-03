import Image from 'next/image';
import { Button } from '@/components/ui/button';
import FeatureCards from './FeatureCards';

export default function AboutSection() {
  return (
    <section className=" bg-[#F7F9F1] py-20 flex flex-col gap-10">
      <div className="relative -mt-50 z-20">
        <FeatureCards />
      </div>

      <div className="max-w-300 mx-auto pt-20 pb-15 bg-[#F7F9F1]">
        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Text */}
          <div className="px-4 sm:px-6 md:px-0">
            <p className="uppercase text-xs sm:text-sm tracking-[3px] text-black mb-3">
              ABOUT US
            </p>

            <h2 className="text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-semibold leading-tight text-[#2C3A04] mb-5">
              Our journey of compassion and hope
            </h2>

            <p className="text-[#46512A] text-sm sm:text-base leading-relaxed mb-5 max-w-130">
              Join us on a journey towards compassion and hope. Through our
              non-profit organisation, we strive to make a positive impact on
              the world. Give back to your community and be a part of something
              greater than yourself.
            </p>

            <p className="text-[#46512A] text-sm sm:text-base leading-relaxed mb-8 max-w-130">
              A transformational journey towards bringing hope and compassion to
              the world.
            </p>

            <Button
              variant="outline"
              className="px-6 py-3 rounded-xl bg-[#F7F9F1] border-[#1f2b0a] text-[#1f2b0a] text-sm sm:text-base hover:bg-[#1f2b0a] hover:text-white"
            >
              Read More
            </Button>
          </div>

          {/* Right Images - Fixed Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <div className="w-full h-85 rounded-3xl overflow-hidden">
                <Image
                  src="/Images/home-0001.jpg"
                  alt=""
                  width={310}
                  height={340}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full h-62.5 rounded-3xl overflow-hidden">
                <Image
                  src="/Images/home-03.jpg"
                  alt=""
                  width={310}
                  height={250}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 md:mt-16">
              <div className="w-full h-62.5 rounded-3xl overflow-hidden">
                <Image
                  src="/Images/home-02.jpg"
                  alt=""
                  width={310}
                  height={250}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full h-85 rounded-3xl overflow-hidden">
                <Image
                  src="/Images/home-0004.jpg"
                  alt=""
                  width={310}
                  height={340}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

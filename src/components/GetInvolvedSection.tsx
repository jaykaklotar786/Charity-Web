import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function GetInvolvedSection() {
  return (
    <section className="bg-[#f4f4ef] px-10 py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center ">
        {/* Left Image */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-125 rounded-2xl overflow-hidden">
          <Image
            src="/Images/home-05.jpg"
            alt="Volunteers holding aid boxes"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>

        {/* Right Content */}
        <div>
          <p className="uppercase text-sm tracking-widest text-gray-500 mb-4">
            Get Involved
          </p>

          <h2 className="text-4xl md:text-5xl font-semibold text-[#2C3A04] leading-tight mb-6">
            Join our movement for change
          </h2>

          <p className="text-[#46512A] leading-relaxed mb-6">
            Join our non-profit organisation and be a part of our movement for
            positive change. We empower communities, support vulnerable
            individuals and strive towards building an equitable society.
            Together, we can create a better world. Join us now!
          </p>

          <p className="text-[#46512A] leading-relaxed mb-8">
            Become part of a transformative movement by supporting our
            non-profit organization. Together we can make lasting change.
          </p>

          <Button
            variant="outline"
            className="w-[164.94px] px-8 py-6 rounded-xl border-[#1f2b0a] text-[#1f2b0a] bg-[#F7F9F1] font-bold text-[18px] hover:bg-[#1f2b0a] hover:text-white"
          >
            Register Now
          </Button>
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';

export default function StoriesSection() {
  return (
    <section className="bg-[#f4f4ef] py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2C3A04] leading-tight">
            Inspiring tales of transformation
          </h2>

          <p className="text-[#46512A] mt-4 pb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Get inspired by the remarkable stories of transformation through our
            non-profit organization. Join us in making a positive impact today.
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#cfd5bf] rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {/* LEFT */}
            <div>
              <div className="relative w-full h-52 sm:h-64 md:h-72 -mt-20 rounded-2xl overflow-hidden">
                <Image
                  src="/Images/home-06.jpg"
                  alt="Story 1"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold mt-6 text-[#2C3A04]">
                The Special One
              </h3>

              <p className="text-[#46512A] mt-4 leading-relaxed text-sm sm:text-base">
                Join our non-profit organisation to help create a brighter
                future for those in need. Every donation counts towards making a
                difference in the lives of those less fortunate.
              </p>

              <button className="mt-6 text-[#1f2b0a] font-bold text-[18px] ">
                Read More ➝
              </button>
            </div>

            {/* RIGHT */}
            <div className="md:border-l md:border-[#cfd5bf] md:pl-10">
              <div className="relative w-full h-52 sm:h-64 md:h-72 -mt-20 rounded-2xl overflow-hidden">
                <Image
                  src="/Images/home-07.jpg"
                  alt="Story 2"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold mt-6 text-[#1f2b0a]">
                A Better Education for Everyone
              </h3>

              <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
                Our non-profit organisation is dedicated to improving access to
                education for all. With your support, we can help provide the
                resources and opportunities needed for success.
              </p>

              <button className="mt-6 text-[#1f2b0a] font-bold text-[18px] ">
                Read More ➝
              </button>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#1f2b0a] mb-10">
            Our Partners
          </p>

          <div className="flex items-center justify-items-center w-full">
            {[
              'logo-01.svg',
              'logo-02.svg',
              'logo-03.svg',
              'logo-04.svg',
              'logo-05.svg',
              'logo-06.svg',
            ].map((logo, index) => (
              <div key={index} className="relative w-[16.66%] h-[66.95px]">
                <Image
                  src={`/Images/${logo}`}
                  alt="partner logo"
                  fill
                  className="object-contain transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from './ui/button';
import Counter from './Counter';

export default function ImpactSection() {
  return (
    <section className="bg-transparent py-16 sm:py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Text Area */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="uppercase text-xs sm:text-sm tracking-widest text-black pb-4">
              Our Impact
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f2b0a] leading-tight">
              The impact we have made in our community
            </h2>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:max-w-md ">
            We have made a significant impact in our community through our
            non-profit organization. By providing services and support to those
            in need, we have created a positive change.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center mt-16 md:mt-20 border-t pt-10 md:pt-12">
          <div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f2b0a]">
              <Counter target={20000000} format="million" plus />
            </h3>
            <p className="text-gray-600 mt-2 text-sm">
              People served worldwide
            </p>
          </div>

          <div className="md:border-l md:pl-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f2b0a]">
              <Counter target={142790} />
            </h3>
            <p className="text-gray-600 mt-2 text-sm">Projects funded</p>
          </div>

          <div className="md:border-l md:pl-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f2b0a]">
              <Counter target={1800000} format="million" />
            </h3>
            <p className="text-gray-600 mt-2 text-sm">People to take action</p>
          </div>

          <div className="md:border-l md:pl-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1f2b0a]">
              <Counter target={5246} />
            </h3>
            <p className="text-gray-600 mt-2 text-sm">Partner organizations</p>
          </div>
        </div>

        {/* Green  Box */}
        <div className="bg-[#66B40B] rounded-2xl mt-16 md:mt-20 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              We can create a better tomorrow
            </h3>
            <p className="mt-3 text-green-100 text-sm sm:text-base">
              Every dollar counts and helps us bring hope and essential
              resources to those in need.
            </p>
          </div>

          <Button
            variant="default"
            className="bg-white hover:bg-green-950 text-black px-6 py-3 rounded-md font-semibold w-full sm:w-auto"
          >
            Donate Now
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full flex items-center pb-75 pt-50 justify-center overflow-hidden bg-[url('/Images/home-bg.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Background Image */}

      <div className="absolute inset-0 object-top bg-black/65 z-0"></div>

      {/* Content */}
      <div className="max-w-270 z-10 mx-auto px-4 font-[80px] sm:px-5  tracking-[-1px] lg:px-10 text-center text-white">
        <h1 className="text-[36px] sm:text-[36px] md:text-[64px] lg:text-[80px]  tracking-[-1px] font-semibold leading-22 pb-5">
          Empowering Change, One Step at a Time
        </h1>

        <p className="text-[24px] sm:text-[24px] md:text-[24px] lg:text-[24px] pb-10 leading-9 tracking-[0.2px] max-w-185 mx-auto">
          Every small act of kindness creates a ripple of positive change. Join
          us in making a difference lives together.
        </p>

        <button className="w-[156.48px] bg-[#66B40B] hover:bg-[#81b82e] text-[18px] font-bold transition duration-300 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base">
          Donate Now
        </button>
      </div>
    </section>
  );
}

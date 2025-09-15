import React from "react";
import Image from "next/image";
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['600'],
  subsets: ['latin'],
});

const TrustedSection = () => {
  return (
    <section className="py-16 bg-white text-center">
      {/* Heading */}
      <h2 className={`${inter.className} font-semibold text-[48px] leading-[120%] text-[#12161D] mx-auto max-w-4xl`}>
        Trusted 34.000+ <br className="hidden lg:block" /> fashionable customers.
      </h2>

      {/* Logos */}
      <div className="flex flex-wrap justify-center items-center gap-15 mt-12">
        <Image src="/clients/samtiv.png" alt="Samtiv" width={120} height={60} />
        <Image src="/clients/iea.png" alt="IEA" width={120} height={60} />
        <Image src="/clients/unica.png" alt="Unica" width={120} height={60} />
        <Image src="/clients/boking.png" alt="Boxing" width={120} height={60} />
        <Image src="/clients/niscala.png" alt="Niscala" width={120} height={60} />
        <Image src="/clients/samtiv.png" alt="Samtiv" width={120} height={60} />
        <Image src="/clients/iea.png" alt="IEA" width={120} height={60} />
        <Image src="/clients/unica.png" alt="Unica" width={120} height={60} />
      </div>
    </section>
  );
};

export default TrustedSection;

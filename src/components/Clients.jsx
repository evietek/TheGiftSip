import React from "react";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const clients = [
  { src: "/clients/samtiv.png", name: "Samtiv" },
  { src: "/clients/iea.png", name: "IEA" },
  { src: "/clients/unica.png", name: "Unica" },
  { src: "/clients/boking.png", name: "Boking" },
  { src: "/clients/niscala.png", name: "Niscala" },
];

const TrustedSection = () => {
  return (
    <section
      className="py-16 bg-white text-center"
      aria-labelledby="trusted-heading"
    >
      {/* Heading */}
      <h2
        id="trusted-heading"
        className={`${inter.className} font-semibold text-[48px] leading-[120%] text-[#12161D] mx-auto max-w-4xl`}
      >
        Trusted by 34,000+ <br className="hidden lg:block" /> fashionable
        customers
      </h2>

      {/* Logos */}
      <ul className="flex flex-wrap justify-center items-center gap-[15px] mt-12">
        {clients.map((client, idx) => (
          <li key={idx} className="flex items-center">
            <Image
              src={client.src}
              alt={client.name}
              width={120}
              height={60}
              className="h-auto w-auto"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrustedSection;

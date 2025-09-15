import Navbar from "@/components/Navbar";
import Hero from '@/components/Hero';
import Clients from '@/components/Clients';
import About from '@/components/About';
import Featured from '@/components/Featured';
import WhyChooseUs from '@/components/WhyChooseUs';
import Products from '@/components/Products';
import CTA from '@/components/CTA';
import Testimonials from '@/components/Testimonials';

export default function HomePage() {
  return (
    <>
    <Navbar />
    <Hero />
    <Clients />
    <About />
    <Featured />
    <WhyChooseUs />
    <Products />
    <CTA />
    <Testimonials />
    </>
  );
}

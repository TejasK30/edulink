import FeaturesSection from "@/components/FeaturesSection"
import HeroSection from "@/components/HeroSection"
import Navbar from "@/components/Navbar"
import TestimonialsSection from "@/components/TestimonialsSection"
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </div>
  )
}

export default HomePage

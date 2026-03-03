"use client"

import FeaturesSection from "@/components/website/FeaturesSection"
import HeroSection from "@/components/website/HeroSection"
import Navbar from "@/components/website/Navbar"
import TestimonialsSection from "@/components/website/TestimonialsSection"
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

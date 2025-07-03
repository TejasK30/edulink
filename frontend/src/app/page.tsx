"use client"

import FeaturesSection from "@/components/FeaturesSection"
import HeroSection from "@/components/HeroSection"
import Navbar from "@/components/Navbar"
import TestimonialsSection from "@/components/TestimonialsSection"
import { useEffect } from "react"
const HomePage = () => {
  useEffect(() => {
    fetch("http://localhost:5000/test-cookie", {
      method: "GET",
      credentials: "include",
    }).then(() => {
      console.log("Request sent")
    })
  }, [])

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

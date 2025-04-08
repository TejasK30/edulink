import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Monitor, Users, BarChart, Star } from "lucide-react"
import Image from "next/image"
import TitleSection from "./title-section"

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <TitleSection
            pill="✨ New: AI-Powered Analytics Dashboard"
            title={""}
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Transform Your Institution with{" "}
            <span className="bg-clip-text text-violet-700 bg-gradient-to-r from-brand-primaryBlue to-brand-primaryPurple">
              Smart Education Management
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Empower your institution with AI-driven insights, streamlined
            administration, and enhanced learning experiences for students and
            faculty alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-8 bg-primary hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
                <Monitor className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-background/50 backdrop-blur-lg rounded-2xl border border-primary/10">
              <Users className="h-8 w-8 text-primary mb-4" />
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-background/50 backdrop-blur-lg rounded-2xl border border-primary/10">
              <BarChart className="h-8 w-8 text-primary mb-4" />
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-background/50 backdrop-blur-lg rounded-2xl border border-primary/10">
              <Star className="h-8 w-8 text-primary mb-4" />
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="relative rounded-2xl overflow-hidden border border-primary/10 shadow-2xl">
            <Image
              src="/dashboard.png"
              alt="Dashboard Preview"
              width={1920}
              height={1080}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

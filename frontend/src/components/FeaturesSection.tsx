import TitleSection from "./title-section"
import Navbar from "@/components/Navbar"
import { FEATURES } from "@/lib/constants"
import { ArrowRight } from "lucide-react"

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <main className="pt-20 relative">
        <section className="px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-7xl mx-auto">
            <TitleSection
              pill="Features"
              title="Explore Our Powerful Features"
              subheading="Everything you need to streamline your institution’s operations."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="group relative bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-primary/10 p-6 hover:border-primary/30 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-primary">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FeaturesPage

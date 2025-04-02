import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import TitleSection from "./title-section"
import { TESTIMONIALS } from "@/lib/constants"

const TestimonialsSection = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <TitleSection
          pill="Testimonials"
          title="Trusted by Leading Institutions"
          subheading="See what educators and students say about our platform"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-background/50 backdrop-blur-lg rounded-2xl border border-primary/10 p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatarUrl} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute top-0 left-0 text-6xl text-primary/10"></span>
                <p className="text-muted-foreground pl-8 relative z-10">
                  {testimonial.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

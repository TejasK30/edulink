import { Feature, Testimonial, PricingPlan, NavigationItem } from "@/lib/types"

export const FEATURES: Feature[] = [
  {
    id: "course-management",
    title: "Smart Course Management",
    description:
      "Efficiently manage curriculum, assignments, and learning resources",
    icon: "📚",
  },
  {
    id: "attendance",
    title: "Attendance & Timetable",
    description: "Automated attendance tracking and dynamic scheduling system",
    icon: "📅",
  },
  {
    id: "faculty",
    title: "Faculty Dashboard",
    description:
      "Streamlined tools for faculty to manage courses, grades, and student interaction",
    icon: "👩‍🏫",
  },
  {
    id: "fees",
    title: "Fee Management",
    description: "Secure payment processing and financial tracking system",
    icon: "💳",
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Dr. Sarah Mitchell",
    role: "Dean of Engineering",
    message:
      "This system has revolutionized how we manage our department. The AI-powered insights have helped us optimize course delivery and student support.",
    avatarUrl: "/avatars/1.png",
  },
  {
    id: "testimonial-2",
    name: "James Wilson",
    role: "Student",
    message:
      "The mobile app makes it so easy to check attendance, access course materials, and get instant support from the AI chatbot.",
    avatarUrl: "/avatars/2.png",
  },
  {
    id: "testimonial-3",
    name: "Prof. Robert Chen",
    role: "Faculty Member",
    message:
      "The automated grading and performance tracking features have saved me countless hours and helped provide better feedback to students.",
    avatarUrl: "/avatars/3.png",
  },
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    description: "Perfect for small institutions getting started",
    features: [
      "Up to 500 students",
      "Basic course management",
      "Attendance tracking",
      "Simple reports",
      "Email support",
    ],
    buttonText: "Start Free",
  },
  {
    id: "pro",
    name: "Professional",
    price: 299,
    description: "Ideal for growing colleges and universities",
    features: [
      "Up to 5000 students",
      "Advanced analytics",
      "AI-powered insights",
      "Custom reports",
      "Priority support",
      "API access",
    ],
    isPopular: true,
    buttonText: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    description: "Custom solutions for large institutions",
    features: [
      "Unlimited students",
      "Custom integrations",
      "Dedicated support",
      "Custom AI models",
      "On-premise deployment",
      "SLA guarantee",
    ],
    buttonText: "Contact Sales",
  },
]

export const NAVIGATION: NavigationItem[] = [
  {
    id: "features",
    label: "Features",
    href: "/features",
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blogs",
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
  },
]

export const FOOTER_LINKS = {
  product: [
    { id: "features", label: "Features", href: "/features" },
    { id: "pricing", label: "Pricing", href: "/pricing" },
    { id: "demo", label: "Request Demo", href: "/demo" },
  ],
  company: [
    { id: "about", label: "About", href: "/about" },
    { id: "blog", label: "Blog", href: "/blog" },
    { id: "careers", label: "Careers", href: "/careers" },
  ],
  resources: [
    { id: "docs", label: "Documentation", href: "/docs" },
    { id: "help", label: "Help Center", href: "/help" },
    { id: "community", label: "Community", href: "/community" },
  ],
  legal: [
    { id: "privacy", label: "Privacy", href: "/privacy" },
    { id: "terms", label: "Terms", href: "/terms" },
    { id: "security", label: "Security", href: "/security" },
  ],
}

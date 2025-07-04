"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Clock, CheckCircle, FileText, Search, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export default function Home() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">EXCOS</span>
            </div>
            {/* Right side nav */}
            <div className="flex items-center">
              {/* Hamburger for mobile */}
              <div className="lg:hidden flex items-center">
                <ThemeToggle />
                <button
                  className="ml-2 p-2 rounded-md text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-0 focus:ring-transparent active:bg-gray-100 dark:active:bg-gray-800"
                  onClick={() => setNavOpen((v) => !v)}
                  aria-label="Open navigation menu"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  {/* Three horizontal lines (classic hamburger) */}
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {navOpen ? (
                      // X icon for close
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      // Three horizontal lines
                      <>
                        <line x1="4" y1="7" x2="20" y2="7" strokeWidth="2" strokeLinecap="round" />
                        <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round" />
                        <line x1="4" y1="17" x2="20" y2="17" strokeWidth="2" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {/* Desktop nav */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* ThemeToggle is now left of Sign In */}
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-gradient">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {navOpen && (
          <div className="lg:hidden bg-white/90 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3 shadow-md">
            <Link href="/login" onClick={() => setNavOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setNavOpen(false)}>
              <Button
                className="w-full btn-gradient justify-start active:bg-purple-100 dark:active:bg-purple-900 focus:bg-purple-100 dark:focus:bg-purple-900"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight">
                  Exam Complaint
                  <span className="text-gradient block">System</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  An Efficient Platform for Submitting and Tracking Exam Complaints with Transparency and
                  Accountability.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="btn-gradient w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base">
                    Submit Complaint
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 h-10 sm:h-12 text-sm sm:text-base dark:border-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-700/80 transition-colors"
                  >
                    Track Status
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-4 sm:space-x-8 pt-6 sm:pt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complaints Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">24h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 glass-effect rounded-3xl p-8 shadow-2xl dark:bg-gray-900/70">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold dark:text-gray-100">Quick Actions</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="font-medium dark:text-gray-100">Submit New Complaint</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <Search className="w-5 h-5 text-blue-600" />
                      <span className="font-medium dark:text-gray-100">Track Existing Complaint</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium dark:text-gray-100">Admin Dashboard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 dark:bg-purple-800/30 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 dark:bg-blue-800/30 rounded-full opacity-40 animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-gray-100">Why Choose EXCOS?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides a comprehensive solution for exam complaint management with modern features and
              intuitive design.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Confidential",
                description: "Your complaints are handled with the highest level of security and confidentiality.",
                color: "text-green-600 bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: Clock,
                title: "Fast Processing",
                description: "Quick response times with automated notifications and status updates.",
                color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: CheckCircle,
                title: "Transparent Process",
                description: "Track your complaint status in real-time with complete transparency.",
                color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
              },
              {
                icon: FileText,
                title: "Easy Documentation",
                description: "Simple forms and file upload system for comprehensive complaint submission.",
                color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
              },
              {
                icon: Users,
                title: "Expert Review",
                description: "Dedicated examination committee reviews each complaint thoroughly.",
                color: "text-red-600 bg-red-100 dark:bg-red-900/30",
              },
              {
                icon: Award,
                title: "Quality Assurance",
                description: "Continuous improvement based on feedback and quality metrics.",
                color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-hover border-0 shadow-lg h-full dark:bg-gray-800/70">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-gray-100">How It Works</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our streamlined process ensures your complaints are handled efficiently and fairly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Submit Complaint",
                description:
                  "Fill out the detailed complaint form with all relevant information about your exam issue.",
              },
              {
                step: "02",
                title: "Initial Review",
                description:
                  "Our system validates your complaint and assigns it to the appropriate examination committee.",
              },
              {
                step: "03",
                title: "Investigation",
                description:
                  "The committee thoroughly investigates your complaint and gathers all necessary information.",
              },
              {
                step: "04",
                title: "Resolution",
                description:
                  "You receive a detailed response with the committee's decision and any corrective actions.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 dark:from-purple-900/40 dark:to-blue-900/40 -z-10"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold dark:text-gray-100">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 gradient-bg dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of students who trust EXCOS for fair and transparent exam complaint resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-purple-600 hover:bg-white/10 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EXCOS</span>
              </div>
              <p className="text-gray-400">Exam Complaint System for Transparent and Efficient Resolution.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Submit Complaint
                </Link>
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Track Status
                </Link>
                <Link href="/register" className="block text-gray-400 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EXCOS. All rights reserved. Built with ❤️ for academic excellence.
          </div>
        </div>
      </footer>
    </div>
  )
}

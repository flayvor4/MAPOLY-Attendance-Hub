import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  User, 
  BarChart3, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X,
  GraduationCap,
  Clock,
  QrCode,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export default function LandingPage({ onNav }: { onNav: (page: string) => void }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      onNav('login'); // Go to role selection or dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'About', href: '#about' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                MAPOLY <span className="text-secondary">Attendance Hub</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  {item.name}
                </a>
              ))}
              {user ? (
                <button
                  onClick={() => onNav('dashboard')}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-4 text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 px-3">
                  <button
                    onClick={handleLogin}
                    className="w-full bg-primary text-white px-4 py-3 rounded-xl font-medium"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-secondary/10 text-secondary border border-secondary/20 mb-8">
                The Future of Academic Attendance
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-8">
                Smart Digital Attendance for <span className="text-secondary">Moshood Abiola Polytechnic.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Ditch the paper sheets. Modernize classroom management with high-speed QR scanning, 
                real-time analytics, and fraud-proof biometric-ready attendance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                >
                  Student Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto bg-white text-primary border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:border-primary transition-all flex items-center justify-center gap-2"
                >
                  Lecturer Access
                </button>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white aspect-[16/9]">
                <div className="bg-slate-100 h-8 border-b border-slate-200 flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="p-8 h-full bg-slate-50 flex gap-6">
                  {/* Mock Sidebar */}
                  <div className="w-48 space-y-4">
                     <div className="h-4 w-full bg-slate-200 rounded" />
                     <div className="h-4 w-3/4 bg-slate-200 rounded" />
                     <div className="h-4 w-5/6 bg-slate-200 rounded" />
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-32 bg-white rounded-xl border border-slate-200 p-4">
                         <div className="w-8 h-8 rounded bg-secondary/10 mb-2" />
                         <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                      <div className="h-32 bg-white rounded-xl border border-slate-200 p-4">
                         <div className="w-8 h-8 rounded bg-accent/10 mb-2" />
                         <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                      <div className="h-32 bg-white rounded-xl border border-slate-200 p-4">
                         <div className="w-8 h-8 rounded bg-warning/10 mb-2" />
                         <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="h-64 bg-white rounded-xl border border-slate-200" />
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">35k+</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">800+</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Lecturers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">150k+</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Attendances/Mo</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">99.9%</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">
              Everything you need to manage academic attendance at scale.
            </h2>
            <p className="text-lg text-slate-600">
              Designed specifically for the unique needs of Moshood Abiola Polytechnic, 
              balancing security with ease of use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<QrCode className="text-secondary" />}
              title="Dynamic QR Scanning"
              description="Secure, time-limited QR codes prevent attendance sharing and fraud."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-accent" />}
              title="Advanced Analytics"
              description="Generate eligibility reports and track participation trends automatically."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-warning" />}
              title="Fraud Prevention"
              description="Device fingerprinting and geolocation verification ensure students are actually in class."
            />
            <FeatureCard 
              icon={<Calendar className="text-blue-500" />}
              title="Course Management"
              description="Easily link lecturers to courses and students to departments."
            />
            <FeatureCard 
              icon={<Clock className="text-purple-500" />}
              title="Real-time Tracking"
              description="Monitor active attendance sessions as they happen across campus."
            />
            <FeatureCard 
              icon={<FileText className="text-rose-500" />}
              title="Automated Reports"
              description="Export semester-end attendance summaries in PDF and Excel formats."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-display font-bold tracking-tight">
                  MAPOLY <span className="text-secondary">Attendance Hub</span>
                </span>
              </div>
              <p className="text-slate-600 max-w-sm mb-6">
                The official digital attendance platform for Moshood Abiola Polytechnic. 
                Improving academic integrity through technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">User Manual</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Technical Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li>ict@mapoly.edu.ng</li>
                <li>Ojere, Abeokuta, Ogun State</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} Moshood Abiola Polytechnic ICT Directorate. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
               <a href="#" className="text-slate-400 hover:text-primary transition-colors text-xs whitespace-nowrap">Privacy Policy</a>
               <a href="#" className="text-slate-400 hover:text-primary transition-colors text-xs whitespace-nowrap">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary/20 hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all group">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

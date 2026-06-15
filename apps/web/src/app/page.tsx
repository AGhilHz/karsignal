import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { StatsSection } from '@/components/home/stats-section';
import { FeaturedCompanies } from '@/components/home/featured-companies';
import { FeaturedJobs } from '@/components/home/featured-jobs';
import { HowItWorks } from '@/components/home/how-it-works';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturedCompanies />
        <FeaturedJobs />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

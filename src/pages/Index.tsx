import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCourses from "@/components/FeaturedCourses";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import CoursePolls from "@/components/CoursePolls";
import CourseSuggestion from "@/components/CourseSuggestion";
import QuickFeatures from "@/components/QuickFeatures";
const Index = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return <div className="min-h-screen bg-background">
      <Navbar />
      <Hero onChatbotOpen={() => setIsChatbotOpen(true)} />
      <FeaturedCourses />
      <CoursePolls />
      <CourseSuggestion />
      <Features />
      <QuickFeatures />
      <CTA />
      <Footer />
      <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
    </div>;
};
export default Index;
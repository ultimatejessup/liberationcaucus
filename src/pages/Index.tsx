import { Helmet } from "react-helmet-async";
import EmailSignupPopup from "@/components/EmailSignupPopup";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FredomSummerSection from "@/components/FredomSummerSection";
import DonateSection from "@/components/DonateSection";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Liberation Caucus | Advancing Justice for Black Communities</title>
        <meta 
          name="description" 
          content="Liberation Caucus is a non-profit, non-partisan organization advancing the political, community, and economic interests of Black people and people of the African diaspora in the United States." 
        />
      </Helmet>
      
      <EmailSignupPopup />
      <Header />
      
      <main>
        <HeroSection />
        <AboutSection />
        <FredomSummerSection />
        <DonateSection />
        <PartnersSection />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;

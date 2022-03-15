import React from "react";
import {
  HeroSection,
  FeaturesSection,
  ContactSection,
  FooterSection,
  PartnersSection,
  AboutSection,
  RoadMap,
} from "../../components/layout/LandingPage";
import NavBarComponent from "../../components/layout/Navbar";
import { Helmet } from "react-helmet";
import AOS from "aos";
AOS.init();
import "aos/dist/aos.css";

const seoData = {
  title: ``,
  description: `Most advanced Decentralized LaunchPad Protocol . Lowest Entry Cost, Launch your Token in seconds. Apply Now. Crypto Launchpad`,
};

const Home = (): React.ReactElement => {
  return (
    <div>
      <Helmet>
        <title>{seoData.title}</title>
        <meta
          name="description"
          content={seoData.description}
          // content="First Decentralized LaunchPad Protocol on the Cronos Chain. Lowest Entry Cost, Launch your Token in seconds. Apply Now. Crypto Launchpad"
        />
        <meta name="og:title" content={seoData.title} />
        <meta name="og:description" content={seoData.description} />
        <meta name="og:type" content="website" />
        <meta name="og:url" content={window.location.href} />
        <meta name="og:site_name" content="DotLaunch" />
      </Helmet>
      <NavBarComponent />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PartnersSection />
      <RoadMap />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default Home;

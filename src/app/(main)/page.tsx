import { posts } from "#site/content";
import AboutSection from "~/components/about-section";
import { PostList } from "~/components/post";
import { ProjectList, projects } from "~/components/project";
import Skills from "~/components/skills";
import { EducationList, educationList } from "~/components/education";
import { HackathonList, hackathons } from "~/components/hackathons";
import { sortPosts } from "~/lib/utils";
import ContactUs from "../../components/contact-us";
import GitHubContributions from "~/components/github-contributions";
import IntroReveal from "~/components/intro-reveal";

const HomePage = () => {
  const publishedPosts = posts.filter((post) => post.published);
  const sortedPosts = sortPosts(publishedPosts);

  return (
    <IntroReveal>
      <div className="!mt-8 space-y-14">
        <AboutSection />
        <Skills />
        <GitHubContributions />
        <ProjectList projects={projects.slice(0, 4)} metadata />
        <HackathonList hackathons={hackathons} />
        <PostList posts={sortedPosts.slice(0, 4)} showRss layout="single" />
        <EducationList educationList={educationList} />
        <ContactUs />
      </div>
    </IntroReveal>
  );
};

export default HomePage;

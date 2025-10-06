import React, { useState } from "react";
import Pagination from "@components/Ui/Pagination";

const newsList = [
  {
    title:
      "Electric Era launches first commercial installation of its PowerNode EV charging stations",
    author: "Michelle Froese",
    date: "November 17, 2023",
    image: "/post/01.png",
    link: "#",
    excerpt: "Electric Era Technologies, a manufacturer of EV fast-charging...",
    sourceLink: "#",
  },
  {
    title: "Protecting fast EV charging stations",
    author: "Philippe Di Fulvio, Littelfuse, Inc",
    date: "August 28, 2021",
    image: "/post/02.png",
    link: "#",
    excerpt:
      "An estimated 5.5 million electric vehicles (EVs) were on the road in 2020. By 2025, the expectation is that over 24 million EVs will be in use. A significant limitation to wider EV adoption is the public charging...",
    sourceLink: "#",
  },
  {
    title: "EV charging infrastructure is only as good as its technology",
    author: "Michelle Froese",
    date: "February 28, 2024",
    image: "/post/03.png",
    link: "#",
    excerpt:
      "RS, a trading brand of RS Group, a global provider of product and service solutions for industrial customers, offers an extensive portfolio of electrical...",
    sourceLink: "#",
  },
  {
    title: "Our top 10 Javascript frameworks to use",
    author: "Michelle Froese",
    date: "February 28, 2024",
    image: "/post/04.png",
    link: "#",
    excerpt:
      "JavaScript frameworks make development easy with extensive features and functionalities.",
    sourceLink: "#",
  },
  {
    title: "Electric Vehicle Charging Infrastructure Growth",
    author: "John Smith",
    date: "March 15, 2024",
    image: "/post/01.png",
    link: "#",
    excerpt: "The electric vehicle charging infrastructure market is experiencing unprecedented growth...",
    sourceLink: "#",
  },
  {
    title: "Sustainable Energy Solutions for EV Charging",
    author: "Sarah Johnson",
    date: "March 10, 2024",
    image: "/post/02.png",
    link: "#",
    excerpt: "Renewable energy sources are becoming increasingly important for EV charging stations...",
    sourceLink: "#",
  },
  {
    title: "Future of Electric Vehicle Technology",
    author: "Mike Chen",
    date: "March 5, 2024",
    image: "/post/03.png",
    link: "#",
    excerpt: "Advancements in battery technology and charging speeds are revolutionizing the EV industry...",
    sourceLink: "#",
  },
  {
    title: "Government Incentives for EV Adoption",
    author: "Lisa Wang",
    date: "February 28, 2024",
    image: "/post/04.png",
    link: "#",
    excerpt: "New government policies are making electric vehicles more accessible to consumers...",
    sourceLink: "#",
  },
  {
    title: "EV Charging Station Maintenance Best Practices",
    author: "David Lee",
    date: "February 20, 2024",
    image: "/post/01.png",
    link: "#",
    excerpt: "Proper maintenance is crucial for ensuring optimal performance of EV charging stations...",
    sourceLink: "#",
  },
  {
    title: "Smart Grid Integration for EV Charging",
    author: "Emma Wilson",
    date: "February 15, 2024",
    image: "/post/02.png",
    link: "#",
    excerpt: "Integrating EV charging stations with smart grid technology offers numerous benefits...",
    sourceLink: "#",
  },
  {
    title: "Wireless EV Charging Technology Advances",
    author: "Alex Rodriguez",
    date: "February 10, 2024",
    image: "/post/03.png",
    link: "#",
    excerpt: "Wireless charging technology is making significant strides in the EV industry...",
    sourceLink: "#",
  },
  {
    title: "EV Charging Station Security Measures",
    author: "Jennifer Kim",
    date: "February 5, 2024",
    image: "/post/04.png",
    link: "#",
    excerpt: "Security considerations are paramount when designing and operating EV charging stations...",
    sourceLink: "#",
  },
];

const News: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  // Calculate which news to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = newsList.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-white py-10 px-2 max-w-[1200px] mx-auto px-4 md:px-12">
      <h1 className="text-4xl font-bold text-center mb-2">
        Latest News & Insights
      </h1>
      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
        Stay updated with the newest trends, innovations, and stories in the EV
        charging industry.
      </p>
      <h2 className="text-lg font-semibold mb-4">All new posts</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {currentNews.map((news, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-none border border-gray-100 hover:shadow-md transition overflow-hidden flex flex-col"
          >
            <a href={news.link} className="block">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-48 object-cover"
              />
            </a>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs mb-2 text-blue-600">
                <span className="font-semibold">By {news.author}</span>
                {news.date && (
                  <>
                    {" | "}
                    <span>{news.date}</span>
                  </>
                )}
              </div>
              <a
                href={news.link}
                className="font-semibold text-base mb-1 hover:underline flex items-center group"
              >
                {news.title}
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <p className="text-gray-500 text-sm">{news.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default News;
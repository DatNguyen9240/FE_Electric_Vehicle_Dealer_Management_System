import React from "react";

const team = [
  {
    name: "Jenny Wilson",
    title: "Co-Founder, CEO",
    image: "/team/jenny.png",
    highlight: true,
  },
  {
    name: "John Doe",
    title: "Developer",
    image: "/team/john.png",
    highlight: false,
  },
  {
    name: "Sarah Lee",
    title: "Designer",
    image: "/team/sarah.png",
    highlight: false,
  },
  {
    name: "Mike Brown",
    title: "Marketing",
    image: "/team/mike.png",
    highlight: false,
  },
  {
    name: "Anna Smith",
    title: "Support",
    image: "/team/anna.png",
    highlight: false,
  },
];

const MeetOurTeam: React.FC = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet our team</h2>
        <p className="text-gray-500 text-base md:text-lg">
          Clarity gives you the blocks & components you need to create a truly
          professional website, landing page or admin panel for your SaaS.
        </p>
      </div>
    </section>
  );
};

export default MeetOurTeam;

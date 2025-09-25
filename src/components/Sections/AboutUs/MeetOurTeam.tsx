import React from "react";
import avt1 from "../../../assets/avt1.png";
import avt2 from "../../../assets/about_us/avt2.png";
import avt3 from "../../../assets/about_us/avt3.png";
import avt4 from "../../../assets/about_us/avt4.png";
import avt5 from "../../../assets/about_us/avt5.png";

const MeetOurTeam: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Savannah Nguyen",
      role: "CEO & Founder",
      avatar: avt1,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CTO",
      avatar: avt2,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      role: "Head of Design",
      avatar: avt3,
    },
    {
      id: 4,
      name: "David Rodriguez",
      role: "Lead Developer",
      avatar: avt4,
    },
    {
      id: 5,
      name: "Emily Watson",
      role: "Marketing Director",
      avatar: avt5,
    },
  ];

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto ">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the creative team</h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
            Clarity gives you the blocks & components you need to create a truly
            professional website, landing page or admin panel for your SaaS.
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="flex flex-wrap justify-center gap-5 ">
          {teamMembers.map((member) => (
            <div key={member.id} className={` rounded-lg border border-gray-200 pb-4 text-center hover:shadow-lg transition-shadow w-57`}>
              {/* Avatar */}
              <div className="h-60 flex items-center justify-center mb-4 mx-auto rounded-t-lg overflow-hidden">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Name and Role */}
              <h3 className="font-bold text-base text-gray-800 mb-1">{member.name}</h3>
              <p className="text-xs text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Divider line */}
      <div className="border-t border-gray-200 mt-10"></div>
    </section>
  );
};

export default MeetOurTeam;

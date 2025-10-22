import React from "react";
import "./member-card.css";

const members = [
  {
    name: "신혁수",
    github: "https://github.com/sins051301",
    title: "Frontend Developer",
    desc: "React • Next.js • TypeScript",
    img: "https://github.com/sins051301.png",
  },
  {
    name: "송혜정",
    github: "https://github.com/Songhyejeong",
    title: "Frontend Developer",
    desc: "React • Next.js • TypeScript",
    img: "https://github.com/Songhyejeong.png",
  },
  {
    name: "채현우",
    github: "https://github.com/hyunwoo0081",
    title: "Frontend Developer",
    desc: "React • Next.js • TypeScript",
    img: "https://github.com/hyunwoo0081.png",
  },
];

export default function MemberCard() {
  return (
    <section className="cards">
      {members.map((m) => (
        <a
          key={m.name}
          href={m.github}
          target="_blank"
          rel="noopener noreferrer"
          className="card"
          style={{
            backgroundImage: `url(${m.img})`,
          }}
        >
          <div className="card-content">
            <h2>{m.name}</h2>
            <p>{m.title}</p>
            <p>{m.desc}</p>
          </div>
        </a>
      ))}
    </section>
  );
}

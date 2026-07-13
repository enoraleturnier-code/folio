import type { Designer } from "./types";

const firstName = "Léa";
const lastName = "Martin";

export const designer: Designer = {
  slug: "lea-martin",
  firstName,
  lastName,
  fullName: `${firstName} ${lastName}`,
  profession: "Designeuse produit",
  adjective: "Visionnaire",
  headline: "Designeuse produit — interfaces sobres, décisions nettes.",
  bio: "Je dessine des interfaces sobres pour des équipes qui prennent des décisions rapides. Dix ans à ciseler des produits SaaS, à cadrer des systèmes de design, et à défendre l'utilisateur là où ça compte : dans la salle où l'on tranche.",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6gHuqRXyMQser0KzvPIMw2L6EtYW15caFUVyuRkSeKTfo_NrEAM-VRq-KMzq6agx4LKN3LZ9IZ7NUraU-wbpcv94etLyE7jXcvor4s-clkIo2aQV9VhwJwjIyNjOdzrrjxPSQbDel4qKEA0M88G0OZtKYxIiY9M7VgmyzxYJBPOI6JwJtWeQ8R_MYJqi-jFe6Jg2Sr-ZviF-Bkqj2q1IxyhH-ZudRLvzHwnZmKFJ-TVvUBOL3D7hi8DbOoY7BKgVOV26c89gtdk",
  linkedin: "https://linkedin.com/in/lea-martin",
  twitter: "https://twitter.com/leamartin",
  website: "https://leamartin.design",
  calUsername: "lea-martin",
  email: "hello@leamartin.design",
  location: "Paris — remote friendly",
};

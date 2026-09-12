export interface Role {
  title: string;
  org: string;
  period: string;
  location: string;
  points: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  verify: string;
  image: string;
  imageAlt: string;
}

export interface Skill {
  label: string;
  items: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  projectUrl: string;
  githubUrl: string;
  launchDate: string;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  services: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export const initialBlogs: Blog[] = [];

export const initialPortfolios: Portfolio[] = [];

export const initialEnquiries: Enquiry[] = [];

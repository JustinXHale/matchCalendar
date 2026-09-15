export type PolicySection = {
  id?: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
};

export type DocReference = {
  title: string;
  path: string;
  description?: string;
};

export type DocSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  references?: DocReference[];
};

export type DocPage = {
  title: string;
  description: string;
  sections: DocSection[];
};

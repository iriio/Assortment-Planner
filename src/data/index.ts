import { ProductTag } from "../types";

// Re-export everything from the original data file
export * from "../data";

export const productTagLibrary: ProductTag[] = [
  // Style Tags
  { id: "tag-casual", name: "Casual", color: "blue", category: "style" },
  { id: "tag-formal", name: "Formal", color: "slate", category: "style" },
  { id: "tag-sporty", name: "Sporty", color: "green", category: "style" },
  { id: "tag-bohemian", name: "Bohemian", color: "purple", category: "style" },
  {
    id: "tag-minimalist",
    name: "Minimalist",
    color: "gray",
    category: "style",
  },

  // Occasion Tags
  { id: "tag-work", name: "Work", color: "indigo", category: "occasion" },
  { id: "tag-party", name: "Party", color: "pink", category: "occasion" },
  {
    id: "tag-vacation",
    name: "Vacation",
    color: "orange",
    category: "occasion",
  },
  { id: "tag-everyday", name: "Everyday", color: "cyan", category: "occasion" },
  {
    id: "tag-special-event",
    name: "Special Event",
    color: "amber",
    category: "occasion",
  },

  // Trend Tags
  { id: "tag-vintage", name: "Vintage", color: "yellow", category: "trend" },
  { id: "tag-streetwear", name: "Streetwear", color: "red", category: "trend" },
  {
    id: "tag-sustainable",
    name: "Sustainable",
    color: "emerald",
    category: "trend",
  },
  { id: "tag-luxury", name: "Luxury", color: "violet", category: "trend" },
  {
    id: "tag-athleisure",
    name: "Athleisure",
    color: "teal",
    category: "trend",
  },

  // Season Tags
  { id: "tag-spring", name: "Spring", color: "lime", category: "season" },
  { id: "tag-summer", name: "Summer", color: "sky", category: "season" },
  { id: "tag-fall", name: "Fall", color: "orange", category: "season" },
  { id: "tag-winter", name: "Winter", color: "neutral", category: "season" },
  {
    id: "tag-transitional",
    name: "Transitional",
    color: "slate",
    category: "season",
  },

  // Performance Tags
  {
    id: "tag-bestseller",
    name: "Bestseller",
    color: "green",
    category: "performance",
  },
  {
    id: "tag-new-arrival",
    name: "New Arrival",
    color: "blue",
    category: "performance",
  },
  {
    id: "tag-high-margin",
    name: "High Margin",
    color: "purple",
    category: "performance",
  },
  {
    id: "tag-clearance",
    name: "Clearance",
    color: "red",
    category: "performance",
  },
  {
    id: "tag-limited-edition",
    name: "Limited Edition",
    color: "amber",
    category: "performance",
  },
];

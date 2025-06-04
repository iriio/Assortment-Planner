import {
  LinePlan,
  ProductCatalogueItem,
  MasterComponent,
  PlannedStyleStatus,
  StyleComponentUsage,
} from "./types";
import {
  calculateStyleCost,
  calculateStyleMargin,
  generateId,
} from "./services/planningService";

export const masterComponentsData: MasterComponent[] = [
  {
    id: "zip001",
    name: "Standard Zipper YKK",
    type: "ZIPPER",
    cost: 1.5,
    supplier: "YKK",
  },
  {
    id: "zip002",
    name: "Premium Zipper Riri",
    type: "ZIPPER",
    cost: 3.0,
    supplier: "Riri",
  },
  {
    id: "zip003",
    name: "Budget Zipper",
    type: "ZIPPER",
    cost: 0.8,
    supplier: "Generic China",
  },
  {
    id: "zip004",
    name: "Waterproof Zipper Aquaguard",
    type: "ZIPPER",
    cost: 2.5,
    supplier: "YKK",
  },
  {
    id: "btn001",
    name: "Metal Shank Button",
    type: "BUTTON",
    cost: 0.5,
    supplier: "Button Co.",
  },
  {
    id: "btn002",
    name: "Plastic Button - Small",
    type: "BUTTON",
    cost: 0.15,
    supplier: "PlastiButton",
  },
  {
    id: "btn003",
    name: "Designer Horn Button",
    type: "BUTTON",
    cost: 1.2,
    supplier: "Artisan Buttons",
  },
  {
    id: "btn004",
    name: "Rubber Coated Button",
    type: "BUTTON",
    cost: 0.4,
    supplier: "TechButtons",
  },
  {
    id: "fab001",
    name: "12oz Denim - Indigo",
    type: "FABRIC",
    cost: 8.0,
    supplier: "DenimMill",
  }, // Per meter/yard assumed
  {
    id: "fab002",
    name: "Cotton Twill - Khaki",
    type: "FABRIC",
    cost: 5.5,
    supplier: "FabricWorld",
  },
  {
    id: "fab003",
    name: "Performance Polyester - Blue",
    type: "FABRIC",
    cost: 6.0,
    supplier: "TechFabrics",
  },
  {
    id: "fab004",
    name: "Recycled Cotton Jersey - Gray",
    type: "FABRIC",
    cost: 7.0,
    supplier: "EcoThreads",
  },
  {
    id: "fab005",
    name: "Merino Wool - Charcoal",
    type: "FABRIC",
    cost: 12.0,
    supplier: "WoolenMills",
  },
  {
    id: "fab006",
    name: "Silk Charmeuse - Ivory",
    type: "FABRIC",
    cost: 15.0,
    supplier: "SilkTreasures",
  },
  {
    id: "fab007",
    name: "Technical Shell - Black",
    type: "FABRIC",
    cost: 9.5,
    supplier: "PerformanceOuter",
  },
  {
    id: "fab008",
    name: "Organic Cotton Poplin - White",
    type: "FABRIC",
    cost: 6.5,
    supplier: "OrganicFabricsCo",
  },
];

// Default component configurations for different product types
const defaultDressComponents: StyleComponentUsage[] = [
  { componentId: "fab004", quantity: 2.0 }, // Main fabric
  { componentId: "zip003", quantity: 1 }, // Zipper
  { componentId: "btn002", quantity: 2 }, // Buttons
];

const defaultJeanComponents: StyleComponentUsage[] = [
  { componentId: "fab001", quantity: 1.5 },
  { componentId: "zip001", quantity: 1 },
  { componentId: "btn001", quantity: 1 },
];
const defaultTrouserComponents: StyleComponentUsage[] = [
  { componentId: "fab002", quantity: 1.3 },
  { componentId: "zip002", quantity: 1 },
  { componentId: "btn003", quantity: 2 },
];
const defaultTshirtComponents: StyleComponentUsage[] = [
  { componentId: "fab004", quantity: 0.8 },
];
const defaultSweaterComponents: StyleComponentUsage[] = [
  { componentId: "fab005", quantity: 1.2 },
];
const defaultJacketComponents: StyleComponentUsage[] = [
  { componentId: "fab007", quantity: 2.0 },
  { componentId: "zip004", quantity: 1 },
  { componentId: "btn004", quantity: 4 },
];
const defaultBlouseComponents: StyleComponentUsage[] = [
  { componentId: "fab006", quantity: 1.5 },
  { componentId: "btn002", quantity: 5 },
];
const defaultAccessoryComponents: StyleComponentUsage[] = [
  { componentId: "fab006", quantity: 0.5 },
  { componentId: "zip003", quantity: 1 },
];

const calculateInitialFinancials = (
  components: StyleComponentUsage[],
  sellingPrice: number
) => {
  const costPrice = calculateStyleCost(components, masterComponentsData);
  const margin = calculateStyleMargin(costPrice, sellingPrice);
  return { costPrice, margin };
};

export const productCatalogueData: ProductCatalogueItem[] = [
  // Dresses
  {
    id: generateId(),
    name: "Wrap-Front T-Shirt Dress",
    categoryName: "Dresses",
    season: "SS24",
    costPrice: 55.6,
    sellingPrice: 139,
    margin: calculateStyleMargin(55.6, 139),
    imageUrl: "/images/WRAP-FRONT_T-SHIRT_DRESS_$139.jpeg",
    components: defaultDressComponents,
    tags: ["tag-casual", "tag-everyday", "tag-bestseller", "tag-spring"],
  },
  {
    id: generateId(),
    name: "Smocked Midi Dress",
    categoryName: "Dresses",
    season: "SS24",
    costPrice: 55.6,
    sellingPrice: 139,
    margin: calculateStyleMargin(55.6, 139),
    imageUrl: "/images/SMOCKED_MIDI_DRESS_$139.jpeg",
    components: defaultDressComponents,
  },
  {
    id: generateId(),
    name: "Sleeveless Bubble-Hem Midi Dress Orange",
    categoryName: "Dresses",
    season: "SS24",
    costPrice: 67.6,
    sellingPrice: 169,
    margin: calculateStyleMargin(67.6, 169),
    imageUrl: "/images/SLEEVELESS_BUBBLE-HEM_MIDI _DRESS_orange_$169.jpeg",
    components: defaultDressComponents,
  },
  {
    id: generateId(),
    name: "Sleeveless Bubble-Hem Midi Dress Navy",
    categoryName: "Dresses",
    season: "SS24",
    costPrice: 67.6,
    sellingPrice: 169,
    margin: calculateStyleMargin(67.6, 169),
    imageUrl: "/images/SLEEVELESS_BUBBLE-HEM_MIDI _DRESS_navy_$169.jpeg",
    components: defaultDressComponents,
  },

  // Tops
  {
    id: generateId(),
    name: "Tie-Back Linen Top",
    categoryName: "Tops",
    season: "SS24",
    costPrice: 39.6,
    sellingPrice: 99,
    margin: calculateStyleMargin(39.6, 99),
    imageUrl: "/images/TIE-BACK_LINEN_TOP_$99.jpeg",
    components: defaultBlouseComponents,
  },
  {
    id: generateId(),
    name: "Slim Ribbed Cotton Tank Top",
    categoryName: "Tops",
    season: "SS24",
    costPrice: 11.6,
    sellingPrice: 29,
    margin: calculateStyleMargin(11.6, 29),
    imageUrl: "/images/SLIM_RIBBED_COTTON_TANK TOP_$29.jpeg",
    components: defaultTshirtComponents,
  },
  {
    id: generateId(),
    name: "Slim Knitted Silk Polo Shirt",
    categoryName: "Tops",
    season: "SS24",
    costPrice: 39.6,
    sellingPrice: 99,
    margin: calculateStyleMargin(39.6, 99),
    imageUrl: "/images/SLIM_KNITTED_SILK_POLO_SHIRT_$99.jpeg",
    components: defaultBlouseComponents,
  },

  // Bottoms
  {
    id: generateId(),
    name: "Wide-Leg Linen Drawstring Pants",
    categoryName: "Bottoms",
    season: "SS24",
    costPrice: 43.6,
    sellingPrice: 109,
    margin: calculateStyleMargin(43.6, 109),
    imageUrl: "/images/WIDE-LEG_LINEN_DRAWSTRING_PANTS_$109.jpeg",
    components: defaultTrouserComponents,
  },
  {
    id: generateId(),
    name: "Signature Straight-Leg Jeans",
    categoryName: "Bottoms",
    season: "SS24",
    costPrice: 48,
    sellingPrice: 120,
    margin: calculateStyleMargin(48, 120),
    imageUrl: "/images/SIGNATURE_STRAIGHT-LEG_JEANS_$120.jpeg",
    components: defaultJeanComponents,
  },
  {
    id: generateId(),
    name: "Pleated Wide-Leg Denim Pants",
    categoryName: "Bottoms",
    season: "SS24",
    costPrice: 60,
    sellingPrice: 150,
    margin: calculateStyleMargin(60, 150),
    imageUrl: "/images/PLEATED_WIDE-LEG_DENIM_PANTS_$150.jpeg",
    components: defaultJeanComponents,
  },

  // Outerwear
  {
    id: generateId(),
    name: "Single-Breasted Linen Blazer",
    categoryName: "Outerwear",
    season: "SS24",
    costPrice: 103.6,
    sellingPrice: 259,
    margin: calculateStyleMargin(103.6, 259),
    imageUrl: "/images/SINGLE-BREASTED_LINEN_BLAZER_$259.JPEG",
    components: defaultJacketComponents,
  },
  {
    id: generateId(),
    name: "Relaxed Double-Breasted Linen Blazer",
    categoryName: "Outerwear",
    season: "SS24",
    costPrice: 116,
    sellingPrice: 290,
    margin: calculateStyleMargin(116, 290),
    imageUrl: "/images/RELAXED_DOUBLE-BREASTED_LINEN_BLAZER_$290.jpeg",
    components: defaultJacketComponents,
  },

  // Accessories
  {
    id: generateId(),
    name: "Sporty Sunglasses",
    categoryName: "Accessories",
    season: "SS24",
    costPrice: 47.6,
    sellingPrice: 119,
    margin: calculateStyleMargin(47.6, 119),
    imageUrl: "/images/SPORTY_SUNGLASSES_$119.jpeg",
    components: [],
  },
  {
    id: generateId(),
    name: "Hand-Woven Raffia Tote Bag",
    categoryName: "Accessories",
    season: "SS24",
    costPrice: 54,
    sellingPrice: 135,
    margin: calculateStyleMargin(54, 135),
    imageUrl: "/images/HAND-WOVEN_TOTE_BAG-RAFFIA_$135.JPEG",
    components: [],
  },
];

// Update initial line plan categories to match our new product structure
export const initialLinePlan: LinePlan = {
  id: generateId(),
  name: "Spring Summer 2026",
  season: "SS26",
  targetOverallMargin: 0.6,
  targetOverallSellThrough: 0.85,
  targetOverallRevenue: 1500000,
  categories: [
    {
      id: generateId(),
      name: "Dresses",
      targetVolume: 2000,
      plannedStyles: [
        {
          id: generateId(),
          name: "Wrap-Front T-Shirt Dress (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[0].id,
          color: "As Original",
          imageUrl: "/images/WRAP-FRONT_T-SHIRT_DRESS_$139.jpeg",
          costPrice: 55.6,
          sellingPrice: 139,
          margin: calculateStyleMargin(55.6, 139),
          components: [...productCatalogueData[0].components],
          notes: "Carryover from SS24. Strong seller in spring.",
          projectedSellThrough: 0.82,
          tags: ["tag-casual", "tag-everyday", "tag-bestseller", "tag-spring"],
        },
        {
          id: generateId(),
          name: "Sleeveless Bubble-Hem Midi Dress Orange (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[2].id,
          color: "As Original",
          imageUrl:
            "/images/SLEEVELESS_BUBBLE-HEM_MIDI _DRESS_orange_$169.jpeg",
          costPrice: 67.6,
          sellingPrice: 169,
          margin: calculateStyleMargin(67.6, 169),
          components: [...productCatalogueData[2].components],
          notes: "Carryover from SS24. Best-selling dress.",
          projectedSellThrough: 0.88,
          tags: ["tag-formal", "tag-party", "tag-bestseller", "tag-summer"],
        },
        {
          id: generateId(),
          name: "SS26 Knit Sweater Dress",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Navy",
          imageUrl: null,
          costPrice: 75,
          sellingPrice: 189,
          margin: calculateStyleMargin(75, 189),
          components: defaultDressComponents,
          notes: "New design for fall, focusing on knitwear trend.",
          projectedSellThrough: 0.75,
          tags: ["tag-casual", "tag-everyday", "tag-new-arrival", "tag-fall"],
        },
        {
          id: generateId(),
          name: "SS26 Wool Blend Midi Dress",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Charcoal",
          imageUrl: "/images/placeholder-dress.jpeg",
          costPrice: 89,
          sellingPrice: 219,
          margin: calculateStyleMargin(89, 219),
          components: defaultDressComponents,
          notes: "Premium wool blend dress for winter.",
          projectedSellThrough: 0.7,
          tags: ["tag-formal", "tag-work", "tag-luxury", "tag-winter"],
        },
      ],
    },
    {
      id: generateId(),
      name: "Outerwear",
      targetVolume: 1500,
      plannedStyles: [
        {
          id: generateId(),
          name: "Single-Breasted Linen Blazer (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[10].id,
          color: "As Original",
          imageUrl: "/images/SINGLE-BREASTED_LINEN_BLAZER_$259.JPEG",
          costPrice: 103.6,
          sellingPrice: 259,
          margin: calculateStyleMargin(103.6, 259),
          components: [...productCatalogueData[10].components],
          notes: "Carryover from SS24. Year-round bestseller.",
          projectedSellThrough: 0.85,
        },
        {
          id: generateId(),
          name: "SS26 Wool Blend Coat",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Camel",
          imageUrl: "/images/placeholder-coat.jpeg",
          costPrice: 150,
          sellingPrice: 399,
          margin: calculateStyleMargin(150, 399),
          components: defaultJacketComponents,
          notes: "New design for fall, premium wool blend.",
          projectedSellThrough: 0.7,
        },
        {
          id: generateId(),
          name: "SS26 Puffer Jacket",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Black",
          imageUrl: "/images/placeholder-coat.jpeg",
          costPrice: 120,
          sellingPrice: 299,
          margin: calculateStyleMargin(120, 299),
          components: defaultJacketComponents,
          notes: "Technical puffer for winter.",
          projectedSellThrough: 0.8,
        },
      ],
    },
    {
      id: generateId(),
      name: "Tops",
      targetVolume: 3000,
      plannedStyles: [
        {
          id: generateId(),
          name: "Tie-Back Linen Top (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[4].id,
          color: "As Original",
          imageUrl: "/images/TIE-BACK_LINEN_TOP_$99.jpeg",
          costPrice: 39.6,
          sellingPrice: 99,
          margin: calculateStyleMargin(39.6, 99),
          components: [...productCatalogueData[4].components],
          notes: "Carryover from SS24. Good transitional piece.",
          projectedSellThrough: 0.75,
        },
        {
          id: generateId(),
          name: "Slim Knitted Silk Polo (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[6].id,
          color: "As Original",
          imageUrl: "/images/SLIM_KNITTED_SILK_POLO_SHIRT_$99.jpeg",
          costPrice: 39.6,
          sellingPrice: 99,
          margin: calculateStyleMargin(39.6, 99),
          components: [...productCatalogueData[6].components],
          notes: "Carryover from SS24. Versatile style.",
          projectedSellThrough: 0.82,
        },
        {
          id: generateId(),
          name: "SS26 Cashmere Blend Sweater",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Cream",
          imageUrl: "/images/placeholder-top.jpeg",
          costPrice: 89,
          sellingPrice: 219,
          margin: calculateStyleMargin(89, 219),
          components: defaultSweaterComponents,
          notes: "Premium cashmere blend for winter.",
          projectedSellThrough: 0.85,
        },
        {
          id: generateId(),
          name: "SS26 Merino Turtleneck",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Forest Green",
          imageUrl: "/images/placeholder-top.jpeg",
          costPrice: 75,
          sellingPrice: 189,
          margin: calculateStyleMargin(75, 189),
          components: defaultSweaterComponents,
          notes: "Classic merino wool turtleneck.",
          projectedSellThrough: 0.8,
        },
      ],
    },
    {
      id: generateId(),
      name: "Bottoms",
      targetVolume: 2500,
      plannedStyles: [
        {
          id: generateId(),
          name: "Signature Straight-Leg Jeans (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[8].id,
          color: "As Original",
          imageUrl: "/images/SIGNATURE_STRAIGHT-LEG_JEANS_$120.jpeg",
          costPrice: 48,
          sellingPrice: 120,
          margin: calculateStyleMargin(48, 120),
          components: [...productCatalogueData[8].components],
          notes: "Carryover from SS24. Core denim style.",
          projectedSellThrough: 0.9,
        },
        {
          id: generateId(),
          name: "Pleated Wide-Leg Denim (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[9].id,
          color: "As Original",
          imageUrl: "/images/PLEATED_WIDE-LEG_DENIM_PANTS_$150.jpeg",
          costPrice: 60,
          sellingPrice: 150,
          margin: calculateStyleMargin(60, 150),
          components: [...productCatalogueData[9].components],
          notes: "Carryover from SS24. Fashion denim.",
          projectedSellThrough: 0.85,
        },
        {
          id: generateId(),
          name: "SS26 Wool Blend Trousers",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Black",
          imageUrl: "/images/placeholder-bottom.jpeg",
          costPrice: 80,
          sellingPrice: 199,
          margin: calculateStyleMargin(80, 199),
          components: defaultTrouserComponents,
          notes: "Premium wool blend trousers.",
          projectedSellThrough: 0.75,
        },
        {
          id: generateId(),
          name: "SS26 Corduroy Wide-Leg Pants",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Rust",
          imageUrl: "/images/placeholder-bottom.jpeg",
          costPrice: 70,
          sellingPrice: 179,
          margin: calculateStyleMargin(70, 179),
          components: defaultTrouserComponents,
          notes: "Trendy corduroy pants for fall.",
          projectedSellThrough: 0.7,
        },
      ],
    },
    {
      id: generateId(),
      name: "Accessories",
      targetVolume: 2000,
      plannedStyles: [
        {
          id: generateId(),
          name: "Hand-Woven Raffia Tote (CO SS24)",
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: productCatalogueData[13].id,
          color: "As Original",
          imageUrl: "/images/HAND-WOVEN_TOTE_BAG-RAFFIA_$135.JPEG",
          costPrice: 54,
          sellingPrice: 135,
          margin: calculateStyleMargin(54, 135),
          components: [...productCatalogueData[13].components],
          notes: "Carryover from SS24. Year-round bestseller.",
          projectedSellThrough: 0.88,
        },
        {
          id: generateId(),
          name: "SS26 Leather Tote Bag",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Cognac",
          imageUrl: "/images/placeholder-accessory.jpeg",
          costPrice: 120,
          sellingPrice: 299,
          margin: calculateStyleMargin(120, 299),
          components: defaultAccessoryComponents,
          notes: "Premium leather tote for fall.",
          projectedSellThrough: 0.75,
        },
        {
          id: generateId(),
          name: "SS26 Wool Scarf",
          status: PlannedStyleStatus.PLACEHOLDER,
          color: "Grey Check",
          imageUrl: "/images/placeholder-accessory.jpeg",
          costPrice: 40,
          sellingPrice: 99,
          margin: calculateStyleMargin(40, 99),
          components: defaultAccessoryComponents,
          notes: "Classic winter accessory.",
          projectedSellThrough: 0.85,
        },
      ],
    },
  ],
  trends: [
    {
      id: "trend1",
      title: "Modern Heritage",
      description:
        "Classic patterns and traditional fabrics reimagined for today.",
      imageUrl: "/images/SINGLE-BREASTED_LINEN_BLAZER_$259.JPEG",
      likes: 1250,
    },
    {
      id: "trend2",
      title: "Cozy Minimalism",
      description: "Clean lines in comfortable, premium materials.",
      imageUrl: "/images/placeholder-top.jpeg",
      likes: 980,
    },
    {
      id: "trend3",
      title: "Earth Tones",
      description: "Warm, natural colors for fall and winter.",
      imageUrl: "/images/placeholder-coat.jpeg",
      likes: 1550,
    },
  ],
};

// Recalculate all initial style financials based on components, except manually set ones
initialLinePlan.categories.forEach((category) => {
  category.plannedStyles.forEach((style) => {
    if (
      style.id !== "lowmargin_bottom" &&
      style.id !== "lowmargin_denim" &&
      !(
        style.name === "Leather Belt" &&
        style.status === PlannedStyleStatus.CARRYOVER
      )
    ) {
      // Exclude special cases
      const { costPrice, margin } = calculateInitialFinancials(
        style.components,
        style.sellingPrice
      );
      style.costPrice = costPrice;
      style.margin = margin;
    }
  });
});

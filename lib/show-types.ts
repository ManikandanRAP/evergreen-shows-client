import type { Show as ApiShow } from "./api-client"

// Legacy Show interface for backward compatibility
export interface Show {
  id: string
  name: string
  partnerUsers: string[]
  revenueSplit: {
    evergreen: number
    partner: number
  }
  createdDate: string

  // Basic Info
  showType: string
  selectType: "Podcasts" | "Video Series" | "Live Show" | "Interview Series"
  subnetwork: string
  format: "Video" | "Audio"
  relationship: "Strong" | "Medium" | "Weak"
  ageMonths: number
  isTentpole: boolean
  isOriginal: boolean

  // Financial
  minimumGuarantee: number
  ownershipPercentage: number
  brandedRevenueAmount: number
  marketingRevenueAmount: number
  webManagementRevenue: number
  latestCPM: number
  revenue2023: number
  revenue2024: number
  revenue2025: number
  hasSponsorshipRevenue: boolean
  hasNonEvergreenRevenue: boolean
  requiresPartnerLedgerAccess: boolean

  // Content Details
  genre: string
  showsPerYear: number
  adSlots: number
  averageLength: number
  primaryContactHost: string
  primaryContactShow: string

  // Demographics
  ageDemographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+"
  genderDemographic: "Male" | "Female" | "Others"
  isActive: boolean
  isUndersized: boolean

  // Additional fields for compatibility
  host?: {
    name: string
    email: string
    phone: string
  }
  showPrimaryContact?: {
    name: string
    email: string
    phone: string
  }
  demographics: {
    region: string
    primaryEducation: string
    secondaryEducation: string
  }
}

// Utility function to convert API Show to legacy Show format
export function convertApiShowToLegacy(apiShow: ApiShow): Show {
  // Calculate age in months from start_date
  const ageMonths = apiShow.start_date
    ? Math.floor((new Date().getTime() - new Date(apiShow.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0

  // Map relationship levels
  const relationshipMap: Record<string, "Strong" | "Medium" | "Weak"> = {
    strong: "Strong",
    medium: "Medium",
    weak: "Weak",
  }

  // Map media types to format
  const formatMap: Record<string, "Video" | "Audio"> = {
    video: "Video",
    audio: "Audio",
    both: "Video", // Default to Video for "both"
  }

  // Map show types to select types
  const selectTypeMap: Record<string, "Podcasts" | "Video Series" | "Live Show" | "Interview Series"> = {
    Branded: "Podcasts",
    Original: "Podcasts",
    Partner: "Podcasts",
  }

  return {
    id: apiShow.id,
    name: apiShow.title || "Untitled Show",
    partnerUsers: [], // This would need to be populated from partner associations
    revenueSplit: {
      evergreen: apiShow.evergreen_ownership_pct || 0,
      partner: 100 - (apiShow.evergreen_ownership_pct || 0),
    },
    createdDate: apiShow.start_date || new Date().toISOString(),

    // Basic Info
    showType: apiShow.show_type || "Original",
    selectType: selectTypeMap[apiShow.show_type || "Original"] || "Podcasts",
    subnetwork: apiShow.subnetwork_id || "",
    format: formatMap[apiShow.media_type || "audio"] || "Audio",
    relationship: relationshipMap[apiShow.relationship_level || "medium"] || "Medium",
    ageMonths,
    isTentpole: apiShow.tentpole || false,
    isOriginal: apiShow.is_original || false,

    // Financial
    minimumGuarantee: apiShow.minimum_guarantee || 0,
    ownershipPercentage: apiShow.evergreen_ownership_pct || 0,
    brandedRevenueAmount: apiShow.branded_revenue_percent
      ? (apiShow.branded_revenue_percent * (apiShow.revenue_2024 || 0)) / 100
      : 0,
    marketingRevenueAmount: apiShow.marketing_services_revenue_percent
      ? (apiShow.marketing_services_revenue_percent * (apiShow.revenue_2024 || 0)) / 100
      : 0,
    webManagementRevenue: 0, // Not directly mapped in API
    latestCPM: apiShow.latest_cpm_usd || 0,
    revenue2023: apiShow.revenue_2023 || 0,
    revenue2024: apiShow.revenue_2024 || 0,
    revenue2025: apiShow.revenue_2025 || 0,
    hasSponsorshipRevenue: apiShow.has_sponsorship_revenue || false,
    hasNonEvergreenRevenue: apiShow.has_non_evergreen_revenue || false,
    requiresPartnerLedgerAccess: apiShow.requires_partner_access || false,

    // Content Details
    genre: apiShow.genre_id || "General",
    showsPerYear: apiShow.shows_per_year || 0,
    adSlots: apiShow.ad_slots || 0,
    averageLength: apiShow.avg_show_length_mins || 0,
    primaryContactHost: apiShow.show_host_contact || "",
    primaryContactShow: apiShow.show_primary_contact || "",

    // Demographics - using defaults since not in API
    ageDemographic: "25-34",
    genderDemographic: "Male",
    isActive: true, // Default to active
    isUndersized: false,

    // Additional fields
    host: apiShow.show_host_contact
      ? {
          name: apiShow.show_host_contact.split(",")[0] || "",
          email: "",
          phone: "",
        }
      : undefined,
    showPrimaryContact: apiShow.show_primary_contact
      ? {
          name: apiShow.show_primary_contact.split(",")[0] || "",
          email: "",
          phone: "",
        }
      : undefined,
    demographics: {
      region: "North America",
      primaryEducation: "College",
      secondaryEducation: "High School",
    },
  }
}

// Utility function to convert legacy Show to API ShowCreate format
export function convertLegacyShowToApiCreate(legacyShow: Partial<Show>): any {
  const relationshipMap: Record<string, "strong" | "medium" | "weak"> = {
    Strong: "strong",
    Medium: "medium",
    Weak: "weak",
  }

  const formatMap: Record<string, "video" | "audio" | "both"> = {
    Video: "video",
    Audio: "audio",
  }

  const showTypeMap: Record<string, "Branded" | "Original" | "Partner"> = {
    Branded: "Branded",
    Original: "Original",
    Partner: "Partner",
  }

  return {
    title: legacyShow.name || "",
    minimum_guarantee: legacyShow.minimumGuarantee || 0,
    subnetwork_id: legacyShow.subnetwork || null,
    media_type: formatMap[legacyShow.format || "Audio"] || "audio",
    tentpole: legacyShow.isTentpole || false,
    relationship_level: relationshipMap[legacyShow.relationship || "Medium"] || "medium",
    show_type: showTypeMap[legacyShow.showType || "Original"] || "Original",
    evergreen_ownership_pct: legacyShow.ownershipPercentage || 0,
    has_sponsorship_revenue: legacyShow.hasSponsorshipRevenue || false,
    has_non_evergreen_revenue: legacyShow.hasNonEvergreenRevenue || false,
    requires_partner_access: legacyShow.requiresPartnerLedgerAccess || false,
    has_branded_revenue: (legacyShow.brandedRevenueAmount || 0) > 0,
    has_marketing_revenue: (legacyShow.marketingRevenueAmount || 0) > 0,
    has_web_mgmt_revenue: (legacyShow.webManagementRevenue || 0) > 0,
    genre_id: legacyShow.genre || null,
    is_original: legacyShow.isOriginal || false,
    shows_per_year: legacyShow.showsPerYear || null,
    latest_cpm_usd: legacyShow.latestCPM || null,
    ad_slots: legacyShow.adSlots || null,
    avg_show_length_mins: legacyShow.averageLength || null,
    start_date: legacyShow.createdDate ? new Date(legacyShow.createdDate).toISOString().split("T")[0] : null,
    revenue_2023: legacyShow.revenue2023 || null,
    revenue_2024: legacyShow.revenue2024 || null,
    revenue_2025: legacyShow.revenue2025 || null,
    show_host_contact: legacyShow.primaryContactHost || null,
    show_primary_contact: legacyShow.primaryContactShow || null,
  }
}

// Mock data for fallback (keeping existing structure)
export const mockShows: Show[] = [
  {
    id: "1",
    name: "The History Hour",
    partnerUsers: ["2"],
    revenueSplit: { evergreen: 70, partner: 30 },
    createdDate: "2023-01-15",
    showType: "original",
    selectType: "Podcasts",
    subnetwork: "Evergreen History",
    format: "Audio",
    relationship: "Strong",
    ageMonths: 12,
    isTentpole: true,
    isOriginal: true,
    minimumGuarantee: 50000,
    ownershipPercentage: 70,
    brandedRevenueAmount: 15000,
    marketingRevenueAmount: 8000,
    webManagementRevenue: 3000,
    latestCPM: 25.5,
    revenue2023: 125000,
    revenue2024: 150000,
    revenue2025: 180000,
    hasSponsorshipRevenue: true,
    hasNonEvergreenRevenue: false,
    requiresPartnerLedgerAccess: true,
    genre: "History",
    showsPerYear: 52,
    adSlots: 3,
    averageLength: 45,
    primaryContactHost: "John Smith, 123 Main St, New York, NY, (555) 123-4567, john@email.com",
    primaryContactShow: "Sarah Johnson, 456 Oak Ave, Los Angeles, CA, (555) 987-6543, sarah@email.com",
    ageDemographic: "35-44",
    genderDemographic: "Male",
    isActive: true,
    isUndersized: false,
    host: {
      name: "John Smith",
      email: "john@email.com",
      phone: "(555) 123-4567",
    },
    showPrimaryContact: {
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 987-6543",
    },
    demographics: {
      region: "North America",
      primaryEducation: "College",
      secondaryEducation: "High School",
    },
  },
]

export interface LedgerEntry {
  id: string
  showId: string
  showName: string
  month: string
  totalGross: number
  totalNet: number
  evergreenComp: number
  partnerComp: number
  description: string
  category: "sponsorship" | "programmatic" | "subscription" | "merchandise"
}

export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: "1",
    showId: "1",
    showName: "The History Hour",
    month: "2024-01",
    totalGross: 15000,
    totalNet: 12000,
    evergreenComp: 8400,
    partnerComp: 3600,
    description: "January sponsorship revenue",
    category: "sponsorship",
  },
]

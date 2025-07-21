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
  relationship: "Owned" | "Partnership" | "Licensed"
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
  hasNonBussownerRevenue: boolean
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
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Save, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Show } from "@/lib/show-types"

interface CreateShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingShow?: Show | null
  onShowUpdated?: () => void
}

interface ShowFormData {
  // Ordered according to DB schema fields where applicable
  id?: string; // Add id for editing an existing show
  title: string;
  minimum_guarantee: string;
  media_type: "video" | "audio" | "both" | "";
  tentpole: boolean; // Renamed to match DB, boolean for form
  relationship_level: "strong" | "medium" | "weak" | "";
  show_type: "Branded" | "Original" | "Partner" | "";
  evergreen_ownership_pct: string;
  has_sponsorship_revenue: boolean;
  has_non_evergreen_revenue: boolean;
  requires_partner_access: boolean;
  has_branded_revenue: boolean; // Renamed to match DB (assuming this maps to brandedRevenueAmount/percentage logic)
  has_marketing_revenue: boolean; // Renamed to match DB (assuming this maps to marketingRevenueAmount/percentage logic)
  has_web_mgmt_revenue: boolean; // Renamed to match DB (assuming this maps to webManagementRevenue/percentage logic)
  genre: string; // Using 'genre' for genre_id, assuming direct string input for simplicity. If genre_id is UUID, this needs rethinking.
  is_original: boolean;
  shows_per_year: string;
  latest_cpm_usd: string;
  ad_slots: string;
  avg_show_length_mins: string;
  start_date?: string; // Not in form currently, but in DB
  show_name_in_qbo?: string; // Not in form currently, but in DB
  side_bonus_percent?: string; // Not in form currently, but in DB
  youtube_ads_percent?: string; // Not in form currently, but in DB
  subscriptions_percent?: string; // Not in form currently, but in DB
  standard_ads_percent?: string; // Not in form currently, but in DB
  sponsorship_ad_fp_lead_percent?: string; // Not in form currently, but in DB
  sponsorship_ad_partner_lead_percent?: string; // Not in form currently, but in DB
  sponsorship_ad_partner_sold_percent?: string; // Not in form currently, but in DB
  programmatic_ads_span_percent?: string; // Not in form currently, but in DB
  merchandise_percent?: string; // Not in form currently, but in DB
  branded_revenue_percent?: string; // Not in form currently, but in DB
  marketing_services_revenue_percent?: string; // Not in form currently, but in DB
  direct_customer_hands_off_percent?: string; // Not in form currently, but in DB
  youtube_hands_off_percent?: string; // Not in form currently, but in DB
  subscription_hands_off_percent?: string; // Not in form currently, but in DB
  revenue_2023: string; // Dynamic years will populate these
  revenue_2024: string;
  revenue_2025: string;
  evergreen_production_staff_name?: string; // Not in form currently, but in DB
  show_host_contact: string;
  show_primary_contact: string;
  age_range: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "";
  gender: string; // Changed to string for percentage input
  region?: string; // Not in form currently, but in DB
  primary_education?: string; // Not in form currently, but in DB
  secondary_education?: string; // Not in form currently, but in DB
  genre_name?: string; // Not in form currently, but in DB, redundant if genre is used
  subnetwork_name?: string; // Not in form currently, but in DB, redundant if subnetwork is used
  // ageMonths is not in the DB schema provided, keeping it for form logic if needed to map to something else or is a derived field.
  ageMonths: string;
  isActive: boolean; // Not in DB schema provided
  isUndersized: boolean; // Not in DB schema provided
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: ShowFormData = {
  // Ordered according to DB schema fields where applicable
  title: "",
  minimum_guarantee: "",
  media_type: "",
  tentpole: false,
  relationship_level: "",
  show_type: "",
  evergreen_ownership_pct: "",
  has_sponsorship_revenue: false,
  has_non_evergreen_revenue: false,
  requires_partner_access: false,
  has_branded_revenue: false,
  has_marketing_revenue: false,
  has_web_mgmt_revenue: false,
  genre: "",
  is_original: false,
  shows_per_year: "",
  latest_cpm_usd: "",
  ad_slots: "",
  avg_show_length_mins: "",
  show_host_contact: "",
  show_primary_contact: "",
  age_range: "",
  gender: "", // Initialize as empty string
  revenue_2023: "",
  revenue_2024: "",
  revenue_2025: "",
  ageMonths: "", // Keeping for now, as it was in previous formData
  isActive: true,
  isUndersized: false,
}

const genres = [
  "History",
  "Human Resources",
  "Human Interest",
  "Fun & Nostalgia",
  "True Crime",
  "Financial",
  "News & Politics",
  "Movies",
  "Music",
  "Religious",
  "Health & Wellness",
  "Parenting",
  "Lifestyle",
  "Storytelling",
  "Literature",
  "Sports",
  "Pop Culture",
  "Arts",
  "Business",
  "Philosophy",
]

// Define required fields for each tab
const requiredFields = {
  basic: ["title", "show_type", "subnetwork", "media_type", "relationship_level", "ageMonths"],
  financial: [
    "minimum_guarantee",
    "evergreen_ownership_pct",
    "has_branded_revenue",
    "has_marketing_revenue",
    "has_web_mgmt_revenue",
    "revenue_2023", // Add to required if needed, or remove if optional
    "revenue_2024", // Add to required if needed, or remove if optional
    "revenue_2025", // Add to required if needed, or remove if optional
  ],
  content: ["genre", "shows_per_year", "show_primary_contact"],
  demographics: ["age_range", "gender"],
}

export default function CreateShowDialog({ open, onOpenChange, editingShow, onShowUpdated }: CreateShowDialogProps) {
  const [formData, setFormData] = useState<ShowFormData>(initialFormData)
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const currentYear = new Date().getFullYear();
  const revenueYears = [currentYear - 2, currentYear - 1, currentYear]; // [2023, 2024, 2025] for current year 2025

  const isEditMode = !!editingShow

  // Load editing data when editingShow changes
  useEffect(() => {
    if (editingShow) {
      setFormData({
        id: editingShow.id, // Include ID for PUT requests
        title: editingShow.name,
        minimum_guarantee: editingShow.minimumGuarantee.toString(),
        media_type: editingShow.format as "video" | "audio" | "both" || "",
        tentpole: editingShow.isTentpole,
        relationship_level: editingShow.relationship as "strong" | "medium" | "weak" || "",
        show_type: editingShow.showType as "Branded" | "Original" | "Partner" || "",
        evergreen_ownership_pct: editingShow.ownershipPercentage.toString(),
        has_sponsorship_revenue: editingShow.hasSponsorshipRevenue,
        has_non_evergreen_revenue: editingShow.hasNonEvergreenRevenue,
        requires_partner_access: editingShow.requiresPartnerLedgerAccess,
        has_branded_revenue: editingShow.hasBrandedRevenue, // Assuming this maps from brandedRevenueAmount
        has_marketing_revenue: editingShow.hasMarketingRevenue, // Assuming this maps from marketingRevenueAmount
        has_web_mgmt_revenue: editingShow.hasWebManagementRevenue, // Assuming this maps from webManagementRevenue
        genre: editingShow.genre,
        is_original: editingShow.isOriginal,
        shows_per_year: editingShow.showsPerYear.toString(),
        latest_cpm_usd: editingShow.latestCPM.toString(),
        ad_slots: editingShow.adSlots.toString(),
        avg_show_length_mins: editingShow.averageLength.toString(),
        revenue_2023: editingShow.revenue2023.toString(),
        revenue_2024: editingShow.revenue2024.toString(),
        revenue_2025: editingShow.revenue2025.toString(),
        show_host_contact: editingShow.primaryContactHost,
        show_primary_contact: editingShow.primaryContactShow,
        age_range: editingShow.ageDemographic as "18-24" | "25-34" | "35-44" | "45-54" | "55+" || "",
        gender: editingShow.genderDemographic, // Maps to the new gender text field
        ageMonths: editingShow.ageMonths.toString(), // Keep for now
        isActive: editingShow.isActive,
        isUndersized: editingShow.isUndersized,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingShow])

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "financial", label: "Financial", icon: "💰" },
    { id: "content", label: "Content Details", icon: "🎙️" },
    { id: "demographics", label: "Demographics", icon: "👥" },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab)

  const validateField = (field: string, value: any): string => {
    const currentTabFields = requiredFields[currentTab as keyof typeof requiredFields] || []

    if (currentTabFields.includes(field)) {
      // Special handling for boolean checkboxes if they are required (though typically not for initial empty check)
      if (typeof value === "boolean") {
        return ""; // Booleans are considered "valid" for presence
      }

      if (!value || (typeof value === "string" && value.trim() === "")) {
        return "This field is required"
      }

      if (field === "ageMonths" && (isNaN(Number(value)) || Number(value) < 0)) {
        return "Age must be a valid positive number"
      }

      if (field === "evergreen_ownership_pct" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
        return "Ownership percentage must be between 0 and 100"
      }

      if (
        (field === "minimum_guarantee" ||
          field.startsWith("revenue_")) &&
        (isNaN(Number(value)) || Number(value) < 0)
      ) {
        return "Amount must be a valid positive number"
      }

      if (field === "shows_per_year" && (isNaN(Number(value)) || Number(value) < 1)) {
        return "Shows per year must be at least 1"
      }

      // Gender percentage validation
      if (field === "gender") {
        const regex = /^(M|F)-\d{1,3}%-(M|F)-\d{1,3}%$/; // Example: M-30%-F-70%
        if (!regex.test(value)) {
          return "Format: Gender-Percentage%-Gender-Percentage% (e.g., M-30%-F-70%)";
        }
        // Further validation: ensure percentages sum to 100
        const parts = value.split('-');
        if (parts.length === 4 && parts[1].endsWith('%') && parts[3].endsWith('%')) {
          const p1 = parseFloat(parts[1].slice(0, -1));
          const p2 = parseFloat(parts[3].slice(0, -1));
          if (isNaN(p1) || isNaN(p2) || (p1 + p2 !== 100)) {
            return "Percentages must sum to 100%";
          }
        } else {
          return "Invalid percentage format";
        }
      }
    }

    return ""
  }

  const validateCurrentTab = (): boolean => {
    const currentTabFields = requiredFields[currentTab as keyof typeof requiredFields] || []
    const newErrors: FormErrors = {}
    let isValid = true

    currentTabFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof ShowFormData])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const validateAllTabs = (): boolean => {
    const allErrors: FormErrors = {}
    let isValid = true

    Object.entries(requiredFields).forEach(([tabId, fields]) => {
      fields.forEach((field) => {
        const error = validateField(field, formData[field as keyof ShowFormData])
        if (error) {
          allErrors[field] = error
          isValid = false
        }
      })
    })

    setErrors(allErrors)
    return isValid
  }

  const handleInputChange = (field: keyof ShowFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    if (validateCurrentTab()) {
      if (currentTabIndex < tabs.length - 1) {
        setCurrentTab(tabs[currentTabIndex + 1].id)
      }
    }
  }

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(tabs[currentTabIndex - 1].id)
    }
  }

  const handleSave = async () => {
    setAttemptedSubmit(true);

    if (!validateAllTabs()) {
      const tabsWithErrors = Object.entries(requiredFields).find(([tabId, fields]) =>
        fields.some((field) => errors[field])
      );

      if (tabsWithErrors) {
        setCurrentTab(tabsWithErrors[0]);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      // Map formData to match backend API field names and types
      const payload = {
        title: formData.title,
        minimum_guarantee: parseFloat(formData.minimum_guarantee || "0"),
        media_type: formData.media_type,
        tentpole: formData.tentpole ? 1 : 0, // Convert boolean to tinyint (0 or 1)
        relationship_level: formData.relationship_level,
        show_type: formData.show_type,
        evergreen_ownership_pct: parseFloat(formData.evergreen_ownership_pct || "0"),
        has_sponsorship_revenue: formData.has_sponsorship_revenue ? 1 : 0,
        has_non_evergreen_revenue: formData.has_non_evergreen_revenue ? 1 : 0,
        requires_partner_access: formData.requires_partner_access ? 1 : 0,
        has_branded_revenue: formData.has_branded_revenue ? 1 : 0,
        has_marketing_revenue: formData.has_marketing_revenue ? 1 : 0,
        has_web_mgmt_revenue: formData.has_web_mgmt_revenue ? 1 : 0,
        genre_id: formData.genre, // Assuming genre maps to genre_id. If genre_id is UUID, this needs adjustment.
        is_original: formData.is_original ? 1 : 0,
        shows_per_year: parseInt(formData.shows_per_year || "0"),
        latest_cpm_usd: parseFloat(formData.latest_cpm_usd || "0"),
        ad_slots: parseInt(formData.ad_slots || "0"),
        avg_show_length_mins: parseInt(formData.avg_show_length_mins || "0"),
        revenue_2023: parseFloat(formData.revenue_2023 || "0"),
        revenue_2024: parseFloat(formData.revenue_2024 || "0"),
        revenue_2025: parseFloat(formData.revenue_2025 || "0"),
        show_host_contact: formData.show_host_contact,
        show_primary_contact: formData.show_primary_contact,
        age_range: formData.age_range,
        gender: formData.gender, // Send as string
        // Fields not directly from form, but in DB schema:
        // start_date: formData.start_date,
        // show_name_in_qbo: formData.show_name_in_qbo,
        // side_bonus_percent: parseFloat(formData.side_bonus_percent || "0"),
        // youtube_ads_percent: parseFloat(formData.youtube_ads_percent || "0"),
        // subscriptions_percent: parseFloat(formData.subscriptions_percent || "0"),
        // standard_ads_percent: parseFloat(formData.standard_ads_percent || "0"),
        // sponsorship_ad_fp_lead_percent: parseFloat(formData.sponsorship_ad_fp_lead_percent || "0"),
        // sponsorship_ad_partner_lead_percent: parseFloat(formData.sponsorship_ad_partner_lead_percent || "0"),
        // sponsorship_ad_partner_sold_percent: parseFloat(formData.sponsorship_ad_partner_sold_percent || "0"),
        // programmatic_ads_span_percent: parseFloat(formData.programmatic_ads_span_percent || "0"),
        // merchandise_percent: parseFloat(formData.merchandise_percent || "0"),
        // branded_revenue_percent: parseFloat(formData.branded_revenue_percent || "0"),
        // marketing_services_revenue_percent: parseFloat(formData.marketing_services_revenue_percent || "0"),
        // direct_customer_hands_off_percent: parseFloat(formData.direct_customer_hands_off_percent || "0"),
        // youtube_hands_off_percent: parseFloat(formData.youtube_hands_off_percent || "0"),
        // subscription_hands_off_percent: parseFloat(formData.subscription_hands_off_percent || "0"),
        // evergreen_production_staff_name: formData.evergreen_production_staff_name,
        // region: formData.region,
        // primary_education: formData.primary_education,
        // secondary_education: formData.secondary_education,
        // genre_name: formData.genre_name,
        // subnetwork_name: formData.subnetwork_name,
        // Note: `ageMonths`, `isActive`, `isUndersized` are not in the provided DB schema.
        // If they need to be sent, you'll need to confirm their corresponding DB fields.
      };

      const url = isEditMode
        ? `http://localhost:8000/podcasts/${editingShow?.id}`
        : "http://localhost:8000/podcasts";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${isEditMode ? "update" : "save"} podcast`);
      }

      const data = await response.json();
      console.log(isEditMode ? "Updated:" : "Saved:", data);

      onShowUpdated?.();
      onOpenChange(false);
      setFormData(initialFormData);
      setCurrentTab("basic");
      setErrors({});
      setAttemptedSubmit(false);
    } catch (err) {
      console.error("Save failed:", err);
      // You might want to display a user-friendly error message here
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setCurrentTab("basic")
    setErrors({})
    setAttemptedSubmit(false)
    onOpenChange(false)
  }

  const isTabComplete = (tabId: string) => {
    const tabFields = requiredFields[tabId as keyof typeof requiredFields] || []
    return tabFields.every((field) => {
      const value = formData[field as keyof ShowFormData]
      if (typeof value === 'boolean') {
        return true;
      }
      return value && (typeof value !== "string" || value.trim() !== "");
    })
  }

  const hasTabErrors = (tabId: string) => {
    const tabFields = requiredFields[tabId as keyof typeof requiredFields] || []
    return tabFields.some((field) => errors[field])
  }

  const getFieldError = (field: string) => errors[field]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Show" : "Create New Show"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 text-sm relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  isTabComplete(tab.id) &&
                  currentTab !== tab.id &&
                  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                  hasTabErrors(tab.id) &&
                  attemptedSubmit &&
                  currentTab !== tab.id &&
                  "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {isTabComplete(tab.id) && !hasTabErrors(tab.id) && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs bg-emerald-100 text-emergreen-700">
                    ✓
                  </Badge>
                )}
                {hasTabErrors(tab.id) && attemptedSubmit && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    !
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📝 Basic Information</CardTitle>
                  <CardDescription>Enter the fundamental details about your show</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-1">
                        Show Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter show name"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className={cn(getFieldError("title") && "border-red-500")}
                      />
                      {getFieldError("title") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("title")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="show_type" className="flex items-center gap-1">
                        Show Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.show_type}
                        onValueChange={(value) => handleInputChange("show_type", value as ShowFormData["show_type"])}
                      >
                        <SelectTrigger className={cn(getFieldError("show_type") && "border-red-500")}>
                          <SelectValue placeholder="Choose show type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branded">Branded</SelectItem>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("show_type") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("show_type")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subnetwork" className="flex items-center gap-1">
                        Subnetwork <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subnetwork"
                        placeholder="Enter subnetwork name"
                        value={formData.subnetwork}
                        onChange={(e) => handleInputChange("subnetwork", e.target.value)}
                        className={cn(getFieldError("subnetwork") && "border-red-500")}
                      />
                      {getFieldError("subnetwork") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("subnetwork")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Media Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.media_type} onValueChange={(value) => handleInputChange("media_type", value as ShowFormData["media_type"])}>
                        <SelectTrigger className={cn(getFieldError("media_type") && "border-red-500")}>
                          <SelectValue placeholder="Choose format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("media_type") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("media_type")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Relationship Level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.relationship_level}
                        onValueChange={(value) => handleInputChange("relationship_level", value as ShowFormData["relationship_level"])}
                      >
                        <SelectTrigger className={cn(getFieldError("relationship_level") && "border-red-500")}>
                          <SelectValue placeholder="Choose relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strong">Strong</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("relationship_level") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("relationship_level")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ageMonths" className="flex items-center gap-1">
                        Age (Months) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ageMonths"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.ageMonths}
                        onChange={(e) => handleInputChange("ageMonths", e.target.value)}
                        className={cn(getFieldError("ageMonths") && "border-red-500")}
                      />
                      {getFieldError("ageMonths") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("ageMonths")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tentpole"
                        checked={formData.tentpole}
                        onCheckedChange={(checked) => handleInputChange("tentpole", checked)}
                      />
                      <Label htmlFor="tentpole">Is Tentpole Show</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_original"
                        checked={formData.is_original}
                        onCheckedChange={(checked) => handleInputChange("is_original", checked)}
                      />
                      <Label htmlFor="is_original">Is Original Content</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">💰 Financial Information</CardTitle>
                  <CardDescription>Configure revenue and financial details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimum_guarantee" className="flex items-center gap-1">
                        Minimum Guarantee (Annual) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minimum_guarantee"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.minimum_guarantee}
                        onChange={(e) => handleInputChange("minimum_guarantee", e.target.value)}
                        className={cn(getFieldError("minimum_guarantee") && "border-red-500")}
                      />
                      {getFieldError("minimum_guarantee") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("minimum_guarantee")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evergreen_ownership_pct" className="flex items-center gap-1">
                        Evergreen Ownership Percentage <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="evergreen_ownership_pct"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={formData.evergreen_ownership_pct}
                        onChange={(e) => handleInputChange("evergreen_ownership_pct", e.target.value)}
                        className={cn(getFieldError("evergreen_ownership_pct") && "border-red-500")}
                      />
                      {getFieldError("evergreen_ownership_pct") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("evergreen_ownership_pct")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_branded_revenue"
                        checked={formData.has_branded_revenue}
                        onCheckedChange={(checked) => handleInputChange("has_branded_revenue", checked)}
                      />
                      <Label htmlFor="has_branded_revenue">Has Branded Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_marketing_revenue"
                        checked={formData.has_marketing_revenue}
                        onCheckedChange={(checked) => handleInputChange("has_marketing_revenue", checked)}
                      />
                      <Label htmlFor="has_marketing_revenue">Has Marketing Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_web_mgmt_revenue"
                        checked={formData.has_web_mgmt_revenue}
                        onCheckedChange={(checked) => handleInputChange("has_web_mgmt_revenue", checked)}
                      />
                      <Label htmlFor="has_web_mgmt_revenue">Has Web Management Revenue</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {revenueYears.map((year) => (
                      <div className="space-y-2" key={year}>
                        <Label htmlFor={`revenue_${year}`}>Revenue {year}</Label>
                        <Input
                          id={`revenue_${year}`}
                          type="number"
                          placeholder="0"
                          min="0"
                          value={formData[`revenue_${year}` as keyof ShowFormData]}
                          onChange={(e) => handleInputChange(`revenue_${year}` as keyof ShowFormData, e.target.value)}
                        />
                         {getFieldError(`revenue_${year}`) && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError(`revenue_${year}`)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latest_cpm_usd">Latest CPM USD</Label>
                    <Input
                      id="latest_cpm_usd"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      value={formData.latest_cpm_usd}
                      onChange={(e) => handleInputChange("latest_cpm_usd", e.target.value)}
                    />
                  </div>


                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_sponsorship_revenue"
                        checked={formData.has_sponsorship_revenue}
                        onCheckedChange={(checked) => handleInputChange("has_sponsorship_revenue", checked)}
                      />
                      <Label htmlFor="has_sponsorship_revenue">Has Sponsorship Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_non_evergreen_revenue"
                        checked={formData.has_non_evergreen_revenue}
                        onCheckedChange={(checked) => handleInputChange("has_non_evergreen_revenue", checked)}
                      />
                      <Label htmlFor="has_non_evergreen_revenue">Has Non Evergreen Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requires_partner_access"
                        checked={formData.requires_partner_access}
                        onCheckedChange={(checked) => handleInputChange("requires_partner_access", checked)}
                      />
                      <Label htmlFor="requires_partner_access">Requires Partner Ledger Access</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Details Tab */}
            <TabsContent value="content" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🎙️ Content Details</CardTitle>
                  <CardDescription>Specify content format and production details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Genre <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
                        <SelectTrigger className={cn(getFieldError("genre") && "border-red-500")}>
                          <SelectValue placeholder="Choose genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError("genre") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("genre")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shows_per_year" className="flex items-center gap-1">
                        Shows per Year <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="shows_per_year"
                        type="number"
                        placeholder="0"
                        min="1"
                        value={formData.shows_per_year}
                        onChange={(e) => handleInputChange("shows_per_year", e.target.value)}
                        className={cn(getFieldError("shows_per_year") && "border-red-500")}
                      />
                      {getFieldError("shows_per_year") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("shows_per_year")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ad_slots">Ad Slots</Label>
                      <Input
                        id="ad_slots"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.ad_slots}
                        onChange={(e) => handleInputChange("ad_slots", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avg_show_length_mins">Average Length (Minutes)</Label>
                      <Input
                        id="avg_show_length_mins"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.avg_show_length_mins}
                        onChange={(e) => handleInputChange("avg_show_length_mins", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="show_host_contact">Primary Contact (Host)</Label>
                    <Textarea
                      id="show_host_contact"
                      placeholder="Name, Phone, Email, Address"
                      rows={4}
                      value={formData.show_host_contact}
                      onChange={(e) => handleInputChange("show_host_contact", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="show_primary_contact" className="flex items-center gap-1">
                      Primary Contact (Show) <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="show_primary_contact"
                      placeholder="Name, Phone, Email, Address"
                      rows={4}
                      value={formData.show_primary_contact}
                      onChange={(e) => handleInputChange("show_primary_contact", e.target.value)}
                      className={cn(getFieldError("show_primary_contact") && "border-red-500")}
                    />
                    {getFieldError("show_primary_contact") && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError("show_primary_contact")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">👥 Demographics</CardTitle>
                  <CardDescription>Define your target audience and show status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Age Demographic <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.age_range}
                        onValueChange={(value) => handleInputChange("age_range", value as ShowFormData["age_range"])}
                      >
                        <SelectTrigger className={cn(getFieldError("age_range") && "border-red-500")}>
                          <SelectValue placeholder="Choose age range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-24">18-24</SelectItem>
                          <SelectItem value="25-34">25-34</SelectItem>
                          <SelectItem value="35-44">35-44</SelectItem>
                          <SelectItem value="45-54">45-54</SelectItem>
                          <SelectItem value="55+">55+</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("age_range") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("age_range")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center gap-1">
                        Gender Demographic <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="gender"
                        placeholder="e.g., M-30%-F-70%"
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className={cn(getFieldError("gender") && "border-red-500")}
                      />
                      {getFieldError("gender") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("gender")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                      />
                      <Label htmlFor="isActive">Is Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUndersized"
                        checked={formData.isUndersized}
                        onCheckedChange={(checked) => handleInputChange("isUndersized", checked)}
                      />
                      <Label htmlFor="isUndersized">Is Undersized</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Show validation errors summary if attempted to submit */}
          {attemptedSubmit && Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mx-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all required fields before saving. Check the highlighted tabs and fields.
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-background">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentTabIndex === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={handleNext} disabled={currentTabIndex === tabs.length - 1}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button className="evergreen-button" onClick={handleSave} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update Show" : "Save Show"}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
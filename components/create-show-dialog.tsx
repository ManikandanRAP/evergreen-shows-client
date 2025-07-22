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
  // Basic Info
  name: string
  showType: string
  selectType: "Podcasts" | "Video Series" | "Live Show" | "Interview Series" | ""
  subnetwork: string
  format: "Video" | "Audio" | "Both" | ""
  relationship: "Strong" | "Medium" | "Weak" | ""
  ageMonths: string
  isTentpole: boolean
  isOriginal: boolean

  // Financial
  minimumGuarantee: string
  ownershipPercentage: string
  brandedRevenueAmount: string
  marketingRevenueAmount: string
  webManagementRevenue: string
  latestCPM: string
  revenue2023: string
  revenue2024: string
  revenue2025: string
  hasSponsorshipRevenue: boolean
  hasNonEvergreenRevenue: boolean
  requiresPartnerLedgerAccess: boolean

  // Content Details
  genre: string
  showsPerYear: string
  adSlots: string
  averageLength: string
  primaryContactHost: string
  primaryContactShow: string

  // Demographics
  ageDemographic: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | ""
  genderDemographic: "Male" | "Female" | "Others" | ""
  isActive: boolean
  isUndersized: boolean
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: ShowFormData = {
  // Basic Info
  name: "",
  showType: "",
  selectType: "",
  subnetwork: "",
  format: "",
  relationship: "",
  ageMonths: "",
  isTentpole: false,
  isOriginal: false,

  // Financial
  minimumGuarantee: "",
  ownershipPercentage: "",
  brandedRevenueAmount: "",
  marketingRevenueAmount: "",
  webManagementRevenue: "",
  latestCPM: "",
  revenue2023: "",
  revenue2024: "",
  revenue2025: "",
  hasSponsorshipRevenue: false,
  hasNonEvergreenRevenue: false,
  requiresPartnerLedgerAccess: false,

  // Content Details
  genre: "",
  showsPerYear: "",
  adSlots: "",
  averageLength: "",
  primaryContactHost: "",
  primaryContactShow: "",

  // Demographics
  ageDemographic: "",
  genderDemographic: "",
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
  basic: ["name", "showType", "selectType", "subnetwork", "format", "relationship", "ageMonths"],
  financial: [
    "minimumGuarantee",
    "ownershipPercentage",
    "brandedRevenueAmount",
    "marketingRevenueAmount",
    "webManagementRevenue",
  ],
  content: ["genre", "showsPerYear", "primaryContactShow"],
  demographics: ["ageDemographic", "genderDemographic"],
}

export default function CreateShowDialog({ open, onOpenChange, editingShow, onShowUpdated }: CreateShowDialogProps) {
  const [formData, setFormData] = useState<ShowFormData>(initialFormData)
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const isEditMode = !!editingShow

  // Load editing data when editingShow changes
  useEffect(() => {
    if (editingShow) {
      setFormData({
        // Basic Info
        name: editingShow.name,
        showType: editingShow.showType,
        selectType: editingShow.selectType,
        subnetwork: editingShow.subnetwork,
        format: editingShow.format,
        relationship: editingShow.relationship,
        ageMonths: editingShow.ageMonths.toString(),
        isTentpole: editingShow.isTentpole,
        isOriginal: editingShow.isOriginal,

        // Financial
        minimumGuarantee: editingShow.minimumGuarantee.toString(),
        ownershipPercentage: editingShow.ownershipPercentage.toString(),
        brandedRevenueAmount: editingShow.brandedRevenueAmount.toString(),
        marketingRevenueAmount: editingShow.marketingRevenueAmount.toString(),
        webManagementRevenue: editingShow.webManagementRevenue.toString(),
        latestCPM: editingShow.latestCPM.toString(),
        revenue2023: editingShow.revenue2023.toString(),
        revenue2024: editingShow.revenue2024.toString(),
        revenue2025: editingShow.revenue2025.toString(),
        hasSponsorshipRevenue: editingShow.hasSponsorshipRevenue,
        hasNonEvergreenRevenue: editingShow.hasNonEvergreenRevenue,
        requiresPartnerLedgerAccess: editingShow.requiresPartnerLedgerAccess,

        // Content Details
        genre: editingShow.genre,
        showsPerYear: editingShow.showsPerYear.toString(),
        adSlots: editingShow.adSlots.toString(),
        averageLength: editingShow.averageLength.toString(),
        primaryContactHost: editingShow.primaryContactHost,
        primaryContactShow: editingShow.primaryContactShow,

        // Demographics
        ageDemographic: editingShow.ageDemographic,
        genderDemographic: editingShow.genderDemographic,
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
    // Check if field is required for current tab
    const currentTabFields = requiredFields[currentTab as keyof typeof requiredFields] || []

    if (currentTabFields.includes(field)) {
      if (!value || value === "" || (typeof value === "string" && value.trim() === "")) {
        return "This field is required"
      }

      // Additional validation for specific fields
      if (field === "ageMonths" && (isNaN(Number(value)) || Number(value) < 0)) {
        return "Age must be a valid positive number"
      }

      if (field === "ownershipPercentage" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
        return "Ownership percentage must be between 0 and 100"
      }

      if (
        (field === "minimumGuarantee" ||
          field === "brandedRevenueAmount" ||
          field === "marketingRevenueAmount" ||
          field === "webManagementRevenue") &&
        (isNaN(Number(value)) || Number(value) < 0)
      ) {
        return "Amount must be a valid positive number"
      }

      if (field === "showsPerYear" && (isNaN(Number(value)) || Number(value) < 1)) {
        return "Shows per year must be at least 1"
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

    // Clear error for this field when user starts typing
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

  const handleSave__ = async () => {
    setAttemptedSubmit(true)

    if (!validateAllTabs()) {
      // Find first tab with errors and switch to it
      const tabsWithErrors = Object.entries(requiredFields).find(([tabId, fields]) =>
        fields.some((field) => errors[field]),
      )

      if (tabsWithErrors) {
        setCurrentTab(tabsWithErrors[0])
      }
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(isEditMode ? "Updating show:" : "Saving show:", formData)
    setIsSubmitting(false)
    onShowUpdated?.()
    onOpenChange(false)
    setFormData(initialFormData)
    setCurrentTab("basic")
    setErrors({})
    setAttemptedSubmit(false)
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
      const token = localStorage.getItem("access_token"); // Replace if token is stored elsewhere
  
      const response = await fetch("http://localhost:8000/podcasts", {
        method: "POST",
        
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save podcast");
      }
  
      const data = await response.json();
      console.log("Saved:", data);
  
      onShowUpdated?.();
      onOpenChange(false);
      setFormData(initialFormData);
      setCurrentTab("basic");
      setErrors({});
      setAttemptedSubmit(false);
    } catch (err) {
      console.error("Save failed:", err);
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
      return value && value !== "" && (typeof value !== "string" || value.trim() !== "")
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
                      <Label htmlFor="name" className="flex items-center gap-1">
                        Show Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter show name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={cn(getFieldError("name") && "border-red-500")}
                      />
                      {getFieldError("name") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("name")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="showType" className="flex items-center gap-1">
                        Show Type <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="showType"
                        placeholder="e.g., Educational, Entertainment"
                        value={formData.showType}
                        onChange={(e) => handleInputChange("showType", e.target.value)}
                        className={cn(getFieldError("showType") && "border-red-500")}
                      />
                      {getFieldError("showType") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("showType")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Select Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.selectType}
                        onValueChange={(value) => handleInputChange("selectType", value)}
                      >
                        <SelectTrigger className={cn(getFieldError("selectType") && "border-red-500")}>
                          <SelectValue placeholder="Choose type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Podcasts">Podcasts</SelectItem>
                          <SelectItem value="Video Series">Video Series</SelectItem>
                          <SelectItem value="Live Show">Live Show</SelectItem>
                          <SelectItem value="Interview Series">Interview Series</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("selectType") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("selectType")}
                        </p>
                      )}
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Format <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.format} onValueChange={(value) => handleInputChange("format", value)}>
                        <SelectTrigger className={cn(getFieldError("format") && "border-red-500")}>
                          <SelectValue placeholder="Choose format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("format") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("format")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Relationship <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value) => handleInputChange("relationship", value)}
                      >
                        <SelectTrigger className={cn(getFieldError("relationship") && "border-red-500")}>
                          <SelectValue placeholder="Choose relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("relationship") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("relationship")}
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
                        id="isTentpole"
                        checked={formData.isTentpole}
                        onCheckedChange={(checked) => handleInputChange("isTentpole", checked)}
                      />
                      <Label htmlFor="isTentpole">Is Tentpole Show</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOriginal"
                        checked={formData.isOriginal}
                        onCheckedChange={(checked) => handleInputChange("isOriginal", checked)}
                      />
                      <Label htmlFor="isOriginal">Is Original Content</Label>
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
                      <Label htmlFor="minimumGuarantee" className="flex items-center gap-1">
                        Minimum Guarantee (Annual) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minimumGuarantee"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.minimumGuarantee}
                        onChange={(e) => handleInputChange("minimumGuarantee", e.target.value)}
                        className={cn(getFieldError("minimumGuarantee") && "border-red-500")}
                      />
                      {getFieldError("minimumGuarantee") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("minimumGuarantee")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownershipPercentage" className="flex items-center gap-1">
                        Ownership Percentage <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ownershipPercentage"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={formData.ownershipPercentage}
                        onChange={(e) => handleInputChange("ownershipPercentage", e.target.value)}
                        className={cn(getFieldError("ownershipPercentage") && "border-red-500")}
                      />
                      {getFieldError("ownershipPercentage") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("ownershipPercentage")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandedRevenueAmount" className="flex items-center gap-1">
                        Branded Revenue Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="brandedRevenueAmount"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.brandedRevenueAmount}
                        onChange={(e) => handleInputChange("brandedRevenueAmount", e.target.value)}
                        className={cn(getFieldError("brandedRevenueAmount") && "border-red-500")}
                      />
                      {getFieldError("brandedRevenueAmount") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("brandedRevenueAmount")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketingRevenueAmount" className="flex items-center gap-1">
                        Marketing Revenue Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="marketingRevenueAmount"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.marketingRevenueAmount}
                        onChange={(e) => handleInputChange("marketingRevenueAmount", e.target.value)}
                        className={cn(getFieldError("marketingRevenueAmount") && "border-red-500")}
                      />
                      {getFieldError("marketingRevenueAmount") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("marketingRevenueAmount")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webManagementRevenue" className="flex items-center gap-1">
                        Web Management Revenue <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="webManagementRevenue"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.webManagementRevenue}
                        onChange={(e) => handleInputChange("webManagementRevenue", e.target.value)}
                        className={cn(getFieldError("webManagementRevenue") && "border-red-500")}
                      />
                      {getFieldError("webManagementRevenue") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("webManagementRevenue")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latestCPM">Latest CPM</Label>
                      <Input
                        id="latestCPM"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={formData.latestCPM}
                        onChange={(e) => handleInputChange("latestCPM", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue2023">Revenue 2023</Label>
                      <Input
                        id="revenue2023"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2023}
                        onChange={(e) => handleInputChange("revenue2023", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue2024">Revenue 2024</Label>
                      <Input
                        id="revenue2024"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2024}
                        onChange={(e) => handleInputChange("revenue2024", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue2025">Revenue 2025</Label>
                      <Input
                        id="revenue2025"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.revenue2025}
                        onChange={(e) => handleInputChange("revenue2025", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSponsorshipRevenue"
                        checked={formData.hasSponsorshipRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasSponsorshipRevenue", checked)}
                      />
                      <Label htmlFor="hasSponsorshipRevenue">Has Sponsorship Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasNonEvergreenRevenue"
                        checked={formData.hasNonEvergreenRevenue}
                        onCheckedChange={(checked) => handleInputChange("hasNonEvergreenRevenue", checked)}
                      />
                      <Label htmlFor="hasNonEvergreenRevenue">Has Non Evergreen Revenue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresPartnerLedgerAccess"
                        checked={formData.requiresPartnerLedgerAccess}
                        onCheckedChange={(checked) => handleInputChange("requiresPartnerLedgerAccess", checked)}
                      />
                      <Label htmlFor="requiresPartnerLedgerAccess">Requires Partner Ledger Access</Label>
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
                      <Label htmlFor="showsPerYear" className="flex items-center gap-1">
                        Shows per Year <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="showsPerYear"
                        type="number"
                        placeholder="0"
                        min="1"
                        value={formData.showsPerYear}
                        onChange={(e) => handleInputChange("showsPerYear", e.target.value)}
                        className={cn(getFieldError("showsPerYear") && "border-red-500")}
                      />
                      {getFieldError("showsPerYear") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("showsPerYear")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adSlots">Ad Slots</Label>
                      <Input
                        id="adSlots"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.adSlots}
                        onChange={(e) => handleInputChange("adSlots", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averageLength">Average Length (Minutes)</Label>
                      <Input
                        id="averageLength"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.averageLength}
                        onChange={(e) => handleInputChange("averageLength", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactHost">Primary Contact (Host)</Label>
                    <Textarea
                      id="primaryContactHost"
                      placeholder="Name, Phone, Email, Address"
                      rows={4}
                      value={formData.primaryContactHost}
                      onChange={(e) => handleInputChange("primaryContactHost", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactShow" className="flex items-center gap-1">
                      Primary Contact (Show) <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="primaryContactShow"
                      placeholder="Name, Phone, Email, Address"
                      rows={4}
                      value={formData.primaryContactShow}
                      onChange={(e) => handleInputChange("primaryContactShow", e.target.value)}
                      className={cn(getFieldError("primaryContactShow") && "border-red-500")}
                    />
                    {getFieldError("primaryContactShow") && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError("primaryContactShow")}
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
                        value={formData.ageDemographic}
                        onValueChange={(value) => handleInputChange("ageDemographic", value)}
                      >
                        <SelectTrigger className={cn(getFieldError("ageDemographic") && "border-red-500")}>
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
                      {getFieldError("ageDemographic") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("ageDemographic")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        Gender Demographic <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.genderDemographic}
                        onValueChange={(value) => handleInputChange("genderDemographic", value)}
                      >
                        <SelectTrigger className={cn(getFieldError("genderDemographic") && "border-red-500")}>
                          <SelectValue placeholder="Choose gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError("genderDemographic") && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("genderDemographic")}
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

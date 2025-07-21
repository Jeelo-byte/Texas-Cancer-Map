import { X, TrendingUp, Users, MapPin, AlertTriangle } from "lucide-react";
import { County } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CountyDetailPanelProps {
  county: County | null;
  isOpen: boolean;
  onClose: () => void;
  maxCancerIncidence: number;
  maxCancerMortality: number;
  maxPovertyRate: number;
  maxHealthcareAccess: number;
  maxPollutionLevel: number;
  carcinogens: import("@/types/carcinogen").Carcinogen[];
  cancers: import("@/types/carcinogen").Cancer[];
  carcinogenCancerLinks: import("@/types/carcinogen").CarcinogenCancerLink[];
  siteCarcinogens: import("@/types/carcinogen").EnvironmentalSiteCarcinogen[];
}

export const CountyDetailPanel = ({
  county,
  isOpen,
  onClose,
  maxCancerIncidence,
  maxCancerMortality,
  maxPovertyRate,
  maxHealthcareAccess,
  maxPollutionLevel,
  carcinogens,
  cancers,
  carcinogenCancerLinks,
  siteCarcinogens,
}: CountyDetailPanelProps) => {
  console.log('CountyDetailPanel county:', county);
  if (!county || !isOpen) return null;

  const [siteSearch, setSiteSearch] = useState("");

  const formatNumber = (num: number) => num.toLocaleString();

  const hasSites = Array.isArray(county.sites) && county.sites.length > 0;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed lg:absolute top-0 right-0 h-full w-full lg:w-96
          border border-slate-200/80 dark:border-slate-700/80 shadow-2xl
          bg-white dark:bg-slate-900
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          overflow-y-auto
        `}
      >
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {county.name}
              </h2>
              <p className="text-muted-foreground flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Population: {formatNumber(county.population)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cancer Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                Cancer Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Incidence Rate</span>
                  <span className="font-medium">
                    {county.cancerIncidence} per 100k
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={maxCancerIncidence > 0 ? Math.min((county.cancerIncidence / maxCancerIncidence) * 100, 100) : 0}
                    className="h-2"
                  />
                  {county.cancerIncidence === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">No data</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Mortality Rate</span>
                  <span className="font-medium">
                    {county.cancerMortality} per 100k
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={maxCancerMortality > 0 ? Math.min((county.cancerMortality / maxCancerMortality) * 100, 100) : 0}
                    className="h-2"
                  />
                  {county.cancerMortality === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">No data</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    Avg Annual Deaths
                  </span>
                  <span className="font-medium">
                    {county.averageAnnualDeaths}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Recent Trend</span>
                  <span className="font-medium">{county.recentTrend}%/yr</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental & Social Factors */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Poverty Rate</span>
                  <span className="font-medium">{county.povertyRate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={maxPovertyRate > 0 ? Math.min((county.povertyRate / maxPovertyRate) * 100, 100) : 0} className="h-2" />
                  {county.povertyRate === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">No data</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    Healthcare Access
                  </span>
                  <span className="font-medium">
                    {county.healthcareAccess}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={maxHealthcareAccess > 0 ? Math.min((county.healthcareAccess / maxHealthcareAccess) * 100, 100) : 0} className="h-2" />
                  {county.healthcareAccess === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">No data</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Pollution Level</span>
                  <span className="font-medium">
                    {county.pollutionLevel}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={maxPollutionLevel > 0 ? Math.min((county.pollutionLevel / maxPollutionLevel) * 100, 100) : 0} className="h-2" />
                  {county.pollutionLevel === 0 && (
                    <span className="text-xs text-muted-foreground ml-2">No data</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancer-Causing Sites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Environmental Sites ({hasSites ? county.sites.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search bar for sites */}
              {hasSites && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={siteSearch}
                    onChange={e => setSiteSearch(e.target.value)}
                    placeholder="Search sites by name or description..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="space-y-3">
                {!hasSites && (
                  <div className="text-muted-foreground text-sm">No environmental sites available for this county.</div>
                )}
                {hasSites && county.sites
                  .filter(site =>
                    site.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
                    site.description?.toLowerCase().includes(siteSearch.toLowerCase())
                  )
                  .map((site) => {
                  // Defensive: skip if site is null/undefined
                  if (!site) return null;
                  // Find carcinogen links for this site
                  const siteCarcLinks = Array.isArray(siteCarcinogens) ? siteCarcinogens.filter(link => link.site_id === site.id) : [];
                  // For each carcinogen at this site, find its details and linked cancers
                  const carcinogenDetailsRaw = siteCarcLinks.map(link => {
                    const carcinogen = Array.isArray(carcinogens) ? carcinogens.find(c => c.id === link.carcinogen_id) : null;
                    if (!carcinogen) return null;
                    // Find all cancer links for this carcinogen
                    const cancerLinks = Array.isArray(carcinogenCancerLinks) ? carcinogenCancerLinks.filter(cl => cl.carcinogen_id === carcinogen.id) : [];
                    const linkedCancersRaw = cancerLinks.map(cl => {
                      const cancer = Array.isArray(cancers) ? cancers.find(ca => ca.id === cl.cancer_id) : null;
                      return cancer ? { ...cancer, linkDescription: cl.description } : null;
                    }).filter(Boolean);
                    // Deduplicate linked cancers by id
                    const linkedCancers = Object.values(
                      linkedCancersRaw.reduce((acc: any, cancer: any) => {
                        if (cancer && !acc[cancer.id]) acc[cancer.id] = cancer;
                        return acc;
                      }, {})
                    );
                    return { ...carcinogen, siteLinkDescription: link.description, linkedCancers };
                  }).filter(Boolean);
                  // Deduplicate carcinogens by id
                  const carcinogenDetails = Object.values(
                    carcinogenDetailsRaw.reduce((acc: any, carc: any) => {
                      if (carc && !acc[carc.id]) acc[carc.id] = carc;
                      return acc;
                    }, {})
                  );
                  return (
                    <div
                      key={site.id}
                      className="border border-border rounded-lg p-3 bg-card text-card-foreground"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {site.name}
                        </h4>
                        <span
                          className={`
                            px-2 py-1 text-xs rounded-full
                            ${
                              site.riskLevel === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : site.riskLevel === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }
                          `}
                        >
                          {site.riskLevel?.toUpperCase?.() || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {site.description || "No description"}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {site.type?.replace?.("_", " ").toUpperCase?.() || "UNKNOWN"}
                      </div>
                      {/* Carcinogens at this site */}
                      {carcinogenDetails.length > 0 ? (
                        <div className="mt-2">
                          <div className="font-semibold text-sm mb-1">Carcinogens at this site:</div>
                          <TooltipProvider>
                          <ul className="ml-4 list-disc">
                            {carcinogenDetails.map(carc => (
                              <li key={carc.id} className="mb-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-medium underline decoration-dashed cursor-help">
                                      {carc.name}
                                    </span>
                                  </TooltipTrigger>
                                  {carc.description && (
                                    <TooltipContent>{carc.description}</TooltipContent>
                                  )}
                                </Tooltip>
                                {carc.type && <span className="ml-2 text-xs text-muted-foreground">[{carc.type}]</span>}
                                {carc.effects && <span className="ml-2 text-xs text-muted-foreground">Effects: {carc.effects}</span>}
                                {carc.siteLinkDescription && <span className="ml-2 text-xs text-muted-foreground">({carc.siteLinkDescription})</span>}
                                {/* Linked cancers */}
                                {carc.linkedCancers && (carc.linkedCancers.length > 0) ? (
                                  <div className="ml-2 mt-1">
                                    <span className="text-xs font-semibold">Linked Cancers:</span>
                                    <ul className="ml-4 list-disc">
                                      {carc.linkedCancers.map((cancer: any) => (
                                        <li key={cancer.id} className="text-xs">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="font-medium underline decoration-dashed cursor-help">
                                                {cancer.name}
                                              </span>
                                            </TooltipTrigger>
                                            {cancer.description && (
                                              <TooltipContent>{cancer.description}</TooltipContent>
                                            )}
                                          </Tooltip>
                                          {cancer.linkDescription && <span className="ml-1 text-muted-foreground">({cancer.linkDescription})</span>}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="ml-2 text-xs text-muted-foreground">No linked cancers for this carcinogen.</div>
                                )}
                              </li>
                            ))}
                          </ul>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No carcinogens linked to this site.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

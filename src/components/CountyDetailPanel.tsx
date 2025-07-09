import { X, TrendingUp, Users, MapPin, AlertTriangle } from "lucide-react";
import { County } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CountyDetailPanelProps {
  county: County | null;
  isOpen: boolean;
  onClose: () => void;
  maxCancerIncidence: number;
  maxCancerMortality: number;
  maxPovertyRate: number;
  maxHealthcareAccess: number;
  maxPollutionLevel: number;
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
}: CountyDetailPanelProps) => {
  console.log('CountyDetailPanel county:', county);
  if (!county || !isOpen) return null;

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          background: "white",
          opacity: 1,
          zIndex: 1000,
        }}
        className={`
          fixed lg:absolute top-0 right-0 h-full w-full lg:w-96
          border border-slate-200/80 dark:border-slate-700/80 shadow-2xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          overflow-y-auto
        `}
      >
        <div className="p-6">
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
                Environmental Sites ({county.sites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {county.sites.map((site) => (
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
                        {site.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {site.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {site.type.replace("_", " ").toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

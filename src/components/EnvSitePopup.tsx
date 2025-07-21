import React from "react";

export function EnvSitePopup({ site }: { site: any }) {
  // Risk badge color
  const riskColor =
    site.risk_level === "high"
      ? "bg-red-100 text-red-700 border-red-200"
      : site.risk_level === "medium"
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className="min-w-[120px] p-0.5 text-slate-800 leading-tight relative">
      <div className="font-semibold text-base mb-0.5">
        {site.site_name}
      </div>
      {site.city && (
        <div className="flex items-center text-xs text-slate-400 mb-0.5">
          {/* Pin outline icon (Lucide style) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            className="w-3 h-3 mr-1 text-slate-300"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 18s6-5.686 6-10A6 6 0 1 0 4 8c0 4.314 6 10 6 10z"
            />
            <circle cx="10" cy="8" r="2" />
          </svg>
          {site.city}
        </div>
      )}
      {site.risk_level && (
        <span
          className={
            `absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase border ${riskColor}`
          }
        >
          {site.risk_level}
        </span>
      )}
    </div>
  );
} 
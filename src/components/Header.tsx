
import { Activity, Map } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Texas Cancer Data Explorer
              </h1>
              <p className="text-sm text-slate-600">
                Environmental Health & Cancer Disparities
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-600">
            <Map className="w-5 h-5" />
            <span className="text-sm font-medium">Interactive County Map</span>
          </div>
        </div>
      </div>
    </header>
  );
};


import { Activity, Map } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Texas Cancer Data Explorer
              </h1>
              <p className="text-sm text-muted-foreground">
                Environmental Health & Cancer Disparities
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Map className="w-5 h-5" />
            <span className="text-sm font-medium">Interactive County Map</span>
          </div>
        </div>
      </div>
    </header>
  );
};

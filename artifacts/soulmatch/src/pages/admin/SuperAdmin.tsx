import { useState } from "react";
import { 
  Server, Database, ShieldAlert, Key, Activity, Globe, 
  Trash2, RefreshCw, DownloadCloud, AlertTriangle, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdmin() {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `Executing system action: ${action}...`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="w-8 h-8 text-red-500" />
            Super Admin Controls
          </h1>
          <p className="text-[#707070] mt-1">
            System-level configurations and critical operations. Restricted to highest clearance.
          </p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 px-4 py-1 text-sm">
          RESTRICTED AREA
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* System Status */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#707070] text-sm">API Server</span>
              <span className="text-green-400 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#707070] text-sm">Database</span>
              <span className="text-green-400 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#707070] text-sm">Compatibility Engine</span>
              <span className="text-yellow-400 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Degraded</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <Button className="w-full bg-card/5 hover:bg-card/10" variant="ghost" onClick={() => handleAction('Run Diagnostics')}>
                <RefreshCw className="w-4 h-4 mr-2" /> Run Diagnostics
              </Button>
            </div>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#F6A8B7]/10 rounded-xl">
              <Globe className="w-6 h-6 text-[#F6A8B7]" />
            </div>
            <h2 className="text-lg font-bold">Global Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#13131A] p-3 rounded-lg border border-white/5">
              <div>
                <div className="font-medium text-sm">Maintenance Mode</div>
                <div className="text-xs text-[#707070]">Disable app access for users</div>
              </div>
              <Button 
                variant={maintenanceMode ? "destructive" : "secondary"} 
                size="sm"
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  handleAction(maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance');
                }}
              >
                {maintenanceMode ? "ON" : "OFF"}
              </Button>
            </div>
            <div className="bg-[#13131A] p-3 rounded-lg border border-white/5 space-y-2">
              <div className="font-medium text-sm">System Announcement</div>
              <Input placeholder="Enter global broadcast message..." className="bg-transparent/20 text-sm" />
              <Button size="sm" className="w-full bg-[#F6A8B7] hover:bg-purple-700 mt-2" onClick={() => handleAction('Broadcast Message')}>Send to All Users</Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-red-500/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-[#F6A8B7]"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300" onClick={() => handleAction('Clear Cache')}>
              <Trash2 className="w-4 h-4 mr-3" /> Clear System Cache
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300" onClick={() => handleAction('Force Backup')}>
              <DownloadCloud className="w-4 h-4 mr-3" /> Force Database Backup
            </Button>
            <div className="pt-2">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAction('Wipe Test Data')}>
                <AlertTriangle className="w-4 h-4 mr-2" /> Wipe Test Data
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Save, ChevronLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface PrefForm {
  minAge: string; maxAge: string; minHeight: string; maxHeight: string;
  preferredReligions: string; preferredLocations: string;
}

export default function PreferencesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: prefs } = useGetPreferences({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const update = useUpdatePreferences({ request: { headers: authHeaders() } });
  const form = useForm<PrefForm>();

  useEffect(() => {
    if (prefs) {
      const p = prefs as any;
      form.reset({
        minAge: p.minAge ?? "", maxAge: p.maxAge ?? "",
        minHeight: p.minHeight ?? "", maxHeight: p.maxHeight ?? "",
        preferredReligions: p.preferredReligions?.join(", ") ?? "",
        preferredLocations: p.preferredLocations?.join(", ") ?? "",
      });
    }
  }, [prefs]);

  function onSave(data: PrefForm) {
    update.mutate(
      {
        data: {
          minAge: data.minAge ? parseInt(data.minAge) : undefined,
          maxAge: data.maxAge ? parseInt(data.maxAge) : undefined,
          minHeight: data.minHeight ? parseInt(data.minHeight) : undefined,
          maxHeight: data.maxHeight ? parseInt(data.maxHeight) : undefined,
          preferredReligions: data.preferredReligions ? data.preferredReligions.split(",").map(s => s.trim()).filter(Boolean) : undefined,
          preferredLocations: data.preferredLocations ? data.preferredLocations.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Preferences saved!" });
          queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 -ml-4 text-muted-foreground hover:bg-card/5">
          <ChevronLeft className="w-4 h-4 mr-1" />Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <SlidersHorizontal className="w-7 h-7 text-primary" />Match Preferences
          </h1>
          <p className="text-muted-foreground">Tell us what you're looking for in a partner.</p>
        </motion.div>

        <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Age Range</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Minimum Age</Label>
                <Input type="number" placeholder="18" className="bg-card/5 border-white/10" {...form.register("minAge")} />
              </div>
              <div className="space-y-1.5">
                <Label>Maximum Age</Label>
                <Input type="number" placeholder="45" className="bg-card/5 border-white/10" {...form.register("maxAge")} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Height Range (cm)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Minimum Height</Label>
                <Input type="number" placeholder="155" className="bg-card/5 border-white/10" {...form.register("minHeight")} />
              </div>
              <div className="space-y-1.5">
                <Label>Maximum Height</Label>
                <Input type="number" placeholder="195" className="bg-card/5 border-white/10" {...form.register("maxHeight")} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Other Preferences</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Preferred Religions</Label>
                <Input placeholder="e.g. Hindu, Muslim, Christian (comma separated)" className="bg-card/5 border-white/10" {...form.register("preferredReligions")} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Locations</Label>
                <Input placeholder="e.g. Mumbai, London, Dubai (comma separated)" className="bg-card/5 border-white/10" {...form.register("preferredLocations")} />
              </div>
            </div>
          </motion.div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground shadow-md border-0 text-white shadow-lg shadow-primary/20" disabled={update.isPending}>
            <Save className="w-4 h-4 mr-2" />{update.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

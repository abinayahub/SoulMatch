import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3, MapPin, Briefcase, GraduationCap, CheckCircle2, Star, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface ProfileForm {
  bio: string; occupation: string; education: string; religion: string;
  motherTongue: string; city: string; country: string; maritalStatus: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading } = useGetMe({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const updateMe = useUpdateMe({ request: { headers: authHeaders() } });
  const form = useForm<ProfileForm>({ defaultValues: { bio: (profile as any)?.bio ?? "", occupation: (profile as any)?.occupation ?? "" } });

  async function onSave(data: ProfileForm) {
    updateMe.mutate(
      { data },
      {
        onSuccess: (updated: any) => {
          updateUser(updated);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setEditing(false);
          toast({ title: "Profile updated!" });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  const p = (profile as any) ?? user;
  const photo = p?.photos?.find((ph: any) => ph.isPrimary) ?? p?.photos?.[0];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={() => setEditing(!editing)} variant={editing ? "outline" : "default"} className={editing ? "border-white/20 bg-white/5" : "gradient-primary border-0 text-white"}>
            {editing ? "Cancel" : <><Edit3 className="w-4 h-4 mr-2" />Edit Profile</>}
          </Button>
        </motion.div>

        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl bg-white/5" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Photo & summary */}
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/30">
                    <AvatarImage src={photo?.url} />
                    <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                      {p ? getInitials(p.firstName, p.lastName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <h2 className="font-bold text-xl">{p?.firstName} {p?.lastName}</h2>
                {p?.displayName && <p className="text-sm text-muted-foreground">@{p.displayName}</p>}
                {(p?.city || p?.country) && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {[p?.city, p?.country].filter(Boolean).join(", ")}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {p?.verificationStatus === "verified" && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                  {p?.isPremium && (
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                      <Star className="w-3 h-3 mr-1" />Premium
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Profile Strength</span>
                    <span className="text-primary font-semibold">{p?.profileCompleteness ?? 40}%</span>
                  </div>
                  <Progress value={p?.profileCompleteness ?? 40} className="h-1.5 bg-white/10" />
                </div>
              </motion.div>

              {/* Photo gallery */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Camera className="w-4 h-4 text-primary" />Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(p?.photos ?? []).map((ph: any, i: number) => (
                    <div key={ph.id ?? i} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                      <img src={ph.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                  <button className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right: Profile details */}
            <div className="md:col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">About Me</h3>
                {editing ? (
                  <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Bio</Label>
                      <Textarea placeholder="Tell people about yourself..." className="bg-white/5 border-white/10 min-h-[100px]" {...form.register("bio")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Occupation</Label>
                        <Input placeholder="What do you do?" className="bg-white/5 border-white/10" {...form.register("occupation")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Education</Label>
                        <Input placeholder="Highest qualification" className="bg-white/5 border-white/10" {...form.register("education")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>City</Label>
                        <Input placeholder="City" className="bg-white/5 border-white/10" {...form.register("city")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input placeholder="Country" className="bg-white/5 border-white/10" {...form.register("country")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Religion</Label>
                        <Input placeholder="Religion" className="bg-white/5 border-white/10" {...form.register("religion")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Mother Tongue</Label>
                        <Input placeholder="Language" className="bg-white/5 border-white/10" {...form.register("motherTongue")} />
                      </div>
                    </div>
                    <Button type="submit" className="gradient-primary border-0 text-white" disabled={updateMe.isPending}>
                      {updateMe.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {p?.bio && <p className="text-sm text-muted-foreground leading-relaxed">{p.bio}</p>}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { icon: Briefcase, label: "Occupation", value: p?.occupation },
                        { icon: GraduationCap, label: "Education", value: p?.education },
                        { icon: MapPin, label: "Location", value: [p?.city, p?.country].filter(Boolean).join(", ") },
                        { icon: MapPin, label: "Religion", value: p?.religion },
                      ].map((item) => item.value && (
                        <div key={item.label} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="font-medium">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Journey stats */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Journey Progress</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={(p?.journeyProgress ?? 0) / 30 * 100} className="h-2.5 bg-white/10" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{p?.journeyProgress ?? 0}/30 days</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

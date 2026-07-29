import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Briefcase, Building2, Wallet } from "lucide-react";

export function ProfessionalDetailsForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      education: p?.education || "",
      fieldOfStudy: p?.fieldOfStudy || "",
      occupation: p?.occupation || "",
      company: p?.company || "",
      industry: p?.industry || "",
      annualIncomeRange: p?.annualIncomeRange || "",
    }
  });

  useEffect(() => {
    form.register("education", { required: "Education is required" });
  }, [form.register]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[clamp(17px,5.09vw,23px)] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Professional Life</h2>
        <p className="text-[#8A7A7A] text-xs">Share your professional background with matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        
        {/* Education & Field of Study */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Highest Education <span className="text-[#FF7A7A]">*</span></Label>
            <Select onValueChange={(v) => form.setValue("education", v, { shouldValidate: true })} defaultValue={form.getValues("education")}>
              <SelectTrigger className={`h-[clamp(43px,12.72vw,57px)] text-[clamp(13px,3.82vw,17px)] text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.education ? "border-red-500" : "border-white/50"}`}>
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate (PhD)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.education && <p className="text-xs text-red-500 ml-1">{form.formState.errors.education.message as string}</p>}
          </div>
          
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Field of Study <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <div className="relative">
              <BookOpen className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input className="h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50" placeholder="e.g. Computer Science" {...form.register("fieldOfStudy")} />
            </div>
          </div>
        </div>

        {/* Occupation & Company */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Occupation <span className="text-[#FF7A7A]">*</span></Label>
            <div className="relative">
              <Briefcase className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.occupation ? "border-red-500" : "border-white/50"}`} placeholder="e.g. Product Designer" {...form.register("occupation", { required: "Occupation is required" })} />
            </div>
            {form.formState.errors.occupation && <p className="text-xs text-red-500 ml-1">{form.formState.errors.occupation.message as string}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Company <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <div className="relative">
              <Building2 className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input className="h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50" placeholder="e.g. Acme Studio" {...form.register("company")} />
            </div>
          </div>
        </div>

        {/* Industry & Income */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Industry <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <Select onValueChange={(v) => form.setValue("industry", v)} defaultValue={form.getValues("industry")}>
              <SelectTrigger className="h-[clamp(43px,12.72vw,57px)] text-[clamp(13px,3.82vw,17px)] text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="arts">Arts & Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Annual Income <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <Select onValueChange={(v) => form.setValue("annualIncomeRange", v)} defaultValue={form.getValues("annualIncomeRange")}>
              <SelectTrigger className="h-[clamp(43px,12.72vw,57px)] text-[clamp(13px,3.82vw,17px)] text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50k">Under $50k</SelectItem>
                <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                <SelectItem value="100k-150k">$100k - $150k</SelectItem>
                <SelectItem value="150k+">$150k+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-3">
          {hasPrevious && (
            <button type="button" onClick={onCancel} className="w-1/3 h-14 text-[clamp(13px,3.82vw,17px)] font-bold rounded-full border border-white/40 text-[#8A7A7A] bg-white/50 hover:bg-white/80 transition-transform active:scale-[0.98]">
              Previous
            </button>
          )}
          <button type="submit" disabled={isPending} className="flex-1 h-14 text-[clamp(13px,3.82vw,17px)] font-bold text-white rounded-full transition-transform active:scale-[0.98] disabled:opacity-50 gradient-coral-pill">
            {isPending ? "Saving..." : "Next Step"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Briefcase, Building2, Wallet, ChevronRight, Lock } from "lucide-react";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Professional Life</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">Share your professional background with matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
        
        {/* Education & Field of Study */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Highest Education <span className="text-[#FF8FA8]">*</span>
            </Label>
            <Select onValueChange={(v) => form.setValue("education", v, { shouldValidate: true })} defaultValue={form.getValues("education")}>
              <SelectTrigger className={`h-14 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.education ? "border-red-500" : "border-[#F4DCE3]"}`}>
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px] border-[#F8D6DD] p-1">
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate (PhD)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.education && <p className="text-xs text-red-500 ml-1">{form.formState.errors.education.message as string}</p>}
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Field of Study <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <BookOpen className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input className="h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]" placeholder="e.g. Computer Science" {...form.register("fieldOfStudy")} />
            </div>
          </div>
        </div>

        {/* Occupation & Company */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Occupation <span className="text-[#FF8FA8]">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.occupation ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="e.g. Product Designer" {...form.register("occupation", { required: "Occupation is required" })} />
            </div>
            {form.formState.errors.occupation && <p className="text-xs text-red-500 ml-1">{form.formState.errors.occupation.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Company <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input className="h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]" placeholder="e.g. Acme Studio" {...form.register("company")} />
            </div>
          </div>
        </div>

        {/* Industry & Income */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Industry <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <Select onValueChange={(v) => form.setValue("industry", v)} defaultValue={form.getValues("industry")}>
              <SelectTrigger className="h-14 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px] border-[#F8D6DD] p-1">
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="arts">Arts & Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Annual Income <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <Select onValueChange={(v) => form.setValue("annualIncomeRange", v)} defaultValue={form.getValues("annualIncomeRange")}>
              <SelectTrigger className="h-14 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px] border-[#F8D6DD] p-1">
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
            <button type="button" onClick={onCancel} className="w-1/3 h-14 text-sm sm:text-base font-bold rounded-full border border-[#F8D6DD] text-[#6D6D6D] bg-[#FFE6EC]/50 hover:bg-[#FFE6EC] transition-transform active:scale-[0.98]">
              Previous
            </button>
          )}
          <button type="submit" disabled={isPending} className="flex-1 h-14 text-base font-bold text-white rounded-full transition-transform active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] hover:opacity-95 shadow-[0_8px_24px_rgba(255,126,156,0.35)] flex items-center justify-center gap-2">
            <span>{isPending ? "Saving..." : "Continue"}</span>
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Security Hint */}
        <div className="pt-3 border-t border-[#F8D6DD]/60 flex items-center justify-center gap-1.5 text-xs text-[#6D6D6D] font-medium">
          <Lock className="w-3.5 h-3.5 text-[#FF8FA8]" />
          <span>Your information is safe and secure.</span>
        </div>
      </form>
    </motion.div>
  );
}

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, Check, ChevronRight, Lock } from "lucide-react";

const COMMON_INTERESTS = [
  "Reading", "Traveling", "Cooking", "Photography", 
  "Music", "Movies", "Fitness", "Gaming", 
  "Art", "Nature", "Technology", "Fashion"
];

export function PreferencesForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      interests: p?.interests?.join(", ") || "",
    }
  });

  const currentInterestsStr = form.watch("interests");

  const toggleInterest = (interest: string) => {
    let interestsList = currentInterestsStr.split(",").map(i => i.trim()).filter(Boolean);
    if (interestsList.includes(interest)) {
      interestsList = interestsList.filter(i => i !== interest);
    } else {
      interestsList.push(interest);
    }
    form.setValue("interests", interestsList.join(", "), { shouldValidate: true });
  };

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      interests: data.interests.split(",").map((i: string) => i.trim()).filter(Boolean)
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Your Interests</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">Tell us about your hobbies and passions.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            What do you like to do? <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="relative">
            <Sparkles className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
            <Input 
              className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.interests ? "border-red-500" : "border-[#F4DCE3]"}`} 
              placeholder="e.g. Reading, Traveling, Cooking" 
              {...form.register("interests", { required: "At least one interest is required" })} 
            />
          </div>
          <p className="text-xs text-[#6D6D6D] ml-1">Type your interests separated by commas, or select from below.</p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {COMMON_INTERESTS.map(interest => {
              const isActive = currentInterestsStr.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`h-10 px-4 rounded-full text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 active:scale-[0.98] ${isActive ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent shadow-[0_2px_10px_rgba(255,126,156,0.25)]' : 'bg-white text-[#6D6D6D] border-[#F4DCE3] hover:border-[#FF8FA8]'}`}
                >
                  {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  {interest}
                </button>
              );
            })}
          </div>

          {form.formState.errors.interests && <p className="text-xs text-red-500 ml-1">{form.formState.errors.interests.message as string}</p>}
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

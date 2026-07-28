import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[20px] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Your Interests</h2>
        <p className="text-[#8A7A7A] text-xs">Tell us about your hobbies and passions.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2">
          <Label className="text-[12px] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">What do you like to do? <span className="text-[#FF7A7A]">*</span></Label>
          <div className="relative">
            <Sparkles className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
            <Input 
              className={`h-[50px] pl-10 text-[15px] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.interests ? "border-red-500" : "border-white/50"}`} 
              placeholder="e.g. Reading, Traveling, Cooking" 
              {...form.register("interests", { required: "At least one interest is required" })} 
            />
          </div>
          <p className="text-[10px] text-[#8A7A7A] ml-1">Type your interests separated by commas, or select from below.</p>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_INTERESTS.map(interest => {
              const isActive = currentInterestsStr.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${isActive ? 'bg-[#FF9A9A] text-white border-[#FF9A9A]' : 'bg-white/40 text-[#8A7A7A] border-white/50 hover:bg-white/80'}`}
                >
                  {isActive && <Check className="w-3 h-3 inline-block mr-1" />}
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
            <button type="button" onClick={onCancel} className="w-1/3 h-14 text-[15px] font-bold rounded-full border border-white/40 text-[#8A7A7A] bg-white/50 hover:bg-white/80 transition-transform active:scale-[0.98]">
              Previous
            </button>
          )}
          <button type="submit" disabled={isPending} className="flex-1 h-14 text-[15px] font-bold text-white rounded-full transition-transform active:scale-[0.98] disabled:opacity-50 gradient-coral-pill">
            {isPending ? "Saving..." : "Next Step"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

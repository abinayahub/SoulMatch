import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";

export function LifestyleForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      dietaryPreference: p?.dietaryPreference || "",
      smoking: p?.smoking || "",
      drinking: p?.drinking || "",
    }
  });

  useEffect(() => {
    form.register("dietaryPreference", { required: "Diet is required" });
  }, [form.register]);

  const diets = [
    "🥗 Vegetarian",
    "🍗 Non-Vegetarian",
    "🥚 Eggetarian",
    "🌱 Vegan",
    "🍽️ Mostly Vegetarian",
    "🥩 Mostly Non-Vegetarian",
    "🍕 No Specific Diet",
    "✍️ Prefer Not to Say"
  ];

  const habits = [
    { value: "never", label: "Never" },
    { value: "socially", label: "Socially" },
    { value: "regularly", label: "Regularly" },
    { value: "trying_to_quit", label: "Trying to quit" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Your Lifestyle Choices</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">What do your daily habits look like?</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        
        {/* Diet */}
        <div className="space-y-2.5">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            What's your diet like? <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {diets.map((diet) => {
              const isSelected = form.watch("dietaryPreference") === diet || 
                                 (diet === "🍕 No Specific Diet" && form.watch("dietaryPreference") === "🍕 No Specific Diet (Eat Everything)");
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => form.setValue("dietaryPreference", diet === "🍕 No Specific Diet" ? "🍕 No Specific Diet (Eat Everything)" : diet, { shouldValidate: true })}
                  className={`h-11 px-5 rounded-full text-sm transition-all border flex items-center gap-1.5 active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent font-bold shadow-[0_4px_14px_rgba(255,126,156,0.3)]' : 'bg-white text-[#1E1E1E] border-[#F4DCE3] font-semibold hover:border-[#FF8FA8]'}`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  {diet}
                </button>
              );
            })}
          </div>
          {form.formState.errors.dietaryPreference && <p className="text-xs text-red-500 ml-1">{form.formState.errors.dietaryPreference.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Smoking */}
          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Do you smoke? <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {habits.map((h) => {
                const isSelected = form.watch("smoking") === h.value;
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => form.setValue("smoking", h.value, { shouldValidate: true })}
                    className={`h-10 px-4 rounded-full text-sm transition-all border flex items-center gap-1.5 active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent font-bold shadow-[0_4px_14px_rgba(255,126,156,0.3)]' : 'bg-white text-[#1E1E1E] border-[#F4DCE3] font-semibold hover:border-[#FF8FA8]'}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drinking */}
          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Do you drink? <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {habits.filter(h => h.value !== "trying_to_quit").map((h) => {
                const isSelected = form.watch("drinking") === h.value;
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => form.setValue("drinking", h.value, { shouldValidate: true })}
                    className={`h-10 px-4 rounded-full text-sm transition-all border flex items-center gap-1.5 active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent font-bold shadow-[0_4px_14px_rgba(255,126,156,0.3)]' : 'bg-white text-[#1E1E1E] border-[#F4DCE3] font-semibold hover:border-[#FF8FA8]'}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    {h.label}
                  </button>
                );
              })}
            </div>
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

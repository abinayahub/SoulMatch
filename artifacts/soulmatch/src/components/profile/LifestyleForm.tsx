import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[clamp(17px,5.09vw,23px)] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Your lifestyle choices</h2>
        <p className="text-[#8A7A7A] text-xs">What do your daily habits look like?</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        
        {/* Diet */}
        <div className="space-y-2">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">What's your diet like? <span className="text-[#FF7A7A]">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {diets.map((diet) => {
              const isSelected = form.watch("dietaryPreference") === diet || 
                                 (diet === "🍕 No Specific Diet" && form.watch("dietaryPreference") === "🍕 No Specific Diet (Eat Everything)");
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => form.setValue("dietaryPreference", diet === "🍕 No Specific Diet" ? "🍕 No Specific Diet (Eat Everything)" : diet, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all border ${isSelected ? 'bg-[#FF9A9A] text-white border-[#FF9A9A] shadow-md' : 'bg-white/50 text-[#5A4A4A] border-white/50 hover:bg-white/80'}`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
          {form.formState.errors.dietaryPreference && <p className="text-xs text-red-500 ml-1">{form.formState.errors.dietaryPreference.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Smoking */}
          <div className="space-y-2">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Do you smoke? <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <div className="flex flex-wrap gap-2">
              {habits.map((h) => {
                const isSelected = form.watch("smoking") === h.value;
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => form.setValue("smoking", h.value, { shouldValidate: true })}
                    className={`h-10 px-4 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all border ${isSelected ? 'bg-[#FF9A9A] text-white border-[#FF9A9A] shadow-md' : 'bg-white/50 text-[#5A4A4A] border-white/50 hover:bg-white/80'}`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drinking */}
          <div className="space-y-2">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Do you drink? <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
            <div className="flex flex-wrap gap-2">
              {habits.filter(h => h.value !== "trying_to_quit").map((h) => {
                const isSelected = form.watch("drinking") === h.value;
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => form.setValue("drinking", h.value, { shouldValidate: true })}
                    className={`h-10 px-4 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all border ${isSelected ? 'bg-[#FF9A9A] text-white border-[#FF9A9A] shadow-md' : 'bg-white/50 text-[#5A4A4A] border-white/50 hover:bg-white/80'}`}
                  >
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

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { User, Heart, Calendar, Ruler, Scale } from "lucide-react";

export function PersonalDetailsForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      fullName: [p?.firstName, p?.lastName].filter(Boolean).join(" "),
      dateOfBirth: p?.dateOfBirth || "",
      gender: p?.gender || "",
      maritalStatus: p?.maritalStatus || "",
      height: p?.height || "",
      weight: p?.weight || "",
      bio: p?.bio || "",
    }
  });

  useEffect(() => {
    form.register("gender", { required: "Gender is required" });
    form.register("maritalStatus", { required: "Marital Status is required" });
  }, [form.register]);

  const onSubmit = (data: any) => {
    const [firstName, ...rest] = data.fullName.split(" ");
    const lastName = rest.join(" ");
    onSave({
      firstName,
      lastName: lastName || undefined,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      height: parseInt(data.height) || undefined,
      weight: parseInt(data.weight) || undefined,
      bio: data.bio,
    });
  };

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  const statuses = [
    { value: "single", label: "Single" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "separated", label: "Separated" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[clamp(17px,5.09vw,23px)] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Personal Details</h2>
        <p className="text-[#8A7A7A] text-xs">Tell us the basics to help find compatible matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Full Name <span className="text-[#FF7A7A]">*</span></Label>
          <div className="relative">
            <User className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
            <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.fullName ? "border-red-500" : "border-white/50"}`} placeholder="e.g. Aria Sharma" {...form.register("fullName", { required: "Name is required" })} />
          </div>
          {form.formState.errors.fullName && <p className="text-xs text-red-500 ml-1">{form.formState.errors.fullName.message as string}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Date of Birth <span className="text-[#FF7A7A]">*</span></Label>
          <div className="relative">
            <Calendar className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
            <Input type="date" className={`h-[clamp(43px,12.72vw,57px)] pl-10 pr-4 text-[clamp(13px,3.82vw,17px)] text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.dateOfBirth ? "border-red-500" : "border-white/50"}`} {...form.register("dateOfBirth", { required: "Birthday is required" })} />
          </div>
          {form.formState.errors.dateOfBirth && <p className="text-xs text-red-500 ml-1">{form.formState.errors.dateOfBirth.message as string}</p>}
          <p className="text-[clamp(9px,2.80vw,13px)] text-[#8A7A7A] ml-1">Used to calculate your age. Cannot be changed later.</p>
        </div>

        {/* Gender Choice Chips */}
        <div className="space-y-2">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Gender <span className="text-[#FF7A7A]">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => {
              const isSelected = form.watch("gender") === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => form.setValue("gender", g.value, { shouldValidate: true })}
                  className={`h-10 px-4 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all border ${isSelected ? 'bg-[#FF9A9A] text-white border-[#FF9A9A] shadow-md' : 'bg-white/50 text-[#5A4A4A] border-white/50 hover:bg-white/80'}`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.gender && <p className="text-xs text-red-500 ml-1">{form.formState.errors.gender.message as string}</p>}
        </div>

        {/* Relationship Status Choice Chips */}
        <div className="space-y-2">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Relationship Status <span className="text-[#FF7A7A]">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => {
              const isSelected = form.watch("maritalStatus") === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => form.setValue("maritalStatus", s.value, { shouldValidate: true })}
                  className={`h-10 px-4 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all border ${isSelected ? 'bg-[#FF9A9A] text-white border-[#FF9A9A] shadow-md' : 'bg-white/50 text-[#5A4A4A] border-white/50 hover:bg-white/80'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.maritalStatus && <p className="text-xs text-red-500 ml-1">{form.formState.errors.maritalStatus.message as string}</p>}
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Height (cm) <span className="text-[#FF7A7A]">*</span></Label>
            <div className="relative">
              <Ruler className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input type="number" className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.height ? "border-red-500" : "border-white/50"}`} placeholder="170" {...form.register("height", { required: "Height is required" })} />
            </div>
            {form.formState.errors.height && <p className="text-xs text-red-500 ml-1">{form.formState.errors.height.message as string}</p>}
            <p className="text-[clamp(9px,2.80vw,13px)] text-[#8A7A7A] ml-1">Improves match accuracy.</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Weight (kg)</Label>
            <div className="relative">
              <Scale className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input type="number" className="h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50" placeholder="65" {...form.register("weight")} />
            </div>
            <p className="text-[clamp(9px,2.80vw,13px)] text-[#8A7A7A] ml-1">Optional field.</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Bio <span className="text-[#FF7A7A]">*</span></Label>
          <Textarea 
            className={`min-h-[clamp(68px,20.36vw,92px)] p-4 rounded-[16px] text-[clamp(12px,3.56vw,16px)] leading-relaxed resize-none text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/70 shadow-sm border ${form.formState.errors.bio ? "border-red-500" : "border-white/60"}`} 
            placeholder="I love quiet mornings, long walks, and discovering new coffee spots..." 
            {...form.register("bio", { required: "Please write a short bio" })} 
          />
          {form.formState.errors.bio && <p className="text-xs text-red-500 ml-1">{form.formState.errors.bio.message as string}</p>}
          <p className="text-[clamp(9px,2.54vw,12px)] text-[#8A7A7A] ml-1">Write 2–3 sentences about yourself.</p>
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

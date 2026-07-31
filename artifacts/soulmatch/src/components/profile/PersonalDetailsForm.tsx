import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { User, Heart, Calendar, Ruler, Scale, Check, ChevronRight, Lock } from "lucide-react";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Personal Details</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">Tell us the basics to help find compatible matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Full Name <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="relative">
            <User className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
            <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.fullName ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="e.g. Aria Sharma" {...form.register("fullName", { required: "Name is required" })} />
          </div>
          {form.formState.errors.fullName && <p className="text-xs text-red-500 ml-1">{form.formState.errors.fullName.message as string}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Date of Birth <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
            <Input type="date" className={`h-14 pl-11 pr-4 text-sm sm:text-base font-medium text-[#1E1E1E] focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.dateOfBirth ? "border-red-500" : "border-[#F4DCE3]"}`} {...form.register("dateOfBirth", { required: "Birthday is required" })} />
          </div>
          {form.formState.errors.dateOfBirth && <p className="text-xs text-red-500 ml-1">{form.formState.errors.dateOfBirth.message as string}</p>}
          <p className="text-xs text-[#6D6D6D] ml-1">Used to calculate your age. Cannot be changed later.</p>
        </div>

        {/* Gender Choice Chips */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Gender <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {genders.map((g) => {
              const isSelected = form.watch("gender") === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => form.setValue("gender", g.value, { shouldValidate: true })}
                  className={`h-11 px-5 rounded-full text-sm transition-all border flex items-center justify-center gap-1.5 active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent font-bold shadow-[0_4px_14px_rgba(255,126,156,0.3)]' : 'bg-white text-[#1E1E1E] border-[#F4DCE3] font-semibold hover:border-[#FF8FA8]'}`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  {g.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.gender && <p className="text-xs text-red-500 ml-1">{form.formState.errors.gender.message as string}</p>}
        </div>

        {/* Relationship Status Choice Chips */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Relationship Status <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {statuses.map((s) => {
              const isSelected = form.watch("maritalStatus") === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => form.setValue("maritalStatus", s.value, { shouldValidate: true })}
                  className={`h-11 px-5 rounded-full text-sm transition-all border flex items-center justify-center gap-1.5 active:scale-[0.98] ${isSelected ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent font-bold shadow-[0_4px_14px_rgba(255,126,156,0.3)]' : 'bg-white text-[#1E1E1E] border-[#F4DCE3] font-semibold hover:border-[#FF8FA8]'}`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  {s.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.maritalStatus && <p className="text-xs text-red-500 ml-1">{form.formState.errors.maritalStatus.message as string}</p>}
        </div>

        {/* Height & Weight Side-by-Side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Height (cm) <span className="text-[#FF8FA8]">*</span>
            </Label>
            <div className="relative">
              <Ruler className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input type="number" className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.height ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="170" {...form.register("height", { required: "Height is required" })} />
            </div>
            {form.formState.errors.height && <p className="text-xs text-red-500 ml-1">{form.formState.errors.height.message as string}</p>}
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">Weight (kg)</Label>
            <div className="relative">
              <Scale className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input type="number" className="h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]" placeholder="65" {...form.register("weight")} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Bio <span className="text-[#FF8FA8]">*</span>
          </Label>
          <Textarea 
            className={`min-h-[92px] p-4 rounded-[18px] text-sm sm:text-base font-medium leading-relaxed resize-none text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white border ${form.formState.errors.bio ? "border-red-500" : "border-[#F4DCE3]"}`} 
            placeholder="I love quiet mornings, long walks, and discovering new coffee spots..." 
            {...form.register("bio", { required: "Please write a short bio" })} 
          />
          {form.formState.errors.bio && <p className="text-xs text-red-500 ml-1">{form.formState.errors.bio.message as string}</p>}
          <p className="text-xs text-[#6D6D6D] ml-1">Write 2–3 sentences about yourself.</p>
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

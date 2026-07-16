import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Let's start with the basics</h2>
        <p className="text-muted-foreground">This helps us introduce you to compatible matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">What's your full name? <span className="text-red-500">*</span></Label>
            <Input className={`bg-background h-14 text-lg ${form.formState.errors.fullName ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. Aria Sharma" {...form.register("fullName", { required: "We need your name to continue" })} />
            {form.formState.errors.fullName && <p className="text-xs text-red-500">{form.formState.errors.fullName.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">When is your birthday? <span className="text-red-500">*</span></Label>
            <Input type="date" className={`bg-background h-14 text-lg ${form.formState.errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} {...form.register("dateOfBirth", { required: "Your birthday is required" })} />
            {form.formState.errors.dateOfBirth && <p className="text-xs text-red-500">{form.formState.errors.dateOfBirth.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">How do you identify? <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => form.setValue("gender", v, { shouldValidate: true })} defaultValue={form.getValues("gender")}>
              <SelectTrigger className={`bg-background h-14 text-lg ${form.formState.errors.gender ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`}><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.gender && <p className="text-xs text-red-500">{form.formState.errors.gender.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">What is your relationship status? <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => form.setValue("maritalStatus", v, { shouldValidate: true })} defaultValue={form.getValues("maritalStatus")}>
              <SelectTrigger className={`bg-background h-14 text-lg ${form.formState.errors.maritalStatus ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`}><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.maritalStatus && <p className="text-xs text-red-500">{form.formState.errors.maritalStatus.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">How tall are you? <span className="text-red-500">*</span></Label>
            <Input type="number" className={`bg-background h-14 text-lg ${form.formState.errors.height ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. 170" {...form.register("height", { required: "Height is required" })} />
            {form.formState.errors.height && <p className="text-xs text-red-500">{form.formState.errors.height.message as string}</p>}
            <p className="text-[10px] text-muted-foreground">In centimeters</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">What's your weight? (Optional)</Label>
            <Input type="number" className="bg-background border-border h-14 text-lg" placeholder="e.g. 62" {...form.register("weight")} />
            <p className="text-[10px] text-muted-foreground">In kilograms</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground/90">Tell us a little about yourself <span className="text-red-500">*</span></Label>
          <Textarea 
            className={`bg-background min-h-[120px] text-lg resize-none ${form.formState.errors.bio ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} 
            placeholder="I'm a designer who loves quiet mornings, long walks, and finding good coffee in new cities..." 
            {...form.register("bio", { required: "Please write a short bio" })} 
          />
          {form.formState.errors.bio && <p className="text-xs text-red-500">{form.formState.errors.bio.message as string}</p>}
          <p className="text-[10px] text-muted-foreground">A short, honest intro — 2 to 3 sentences.</p>
        </div>

        <div className="pt-6 flex gap-3">
          {hasPrevious && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/3 h-14 text-lg font-bold rounded-xl border-border hover:bg-muted">
              Previous
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md text-white border-0 rounded-xl">
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

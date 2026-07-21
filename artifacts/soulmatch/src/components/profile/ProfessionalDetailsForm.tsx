import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">What do you do?</h2>
        <p className="text-muted-foreground">Share your professional background with matches.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Highest Education <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => form.setValue("education", v, { shouldValidate: true })} defaultValue={form.getValues("education")}>
              <SelectTrigger className={`bg-background h-14 text-lg ${form.formState.errors.education ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`}><SelectValue placeholder="Select education" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate (PhD)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.education && <p className="text-xs text-red-500">{form.formState.errors.education.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Field of Study (Optional)</Label>
            <Input className="bg-background border-border h-14 text-lg" placeholder="e.g. Computer Science" {...form.register("fieldOfStudy")} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Occupation <span className="text-red-500">*</span></Label>
            <Input className={`bg-background h-14 text-lg ${form.formState.errors.occupation ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. Product Designer" {...form.register("occupation", { required: "Occupation is required" })} />
            {form.formState.errors.occupation && <p className="text-xs text-red-500">{form.formState.errors.occupation.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Company (Optional)</Label>
            <Input className="bg-background border-border h-14 text-lg" placeholder="e.g. Acme Studio" {...form.register("company")} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Industry (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("industry", v)} defaultValue={form.getValues("industry")}>
              <SelectTrigger className="bg-background border-border h-14 text-lg"><SelectValue placeholder="Select industry" /></SelectTrigger>
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
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Annual Income (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("annualIncomeRange", v)} defaultValue={form.getValues("annualIncomeRange")}>
              <SelectTrigger className="bg-background border-border h-14 text-lg"><SelectValue placeholder="Select range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50k">Under $50k</SelectItem>
                <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                <SelectItem value="100k-150k">$100k - $150k</SelectItem>
                <SelectItem value="150k+">$150k+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-6 flex gap-3">
          {hasPrevious && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/3 h-14 text-lg font-bold rounded-xl border-border hover:bg-muted">
              Previous
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="flex-1 h-14 text-lg font-bold bg-primary text-white shadow-md border-0 rounded-xl">
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

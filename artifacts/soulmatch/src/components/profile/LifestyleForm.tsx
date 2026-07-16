import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Your lifestyle choices</h2>
        <p className="text-muted-foreground">What do your daily habits look like?</p>
      </div>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">What's your diet like? <span className="text-red-500">*</span></Label>
            <Select onValueChange={(v) => form.setValue("dietaryPreference", v, { shouldValidate: true })} defaultValue={form.getValues("dietaryPreference")}>
              <SelectTrigger className={`bg-background h-14 text-lg ${form.formState.errors.dietaryPreference ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`}><SelectValue placeholder="Select preference" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="🥗 Vegetarian">🥗 Vegetarian</SelectItem>
                <SelectItem value="🍗 Non-Vegetarian">🍗 Non-Vegetarian</SelectItem>
                <SelectItem value="🥚 Eggetarian">🥚 Eggetarian</SelectItem>
                <SelectItem value="🌱 Vegan">🌱 Vegan</SelectItem>
                <SelectItem value="🍽️ Mostly Vegetarian">🍽️ Mostly Vegetarian</SelectItem>
                <SelectItem value="🥩 Mostly Non-Vegetarian">🥩 Mostly Non-Vegetarian</SelectItem>
                <SelectItem value="🍕 No Specific Diet (Eat Everything)">🍕 No Specific Diet (Eat Everything)</SelectItem>
                <SelectItem value="✍️ Prefer Not to Say">✍️ Prefer Not to Say</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.dietaryPreference && <p className="text-xs text-red-500">{form.formState.errors.dietaryPreference.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Do you smoke? (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("smoking", v)} defaultValue={form.getValues("smoking")}>
              <SelectTrigger className="bg-background border-border h-14 text-lg"><SelectValue placeholder="Select smoking habit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="socially">Socially</SelectItem>
                <SelectItem value="regularly">Regularly</SelectItem>
                <SelectItem value="trying_to_quit">Trying to quit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Do you drink? (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("drinking", v)} defaultValue={form.getValues("drinking")}>
              <SelectTrigger className="bg-background border-border h-14 text-lg"><SelectValue placeholder="Select drinking habit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="socially">Socially</SelectItem>
                <SelectItem value="regularly">Regularly</SelectItem>
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
          <Button type="submit" disabled={isPending} className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md border-0 rounded-xl">
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

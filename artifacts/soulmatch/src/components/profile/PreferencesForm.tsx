import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export function PreferencesForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      interests: p?.interests?.join(", ") || "",
    }
  });

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      interests: data.interests.split(",").map((i: string) => i.trim()).filter(Boolean)
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Who are you looking for?</h2>
        <p className="text-muted-foreground">Tell us about your interests and hobbies.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground/90">What do you like to do? <span className="text-red-500">*</span></Label>
          <Input className={`bg-background h-14 text-lg ${form.formState.errors.interests ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. Reading, Traveling, Cooking" {...form.register("interests", { required: "At least one interest is required" })} />
          <p className="text-xs text-muted-foreground mt-1">Separate each interest with a comma.</p>
          {form.formState.errors.interests && <p className="text-xs text-red-500">{form.formState.errors.interests.message as string}</p>}
        </div>

        <div className="pt-6 flex gap-3">
          {hasPrevious && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/3 h-14 text-lg font-bold rounded-xl border-border hover:bg-muted">
              Previous
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md rounded-xl">
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

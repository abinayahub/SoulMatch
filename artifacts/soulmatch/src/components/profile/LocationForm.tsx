import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";

import { Country, State } from 'country-state-city';

const ALL_COUNTRIES = Country.getAllCountries();

export function LocationForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const form = useForm({
    defaultValues: {
      country: p?.country || "",
      stateRegion: p?.stateRegion || "",
      city: p?.city || "",
      citizenship: p?.citizenship || "",
      languages: p?.languages?.join(", ") || "",
      religion: p?.religion || "",
    }
  });
  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const selectedCountryName = form.watch("country");
  const selectedCountryObj = ALL_COUNTRIES.find(c => c.name === selectedCountryName);
  const availableStates = selectedCountryObj ? State.getStatesOfCountry(selectedCountryObj.isoCode) : [];

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      languages: data.languages ? data.languages.split(",").map((l: string) => l.trim()).filter(Boolean) : []
    });
  };

  useEffect(() => {
    form.register("country", { required: "Country is required" });
    form.register("stateRegion", { required: "State / Region is required" });
  }, [form.register]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Where are you based?</h2>
        <p className="text-muted-foreground">Find matches near you or where you're from.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Country <span className="text-red-500">*</span></Label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className={`w-full justify-between bg-background h-14 text-lg font-normal ${form.formState.errors.country ? "border-red-500 focus-visible:ring-red-500" : "border-border"} ${!form.watch("country") && "text-muted-foreground"}`}
                >
                  {form.watch("country") ? form.watch("country") : "Select country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList className="max-h-[200px] sm:max-h-[300px]">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {ALL_COUNTRIES.map((country) => (
                        <CommandItem
                          key={country.isoCode}
                          value={country.name}
                          onSelect={() => {
                            form.setValue("country", country.name, { shouldValidate: true });
                            form.setValue("stateRegion", ""); // reset state when country changes
                            setOpenCountry(false);
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${form.watch("country") === country.name ? "opacity-100" : "opacity-0"}`} />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.country && <p className="text-xs text-red-500">{form.formState.errors.country.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">State / Region <span className="text-red-500">*</span></Label>
            {availableStates.length > 0 ? (
              <Popover open={openState} onOpenChange={setOpenState}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openState}
                    className={`w-full justify-between bg-background h-14 text-lg font-normal ${form.formState.errors.stateRegion ? "border-red-500 focus-visible:ring-red-500" : "border-border"} ${!form.watch("stateRegion") && "text-muted-foreground"}`}
                  >
                    {form.watch("stateRegion") ? form.watch("stateRegion") : "Select state"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command>
                    <CommandInput placeholder="Search state..." />
                    <CommandList className="max-h-[200px] sm:max-h-[300px]">
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {availableStates.map((state) => (
                          <CommandItem
                            key={state.isoCode}
                            value={state.name}
                            onSelect={() => {
                              form.setValue("stateRegion", state.name, { shouldValidate: true });
                              setOpenState(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${form.watch("stateRegion") === state.name ? "opacity-100" : "opacity-0"}`} />
                            {state.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input className={`bg-background h-14 text-lg ${form.formState.errors.stateRegion ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. California" {...form.register("stateRegion", { required: "State / Region is required" })} />
            )}
            {form.formState.errors.stateRegion && <p className="text-xs text-red-500">{form.formState.errors.stateRegion.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">City <span className="text-red-500">*</span></Label>
            <Input className={`bg-background h-14 text-lg ${form.formState.errors.city ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. San Francisco" {...form.register("city", { required: "City is required" })} />
            {form.formState.errors.city && <p className="text-xs text-red-500">{form.formState.errors.city.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Citizenship <span className="text-red-500">*</span></Label>
            <Input className={`bg-background h-14 text-lg ${form.formState.errors.citizenship ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. US Citizen" {...form.register("citizenship", { required: "Citizenship is required" })} />
            {form.formState.errors.citizenship && <p className="text-xs text-red-500">{form.formState.errors.citizenship.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Languages Spoken <span className="text-red-500">*</span></Label>
            <Input className={`bg-background h-14 text-lg ${form.formState.errors.languages ? "border-red-500 focus-visible:ring-red-500" : "border-border"}`} placeholder="e.g. English, Spanish" defaultValue={p?.languages?.join(", ")} {...form.register("languages", { required: "At least one language is required" })} />
            <p className="text-[10px] text-muted-foreground">Separate with commas</p>
            {form.formState.errors.languages && <p className="text-xs text-red-500">{form.formState.errors.languages.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/90">Religion (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("religion", v)} defaultValue={form.getValues("religion")}>
              <SelectTrigger className="bg-background border-border h-14 text-lg"><SelectValue placeholder="Select religion" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Christianity">Christianity</SelectItem>
                <SelectItem value="Islam">Islam</SelectItem>
                <SelectItem value="Hinduism">Hinduism</SelectItem>
                <SelectItem value="Buddhism">Buddhism</SelectItem>
                <SelectItem value="Judaism">Judaism</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Agnostic">Agnostic</SelectItem>
                <SelectItem value="Atheist">Atheist</SelectItem>
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

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Globe2, Map, MapPin, Flag, MessageSquare, BookHeart } from "lucide-react";
import { motion } from "framer-motion";

import { Country, State } from 'country-state-city';

const ALL_COUNTRIES = Country.getAllCountries();
const COMMON_LANGUAGES = ["English", "Spanish", "French", "Hindi", "Mandarin", "Arabic", "German", "Japanese"];

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
  
  const currentLanguagesStr = form.watch("languages");

  const toggleLanguage = (lang: string) => {
    let langs = currentLanguagesStr.split(",").map(l => l.trim()).filter(Boolean);
    if (langs.includes(lang)) {
      langs = langs.filter(l => l !== lang);
    } else {
      langs.push(lang);
    }
    form.setValue("languages", langs.join(", "), { shouldValidate: true });
  };

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[clamp(17px,5.09vw,23px)] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Where are you based?</h2>
        <p className="text-[#8A7A7A] text-xs">Find matches near you or where you're from.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Country & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Country <span className="text-[#FF7A7A]">*</span></Label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className={`w-full justify-between h-[clamp(43px,12.72vw,57px)] pl-4 pr-4 text-[clamp(13px,3.82vw,17px)] font-normal text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.country ? "border-red-500" : "border-white/50"} ${!form.watch("country") && "text-[#B8A8A8]"}`}
                >
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-[#C8B8B8]" />
                    {form.watch("country") ? form.watch("country") : "Select country"}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList className="max-h-[clamp(170px,50.89vw,230px)] sm:max-h-[300px]">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {ALL_COUNTRIES.map((country) => (
                        <CommandItem
                          key={country.isoCode}
                          value={country.name}
                          onSelect={() => {
                            form.setValue("country", country.name, { shouldValidate: true });
                            form.setValue("stateRegion", "");
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
            {form.formState.errors.country && <p className="text-xs text-red-500 ml-1">{form.formState.errors.country.message as string}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">State / Region <span className="text-[#FF7A7A]">*</span></Label>
            {availableStates.length > 0 ? (
              <Popover open={openState} onOpenChange={setOpenState}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openState}
                    className={`w-full justify-between h-[clamp(43px,12.72vw,57px)] pl-4 pr-4 text-[clamp(13px,3.82vw,17px)] font-normal text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.stateRegion ? "border-red-500" : "border-white/50"} ${!form.watch("stateRegion") && "text-[#B8A8A8]"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-[#C8B8B8]" />
                      {form.watch("stateRegion") ? form.watch("stateRegion") : "Select state"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command>
                    <CommandInput placeholder="Search state..." />
                    <CommandList className="max-h-[clamp(170px,50.89vw,230px)] sm:max-h-[300px]">
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
              <div className="relative">
                <Map className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
                <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.stateRegion ? "border-red-500" : "border-white/50"}`} placeholder="e.g. California" {...form.register("stateRegion", { required: "State / Region is required" })} />
              </div>
            )}
            {form.formState.errors.stateRegion && <p className="text-xs text-red-500 ml-1">{form.formState.errors.stateRegion.message as string}</p>}
          </div>
        </div>

        {/* City & Citizenship */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">City <span className="text-[#FF7A7A]">*</span></Label>
            <div className="relative">
              <MapPin className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.city ? "border-red-500" : "border-white/50"}`} placeholder="e.g. San Francisco" {...form.register("city", { required: "City is required" })} />
            </div>
            {form.formState.errors.city && <p className="text-xs text-red-500 ml-1">{form.formState.errors.city.message as string}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Citizenship <span className="text-[#FF7A7A]">*</span></Label>
            <div className="relative">
              <Flag className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
              <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.citizenship ? "border-red-500" : "border-white/50"}`} placeholder="e.g. US Citizen" {...form.register("citizenship", { required: "Citizenship is required" })} />
            </div>
            {form.formState.errors.citizenship && <p className="text-xs text-red-500 ml-1">{form.formState.errors.citizenship.message as string}</p>}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Languages Spoken <span className="text-[#FF7A7A]">*</span></Label>
          <div className="relative">
            <MessageSquare className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8B8B8]" />
            <Input className={`h-[clamp(43px,12.72vw,57px)] pl-10 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#B8A8A8] focus-visible:ring-[#FF9A9A]/50 bg-white/60 ${form.formState.errors.languages ? "border-red-500" : "border-white/50"}`} placeholder="Type languages separated by commas" {...form.register("languages", { required: "At least one language is required" })} />
          </div>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_LANGUAGES.map(lang => {
              const isActive = currentLanguagesStr.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-[clamp(9px,2.80vw,13px)] font-bold transition-all border ${isActive ? 'bg-[#FF9A9A] text-white border-[#FF9A9A]' : 'bg-white/40 text-[#8A7A7A] border-white/50 hover:bg-white/80'}`}
                >
                  {isActive && <Check className="w-2.5 h-2.5 inline-block mr-1" />}
                  {lang}
                </button>
              );
            })}
          </div>
          {form.formState.errors.languages && <p className="text-xs text-red-500 ml-1">{form.formState.errors.languages.message as string}</p>}
        </div>

        {/* Religion */}
        <div className="space-y-1">
          <Label className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#4A3B3B] uppercase tracking-wider ml-1">Religion <span className="text-gray-400 font-normal lowercase">(optional)</span></Label>
          <Select onValueChange={(v) => form.setValue("religion", v)} defaultValue={form.getValues("religion")}>
            <SelectTrigger className="h-[clamp(43px,12.72vw,57px)] pl-4 text-[clamp(13px,3.82vw,17px)] text-[#252525] focus-visible:ring-[#FF9A9A]/50 bg-white/60 border-white/50">
              <div className="flex items-center gap-2">
                <BookHeart className="w-4 h-4 text-[#C8B8B8]" />
                <SelectValue placeholder="Select religion" />
              </div>
            </SelectTrigger>
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

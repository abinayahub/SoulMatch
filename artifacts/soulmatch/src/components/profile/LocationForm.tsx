import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Globe2, Map, MapPin, Flag, MessageSquare, BookHeart, ChevronRight, Lock } from "lucide-react";
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Where are you based?</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">Find matches near you or where you're from.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Country & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Country <span className="text-[#FF8FA8]">*</span>
            </Label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className={`w-full justify-between h-14 pl-4 pr-4 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.country ? "border-red-500" : "border-[#F4DCE3]"} ${!form.watch("country") && "text-[#6D6D6D]/50"}`}
                >
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-[#FF8FA8]" />
                    {form.watch("country") ? form.watch("country") : "Select country"}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#FF8FA8]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border-[#F8D6DD] shadow-lg" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList className="max-h-[230px] sm:max-h-[300px]">
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
                          <Check className={`mr-2 h-4 w-4 ${form.watch("country") === country.name ? "opacity-100 text-[#FF7E9C]" : "opacity-0"}`} />
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

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              State / Region <span className="text-[#FF8FA8]">*</span>
            </Label>
            {availableStates.length > 0 ? (
              <Popover open={openState} onOpenChange={setOpenState}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openState}
                    className={`w-full justify-between h-14 pl-4 pr-4 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.stateRegion ? "border-red-500" : "border-[#F4DCE3]"} ${!form.watch("stateRegion") && "text-[#6D6D6D]/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-[#FF8FA8]" />
                      {form.watch("stateRegion") ? form.watch("stateRegion") : "Select state"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#FF8FA8]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border-[#F8D6DD] shadow-lg" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command>
                    <CommandInput placeholder="Search state..." />
                    <CommandList className="max-h-[230px] sm:max-h-[300px]">
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
                            <Check className={`mr-2 h-4 w-4 ${form.watch("stateRegion") === state.name ? "opacity-100 text-[#FF7E9C]" : "opacity-0"}`} />
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
                <Map className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
                <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.stateRegion ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="e.g. California" {...form.register("stateRegion", { required: "State / Region is required" })} />
              </div>
            )}
            {form.formState.errors.stateRegion && <p className="text-xs text-red-500 ml-1">{form.formState.errors.stateRegion.message as string}</p>}
          </div>
        </div>

        {/* City & Citizenship */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              City <span className="text-[#FF8FA8]">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.city ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="e.g. San Francisco" {...form.register("city", { required: "City is required" })} />
            </div>
            {form.formState.errors.city && <p className="text-xs text-red-500 ml-1">{form.formState.errors.city.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
              Citizenship <span className="text-[#FF8FA8]">*</span>
            </Label>
            <div className="relative">
              <Flag className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
              <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.citizenship ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="e.g. US Citizen" {...form.register("citizenship", { required: "Citizenship is required" })} />
            </div>
            {form.formState.errors.citizenship && <p className="text-xs text-red-500 ml-1">{form.formState.errors.citizenship.message as string}</p>}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Languages Spoken <span className="text-[#FF8FA8]">*</span>
          </Label>
          <div className="relative">
            <MessageSquare className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8FA8]" />
            <Input className={`h-14 pl-11 text-sm sm:text-base font-medium text-[#1E1E1E] placeholder:text-[#6D6D6D]/40 focus-visible:ring-2 focus-visible:ring-[#FF8FA8]/30 focus-visible:border-[#FF8FA8] bg-white rounded-[18px] ${form.formState.errors.languages ? "border-red-500" : "border-[#F4DCE3]"}`} placeholder="Type languages separated by commas" {...form.register("languages", { required: "At least one language is required" })} />
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {COMMON_LANGUAGES.map(lang => {
              const isActive = currentLanguagesStr.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`h-9 px-4 rounded-full text-xs font-bold transition-all border flex items-center gap-1 active:scale-[0.98] ${isActive ? 'bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-white border-transparent shadow-[0_2px_10px_rgba(255,126,156,0.25)]' : 'bg-white text-[#6D6D6D] border-[#F4DCE3] hover:border-[#FF8FA8]'}`}
                >
                  {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  {lang}
                </button>
              );
            })}
          </div>
          {form.formState.errors.languages && <p className="text-xs text-red-500 ml-1">{form.formState.errors.languages.message as string}</p>}
        </div>

        {/* Religion */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-[#1E1E1E] ml-0.5">
            Religion <span className="text-[#6D6D6D] font-normal text-xs">(optional)</span>
          </Label>
          <Select onValueChange={(v) => form.setValue("religion", v)} defaultValue={form.getValues("religion")}>
            <SelectTrigger className="h-14 pl-4 text-sm sm:text-base font-medium text-[#1E1E1E] focus:ring-2 focus:ring-[#FF8FA8]/30 focus:border-[#FF8FA8] bg-white rounded-[18px] border-[#F4DCE3]">
              <div className="flex items-center gap-2">
                <BookHeart className="w-5 h-5 text-[#FF8FA8]" />
                <SelectValue placeholder="Select religion" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-[18px] border-[#F8D6DD] p-1">
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

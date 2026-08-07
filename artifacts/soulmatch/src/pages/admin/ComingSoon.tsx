import { Construction } from "lucide-react";

export default function AdminComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p- border border-[#E5E7EB] flex flex-col items-center justify-center text-center min-h-[clamp(340px,101.78vw,460px)]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Module In Development</h2>
        <p className="text-[#6B7280] max-w-md">
          The {title} module is currently being built and will be available in the next platform update.
        </p>
      </div>
    </div>
  );
}

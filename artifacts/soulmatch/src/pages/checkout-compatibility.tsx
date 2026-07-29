import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Lock, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
const Layout = AppLayout as any;

export default function CheckoutCompatibilityPage() {
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "card" && cardNumber.length < 16) {
      toast({ title: "Invalid Card", description: "Please enter a valid 16-digit card number", variant: "destructive" });
      return;
    }
    if (method === "upi" && !upiId.includes("@")) {
      toast({ title: "Invalid UPI", description: "Please enter a valid UPI ID", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Upgrade user locally to mock premium status
      updateUser({ role: "premium", isPremium: true });
    }, 2000);
  };

  const handleReturn = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      setLocation("/discover");
    }
  };

  return (
    <Layout showBanner={false}>
      <div className="pt-4 px-4 max-w-lg mx-auto min-h-screen">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit mb-6 -ml-3 text-[#707070] hover:text-[#252525]"
          onClick={handleReturn}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#252525] mb-2 leading-tight">
            Unlock Compatibility
          </h1>
          <p className="text-[#707070] text-sm">
            Get unlimited access to deep values and personality match breakdowns.
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-[#252525]">Premium Insights</span>
            <span className="font-bold">₹99.00</span>
          </div>
          <div className="flex justify-between items-center text-xs text-[#707070] pt-2 border-t border-border/50">
            <span>One-time fee</span>
            <span>Total due: ₹99.00</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#252525]">Payment Details</h2>
                <div className="flex items-center text-[clamp(9px,2.54vw,12px)] text-[#707070] bg-card px-2 py-1 rounded-full border border-border">
                  <Lock className="w-3 h-3 mr-1" /> Secure
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    method === "card"
                      ? "border-[#F6A8B7] bg-[#F6A8B7]/5 text-[#F6A8B7]"
                      : "border-border bg-card text-[#707070]"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1.5" />
                  <span className="text-[clamp(9px,2.80vw,13px)] font-semibold">Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    method === "upi"
                      ? "border-[#F6A8B7] bg-[#F6A8B7]/5 text-[#F6A8B7]"
                      : "border-border bg-card text-[#707070]"
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1.5" />
                  <span className="text-[clamp(9px,2.80vw,13px)] font-semibold">UPI</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                {method === "card" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                      <label className="text-xs font-medium text-[#252525] mb-1.5 block">Card Number</label>
                      <Input 
                        placeholder="0000 0000 0000 0000" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-[#252525] mb-1.5 block">Expiry</label>
                        <Input placeholder="MM/YY" className="bg-card border-border" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#252525] mb-1.5 block">CVV</label>
                        <Input placeholder="123" type="password" maxLength={3} className="bg-card border-border" />
                      </div>
                    </div>
                  </div>
                )}
                
                {method === "upi" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                      <label className="text-xs font-medium text-[#252525] mb-1.5 block">Enter UPI ID</label>
                      <Input 
                        placeholder="example@okaxis" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                    <p className="text-xs text-[#707070] text-center">
                      A payment request will be sent to your UPI app.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full h-12 w-full text-[#252525] rounded-full border border-white/40 transition-all hover:bg-[#F6A8B7]  font-bold mt-4 shadow-lg shadow-[#F6A8B7]/20" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <>Pay ₹99.00</>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#252525] mb-2">Payment Successful!</h2>
              <p className="text-[#707070] text-sm mb-8">
                You now have full access to compatibility history and premium insights.
              </p>
              
              <Button 
                onClick={handleReturn}
                className="w-full h-12 w-full text-[#252525] rounded-full border border-white/40 transition-all hover:bg-[#F6A8B7]  rounded-xl font-bold shadow-lg shadow-[#F6A8B7]/20" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}
              >
                Return to Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

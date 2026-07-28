import { Button } from "@/components/ui/button";
import { ShieldCheck, Camera, CreditCard, CheckCircle2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export function VerificationForm({ p, onCancel, onSave, hasPrevious }: any) {
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [faceDetectionState, setFaceDetectionState] = useState<"scanning" | "detected" | "none">("none");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [fallbackPhoto, setFallbackPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frontIdRef = useRef<HTMLInputElement>(null);
  const backIdRef = useRef<HTMLInputElement>(null);
  const fallbackCameraRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const scanIntervalRef = useRef<any>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        await tf.ready();
        modelRef.current = await blazeface.load();
      } catch (e) {
        console.error("Failed to load face model", e);
      }
    };
    initModel();
    return () => {
      stopCamera();
    };
  }, []);

  const handleFallbackSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFallbackPhoto(base64String);
      setShowCamera(true);
      setFaceDetectionState("scanning");
      
      const img = new Image();
      img.src = base64String;
      img.onload = async () => {
        try {
          if (!modelRef.current) {
             modelRef.current = await blazeface.load();
          }
          const predictions = await modelRef.current.estimateFaces(img, false);
          
          const validFaces = predictions.filter((p: any) => {
             const prob = Array.isArray(p.probability) ? p.probability[0] : Number(p.probability);
             return prob > 0.85; 
          });
          
          if (validFaces.length > 0) {
            setFaceDetectionState("detected");
            setTimeout(() => {
              setCapturedPhoto(base64String);
              setShowCamera(false);
              setFaceDetectionState("none");
              setFallbackPhoto(null);
            }, 1500);
          } else {
            // Face NOT detected
            toast({ 
              title: "Face Not Detected", 
              description: "Could not find a clear human face in this photo. Please ensure your nose, eyes, and mouth are clearly visible.", 
              variant: "destructive" 
            });
            setShowCamera(false);
            setFaceDetectionState("none");
            setFallbackPhoto(null);
          }
        } catch (e) {
          console.error(e);
          toast({ 
            title: "Verification Error", 
            description: "An error occurred while scanning your face or no face was detected. Please try again.", 
            variant: "destructive" 
          });
          setShowCamera(false);
          setFaceDetectionState("none");
          setFallbackPhoto(null);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updates: any = {};
      if (side === 'front') updates.govIdFrontUrl = base64String;
      if (side === 'back') updates.govIdBackUrl = base64String;
      
      // Auto-verify ID if both sides are present
      const hasOtherSide = side === 'front' ? !!p?.govIdBackUrl : !!p?.govIdFrontUrl;
      if (hasOtherSide) {
        updates.isGovIdVerified = true;
      }
      
      onSave(updates, false);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setFaceDetectionState("scanning");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser (may require HTTPS).");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start AI face detection loop
      scanIntervalRef.current = setInterval(async () => {
        if (!streamRef.current || !videoRef.current || !modelRef.current) return;
        
        try {
          const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
          
          const validFaces = predictions.filter((p: any) => {
             const prob = Array.isArray(p.probability) ? p.probability[0] : Number(p.probability);
             return prob > 0.85; 
          });

          if (validFaces.length > 0) {
            clearInterval(scanIntervalRef.current);
            setFaceDetectionState("detected");
            setTimeout(() => {
              if (streamRef.current) {
                takePhoto();
              }
            }, 1000);
          }
        } catch (e) {
          console.error("Face scan error", e);
        }
      }, 500);
      
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
      setFaceDetectionState("none");
      
      // Fallback to file input with capture="user"
      if (fallbackCameraRef.current) {
        fallbackCameraRef.current.click();
      } else {
        toast({ title: "Camera Error", description: err.message || "Could not access the camera. Make sure permissions are granted.", variant: "destructive" });
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setFaceDetectionState("none");
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSubmit = () => {
    if (capturedPhoto) {
      onSave({ isSelfieVerified: true, selfieUrl: capturedPhoto }, false);
      toast({ title: "Verification submitted!" });
      setCapturedPhoto(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="premium-glass-card rounded-[24px] p-4 sm:p-6 mb-4 border border-white/50">
      <div className="mb-5 border-b border-white/40 pb-3 text-center">
        <h2 className="text-[20px] sm:text-[22px] font-black mb-2 text-[#4A3B3B]">Verify your profile</h2>
        <p className="text-[#8A7A7A] text-xs">Verified profiles get 4x more meaningful matches and a trust badge.</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/60 shadow-sm border border-white/50">
              <ShieldCheck className="w-5 h-5 text-[#FF7A7A]" />
            </div>
            <div>
              <h3 className="font-bold text-[14px] mb-1 text-[#4A3B3B]">Get the Trust Badge</h3>
              <p className="text-[11px] text-[#8A7A7A] mb-3 leading-relaxed">Complete both steps below to unlock your verified badge and increase your profile visibility.</p>
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${p?.isGovIdVerified ? 'border-green-400 text-green-600 bg-green-50' : 'border-white/50 text-[#8A7A7A] bg-white/40'}`}>
                  {p?.isGovIdVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-[#8A7A7A]/30" />}
                  ID Verified
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${p?.isSelfieVerified ? 'border-green-400 text-green-600 bg-green-50' : 'border-white/50 text-[#8A7A7A] bg-white/40'}`}>
                  {p?.isSelfieVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-[#8A7A7A]/30" />}
                  Selfie Matched
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold tracking-wider text-[#4A3B3B] uppercase ml-1">Government ID</h3>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="user"
              ref={fallbackCameraRef} 
              onChange={handleFallbackSelfie} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={frontIdRef} 
              onChange={(e) => handleIdUpload(e, 'front')} 
              className="hidden" 
            />
            <div 
              className={`p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group min-h-[120px] ${p?.govIdFrontUrl ? 'border-none shadow-md' : 'border-2 border-dashed border-white/60 bg-white/40 hover:bg-white/60 hover:border-[#FF9A9A]'}`}
              onClick={() => frontIdRef.current?.click()}
            >
              {p?.govIdFrontUrl ? (
                <>
                  <img src={p.govIdFrontUrl} alt="Front ID" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="relative z-10 flex flex-col items-center pointer-events-none p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/50">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-bold text-[13px] text-green-600">Front Uploaded</p>
                  </div>
                  <button 
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm hover:bg-red-500 rounded-full text-white transition-all z-20 shadow-md border border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave({ govIdFrontUrl: null, isGovIdVerified: false }, false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center transition-transform group-hover:scale-105">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-[#FF9A9A]" />
                  <p className="font-bold text-[14px] text-[#4A3B3B]">Upload Front of ID</p>
                </div>
              )}
            </div>

            <input 
              type="file" 
              accept="image/*" 
              ref={backIdRef} 
              onChange={(e) => handleIdUpload(e, 'back')} 
              className="hidden" 
            />
            <div 
              className={`p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group min-h-[120px] ${p?.govIdBackUrl ? 'border-none shadow-md' : 'border-2 border-dashed border-white/60 bg-white/40 hover:bg-white/60 hover:border-[#FF9A9A]'}`}
              onClick={() => backIdRef.current?.click()}
            >
              {p?.govIdBackUrl ? (
                <>
                  <img src={p.govIdBackUrl} alt="Back ID" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="relative z-10 flex flex-col items-center pointer-events-none p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/50">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-bold text-[13px] text-green-600">Back Uploaded</p>
                  </div>
                  <button 
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm hover:bg-red-500 rounded-full text-white transition-all z-20 shadow-md border border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave({ govIdBackUrl: null, isGovIdVerified: false }, false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center transition-transform group-hover:scale-105">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-[#B8A8A8]" />
                  <p className="font-bold text-[14px] text-[#4A3B3B]">Upload Back of ID</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[12px] font-bold tracking-wider text-[#4A3B3B] uppercase ml-1">Selfie Verification <span className="text-[#FF7A7A]">*</span></h3>
            <div className="p-4 rounded-2xl border-2 border-white/60 bg-white/40 min-h-[280px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
              
              {showCamera ? (
                <>
                  {fallbackPhoto ? (
                    <img src={fallbackPhoto} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
                  )}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex flex-col items-center justify-end pb-6">
                    {faceDetectionState === "scanning" && (
                      <div className="bg-black/70 backdrop-blur-md text-white px-5 py-3 rounded-2xl mb-6 animate-pulse border border-white/30 text-[13px] font-bold text-center shadow-lg">
                        Scanning... Face is not visible.<br/>Please center your face.
                      </div>
                    )}
                    {faceDetectionState === "detected" && (
                      <div className="bg-green-500/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl mb-6 border border-green-400 text-[14px] font-bold shadow-lg">
                        Face Detected! Taking photo...
                      </div>
                    )}
                    <button onClick={stopCamera} className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all z-20 shadow-md border border-white/20"><X className="w-5 h-5" /></button>
                    {/* Face overlay guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-48 h-64 rounded-[100%] border-2 border-dashed transition-colors duration-500 ${faceDetectionState === "detected" ? "border-green-400 bg-green-400/10" : "border-white/70"}`}></div>
                    </div>
                  </div>
                </>
              ) : (capturedPhoto || p?.selfieUrl) ? (
                <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                  <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="font-black text-[20px] text-[#4A3B3B] mb-2">Face Verified</p>
                  <p className="text-[12px] text-[#8A7A7A] text-center max-w-[220px] mb-8 leading-relaxed">
                    Strictly for internal verification.<br/>Will NEVER be shown publicly.
                  </p>
                  <Button onClick={startCamera} variant="outline" className="text-[#5A4A4A] border-white/80 bg-white/60 hover:bg-white rounded-full px-6 font-bold text-[13px]">Retake Photo</Button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-white/80 border border-white shadow-sm text-[#FF7A7A]">
                    <Camera className="w-10 h-10" />
                  </div>
                  <p className="font-black text-[18px] mb-2 text-[#4A3B3B]">Take a live selfie</p>
                  <p className="text-[13px] text-[#8A7A7A] mb-4 max-w-[220px] leading-relaxed">We'll match this with your ID and profile photos to verify you.</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-8 max-w-[240px]">
                    <p className="text-[11px] font-bold text-green-600 text-center leading-relaxed">This photo is strictly for verification and will NEVER be shown publicly.</p>
                  </div>
                  <button onClick={startCamera} className="w-full max-w-[220px] h-12 text-[14px] font-bold text-white rounded-full transition-transform active:scale-[0.98] gradient-coral-pill">Start Camera</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3 flex-wrap">
          {hasPrevious && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-1/3 h-14 text-[15px] font-bold rounded-full border border-white/40 text-[#8A7A7A] bg-white/50 hover:bg-white/80 transition-transform active:scale-[0.98]"
            >
              Previous
            </button>
          )}
          <button 
            type="button" 
            onClick={() => {
              handleSubmit();
              onSave({}); // Trigger final step navigation
            }} 
            disabled={!capturedPhoto && !p?.isSelfieVerified}
            className="flex-1 h-14 text-[15px] font-bold text-white rounded-full transition-transform active:scale-[0.98] disabled:opacity-50 gradient-coral-pill"
          >
            Finish Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

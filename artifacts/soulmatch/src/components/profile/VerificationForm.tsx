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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Verify your profile</h2>
        <p className="text-muted-foreground">Verified profiles get 4x more meaningful matches and a trust badge.</p>
      </div>

      <div className="space-y-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Get the Trust Badge</h3>
              <p className="text-sm text-muted-foreground mb-4">Complete both steps below to unlock your verified badge and increase your profile visibility.</p>
              <div className="flex gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${p?.isGovIdVerified ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-border text-muted-foreground'}`}>
                  {p?.isGovIdVerified ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                  ID Verified
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${p?.isSelfieVerified ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-border text-muted-foreground'}`}>
                  {p?.isSelfieVerified ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                  Selfie Matched
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Government ID</h3>
            
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
              className="p-6 rounded-2xl bg-background border border-border border-dashed text-center cursor-pointer hover:bg-white/10 transition-colors relative overflow-hidden group"
              onClick={() => frontIdRef.current?.click()}
            >
              {p?.govIdFrontUrl ? (
                <>
                  <img src={p.govIdFrontUrl} alt="Front ID" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-400" />
                    <p className="font-medium text-sm text-green-400">Front Uploaded</p>
                  </div>
                  <button 
                    type="button"
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-foreground/90 transition-colors z-20 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave({ govIdFrontUrl: null, isGovIdVerified: false }, false);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-sm">Upload Front of ID</p>
                </>
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
              className="p-6 rounded-2xl bg-background border border-border border-dashed text-center cursor-pointer hover:bg-white/10 transition-colors relative overflow-hidden group"
              onClick={() => backIdRef.current?.click()}
            >
              {p?.govIdBackUrl ? (
                <>
                  <img src={p.govIdBackUrl} alt="Back ID" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-400" />
                    <p className="font-medium text-sm text-green-400">Back Uploaded</p>
                  </div>
                  <button 
                    type="button"
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-foreground/90 transition-colors z-20 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave({ govIdBackUrl: null, isGovIdVerified: false }, false);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="font-medium text-sm">Upload Back of ID</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Selfie Verification <span className="text-red-500">*</span></h3>
            <div className="p-6 rounded-2xl bg-background border border-border min-h-[320px] flex flex-col items-center justify-center text-center relative overflow-hidden">
              
              {showCamera ? (
                <>
                  {fallbackPhoto ? (
                    <img src={fallbackPhoto} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end pb-4">
                    {faceDetectionState === "scanning" && (
                      <div className="bg-black/60 text-white px-4 py-2 rounded-full mb-4 animate-pulse border border-white/20 text-sm font-medium text-center">
                        Scanning... Face is not visible.<br/>Please center your face.
                      </div>
                    )}
                    {faceDetectionState === "detected" && (
                      <div className="bg-green-500/80 text-white px-4 py-2 rounded-full mb-4 border border-green-400 text-sm font-medium">
                        Face Detected! Taking photo...
                      </div>
                    )}
                    <button onClick={stopCamera} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-foreground/90 hover:bg-black/70 transition z-10"><X className="w-4 h-4" /></button>
                    {/* Face overlay guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-40 h-56 rounded-[100%] border-2 border-dashed ${faceDetectionState === "detected" ? "border-green-400" : "border-white/50"}`}></div>
                    </div>
                  </div>
                </>
              ) : (capturedPhoto || p?.selfieUrl) ? (
                <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="font-bold text-xl text-foreground mb-2">Face Verified</p>
                  <p className="text-xs text-muted-foreground text-center max-w-[220px] mb-6">
                    Strictly for internal verification.<br/>Will NEVER be shown publicly.
                  </p>
                  <Button onClick={startCamera} variant="outline" className="text-foreground border-border hover:bg-muted">Retake Photo</Button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="font-medium mb-2">Take a live selfie</p>
                  <p className="text-xs text-muted-foreground mb-2 max-w-[200px]">We'll match this with your ID and profile photos to verify you.</p>
                  <p className="text-xs font-semibold text-green-500/80 mb-6 max-w-[200px] text-center">This photo is strictly for verification and will NEVER be shown publicly on your profile.</p>
                  <Button onClick={startCamera} className="w-full max-w-[200px]">Start Camera</Button>
                </>
              )}

            </div>
          </div>
        </div>

        <div className="pt-6 flex gap-3">
          {hasPrevious && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="w-1/3 h-14 text-lg font-bold rounded-xl border-border hover:bg-muted"
            >
              Previous
            </Button>
          )}
          <Button 
            type="button" 
            onClick={() => {
              handleSubmit();
              onSave({}); // Trigger final step navigation
            }} 
            disabled={!capturedPhoto && !p?.isSelfieVerified}
            className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md border-0 rounded-xl"
          >
            Finish Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

import { Button } from "@/components/ui/button";
import { Upload, X, PlayCircle, ImagePlus, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useUploadPhoto, useDeletePhoto, getGetMeQueryKey } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export function MediaForm({ p, onSave, onCancel, hasPrevious, isPending }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const uploadPhoto = useUploadPhoto({ request: { headers: authHeaders() } });
  const deletePhoto = useDeletePhoto({ request: { headers: authHeaders() } });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleDeletePhoto = (photoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePhoto.mutate(
      { photoId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Photo deleted" });
        },
        onError: (err: any) => toast({ title: "Failed to delete photo", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "Video too large", description: "Please select a short video under 15MB.", variant: "destructive" });
      return;
    }

    setIsUploadingVideo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onSave({ videoIntroUrl: base64String }, false);
      setIsUploadingVideo(false);
      toast({ title: "Video uploaded successfully" });
    };
    reader.onerror = () => {
      setIsUploadingVideo(false);
      toast({ title: "Failed to read video file", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please select an image under 10MB.", variant: "destructive" });
      return;
    }

    if (targetIndex !== undefined) setUploadingIndex(targetIndex);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      uploadPhoto.mutate(
        {
          data: {
            url: base64String,
            publicId: "photo_" + Date.now(),
            isPrimary: !p?.photos?.length
          }
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
            toast({ title: "Photo uploaded successfully" });
            setUploadingIndex(null);
          },
          onError: (err: any) => {
            toast({ title: "Failed to upload photo", description: err.message, variant: "destructive" });
            setUploadingIndex(null);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[28px] p-6 sm:p-8 mb-4 border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]">
      <div className="mb-6 pb-4 border-b border-[#F8D6DD]/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight mb-1">Add Your Best Photos</h2>
        <p className="text-sm text-[#6D6D6D] font-normal">Show up as your real self. Upload at least 1 photo to continue.</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ImagePlus className="w-5 h-5 text-[#FF8FA8]" />
            <h3 className="text-sm font-bold text-[#1E1E1E]">Photo Gallery</h3>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={(e) => handleFileUpload(e, uploadingIndex ?? undefined)} 
            className="hidden" 
          />
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const photo = p?.photos?.[index];
              const isThisUploading = uploadPhoto.isPending && uploadingIndex === index;
              return (
                <div 
                  key={index} 
                  className={`aspect-[3/4] rounded-[18px] flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all ${
                    photo ? 'border-none shadow-sm' : 'border-2 border-dashed border-[#F4DCE3] bg-white hover:bg-[#FFE6EC]/30 hover:border-[#FF8FA8]'
                  }`}
                  onClick={() => {
                    if (!photo && !uploadPhoto.isPending) {
                      setUploadingIndex(index);
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {photo ? (
                    <>
                      <img src={photo.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        aria-label="Delete photo"
                        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md hover:bg-red-500 rounded-full text-white transition-all z-20 shadow-md flex items-center justify-center cursor-pointer border border-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete this photo?")) {
                            handleDeletePhoto(photo.id, e);
                          }
                        }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 inset-x-0 py-1.5 bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] text-center">
                          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Primary</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-2 transition-transform group-hover:scale-105">
                      {isThisUploading ? (
                        <div className="w-6 h-6 border-2 border-[#FF8FA8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      ) : (
                        <Upload className="w-6 h-6 mx-auto mb-1.5 text-[#FF8FA8]" />
                      )}
                      <span className="text-xs font-semibold text-[#6D6D6D]">
                        {isThisUploading ? "Uploading..." : index === 0 ? "Add Main Photo" : "Add Photo"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FF8FA8]" />
              <h3 className="text-sm font-bold text-[#1E1E1E]">Video Introduction</h3>
            </div>
            <span className="text-xs text-[#6D6D6D] font-normal">(optional)</span>
          </div>
          
          <input 
            type="file" 
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" 
            ref={videoInputRef} 
            onChange={handleVideoUpload} 
            className="hidden" 
          />
          <div 
            className={`w-full h-44 rounded-[18px] flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
              p?.videoIntroUrl ? 'border-none shadow-sm' : 'border-2 border-dashed border-[#F4DCE3] bg-white hover:bg-[#FFE6EC]/30 hover:border-[#FF8FA8]'
            }`}
            onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
          >
            {isUploadingVideo ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#FF8FA8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#1E1E1E]">Uploading video...</p>
              </div>
            ) : p?.videoIntroUrl ? (
              <>
                <video src={p.videoIntroUrl} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="relative z-10 flex flex-col items-center pointer-events-none p-4 rounded-2xl bg-black/40 backdrop-blur-sm">
                  <PlayCircle className="w-10 h-10 mx-auto mb-2 text-white drop-shadow-md" />
                  <p className="font-bold text-sm text-white">Video Uploaded</p>
                  <p className="text-xs text-white/80">Click anywhere to replace</p>
                </div>
                {/* Delete button for Video Intro */}
                <button 
                  type="button"
                  aria-label="Delete video"
                  className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md hover:bg-red-500 rounded-full text-white transition-all z-20 shadow-lg border border-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete your video intro?")) {
                      onSave({ videoIntroUrl: null }, false);
                      toast({ title: "Video intro deleted" });
                    }
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center max-w-sm px-4 transition-transform group-hover:scale-105">
                <PlayCircle className="w-10 h-10 mx-auto mb-2 text-[#FF8FA8]" />
                <p className="text-base font-bold mb-1 text-[#1E1E1E]">Record or upload an intro</p>
                <p className="text-xs text-[#6D6D6D] leading-relaxed">Up to 30 seconds (max 15MB).<br/>Let matches hear your voice!</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex gap-3 w-full">
            {hasPrevious && (
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-1/3 h-14 text-sm sm:text-base font-bold rounded-full border border-[#F8D6DD] text-[#6D6D6D] bg-[#FFE6EC]/50 hover:bg-[#FFE6EC] transition-transform active:scale-[0.98]"
              >
                Previous
              </button>
            )}
            <button 
              type="button"
              onClick={() => onSave({})}
              disabled={isPending || uploadPhoto.isPending || !p?.photos?.length} 
              className="flex-1 h-14 text-base font-bold text-white rounded-full transition-transform active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] hover:opacity-95 shadow-[0_8px_24px_rgba(255,126,156,0.35)] flex items-center justify-center gap-2"
            >
              <span>{isPending ? "Saving..." : "Continue"}</span>
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          </div>
          {!p?.photos?.length && (
            <p className="text-center text-xs font-bold text-[#FF7E9C] mt-3">You must upload at least one photo to continue.</p>
          )}
        </div>

        {/* Bottom Security Hint */}
        <div className="pt-3 border-t border-[#F8D6DD]/60 flex items-center justify-center gap-1.5 text-xs text-[#6D6D6D] font-medium">
          <Lock className="w-3.5 h-3.5 text-[#FF8FA8]" />
          <span>Your information is safe and secure.</span>
        </div>
      </div>
    </motion.div>
  );
}

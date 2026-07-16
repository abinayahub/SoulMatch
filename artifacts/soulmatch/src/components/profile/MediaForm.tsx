import { Button } from "@/components/ui/button";
import { Upload, X, PlayCircle } from "lucide-react";
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

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onSave({ videoIntroUrl: base64String }, false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          },
          onError: (err: any) => {
            toast({ title: "Failed to upload photo", description: err.message, variant: "destructive" });
          }
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-8 mb-6 relative overflow-hidden">
      <div className="mb-6 border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Add your best photos</h2>
        <p className="text-muted-foreground">Show up as your real self. We blur photos with public until matches are mutual.</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Gallery</h3>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const photo = p?.photos?.[index];
              return (
                <div 
                  key={index} 
                  className="aspect-[3/4] rounded-2xl bg-background border border-border flex items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors" 
                  onClick={() => !photo && fileInputRef.current?.click()}
                >
                  {photo ? (
                    <>
                      <img src={photo.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <div 
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={(e) => handleDeletePhoto(photo.id, e)}
                      >
                        <X className="w-8 h-8 text-white border-0" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{uploadPhoto.isPending ? "Uploading..." : "Upload"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Video Introduction</h3>
          
          <input 
            type="file" 
            accept="video/*" 
            ref={videoInputRef} 
            onChange={handleVideoUpload} 
            className="hidden" 
          />
          <div 
            className="w-full h-48 rounded-2xl bg-background border border-border border-dashed flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors relative overflow-hidden group"
            onClick={() => videoInputRef.current?.click()}
          >
            {p?.videoIntroUrl ? (
              <>
                <video src={p.videoIntroUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <PlayCircle className="w-8 h-8 mx-auto mb-3 text-green-400" />
                  <p className="font-medium text-sm text-green-400">Video Uploaded</p>
                  <p className="text-xs text-green-400/70">Click to replace</p>
                </div>
                <button 
                  type="button"
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave({ videoIntroUrl: null }, false);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center max-w-sm px-4">
                <PlayCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Record or upload a short intro</p>
                <p className="text-xs text-muted-foreground">Up to 30 seconds. This helps matches hear your voice and see your personality.</p>
              </div>
            )}
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
            onClick={() => onSave({})}
            disabled={isPending || uploadPhoto.isPending || !p?.photos?.length} 
            className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md text-white border-0 rounded-xl"
          >
            {isPending ? "Saving..." : "Next"}
          </Button>
          {!p?.photos?.length && (
            <p className="text-center text-xs text-red-400 mt-3">You need to upload at least one photo to continue.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageCompression";
import { executeMediaUpload } from "@/lib/mediaUploadAdapter";
import { profileService } from "@/services/profile";

interface ProfileImageUploaderProps {
  currentProfileUrl?: string | null;
  name?: string | null;
  onUploadSuccess?: (newUrl: string) => void;
  className?: string; // Additional classes for the avatar itself
}

/**
 * A comprehensive Image Uploader for the User Profile.
 * Orchestrates the full lifecycle: Pick -> Compress -> Init Auth -> Upload -> Complete -> Display
 */
export function ProfileImageUploader({
  currentProfileUrl,
  name,
  onUploadSuccess,
  className = "w-24 h-24 text-2xl",
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = localPreview || currentProfileUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Client-Side Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    // Rough check on original size (Hard limit 15MB before compression aborts parsing)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is too large. Please select an image under 15MB.");
      return;
    }

    try {
      setIsUploading(true);

      // Create optimistic local preview
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);

      // 2. Compress the image (Targeting under 200KB and reasonable max dimensions)
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.195, // strict 200 KB limit
        maxWidthOrHeight: 800, // reduce dimensions slightly to assist with dropping extreme sizes
        quality: 0.85
      });

      // 3. Request Upload Instruction from the Backend
      const initResponse = await profileService.initProfileImageUpload({
        fileName: compressedFile.name,
        contentType: compressedFile.type,
        sizeBytes: compressedFile.size
      });

      // 4. Execute generic vendor-agnostic upload using the returned instruction
      const uploadResult = await executeMediaUpload(compressedFile, initResponse.data);

       // 5. Notify the backend that the upload succeeded to persist the change permanently
      const completeResponse = await profileService.completeProfileImageUpload({
        objectKey: uploadResult.objectKey,
        secureUrl: uploadResult.secureUrl,
        etag: uploadResult.etag,
        metadata: uploadResult.metadata
      });

      toast.success("Profile image updated successfully!");

      // Bubble up the final confirmed URL state
      if (onUploadSuccess && completeResponse.data.profileUrl) {
         onUploadSuccess(completeResponse.data.profileUrl);
      }

    } catch (err: any) {
      console.error("Profile image upload failed:", err);
      // Revert optimistic preview
      setLocalPreview(null);
      toast.error(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting the same file again if it failed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerSelect = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block group">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      
      {/* The visible Avatar */}
      <UserAvatar 
        profileUrl={displayUrl} 
        name={name} 
        className={`${className} transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`} 
      />

      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm z-10 transition-all">
           <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Edit Trigger Badge */}
      {!isUploading && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/4 translate-y-1/4 z-10 hover:bg-primary hover:text-primary-foreground"
          onClick={triggerSelect}
        >
          <Camera className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

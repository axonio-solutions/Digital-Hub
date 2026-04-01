// picture-uploader.tsx
import { useUpdateCafeBanner } from "./picture-uploader.queries";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FilePondFile } from "filepond";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

const BUCKET_NAME = "cafe_images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PictureUploaderProps {
  initialPicture?: string | null;
}

const generateUniqueFileName = (originalName: string): string => {
  const ext = originalName.split(".").pop() || "jpg";
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;
};

export const PictureUploader = ({ initialPicture }: PictureUploaderProps) => {
  const updateMutation = useUpdateCafeBanner();
  const [files, setFiles] = useState<Array<FilePondFile>>([]);
  const supabase = getSupabaseBrowserClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeImage = async () => {
      if (!initialPicture) {
        setIsInitialized(true);
        return;
      }

      try {
        // Verify image accessibility
        const img = new Image();
        img.src = initialPicture;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        setFiles([{
          source: initialPicture,
          options: {
            type: 'local',
            metadata: {
              origin: 'supabase-storage',
              poster: initialPicture
            }
          }
        } as unknown as FilePondFile]);
      } catch (error) {
        console.error('Image verification failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeImage();
  }, [initialPicture]);

  const handleUploadToStorage = async (file: File) => {
    const fileName = generateUniqueFileName(file.name);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (error) throw error;

    return supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path).data.publicUrl;
  };

  const handleProcess = async (file: File) => {
    try {
      const imageUrl = await handleUploadToStorage(file);
      await updateMutation.mutateAsync({ imageUrl });
      toast.success("تم تحديث الصورة بنجاح");
      return imageUrl;
    } catch (error) {
      toast.error("فشل في رفع الصورة");
      throw error;
    }
  };

  const handleRemove = async (source: string) => {
    const fileName = source.split("/").pop() || "";
    try {
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      await updateMutation.mutateAsync({ imageUrl: null });
      toast.success("تم حذف الصورة بنجاح");
    } catch (error) {
      toast.error("فشل في حذف الصورة");
      throw error;
    }
  };

  const handleLoad = (source: string, load: (file: File) => void) => {
    
    console.log("[Load] Loading image from:", source);
    
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const fileName = source.split('/').pop() || 'image.jpg';
        const file = new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now()
        });
        load(file);
      }
    };
    
    xhr.onerror = () => load(new File([], 'error'));
    xhr.open('GET', source);
    xhr.send();
  };

  if (!isInitialized) {
    return <div className="w-40 h-40 rounded-full animate-pulse bg-gray-200" />;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-full overflow-hidden p-1">
      <div className="w-full sm:w-40 min-w-0">
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={false}
          maxFiles={1}
          acceptedFileTypes={ACCEPTED_FILE_TYPES}
          maxFileSize={MAX_FILE_SIZE}
          imagePreviewHeight={170}
          imageCropAspectRatio="1:1"
          imageResizeTargetWidth={400}
          imageResizeTargetHeight={400}
          stylePanelLayout="compact circle"
          labelIdle="اسحب وأفلت الصورة أو انقر للتصفح"
          labelMaxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
          credits={false}
          server={{
            load: (source, load) => {
                
              
              handleLoad(source, load);
              return { abort: () => {} };
            },
            process: (fieldName, file, metadata, load, error) => {
              handleProcess(file)
                .then(url => load(url))
                .catch(err => error(err.message));
            },
            remove: (source, load) => {
              handleRemove(source)
                .then(load)
                .catch(err => console.error(err));
            }
          }}
          allowImagePreview={true}
          allowImageExifOrientation={true}
          allowImageCrop={true}
          allowImageTransform={true}
          stylePanelAspectRatio={1}
        />
      </div>
      <Alert className="flex-1 min-w-0 bg-blue-50 border-blue-200">
        <AlertDescription className="text-xs text-blue-700">
          <span className="font-medium block mb-1">متطلبات شعار المقهى</span>
          يجب أن يكون الشعار بتنسيق JPG أو PNG أو WebP، وبحجم أقصى 5 ميجابايت، وبأبعاد 400×400 بكسل.
        </AlertDescription>
      </Alert>
    </div>
  );
};
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FilePondFile } from "filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PictureUploaderProps {
	initialPicture?: string | null;
	type: "profile" | "cafe";
}

const PictureUploader = ({ initialPicture, type }: PictureUploaderProps) => {
	const [files, setFiles] = useState<File[]>([]);

	// Mock upload handler
	const handleUpload = (
		fieldName: string,
		file: File,
		metadata: any,
		load: (p: string) => void,
		error: (e: string) => void,
		progress: (b: boolean, loaded: number, total: number) => void,
		abort: () => void,
	) => {
		// Simulate upload progress
		const progressInterval = setInterval(() => {
			progress(true, Math.random() * file.size, file.size);
		}, 500);

		// Simulate upload completion after 2 seconds
		setTimeout(() => {
			clearInterval(progressInterval);
			progress(true, file.size, file.size);
			load(URL.createObjectURL(file));
		}, 2000);

		return {
			abort: () => {
				clearInterval(progressInterval);
				abort();
			},
		};
	};

	const handleInit = () => {
		if (!initialPicture) return;
		setFiles([
			{
				source: initialPicture,
				options: { type: "local" },
			} as unknown as File,
		]);
	};

	return (
		<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-full overflow-hidden p-1">
			<div className="w-full sm:w-40 min-w-0">
				<FilePond
					files={files}
					onupdatefiles={(fileItems: FilePondFile[]) => {
						setFiles(fileItems.map((f: FilePondFile) => f.file as File));
					}}
					allowMultiple={false}
					oninit={handleInit}
					maxFiles={1}
					acceptedFileTypes={ACCEPTED_FILE_TYPES}
					maxFileSize={MAX_FILE_SIZE}
					imagePreviewHeight={170}
					imageCropAspectRatio="1:1"
					imageResizeTargetWidth={400}
					imageResizeTargetHeight={400}
					stylePanelLayout="compact circle"
					styleLoadIndicatorPosition="center bottom"
					styleProgressIndicatorPosition="right bottom"
					styleButtonRemoveItemPosition="left bottom"
					styleButtonProcessItemPosition="right bottom"
					labelIdle="اسحب وأفلت الصورة أو انقر للتصفح"
					labelMaxFileSize={`${MAX_FILE_SIZE / (1024 * 1024)}MB`}
					credits={false}
					instantUpload={false}
					server={{
						process: handleUpload,
						load: (source, load) => {
							load(source);
							return { abort: () => {} };
						},
						remove: (source, load) => {
							load();
							return { abort: () => {} };
						},
					}}
				/>
			</div>
			<Alert className="flex-1 min-w-0 bg-blue-50 border-blue-200">
				<AlertDescription className="text-xs text-blue-700">
					{type === "profile" ? (
						<>
							<span className="font-medium block mb-1">
								متطلبات صورة الملف الشخصي
							</span>
							يجب أن تكون الصورة بتنسيق JPG أو PNG أو WebP، وبحجم أقصى 5
							ميجابايت، وبأبعاد 400×400 بكسل.
						</>
					) : (
						<>
							<span className="font-medium block mb-1">
								متطلبات شعار المقهى
							</span>
							يجب أن يكون الشعار بتنسيق JPG أو PNG أو WebP، وبحجم أقصى 5
							ميجابايت، وبأبعاد 400×400 بكسل.
						</>
					)}
				</AlertDescription>
			</Alert>
		</div>
	);
};

export default PictureUploader;

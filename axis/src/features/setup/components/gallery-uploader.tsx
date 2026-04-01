import {
	IconAlertCircle,
	IconPhoto,
	IconPhotoX,
	IconTrashX,
	IconTrashXFilled,
	IconUpload,
} from "@tabler/icons-react";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

type UploadProgress = {
	fileId: string;
	progress: number;
	completed: boolean;
	error?: string;
};

type FileMetadata = {
	name: string;
	size: number;
	type: string;
	url: string;
	id: string;
};

type GalleryUploaderProps = {
	initialImages?: Array<{ id: string; image_url: string }>;
	onUploadComplete?: (files: Array<any>) => void;
	maxFiles?: number;
	maxSizeMB?: number;
	title?: string;
};

const convertToFileMetadata = (
	images: Array<{ id: string; image_url: string }>,
): Array<FileMetadata> => {
	return images.map((img, index) => ({
		name: `image-${index + 1}.jpg`,
		size: 1500000 + index * 100000,
		type: "image/jpeg",
		url: img.image_url,
		id: img.id,
	}));
};

export const GalleryUploader = ({
	initialImages = [],
	onUploadComplete,
	maxFiles = 10,
	maxSizeMB = 5,
	title = "الصور",
}: GalleryUploaderProps) => {
	const maxSize = maxSizeMB * 1024 * 1024;

	const initialFiles = convertToFileMetadata(initialImages);

	const [uploadProgress, setUploadProgress] = useState<Array<UploadProgress>>([]);
	const [isUploading, setIsUploading] = useState(false);

	const [
		{ files, isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			clearFiles,
			getInputProps,
		},
	] = useFileUpload({
		accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
		maxSize,
		multiple: true,
		maxFiles,
		initialFiles,
		onFilesAdded: (addedFiles) => {
			const newProgressItems = addedFiles.map((file) => ({
				fileId: file.id,
				progress: 0,
				completed: false,
			}));

			setUploadProgress((prev) => [...prev, ...newProgressItems]);

			handleFileUpload(addedFiles);
		},
	});

	const handleFileUpload = async (filesToUpload) => {
		setIsUploading(true);

		// For each file, simulate an upload with progress
		const uploadPromises = filesToUpload.map((fileObj) => {
			return new Promise((resolve) => {
				if (!(fileObj.file instanceof File)) {
					// If it's already an uploaded file (from initialFiles), skip upload
					resolve({ id: fileObj.id, success: true });
					return;
				}

				let progress = 0;
				const interval = setInterval(() => {
					progress += 5;
					// Update progress for this file
					setUploadProgress((prev) =>
						prev.map((item) =>
							item.fileId === fileObj.id
								? { ...item, progress: Math.min(progress, 100) }
								: item,
						),
					);

					if (progress >= 100) {
						clearInterval(interval);
						// Mark as completed
						setUploadProgress((prev) =>
							prev.map((item) =>
								item.fileId === fileObj.id
									? { ...item, completed: true }
									: item,
							),
						);
						resolve({ id: fileObj.id, success: true });
					}
				}, 100);
			});
		});

		// Wait for all uploads to complete
		await Promise.all(uploadPromises);
		setIsUploading(false);

		// Notify parent component that upload is complete
		if (onUploadComplete) {
			onUploadComplete(files);
		}
	};

	const handleFileRemoved = (fileId: string) => {
		setUploadProgress((prev) => prev.filter((item) => item.fileId !== fileId));
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Drop area */}
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				data-dragging={isDragging || undefined}
				data-files={files.length > 0 || undefined}
				className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
			>
				<input
					{...getInputProps()}
					className="sr-only"
					aria-label={`رفع ${title}`}
				/>
				{files.length > 0 ? (
					<div className="flex w-full flex-col gap-3">
						<div className="flex items-center justify-between gap-2">
							<h3 className="truncate text-sm font-medium">
								{title} ({files.length})
							</h3>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={openFileDialog}>
									<IconUpload
										className="size-3.5 opacity-60"
										aria-hidden="true"
									/>
									إضافة المزيد
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setUploadProgress([]);
										clearFiles();
									}}
								>
									<IconTrashX
										className="size-3.5 opacity-60"
										aria-hidden="true"
									/>
									حذف الكل
								</Button>
							</div>
						</div>

						<div className="w-full space-y-2">
							{files.map((file) => {
								const fileProgress = uploadProgress.find(
									(p) => p.fileId === file.id,
								);
								const isUploadingFile = fileProgress && !fileProgress.completed;

								return (
									<div
										key={file.id}
										data-uploading={isUploadingFile || undefined}
										className="bg-background flex flex-col gap-1 rounded-lg border p-2 pe-3 transition-opacity duration-300"
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-3 overflow-hidden data-[uploading=true]:opacity-50">
												<div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
													{file.preview ? (
														<img
															src={file.preview}
															alt={file.file.name}
															className="size-full rounded-[inherit] object-cover"
														/>
													) : (
														<IconPhoto className="size-5" />
													)}
												</div>
												<div className="flex min-w-0 flex-col gap-0.5">
													<p className="truncate text-[13px] font-medium">
														{file.file instanceof File
															? file.file.name
															: file.file.name}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatBytes(
															file.file instanceof File
																? file.file.size
																: file.file.size,
														)}
													</p>
												</div>
											</div>
											<Button
												size="icon"
												variant="ghost"
												className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
												onClick={() => {
													handleFileRemoved(file.id);
													removeFile(file.id);
												}}
												aria-label="حذف الملف"
											>
												<IconPhotoX className="size-4" aria-hidden="true" />
											</Button>
										</div>

										{/* Upload progress bar */}
										{fileProgress &&
											(() => {
												const progress = fileProgress.progress || 0;
												const completed = fileProgress.completed || false;

												if (completed) return null;

												return (
													<div className="mt-1 flex items-center gap-2">
														<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
															<div
																className="bg-primary h-full transition-all duration-300 ease-out"
																style={{ width: `${progress}%` }}
															/>
														</div>
														<span className="text-muted-foreground w-10 text-xs tabular-nums">
															{progress}%
														</span>
													</div>
												);
											})()}
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center px-4 py-3 text-center">
						<div
							className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
							aria-hidden="true"
						>
							<IconPhoto className="size-4 opacity-60" />
						</div>
						<p className="mb-1.5 text-sm font-medium">اسحب الصور إلى هنا</p>
						<p className="text-muted-foreground text-xs">
							SVG, PNG, JPG أو GIF (الحد الأقصى: {maxSizeMB}MB)
						</p>
						<Button variant="outline" className="mt-4" onClick={openFileDialog}>
							<IconUpload className="size-5 opacity-60" aria-hidden="true" />
							اختيار الصور
						</Button>
					</div>
				)}
			</div>

			{errors.length > 0 && (
				<div
					className="text-destructive flex items-center gap-1 text-xs"
					role="alert"
				>
					<IconAlertCircle className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</div>
			)}

			{/* Submit button */}
			{files.length > 0 && (
				<Button className="mt-4" disabled={isUploading}>
					{isUploading ? <Icons.spinner /> : "حفظ الصور"}
				</Button>
			)}
		</div>
	);
};

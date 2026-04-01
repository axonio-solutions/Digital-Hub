import { IconLoader } from "@tabler/icons-react";
import { CheckCircle, File, Upload, X } from "lucide-react";
import {
	
	createContext,
	useCallback,
	useContext
} from "react";
import { Icons } from "./icons";
import type {PropsWithChildren} from "react";
import type { UseSupabaseUploadReturn } from "@/hooks/use-supabase-upload";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const formatBytes = (
	bytes: number,
	decimals = 2,
	size?: "bytes" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB",
) => {
	const k = 1000;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	if (bytes === 0 || bytes === undefined)
		return size !== undefined ? `0 ${size}` : "0 bytes";
	const i =
		size !== undefined
			? sizes.indexOf(size)
			: Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

type DropzoneContextType = Omit<
	UseSupabaseUploadReturn,
	"getRootProps" | "getInputProps"
>;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
	undefined,
);

type DropzoneProps = UseSupabaseUploadReturn & {
	className?: string;
};

const Dropzone = ({
	className,
	children,
	getRootProps,
	getInputProps,
	...restProps
}: PropsWithChildren<DropzoneProps>) => {
	const isSuccess = restProps.isSuccess;
	const isActive = restProps.isDragActive;
	const isInvalid =
		(restProps.isDragActive && restProps.isDragReject) ||
		(restProps.errors.length > 0 && !restProps.isSuccess) ||
		restProps.files.some((file) => file.errors.length !== 0);

	return (
		<DropzoneContext.Provider value={{ ...restProps }}>
			<div
				{...getRootProps({
					className: cn(
						"border border-gray-300 rounded-lg p-6 text-center bg-card transition-colors duration-300 text-foreground",
						className,
						isSuccess ? "border-solid" : "border-dashed",
						isActive && "border-primary bg-primary/10",
						isInvalid && "border-destructive bg-destructive/10",
					),
				})}
			>
				<input {...getInputProps()} />
				{children}
			</div>
		</DropzoneContext.Provider>
	);
};
const DropzoneContent = ({ className }: { className?: string }) => {
	const {
		files,
		setFiles,
		onUpload,
		loading,
		successes,
		errors,
		maxFileSize,
		maxFiles,
		isSuccess,
	} = useDropzoneContext();

	const exceedMaxFiles = files.length > maxFiles;

	const handleRemoveFile = useCallback(
		(fileName: string) => {
			setFiles(files.filter((file) => file.name !== fileName));
		},
		[files, setFiles],
	);

	if (isSuccess) {
		return (
			<div
				className={cn(
					"flex flex-row items-center gap-x-2 justify-center",
					className,
				)}
			>
				<CheckCircle size={16} className="text-primary" />
				<p className="text-primary text-sm">
					{files.length > 1
						? `تم رفع ${files.length} ملفات بنجاح`
						: "تم رفع الملف بنجاح"}
				</p>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col", className)}>
			{files.map((file, idx) => {
				const fileError = errors.find((e) => e.name === file.name);
				const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

				return (
					<div
						key={`${file.name}-${idx}`}
						className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4 "
					>
						{file.type.startsWith("image/") ? (
							<div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
								<img
									src={file.preview}
									alt={file.name}
									className="object-cover"
								/>
							</div>
						) : (
							<div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
								<File size={18} />
							</div>
						)}

						<div className="shrink grow flex flex-col items-start truncate">
							<p title={file.name} className="text-sm truncate max-w-full">
								{file.name}
							</p>
							{file.errors.length > 0 ? (
								<p className="text-xs text-destructive">
									{file.errors
										.map((e) =>
											e.message.startsWith("File is larger than")
												? `حجم الملف أكبر من ${formatBytes(maxFileSize, 2)} (الحجم: ${formatBytes(file.size, 2)})`
												: e.message,
										)
										.join(", ")}
								</p>
							) : loading && !isSuccessfullyUploaded ? (
								<p className="text-xs text-muted-foreground">
									جاري رفع الملف...
								</p>
							) : fileError ? (
								<p className="text-xs text-destructive">
									فشل في الرفع: {fileError.message}
								</p>
							) : isSuccessfullyUploaded ? (
								<p className="text-xs text-primary">تم رفع الملف بنجاح</p>
							) : (
								<p className="text-xs text-muted-foreground">
									{formatBytes(file.size, 2)}
								</p>
							)}
						</div>

						{!loading && !isSuccessfullyUploaded && (
							<Button
								size="icon"
								variant="link"
								className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
								onClick={() => handleRemoveFile(file.name)}
							>
								<X />
							</Button>
						)}
					</div>
				);
			})}
			{exceedMaxFiles && (
				<p className="text-sm text-right mt-2 text-destructive">
					يمكنك رفع {maxFiles} {maxFiles > 1 ? "ملفات" : "ملف"} كحد أقصى، الرجاء
					إزالة {files.length - maxFiles}{" "}
					{files.length - maxFiles > 1 ? "ملفات" : "ملف"}.
				</p>
			)}
			{files.length > 0 && !exceedMaxFiles && (
				<div className="mt-2">
					<Button
						variant="outline"
						onClick={onUpload}
						disabled={files.some((file) => file.errors.length !== 0) || loading}
					>
						{loading ? <Icons.spinner /> : <>رفع الملفات</>}
					</Button>
				</div>
			)}
		</div>
	);
};

const DropzoneEmptyState = ({ className }: { className?: string }) => {
	const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext();

	if (isSuccess) {
		return null;
	}

	return (
		<div className={cn("flex flex-col items-center gap-y-2", className)}>
			<Upload size={20} className="text-muted-foreground" />
			<p className="text-sm">
				{!!maxFiles && maxFiles > 1 ? `رفع ${maxFiles} ملفات` : "رفع ملف"}
			</p>
			<div className="flex flex-col items-center gap-y-1">
				<p className="text-xs text-muted-foreground">
					اسحب و أفلت أو
					<Button
						onClick={() => inputRef.current?.click()}
						variant="link"
						className="px-1 cursor-pointer"
					>
						{maxFiles === 1 ? "اختر ملف" : "اختر ملفات"}
					</Button>
					للرفع
				</p>
				{maxFileSize !== Number.POSITIVE_INFINITY && (
					<p className="text-xs text-muted-foreground">
						الحد الأقصى لحجم الملف:
						<span dir="ltr" className="me-1 font-bold text-black">
							{formatBytes(maxFileSize, 2)}
						</span>
					</p>
				)}
			</div>
		</div>
	);
};

const useDropzoneContext = () => {
	const context = useContext(DropzoneContext);

	if (!context) {
		throw new Error("useDropzoneContext must be used within a Dropzone");
	}

	return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };

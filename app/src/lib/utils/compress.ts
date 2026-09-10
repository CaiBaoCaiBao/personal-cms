import imageCompression, {
    type Options
} from 'browser-image-compression';
import { AppError } from './errors/app-error';

const compressOptions = (): Options => {
    return {
        maxSizeMB: 2,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
    }
}

type CompressImageProps = {
    file: File;
    options?: Options;
}

export async function compressImage({ file, options }: CompressImageProps): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }
    try {
        const compressedFile = await imageCompression(file, options || compressOptions());
        const ext = compressedFile.type === "image/webp" ? ".webp" : file.type;
        return new File([compressedFile], file.name.replace(/\.\w+$/i, ext), { type: compressedFile.type },);
    } catch (e) {
        throw new AppError("INTERNAL_ERROR", "Failed to compress image");
    }
}
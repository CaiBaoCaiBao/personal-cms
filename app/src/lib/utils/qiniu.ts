import qiniu from "qiniu";

export class Qiniu {
    public static readonly UPLOAD_HOST = "https://upload-z2.qiniup.com" as const;

    static getFileHash(file: File) {
       
    }

    /** @description 构建对象键 */
    static buildObjectKey(id: string, filename: string) {
        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dot = filename.lastIndexOf(".");
        const ext = dot > 0 ? filename.substring(dot).toLowerCase() : "";
        return `${yyyy}/${mm}/${id}${ext}`;
    }

}
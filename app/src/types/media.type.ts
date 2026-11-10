import { FieldOutputTypes } from "@/prisma/contract";
import { columns } from "@/lib/utils";

type MediaFolderOutput = FieldOutputTypes["public"]["MediaFolder"];
type MediaAssetOutput = FieldOutputTypes["public"]["MediaAsset"];
type MediaFileOutput = FieldOutputTypes["public"]["MediaFile"];
type MediaVariantOutput = FieldOutputTypes["public"]["MediaVariant"];

type Row<Model, Fields extends readonly (keyof Model)[]> = Pick<Model, Fields[number]>;
type FileWithVariants<
    FileFields extends readonly (keyof MediaFileOutput)[],
    VariantFields extends readonly (keyof MediaVariantOutput)[],
> = Row<MediaFileOutput, FileFields> & {
    variants: Row<MediaVariantOutput, VariantFields>[];
};

const folderColumns = columns<MediaFolderOutput>();
const assetColumns = columns<MediaAssetOutput>();
const fileColumns = columns<MediaFileOutput>();
const variantColumns = columns<MediaVariantOutput>();

export const mediaFolderListFields = folderColumns("id", "name");
export type MediaFolderList = Row<MediaFolderOutput, typeof mediaFolderListFields>;

export const mediaThumbFields = variantColumns("url", "mime", "width", "height");

export const mediaAssetListFields = assetColumns(
    "id",
    "title",
    "kind",
    "status",
    "createdAt",
);
export const mediaAssetListFileFields = fileColumns("status");
export type MediaAssetList = Row<MediaAssetOutput, typeof mediaAssetListFields> & {
    currentFile: FileWithVariants<typeof mediaAssetListFileFields, typeof mediaThumbFields> | null;
};

export const mediaAssetDetailFields = assetColumns(
    ...mediaAssetListFields,
    "description",
    "updatedAt",
);
export const mediaAssetDetailFileFields = fileColumns(
    "id",
    "version",
    "status",
    "originalName",
    "mime",
    "url",
    "size",
    "width",
    "height",
    "durationMs",
    "createdAt",
);
export const mediaAssetDetailFileVariantFields = variantColumns(
    "id",
    "purpose",
    "url",
    "mime",
    "size",
    "width",
    "height",
);
export const mediaAssetDetailFilesFields = fileColumns(
    "id",
    "version",
    "status",
    "originalName",
    "mime",
    "size",
    "width",
    "height",
    "createdAt",
);
export type MediaAssetDetail = Row<MediaAssetOutput, typeof mediaAssetDetailFields> & {
    currentFile: FileWithVariants<
        typeof mediaAssetDetailFileFields,
        typeof mediaAssetDetailFileVariantFields
    > | null;
    files: FileWithVariants<typeof mediaAssetDetailFilesFields, typeof mediaThumbFields>[];
};

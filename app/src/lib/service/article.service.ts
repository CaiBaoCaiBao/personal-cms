import "server-only";
import {
    ArticleDao,
    ArticleInput,
    ContentDao,
    JsonContentDao,
    HtmlContentDao,
    type ContentInput,
} from "../dao";
import {
    generateSlug,
    nextSlug
} from "../utils/server";
import {
    ArticleDTO,
    ArticleQueryDTO,
} from "../schema/content/article.schema";
import { ContentQueryDTO } from "../schema/content/content.schema";
import { PaginationDTO } from "../schema/globals.schema";
import { ContentService } from "./content.service";
import { db } from "@/prisma/db";
import { NotFoundError } from "../errors";
import { PaginationResponse } from "@/types/globals.type";
import {
    ArticleDetailVO,
    ArticleListVO
} from "@/types/content.type";

export class ArticleService {
    /** @description 创建文章 */
    static async create(dto: ArticleDTO): Promise<void> {
        const contentData: ContentInput = {
            status: dto.status,
            type: dto.type,
            title: dto.title ?? "Untitled",
            publishedAt: dto.status === "PUBLISHED" ? new Date().toISOString() : null,
            archivedAt: null,
            articleId: null,
        }
        await db.transaction(async (): Promise<void> => {
            const contentId = await ContentDao.insert(contentData);
            const base = dto.title ? generateSlug(dto.title) || contentId : contentId;
            const slug = base === contentId ? contentId : nextSlug(base, await ArticleDao.listSlugs(base));
            const articleData: ArticleInput = {
                contentId,
                coverImgId: dto.coverImgId,
                slug,
            }
            const articleId = await ArticleDao.insert(articleData);
            await Promise.all([
                ContentDao.update(contentId, { articleId }),
                dto.jsonContent != null
                    ? JsonContentDao.insert({ contentId, body: JSON.parse(dto.jsonContent) })
                    : undefined,
                dto.htmlContent != null
                    ? HtmlContentDao.insert({ contentId, body: dto.htmlContent })
                    : undefined,
            ]);
        })
    }
    /** @description 更新文章 */
    static async update(id: string, dto: ArticleDTO): Promise<void> {
        const article = await ArticleDao.findById(id);
        if (!article) throw new NotFoundError("ARTICLE", "Article is not found");
        const content = await ContentDao.findById(article.contentId);
        if (!content) throw new NotFoundError("CONTENT", "Content is not found");
        const base = dto.title ? generateSlug(dto.title) : "";
        const slug = !base || base === article.slug
            ? article.slug
            : nextSlug(base, (await ArticleDao.listSlugs(base)).filter((item) => item !== article.slug));
        const jsonBody = dto.jsonContent == null ? null : JSON.parse(dto.jsonContent);
        await db.transaction(async () => {
            await ContentDao.update(content.id, {
                title: dto.title ?? "Untitled",
                type: dto.type,
                status: dto.status,
                publishedAt: dto.status === "PUBLISHED"
                    ? content.publishedAt ?? new Date().toISOString()
                    : content.publishedAt,
            });
            await ArticleDao.update(article.id, {
                slug,
                coverImgId: dto.coverImgId,
            });
            await ContentService.syncJson(content.id, jsonBody);
            await ContentService.syncHtml(content.id, dto.htmlContent);
        })
    }

    /** @description 分页查询文章列表 */
    static async pagination(dto: ArticleQueryDTO, page: PaginationDTO): Promise<PaginationResponse<ArticleListVO>> {
        const contentQuery: ContentQueryDTO = {
            title: dto.title,
            type: dto.type,
            status: dto.status,
        }
        const { list, total } = await ContentDao.query(contentQuery, page);
        if (list.length === 0) {
            return { data: [], total, pageIndex: page.pageIndex, pageSize: page.pageSize };
        }
        const articles = await ArticleDao.listByContentIds(list.map((item) => item.id));
        const articlesByContentId = new Map(articles.map((article) => [article.contentId, article]));
        const data = list.map((content) => {
            const article = articlesByContentId.get(content.id);
            if (!article) throw new NotFoundError("ARTICLE", "Article is not found");
            return {
                ...content,
                slug: article.slug,
                coverImgId: article.coverImgId,
            };
        });
        return {
            data,
            total,
            pageIndex: page.pageIndex,
            pageSize: page.pageSize,
        };
    }

    /** @description 删除文章 */
    static async remove(id: string): Promise<void> {
        await db.transaction(async () => {
            const article = await ArticleDao.findById(id);
            if (!article) throw new NotFoundError("ARTICLE", "Article is not found");
            await ContentDao.delete(article.contentId);
        })
    }

    /** @description 获取文章详情 */
    static async getItem(id: string): Promise<ArticleDetailVO> {
        const article = await ArticleDao.findById(id);
        if (!article) throw new NotFoundError("ARTICLE", "Article is not found");

        const content = await ContentDao.findById(article.contentId);
        if (!content) throw new NotFoundError("CONTENT", "Content is not found");

        const [json, html] = await Promise.all([
            JsonContentDao.findByContentId(content.id),
            HtmlContentDao.findByContentId(content.id),
        ]);

        return {
            id: article.id,
            contentId: content.id,
            slug: article.slug,
            coverImgId: article.coverImgId,
            title: content.title,
            type: content.type,
            status: content.status,
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
            publishedAt: content.publishedAt,
            jsonContent: json ? JSON.stringify(json.body) : null,
            htmlContent: html?.body ?? null,
        };
    }
}
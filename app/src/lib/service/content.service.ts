import "server-only";

import {
    JsonContentDao,
    HtmlContentDao,
    type JsonContentInput,
} from "../dao";

export class ContentService{
    static async syncJson(contentId: string, body: JsonContentInput["body"] | null): Promise<void> {
        if (body == null) {
            await JsonContentDao.delete(contentId);
            return;
        }
        const existing = await JsonContentDao.findByContentId(contentId);
        if (existing) {
            await JsonContentDao.update(contentId, { body });
            return;
        }
        await JsonContentDao.insert({ contentId, body });
    }
    
    static async syncHtml(contentId: string, body: string | null): Promise<void> {
        if (body == null) {
            await HtmlContentDao.delete(contentId);
            return;
        }
        const existing = await HtmlContentDao.findByContentId(contentId);
        if (existing) {
            await HtmlContentDao.update(contentId, { body });
            return;
        }
        await HtmlContentDao.insert({ contentId, body });
    }
}
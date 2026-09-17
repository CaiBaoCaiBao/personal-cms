import {
    realmPlugin,
    addActivePlugin$,
    addLexicalNode$,
    addImportVisitor$,
    addExportVisitor$,
} from '@mdxeditor/editor';

export const myPlugin = realmPlugin<{ /* 可选参数 */ }>({
    init(realm, params) {
        // 挂载时：注册节点、Markdown 导入/导出、UI 等
        realm.pubIn({
            [addActivePlugin$]: 'my-plugin',
            // [addLexicalNode$]: MyNode,
            // [addImportVisitor$]: MdastMyVisitor,
            // [addExportVisitor$]: LexicalMyVisitor,
        })
    },
    postInit(realm, params) {
        // 所有插件 init 之后
    },
    update(realm, params) {
        // 每次重渲染，可更新参数对应的 cell/signal
    },
})
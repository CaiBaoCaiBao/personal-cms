type TreeNodeBase = {
  id: string;
  parentId: string;
};

export type TreeNode<T extends TreeNodeBase> = T & {
  children: TreeNode<T>[];
};

/**
 * 扁平列表 → 树
 * @param list 扁平节点（需含 id / parentId）
 * @param rootParentId 根节点的 parentId，分类场景一般为 ""
 */
export function buildTree<T extends TreeNodeBase>(
  list: T[],
  rootParentId: string = "",
): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];
  // 先建所有节点，保证挂子时父节点已存在
  for (const item of list) {
    map.set(item.id, { ...item, children: [] });
  }
  for (const item of list) {
    const node = map.get(item.id)!;
    if (item.parentId === rootParentId || !map.has(item.parentId)) {
      // 无父 / 父不在本批数据 → 当作根（或孤儿挂顶层）
      roots.push(node);
    } else {
      map.get(item.parentId)!.children.push(node);
    }
  }
  return roots;
}

type FilterableTreeNode<T> = T & { children?: FilterableTreeNode<T>[] };

/**
 * 按谓词过滤树：自身命中则保留整棵子树；仅后代命中则保留祖先路径。
 */
export function filterTree<T>(
  nodes: FilterableTreeNode<T>[],
  predicate: (node: FilterableTreeNode<T>) => boolean,
): FilterableTreeNode<T>[] {
  const result: FilterableTreeNode<T>[] = [];
  for (const node of nodes) {
    const children = node.children ?? [];
    if (predicate(node)) {
      result.push(node);
      continue;
    }
    const filteredChildren = filterTree(children, predicate);
    if (filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}
# 数据库设计

## 1. SystemRouter

| 字段 | 类型 | 默认值 | 备注 |
| :---: | :---: | :---: | :---: |
| id | string | - | 路由ID |
| name | string | - | 路由名称 |
| path | string? | - | 路由路径 |
| icon | string? | - | 路由图标 |
| parentId | string? | - | 父级ID |
| routeType | string | page | 路由类型 |
| sortOrder | number | 0 | 排序 |
| isFold | boolean? | false | 是否折叠 |
| isActive | boolean | true | 是否启用该路由 |
| createdAt | string | now() | 创建时间 |
| modifiedAt | string? | update | 编辑时间 |
| removedAt | string? | - | 删除时间 |
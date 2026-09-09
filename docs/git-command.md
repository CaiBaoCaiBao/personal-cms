# git约定式提交规范

## 为什么使用约定式提交规范？

- 自动化生成 CHANGELOG。
- 基于提交的类型，自动决定语义化的版本变更。
- 向同事、公众与其他利益关系者传达变化的性质。
- 触发构建和部署流程。
- 让人们探索一个更加结构化的提交历史，以便降低对你的项目做出贡献的难度。

## 提交格式

``` bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 说明

1. `fix`: 类型 为 `fix` 的提交表示在代码库中修复了一个 bug。
2. `feat`: 类型 为 `feat` 的提交表示在代码库中新增了一个功能。
3. `BREAKING CHANGE`: 在脚注中包含 `BREAKING CHANGE:` 或 <类型>(范围) 后面有一个 `!` 的提交，表示引入了破坏性 API 变更。 破坏性变更可以是任意 类型 提交的一部分。
4. 除 `fix:` 和 `feat:` 之外，也可以使用其它提交 类型 ，例如 [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)（基于 [Angular](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) 约定）中推荐的 `build:`、`chore:`、 `ci:`、`docs:`、`style:`、`refactor:`、`perf:`、`test:`，等等。

- build: 用于修改项目构建系统，例如修改依赖库、外部接口或者升级 Node 版本等；
- chore: 用于对非业务性代码进行修改，例如修改构建流程或者工具配置等；
- ci: 用于修改持续集成流程，例如修改 Travis、Jenkins 等工作流配置；
- docs: 用于修改文档，例如修改 README 文件、API 文档等；
- style: 用于修改代码的样式，例如调整缩进、空格、空行等；
- refactor: 用于重构代码，例如修改代码结构、变量名、函数名等但不修改功能逻辑；
- perf: 用于优化性能，例如提升代码的性能、减少内存占用等；
- test: 用于修改测试用例，例如添加、删除、修改代码的测试用例等。

1. 脚注中除了 `BREAKING CHANGE: <description>` ，其它条目应该采用类似 **git trailer format** 这样的惯例。

其它提交类型在约定式提交规范中并没有强制限制，并且在语义化版本中没有隐式影响（除非它们包含 BREAKING CHANGE）。 可以为提交类型添加一个围在圆括号内的范围，以为其提供额外的上下文信息。例如 `feat(parser): adds ability to parse arrays.`。

## 示例

### [包含了描述并且脚注中有破坏性变更的提交说明](#包含了描述并且脚注中有破坏性变更的提交说明)

``` bash
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### [包含了`!`字符以提醒注意破坏性变更的提交说明](#包含了字符以提醒注意破坏性变更的提交说明)

``` bash
feat!: send an email to the customer when a product is shipped
```

### [包含了范围和破坏性变更 `!` 的提交说明](#包含了范围和破坏性变更--的提交说明)

feat(api)!: send an email to the customer when a product is shipped

### [包含了 `!` 和 BREAKING CHANGE 脚注的提交说明](#包含了--和-breaking-change-脚注的提交说明)

``` bash
feat!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

### [不包含正文的提交说明](#不包含正文的提交说明)

``` bash
docs: correct spelling of CHANGELOG
```

### [包含范围的提交说明](#包含范围的提交说明)

``` bash
feat(lang): add polish language
```

### [包含多行正文和多行脚注的提交说明](#包含多行正文和多行脚注的提交说明)

``` bash
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

## 参考文献

- Conventional Commits_[中文](https://www.conventionalcommits.org/zh-hans/v1.0.0/)-[英文](https://www.conventionalcommits.org/en/v1.0.0/)


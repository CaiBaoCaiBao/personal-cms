# Git 提交约定文档

## 做什么

- 基于提交的类型，自主决定语义化的版本变更
- 向公众、相关利益关系者传达项目实质性的变化
- 向查看者提供结构化的提交历史，降低对项目做出贡献的难度
- 以便自动化生成 changelog

## 如何使用

### 结构

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 说明

1. **fix**: <i>类型</i> 为 `fix` 的提交表示在代码库中修复了一个 bug。
2. **feat**: <i>类型</i> 为 `feat` 的提交表示在代码库中新增了一个功能。
3. **BREAKING** CHANGE: 在脚注中包含 `BREAKING CHANGE:` 或 <类型>(范围) 后面有一个 `!` 的提交，表示引入了破坏性 API 变更。 破坏性变更可以是任意 <i>类型</i> 提交的一部分。
4. 除 `fix`: 和 `feat:` 之外，也可以使用其它提交 <i>类型</i> ，例如 [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)（基于 [Angular 约定](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)）中推荐的 `build:`、`chore:`、 `ci:`、`docs:`、`style:`、`refactor:`、`perf:`、`test:`，等等。
    - build: 用于修改项目构建系统，例如修改依赖库、外部接口或者升级 Node 版本等；
    - chore: 用于对非业务性代码进行修改，例如修改构建流程或者工具配置等；
    - ci: 用于修改持续集成流程，例如修改 Travis、Jenkins 等工作流配置；
    - docs: 用于修改文档，例如修改 README 文件、API 文档等；
    - style: 用于修改代码的样式，例如调整缩进、空格、空行等；
    - refactor: 用于重构代码，例如修改代码结构、变量名、函数名等但不修改功能逻辑；
    - perf: 用于优化性能，例如提升代码的性能、减少内存占用等；
    - test: 用于修改测试用例，例如添加、删除、修改代码的测试用例等。
5. 脚注中除了 `BREAKING CHANGE: <description>` ，其它条目应该采用类似 [git trailer format](https://git-scm.com/docs/git-interpret-trailers) 这样的惯例。

其它提交类型在约定式提交规范中并没有强制限制，并且在语义化版本中没有隐式影响（除非它们包含 BREAKING CHANGE）。 可以为提交类型添加一个围在圆括号内的范围，以为其提供额外的上下文信息。例如 `feat(parser): adds ability to parse arrays.`。

### 示例

#### [包含了描述并且脚注中有破坏性变更的提交说明](#包含了描述并且脚注中有破坏性变更的提交说明)

``` bash
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

#### [包含了 ! 字符以提醒注意破坏性变更的提交说明](#包含了--字符以提醒注意破坏性变更的提交说明)

``` bash
feat!: send an email to the customer when a product is shipped
```

#### [包含了范围和破坏性变更 ! 的提交说明](#包含了范围和破坏性变更--的提交说明)

``` bash
feat(api)!: send an email to the customer when a product is shipped
```

#### [包含了 ! 和 BREAKING CHANGE 脚注的提交说明](#包含了--和-breaking-change-脚注的提交说明)

``` bash
feat!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

#### [不包含正文的提交说明](#不包含正文的提交说明)

``` bash
docs: correct spelling of CHANGELOG
```

#### [包含范围的提交说明](#包含范围的提交说明)

``` bash
feat(lang): add polish language
```

#### [包含多行正文和多行脚注的提交说明](#包含多行正文和多行脚注的提交说明)

``` bash
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

## 规范

1. 每个提交都**必须**使用类型字段前缀，它由一个名词构成，诸如 `feat` 或 `fix` ， 其后接**可选的**范围字段，**可选的** `!`，以及**必要**的冒号（英文半角）和空格。
2. 当一个提交为应用或类库实现了新功能时，**必须**使用 `feat` 类型。
3. 当一个提交为应用修复了 bug 时，**必须**使用 `fix` 类型。
4. 范围字段**可以**跟随在类型字段后面。范围**必须**是一个描述某部分代码的名词，并用圆括号包围，例如： `fix(parser)`:
5. 描述字段**必须**直接跟在 <类型>(范围) 前缀的冒号和空格之后。 描述指的是对代码变更的简短总结，例如： <i>fix: array parsing issue when multiple spaces were contained in string</i> 。
6. 在简短描述之后，**可以**编写较长的提交正文，为代码变更提供额外的上下文信息。正文**必须**起始于描述字段结束的一个空行后。
7. 提交的正文内容自由编写，并**可以**使用空行分隔不同段落。
8. 在正文结束的一个空行之后，**可以**编写一行或多行脚注。每行脚注都**必须**包含 一个令牌（token），后面紧跟 `:<space>` 或 `<space>#` 作为分隔符，后面再紧跟令牌的值（受 **git trailer convention** 启发）。
9. 脚注的令牌**必须**使用 `-` 作为连字符，比如 `Acked-by` (这样有助于 区分脚注和多行正文)。有一种例外情况就是 `BREAKING CHANGE`，它**可以**被认为是一个令牌。
10. 脚注的值**可以**包含空格和换行，值的解析过程**必须**直到下一个脚注的令牌/分隔符出现为止。
11. 破坏性变更**必须**在提交信息中标记出来，要么在 <类型>(范围) 前缀中标记，要么作为脚注的一项。
12. 包含在脚注中时，破坏性变更**必须**包含大写的文本 `BREAKING CHANGE`，后面紧跟着冒号、空格，然后是描述，例如： `BREAKING CHANGE: environment variables now take precedence over config files` 。
13. 包含在 <类型>(范围) 前缀时，破坏性变更**必须**通过把 ! 直接放在 `:` 前面标记出来。 如果使用了 `!`，那么脚注中**可以**不写 `BREAKING CHANGE:`， 同时提交信息的描述中**应该**用来描述破坏性变更。
14. 在提交说明中，**可以**使用 `feat` 和 `fix` 之外的类型，比如：`docs: updated ref docs.` 。
15. 工具的实现必须**不区分**大小写地解析构成约定式提交的信息单元，只有 BREAKING CHANGE **必须**是大写的。
16. BREAKING-CHANGE 作为脚注的令牌时**必须**是 BREAKING CHANGE 的同义词。

## 参考文献

1. Conventional Commits_[zh-CN](https://www.conventionalcommits.org/zh-hans/v1.0.0/)-[en-US](https://www.conventionalcommits.org/en/v1.0.0/)
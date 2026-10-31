# OpenAISupporter 0.2.0 candidate

Aide 的 OpenAI 价格支持插件，沿用 [DeepSeekSupporter](https://github.com/skyelan1999/aide-pkg-DeepSeekSupporter) 的数据档案结构。MIT 许可，非 OpenAI 官方产品。

安装并启用后，Aide 读取离线 `provider-support.json`，为官方端点和已列出的模型提供 **USD／百万 token** 费率、缓存命中价格和长上下文阶梯。插件不注册 AI 工具，不接触 API Key。聊天、模型列表同步和凭证管理继续使用 Aide 原有功能。

## 安装

需要包含 `provider-browser-balance-v1` 能力的 Aide 源码构建或兼容发行版（发行版门槛 0.1.17.6 RC2）。旧宿主请继续使用 0.1.0。美元计价支持提交 [`40b6e96`](https://github.com/skyelan1999/aide/commit/40b6e96bead57e19f2f4e5121b147df0a1aeb1db)。旧宿主不支持本档案的 USD 币种；请先升级宿主。

在 [Aide 插件市场](https://skyelan1999.github.io/aide-pkg-shop/) 搜索 `OpenAISupporter`，安装并启用。也可从 [Release v0.1.0](https://github.com/skyelan1999/aide-pkg-OpenAISupporter/releases/tag/v0.1.0) 下载 ZIP，在 Aide 插件面板导入。

在 Aide 的模型提供商设置中配置 `https://api.openai.com/v1` 及自己的 API Key，再同步或填写所需模型。只有该 HTTPS 官方端点及以下精确模型 ID 命中档案；第三方代理、Azure、区域端点、未知别名和其他模型沿用宿主的手动费率。模型可用性以账户权限和官方返回结果为准。

## 价格快照

核验日期：**2026-10-30**。以下是短上下文 Standard 美元单价，不换算人民币。

| 模型 ID | 输入 | 缓存命中输入 | 输出 |
| --- | ---: | ---: | ---: |
| gpt-6-astra | 10 | 1 | 50 |
| gpt-6.1-sol | 2 | 0.10 | 10 |
| gpt-6.1-terra | 1 | 0.05 | 5 |
| gpt-6-luna | 0.10 | 0.01 | 0.50 |

整次请求输入 **超过 272,000 token** 时，输入和缓存命中单价乘 2，输出单价乘 1.5；档案上限为 1,050,000 输入 token，超过上限不猜测价格。规则和原价来源分别见 [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)、[Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)、[Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra)、[Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)。

这是 token 费用估算，不替代账单。缓存写入、工具调用、音频／图像生成、Batch／Flex／Fast／Ultrafast、地区溢价、税费、订阅额度和合同折扣不在本档案中。缺少缓存拆分时由宿主按未命中估算。实际请求采用其他服务等级时，请勿将 Standard 估算视为该等级账单。运行时不抓取价格，调价通过新插件版本交付。宿主按调用保存币种和价格快照，USD 与 CNY 分别汇总。

## 余额与凭证

本候选版由插件声明官网页面、金额标签、账户标签、可见项目设置链接和 300 秒查询周期。兼容的 **macOS Aide + Safari** 可在账户卡片点击「关联官网余额」：复用现有 Safari 登录，打开一个专用官网窗口。核对网站显示的组织/账户，确认它对应所选 API Key 后，Aide 每 5 分钟后台刷新该专用窗口并读取预付余额，不必每次手动同步。

请保持专用窗口打开。Safari 关闭、窗口关闭、登录失效、页面布局改变、账户标签或项目标识变化时停止返回当前余额，显示待恢复和最后时间。首次需为 Aide Computer Bridge 授予辅助功能权限。读取不使用屏幕截图、Cookie 导出或任意网页脚本；模型 Key 不发给原生读取器。API Key 与官网账户的关系由用户明确确认，不能通过显示名自动证明组织身份。

官方 [Costs API](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs) 查询已发生费用，不是预付余额。本方式是官网登录页面读取，受页面和 Safari 可访问性结构影响，不声称存在公开的 API 余额接口。插件仍是数据档案，不注册工具、不接触 API Key 或网页登录令牌。Windows/Linux 的网页同步尚不支持，原有计价能力保留。

此分支为开发候选，实际原生/Safari 验收和发布状态见中央 [issue #667](https://github.com/skyelan1999/aide/issues/667)。未发行、未更新市场。

## 开发与验证

```sh
npm test
python3 scripts/package.py
cd dist && shasum -a 256 -c SHA256SUMS
```

ZIP 使用显式白名单、固定时间戳和普通文件权限，不包含测试、Git、开发缓存或凭证。JavaScript／JSON 通用包无需区分 ARM64／AMD64；Release 和市场使用相同 ZIP 字节与 SHA-256。宿主验收样例位于 `test/host-acceptance.go.txt`，加载实际 ZIP 验证安装、启停、端点隔离、阶梯、缓存和 USD/CNY 记账，不调用真实账户或付费模型。

官方资料、版本边界和验收记录见 [调研记录](docs/RESEARCH-20261030.md)。

OpenAISupporter is a data-only Aide provider-pricing extension. It supplies a dated USD Standard snapshot for four exact official model IDs. Aide owns credentials and accounting. The data-only browser-balance declaration requires a compatible Aide host; no cookie or model key enters plugin JavaScript. No generation tool is registered. The identical architecture-independent package is distributed through GitHub Releases and the Aide marketplace.

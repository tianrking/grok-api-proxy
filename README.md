
# Grok API Proxy

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange) ![xAI](https://img.shields.io/badge/xAI-Grok-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 项目概述

`grok-api-proxy` 是一个基于 [Cloudflare Workers](https://workers.cloudflare.com/) 的代理服务，用于中转 [xAI Grok API](https://api.x.ai/) 请求。它利用 Cloudflare 的全球边缘网络加速对 `https://api.x.ai/v1/chat/completions` 的访问，客户端需提供自己的 xAI API 密钥，确保灵活性和安全性。

- **创建日期**: 2025年2月19日
- **部署地址**: [https://grok.bkgr.workers.dev/](https://grok.bkgr.workers.dev/)
- **GitHub**: [https://github.com/tianrking/grok-api-proxy](https://github.com/tianrking/grok-api-proxy)

## 功能

- **API 中转**: 将客户端请求转发到 xAI 的 Grok API。
- **加速访问**: 通过 Cloudflare 的 CDN 优化网络延迟。
- **密钥灵活性**: 支持客户端使用自己的 xAI API 密钥，无需在代理端存储。
- **流式/非流式支持**: 兼容 Grok API 的所有响应模式。

## 部署步骤

1. **创建 Worker**:
   - 登录 [Cloudflare 仪表板](https://dash.cloudflare.com/)，进入 “Workers & Pages” 页面。
   - 点击 “Create Worker”，粘贴 `worker.js` 中的代码。
   - 部署到你的 Workers 域名（例如 `grok.bkgr.workers.dev`）。

2. **无需配置密钥**:
   - 本项目不存储 xAI API 密钥，密钥由客户端通过 `Authorization` 请求头提供。

3. **绑定自定义域名（可选）**:
   - 在 “Triggers” 中添加自定义路由，如 `api.yourdomain.com/*`。

## 使用方法

### 测试接口

以下是一个使用 `curl` 测试代理服务的真实示例：

```bash
curl https://grok.bkgr.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-xai-api-key>" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are a test assistant."
      },
      {
        "role": "user",
        "content": "Testing. Just say hi and hello world and nothing else."
      }
    ],
    "model": "grok-2-latest",
    "stream": false,
    "temperature": 0
  }'
```

参数说明
URL: https://grok.bkgr.workers.dev/v1/chat/completions - 代理服务端点。
Authorization: 替换 <your-xai-api-key> 为你的 xAI API 密钥（例如 xai-XXXX）。
model: grok-2-latest - 当前映射到 grok-2-1212（2024年12月版本）。
stream: false 表示非流式响应，true 启用流式。
temperature: 0 确保输出一致性。

```json
json
{
  "id": "dccd196b-afb1-4adf-bd3f-c2cf3dc6f1cc",
  "object": "chat.completion",
  "created": 1740021634,
  "model": "grok-2-1212",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hi\nHello world",
        "refusal": null
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 28,
    "completion_tokens": 5,
    "total_tokens": 33,
    "prompt_tokens_details": {
      "text_tokens": 28,
      "audio_tokens": 0,
      "image_tokens": 0,
      "cached_tokens": 0
    }
  },
  "system_fingerprint": "fp_c612364da3"
}
```

说明:
"content": "Hi\nHello world" - 完全符合请求要求。
"created": 1740021634 - Unix 时间戳，对应 2025年2月19日。
"model": "grok-2-1212" - 表示 grok-2-latest 当前指向的版本。
错误示例
如果未提供有效密钥：

```json
json
{
  "error": "Missing or invalid Authorization header. Please provide a valid Bearer token."
}
```

## 注意事项
- 密钥权限: 确保你的 xAI API 密钥有权访问指定模型（如 grok-2-latest）。
- 模型名称: grok-2-latest 当前有效，若需使用其他模型（如 grok-3），请查阅 xAI API 文档。
- 流量限制: Cloudflare 免费计划每天10万次请求，超出需升级付费计划。
- 调试: 若遇到问题，可在 Worker 中添加 console.log 并查看 Cloudflare 日志。




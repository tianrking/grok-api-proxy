// worker.js - Cloudflare Worker 脚本，用于中转 xAI Grok API 请求
// 作者: w0x7ce
// 描述: 该脚本通过 Cloudflare Worker 提供 xAI Grok API 的代理服务，客户端需提供自己的 API 密钥。

// xAI Grok API 的官方端点
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * 处理传入的 HTTP 请求并转发到 xAI API
 * @param {Request} request - 客户端发来的请求对象
 * @returns {Response} - 转发后的响应或错误信息
 */
async function handleRequest(request) {
  // 从请求头中提取客户端提供的 Authorization（API 密钥）
  const clientAuth = request.headers.get('Authorization');
  
  // 检查是否提供了有效的 Bearer 密钥
  if (!clientAuth || !clientAuth.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        error: 'Missing or invalid Authorization header. Please provide a valid Bearer token.',
      }),
      {
        status: 401, // 未授权
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 复制客户端的请求头，并确保 Content-Type 为 JSON
  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');

  // 获取请求体（JSON 格式）
  const body = await request.text();

  // 构造转发请求，保持原始方法、头和体
  const proxyRequest = new Request(XAI_API_URL, {
    method: request.method,
    headers: headers,
    body: body,
  });

  // 转发请求到 xAI API 并获取响应
  const response = await fetch(proxyRequest);

  // 检查请求是否要求流式响应
  let stream = false;
  try {
    const requestData = JSON.parse(body);
    stream = requestData.stream || false;
  } catch (e) {
    // 如果 JSON 解析失败，默认非流式
    console.log('Failed to parse request body:', e);
  }

  // 根据 stream 参数返回流式或非流式响应
  if (stream) {
    // 流式响应：直接返回原始响应流
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } else {
    // 非流式响应：等待完整响应后返回
    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 监听 Cloudflare Worker 的 fetch 事件
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

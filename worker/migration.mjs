export const migrationReadOnly = env => env.MIGRATION_READ_ONLY === 'true'

export function migrationResponse(request, env, securityHeaders = {}) {
  if (!migrationReadOnly(env) || !new URL(request.url).pathname.startsWith('/api/') ||
      ['GET', 'HEAD'].includes(request.method)) return null
  return new Response(JSON.stringify({
    error: 'กำลังย้ายระบบชั่วคราว กรุณารอสักครู่แล้วลองใหม่ หรือติดต่อทางโทรศัพท์หรือ LINE'
  }), {status: 503, headers: {
    ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'Retry-After': '300'
  }})
}

import { NextRequest } from "next/server";

/**
 * 클라이언트 IP 주소를 추출합니다.
 * Vercel, Cloudflare 등 프록시 환경을 고려합니다.
 */
export function getClientIp(request: NextRequest): string {
  // Vercel/일반 프록시 환경
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for는 "client, proxy1, proxy2" 형태일 수 있음
    return forwardedFor.split(",")[0].trim();
  }

  // Vercel 전용 헤더
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Cloudflare 전용 헤더
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 로컬 개발 환경 fallback
  return "127.0.0.1";
}

/**
 * IP 주소를 마스킹합니다 (예: 123.456.***.***).
 * 개인정보 보호를 위해 어드민 UI에서 사용합니다.
 */
export function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  // IPv6 등 다른 형식은 앞 절반만 표시
  return ip.substring(0, Math.ceil(ip.length / 2)) + "***";
}

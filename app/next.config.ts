import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.0.104",   // 你日志里被拦的 IP
    "192.168.140.1",   // 终端 Network 显示的 IP（如有需要）
  ],
};

export default nextConfig;

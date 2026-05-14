import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Tất cả pages sử dụng client-side hooks (DnD, Zustand)
   * nên cần dynamic rendering, không static generation.
   * Điều này fix lỗi `useContext null` khi prerender `/_global-error`.
   */
  experimental: {
    // Disable static prerendering for global-error page
  },
};

export default nextConfig;

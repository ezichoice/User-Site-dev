/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    unoptimized: true,


    domains: [
      "aokwfioxeqahjifyoeau.supabase.co",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "api.ezichoice.lk",
      "sche-edu-lk.b-cdn.net",
    ],
  },
  env: {
    BASE_URL: "https://ezichoice.lk", // Replace with your production URL
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets `npm run dev` also serve http://127.0.0.1:3000, so a second account can log in there
  // (cookies are per host, so localhost and 127.0.0.1 keep separate sessions).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

// next.config.mjs
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

function buildCsp() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",                 // needed for PayPal SDK + styled-jsx
    'https://www.paypal.com',
    'https://*.paypal.com',            // NEW
    'https://www.paypalobjects.com',
    'https://*.paypalobjects.com',     // NEW
  ];
  if (!isProd) {
    scriptSrc.push("'unsafe-eval'");
  }

const connectSrc = [
  "'self'",
  'https://api.printify.com',
  'https://api-m.paypal.com',
  'https://api-m.sandbox.paypal.com',
  'https://www.paypal.com',
  'https://www.sandbox.paypal.com',  // ✅ add this
  'https://*.paypal.com',            // ✅ wildcard is safest
];

const frameSrc = [
  "'self'",
  'https://www.paypal.com',
  'https://www.sandbox.paypal.com',  // ✅ add this
  'https://*.paypal.com',
];


  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://images-api.printify.com',
    'https://images.printify.com',
    'https://www.paypalobjects.com',   // NEW
    'https://*.paypalobjects.com',     // NEW
  ];

  return [
    `default-src 'self';`,
    `base-uri 'self';`,
    `object-src 'none';`,
    `frame-ancestors 'none';`,
    `img-src ${imgSrc.join(' ')};`,
    `font-src 'self' data: https:;`,
    `style-src 'self' 'unsafe-inline';`,
    `script-src ${scriptSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `upgrade-insecure-requests;`,
  ].join(' ');
}


const securityHeaders = [
  { key: 'Content-Security-Policy', value: buildCsp() },
  { key: 'X-Frame-Options', value: 'DENY' },              // allow *your* pages to be framed by nobody
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-api.printify.com',
        pathname: '/mockup/**',
      },
      {
        protocol: 'https',
        hostname: 'images.printify.com',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Optional hardening (safe defaults)
  reactStrictMode: true,
  poweredByHeader: false,
  // productionBrowserSourceMaps: false, // uncomment to avoid leaking source maps
};

export default nextConfig;

intranet/src/
├── app/
│   ├── login/page.tsx
│   ├── [slug]/page.tsx                    # protegido, con botón lápiz
│   ├── editor/[slug]/page.tsx             # Puck + Editor.js
│   └── (admin)/
│       └── panel/page.tsx                 # SOLO enlace "Abrir panel de administración"
│                                           # hacia sitio-web-olo:3000/admin/panel — NO duplica el panel
├── features/
│   ├── paginas/                           # misma forma, usa @olo/blocks-renderer
│   └── auth/
├── middleware.ts                          # matcher: ['/:path*'] — TODO protegido, no hay zona pública
└── lib/
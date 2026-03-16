# pact.ar — Contexto del proyecto

## Qué es
SaaS de contratos digitales para Argentina. Permite a freelancers y comerciantes independientes crear, firmar y gestionar contratos digitales con validez legal.

## Stack
- **Frontend:** Next.js 15 + Tailwind CSS → Vercel
- **Backend:** Node.js + Express + TypeScript → Railway
- **Base de datos:** PostgreSQL → Railway
- **Emails:** Resend
- **Pagos:** Mercado Pago Subscriptions

## Estructura del repo
```
pact-ar/
├── frontend/          # Next.js app
│   ├── app/
│   │   ├── page.tsx                        # Landing page
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── templates/page.tsx
│   │   ├── editor/[id]/page.tsx            # Editor con variables
│   │   ├── editor/personalizado/page.tsx   # Editor libre
│   │   ├── contratos/[id]/page.tsx         # Detalle + invitar a firmar
│   │   ├── firmar/[token]/page.tsx         # Página pública de firma
│   │   ├── verificar/[token]/page.tsx      # Verificación de email
│   │   └── verificar-pendiente/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── Footer.tsx
│   │   └── UpgradeBanner.tsx
│   └── lib/
│       └── api.ts                          # apiGet y apiPost helpers
└── backend/
    └── src/
        ├── index.ts                        # Entry point Express
        ├── db.ts                           # Pool PostgreSQL
        ├── middleware/
        │   └── auth.ts                     # JWT middleware
        ├── routes/
        │   ├── auth.ts                     # /auth/register, /auth/login, /auth/me, /auth/verify/:token
        │   ├── contracts.ts                # /contracts CRUD + /contracts/custom
        │   ├── templates.ts                # /templates GET
        │   ├── signatures.ts               # /signatures/invite, /signatures/firmar/:token
        │   └── payments.ts                 # /payments/checkout, /payments/webhook
        ├── services/
        │   └── email.ts                    # sendVerificationEmail, sendSignatureRequest, sendSignatureConfirmation
        └── templates/                      # 10 JSONs de contratos
            ├── servicios.json
            ├── confidencialidad.json
            ├── locacion-inmueble.json
            ├── compraventa.json
            ├── senal-reserva.json
            ├── cesion-derechos.json
            ├── acuerdo-pago.json
            ├── contrato-obra.json
            ├── mandato.json
            └── acuerdo-socios.json

```

## Base de datos — tablas
```sql
users (id, email, password_hash, plan, email_verified, verification_token, mp_subscription_id, plan_expires_at, created_at)
contracts (id, user_id, template_id, nombre, variables JSONB, cuerpo, estado, created_at, updated_at)
signatures (id, contract_id, firmante_email, firmante_nombre, token, estado, ip, signed_at, created_at)
```

## Variables de entorno — backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://pact_lucas:password@localhost:5432/pact_ar
JWT_SECRET=...
JWT_EXPIRES_IN=7d
RESEND_API_KEY=...
FRONTEND_URL=http://localhost:3000
MP_ACCESS_TOKEN=...
MP_PLAN_PRO_ID=5a92755567ea4e2188862149615fe22f
```

## Variables de entorno — frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Design system
- **Paleta:** cream (#F8F7F4), ink (#1C1C1A), green (#2C5F2E), muted (#5F5E5A), hint (#888780), border (#D6D3CC)
- **Tipografía:** Playfair Display (serif, títulos) + DM Sans (sans, cuerpo)
- **Estética:** sobria, profesional, minimalista. Sin gradientes ni colores brillantes.
- **Tailwind:** clases customizadas en tailwind.config.ts: text-ink, text-green, text-muted, text-hint, bg-cream, border-border, font-serif, font-sans

## Modelo de negocio
- **Free:** 3 contratos/mes
- **Pro:** $5.000 ARS/mes, contratos ilimitados
- **Business:** próximamente

## Estado actual
- ✅ Landing page
- ✅ Registro / Login con verificación de email
- ✅ Biblioteca de 10 templates + editor personalizado
- ✅ Editor con preview en tiempo real
- ✅ Firma digital por email (Resend + token único)
- ✅ Dashboard con stats y lista de contratos
- ✅ Pagos con Mercado Pago Subscriptions
- ⬜ Deploy (Vercel + Railway)

## Problema pendiente
El email de invitación a firmar no llega en desarrollo. El backend responde "Invitación enviada correctamente" pero Resend no entrega el email. Posiblemente Resend requiere dominio verificado para enviar a destinatarios arbitrarios en modo producción. Investigar logs de Resend o agregar manejo de errores más detallado en `signatures.ts`.

## Convenciones
- Los tokens JWT se guardan en localStorage con la key "token"
- Las rutas protegidas leen el token de localStorage y lo mandan como Bearer en Authorization header
- El preview de contratos renderiza líneas con \t como grid de 2 columnas
- Los contratos personalizados usan template_id = "personalizado"

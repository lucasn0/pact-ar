import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function sendVerificationEmail(params: {
  email: string;
  token: string;
}) {
  const link = `${FRONTEND_URL}/verificar/${params.token}`;

  await resend.emails.send({
    from: "pact.ar <onboarding@resend.dev>",
    to: params.email,
    subject: "Verificá tu cuenta en pact.ar",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1C1C1A;">
        <h1 style="font-size: 24px; font-weight: 400; margin-bottom: 8px;">pact<span style="color: #2C5F2E;">.ar</span></h1>
        <hr style="border: none; border-top: 1px solid #D6D3CC; margin: 24px 0;" />
        <p style="font-size: 15px; line-height: 1.7;">Gracias por registrarte. Para activar tu cuenta hacé click en el botón:</p>
        <a href="${link}" style="display: inline-block; background: #1C1C1A; color: #F8F7F4; text-decoration: none; padding: 14px 32px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin: 24px 0;">
          Verificar mi cuenta
        </a>
        <p style="font-size: 12px; color: #888780; margin-top: 32px; line-height: 1.6;">
          Si no creaste una cuenta en pact.ar, ignorá este email.
        </p>
      </div>
    `,
  });
}

export async function sendSignatureRequest(params: {
  firmante_email: string;
  firmante_nombre: string;
  emisor_email: string;
  contrato_nombre: string;
  token: string;
}) {
  const link = `${FRONTEND_URL}/firmar/${params.token}`;

  await resend.emails.send({
    from: "pact.ar <noreply@pact.ar>",
    to: params.firmante_email,
    subject: `Te invitaron a firmar: ${params.contrato_nombre}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1C1C1A;">
        <h1 style="font-size: 24px; font-weight: 400; margin-bottom: 8px;">pact<span style="color: #2C5F2E;">.ar</span></h1>
        <hr style="border: none; border-top: 1px solid #D6D3CC; margin: 24px 0;" />

        <p style="font-size: 15px; line-height: 1.7;">Hola <strong>${params.firmante_nombre}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.7;">
          <strong>${params.emisor_email}</strong> te invitó a firmar el siguiente contrato:
        </p>

        <div style="background: #F8F7F4; border: 1px solid #D6D3CC; padding: 20px 24px; margin: 24px 0;">
          <p style="font-size: 16px; font-weight: 500; margin: 0;">${params.contrato_nombre}</p>
        </div>

        <a href="${link}" style="display: inline-block; background: #1C1C1A; color: #F8F7F4; text-decoration: none; padding: 14px 32px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">
          Ver y firmar contrato
        </a>

        <p style="font-size: 12px; color: #888780; margin-top: 32px; line-height: 1.6;">
          Este link es personal e intransferible. Al firmar, aceptás el contenido del contrato y confirmás tu identidad mediante este email.<br/>
          Válido bajo Ley 25.506 y CCyC art. 288.
        </p>
      </div>
    `,
  });
}

export async function sendSignatureConfirmation(params: {
  email: string;
  nombre: string;
  contrato_nombre: string;
}) {
  await resend.emails.send({
    from: "pact.ar <noreply@pact.ar>",
    to: params.email,
    subject: `Contrato firmado: ${params.contrato_nombre}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1C1C1A;">
        <h1 style="font-size: 24px; font-weight: 400; margin-bottom: 8px;">pact<span style="color: #2C5F2E;">.ar</span></h1>
        <hr style="border: none; border-top: 1px solid #D6D3CC; margin: 24px 0;" />

        <p style="font-size: 15px; line-height: 1.7;">Hola <strong>${params.nombre}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.7;">
          El contrato <strong>${params.contrato_nombre}</strong> fue firmado correctamente.
        </p>

        <div style="background: #EAF3DE; border: 1px solid #2C5F2E; padding: 16px 24px; margin: 24px 0;">
          <p style="font-size: 14px; color: #2C5F2E; margin: 0;">✓ Firma registrada con fecha y hora</p>
        </div>

        <p style="font-size: 12px; color: #888780; margin-top: 32px; line-height: 1.6;">
          Podés acceder al contrato firmado desde tu dashboard en pact.ar.<br/>
          Válido bajo Ley 25.506 y CCyC art. 288.
        </p>
      </div>
    `,
  });
}

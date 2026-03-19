import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { sendSignatureRequest, sendSignatureConfirmation, sendSignatureNotificationToEmisor } from "../services/email";

const router = Router();

// POST /signatures/invite — enviar invitación a firmar (requiere auth)
router.post("/invite", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { contract_id, firmante_email, firmante_nombre } = req.body;

  if (!contract_id || !firmante_email || !firmante_nombre) {
    res.status(400).json({ error: "contract_id, firmante_email y firmante_nombre son requeridos" });
    return;
  }

  try {
    // Verificar que el contrato pertenece al usuario
    const contractResult = await db.query(
      "SELECT id, nombre FROM contracts WHERE id = $1 AND user_id = $2",
      [contract_id, req.userId]
    );

    if (contractResult.rows.length === 0) {
      res.status(404).json({ error: "Contrato no encontrado" });
      return;
    }

    const contract = contractResult.rows[0];

    // Obtener email del emisor
    const userResult = await db.query("SELECT email FROM users WHERE id = $1", [req.userId]);
    const emisor_email = userResult.rows[0].email;

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar en DB
    await db.query(
      `INSERT INTO signatures (contract_id, firmante_email, firmante_nombre, token)
       VALUES ($1, $2, $3, $4)`,
      [contract_id, firmante_email, firmante_nombre, token]
    );

    // Actualizar estado del contrato
    await db.query(
      "UPDATE contracts SET estado = 'pendiente_firma', updated_at = NOW() WHERE id = $1",
      [contract_id]
    );

    // Enviar email
    try {
      await sendSignatureRequest({
        firmante_email,
        firmante_nombre,
        emisor_email,
        contrato_nombre: contract.nombre,
        token,
      });
    } catch (emailErr) {
      console.error("[signatures/invite] Fallo al enviar email:", emailErr);
      // La firma quedó guardada en DB; devolver error con detalle
      res.status(500).json({
        error: "Invitación guardada pero el email no pudo enviarse",
        detail: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
      return;
    }

    res.json({ message: "Invitación enviada correctamente" });
  } catch (err) {
    console.error("[signatures/invite] Error inesperado:", err);
    res.status(500).json({ error: "Error al enviar la invitación" });
  }
});

// GET /signatures/firmar/:token — obtener contrato por token (público, no requiere auth)
router.get("/firmar/:token", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT s.id, s.firmante_nombre, s.firmante_email, s.estado,
              c.nombre, c.cuerpo, c.template_id
       FROM signatures s
       JOIN contracts c ON s.contract_id = c.id
       WHERE s.token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Link de firma inválido o expirado" });
      return;
    }

    const sig = result.rows[0];

    if (sig.estado === "firmado") {
      res.status(409).json({ error: "Este contrato ya fue firmado" });
      return;
    }

    res.json({
      firmante_nombre: sig.firmante_nombre,
      contrato_nombre: sig.nombre,
      cuerpo: sig.cuerpo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el contrato" });
  }
});

// POST /signatures/firmar/:token — firmar contrato (público, no requiere auth)
router.post("/firmar/:token", async (req: Request, res: Response): Promise<void> => {
  const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "";

  try {
    const result = await db.query(
      `SELECT s.id, s.firmante_nombre, s.firmante_email, s.estado, s.contract_id,
              c.nombre, c.cuerpo, u.email AS emisor_email
       FROM signatures s
       JOIN contracts c ON s.contract_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE s.token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Link de firma inválido" });
      return;
    }

    const sig = result.rows[0];

    if (sig.estado === "firmado") {
      res.status(409).json({ error: "Este contrato ya fue firmado" });
      return;
    }

    // Registrar firma
    await db.query(
      `UPDATE signatures SET estado = 'firmado', ip = $1, signed_at = NOW() WHERE id = $2`,
      [ip, sig.id]
    );

    // Actualizar estado del contrato
    await db.query(
      "UPDATE contracts SET estado = 'firmado', updated_at = NOW() WHERE id = $1",
      [sig.contract_id]
    );

    // Enviar confirmación al firmante (no bloquear si falla)
    try {
      await sendSignatureConfirmation({
        email: sig.firmante_email,
        nombre: sig.firmante_nombre,
        contrato_nombre: sig.nombre,
        cuerpo: sig.cuerpo,
      });
    } catch (emailErr) {
      console.error("[signatures/firmar] Fallo al enviar confirmación al firmante:", emailErr);
    }

    // Notificar al emisor que su contrato fue firmado (no bloquear si falla)
    try {
      await sendSignatureNotificationToEmisor({
        emisor_email: sig.emisor_email,
        firmante_nombre: sig.firmante_nombre,
        firmante_email: sig.firmante_email,
        contrato_nombre: sig.nombre,
        cuerpo: sig.cuerpo,
      });
    } catch (emailErr) {
      console.error("[signatures/firmar] Fallo al notificar al emisor:", emailErr);
    }

    res.json({ message: "Contrato firmado correctamente" });
  } catch (err) {
    console.error("[signatures/firmar] Error inesperado:", err);
    res.status(500).json({ error: "Error al registrar la firma" });
  }
});

export default router;

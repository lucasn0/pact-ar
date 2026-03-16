import { Router, Response } from "express";
import { db } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import fs from "fs";
import path from "path";

const router = Router();
const TEMPLATES_DIR = path.join(__dirname, "../templates");

function loadTemplate(id: string) {
  const filePath = path.join(TEMPLATES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function renderCuerpo(cuerpo: string, variables: Record<string, string>): string {
  return cuerpo.replace(/\{\{(\w+)\}\}/g, (_match, key) => variables[key] || `{{${key}}}`);
}

// Todas las rutas requieren auth
router.use(authMiddleware);

async function checkUser(userId: number): Promise<{ error: string } | { plan: string }> {
  const result = await db.query(
    "SELECT email_verified, plan, plan_expires_at FROM users WHERE id = $1",
    [userId]
  );
  const user = result.rows[0];

  if (!user?.email_verified) {
    return { error: "Debés verificar tu email antes de crear contratos" };
  }

  // Si el plan Pro venció, bajarlo a free
  if (user.plan === "pro" && user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
    await db.query("UPDATE users SET plan = 'free' WHERE id = $1", [userId]);
    user.plan = "free";
  }

  return { plan: user.plan };
}

// POST /contracts — crear contrato
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const { template_id, nombre, variables } = req.body;

  if (!template_id || !nombre || !variables) {
    res.status(400).json({ error: "template_id, nombre y variables son requeridos" });
    return;
  }

  const userCheck = await checkUser(req.userId!);
  if ("error" in userCheck) {
    res.status(403).json({ error: userCheck.error });
    return;
  }

  const template = loadTemplate(template_id);
  if (!template) {
    res.status(404).json({ error: "Template no encontrado" });
    return;
  }

  const cuerpo = renderCuerpo(template.cuerpo, variables);

  try {
    const result = await db.query(
      `INSERT INTO contracts (user_id, template_id, nombre, variables, cuerpo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, template_id, nombre, estado, created_at`,
      [req.userId, template_id, nombre, JSON.stringify(variables), cuerpo]
    );

    res.status(201).json({ contract: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el contrato" });
  }
});

// POST /contracts/custom — crear contrato personalizado
router.post("/custom", async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, cuerpo } = req.body;

  if (!nombre || !cuerpo) {
    res.status(400).json({ error: "nombre y cuerpo son requeridos" });
    return;
  }

  const userCheck = await checkUser(req.userId!);
  if ("error" in userCheck) {
    res.status(403).json({ error: userCheck.error });
    return;
  }

  try {
    const result = await db.query(
      `INSERT INTO contracts (user_id, template_id, nombre, variables, cuerpo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, template_id, nombre, estado, created_at`,
      [req.userId, "personalizado", nombre, JSON.stringify({}), cuerpo]
    );
    res.status(201).json({ contract: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el contrato" });
  }
});

// GET /contracts — listar contratos del usuario
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT id, template_id, nombre, estado, created_at
       FROM contracts WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({ contracts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los contratos" });
  }
});

// GET /contracts/:id — obtener un contrato completo
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT * FROM contracts WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Contrato no encontrado" });
      return;
    }

    res.json({ contract: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el contrato" });
  }
});

// DELETE /contracts/:id — eliminar contrato en borrador
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT id, estado FROM contracts WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Contrato no encontrado" });
      return;
    }

    if (result.rows[0].estado !== "borrador") {
      res.status(400).json({ error: "Solo se pueden eliminar contratos en borrador" });
      return;
    }

    await db.query("DELETE FROM contracts WHERE id = $1", [req.params.id]);
    res.json({ message: "Contrato eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el contrato" });
  }
});

// POST /contracts/:id/revocar — revocar invitación pendiente
router.post("/:id/revocar", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT id, estado FROM contracts WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Contrato no encontrado" });
      return;
    }

    if (result.rows[0].estado !== "pendiente_firma") {
      res.status(400).json({ error: "Solo se pueden revocar contratos pendientes de firma" });
      return;
    }

    // Invalidar tokens de firma pendientes
    await db.query(
      `UPDATE signatures SET estado = 'revocado' WHERE contract_id = $1 AND estado = 'pendiente'`,
      [req.params.id]
    );

    // Volver el contrato a borrador
    await db.query(
      `UPDATE contracts SET estado = 'borrador', updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    res.json({ message: "Invitación revocada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al revocar la invitación" });
  }
});

export default router;

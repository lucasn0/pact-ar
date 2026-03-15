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

// POST /contracts — crear contrato
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const { template_id, nombre, variables } = req.body;

  if (!template_id || !nombre || !variables) {
    res.status(400).json({ error: "template_id, nombre y variables son requeridos" });
    return;
  }

  // Verificar que el email esté confirmado
  const userCheck = await db.query("SELECT email_verified FROM users WHERE id = $1", [req.userId]);
  if (!userCheck.rows[0]?.email_verified) {
    res.status(403).json({ error: "Debés verificar tu email antes de crear contratos" });
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

export default router;

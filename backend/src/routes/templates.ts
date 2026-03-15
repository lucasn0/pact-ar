import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const TEMPLATES_DIR = path.join(__dirname, "../templates");

function loadTemplates() {
  const files = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
    return JSON.parse(content);
  });
}

// GET /templates — lista todos los templates (sin el cuerpo)
router.get("/", (_req: Request, res: Response) => {
  try {
    const templates = loadTemplates().map(({ id, nombre, descripcion, variables }) => ({
      id,
      nombre,
      descripcion,
      cantidad_variables: variables.length,
    }));
    res.json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar los templates" });
  }
});

// GET /templates/:id — devuelve un template completo con cuerpo
router.get("/:id", (req: Request, res: Response): void => {
  try {
    const templates = loadTemplates();
    const template = templates.find((t) => t.id === req.params.id);

    if (!template) {
      res.status(404).json({ error: "Template no encontrado" });
      return;
    }

    res.json({ template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar el template" });
  }
});

export default router;

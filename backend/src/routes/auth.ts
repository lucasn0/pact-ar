import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { sendVerificationEmail } from "../services/email";

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email y contraseña son requeridos" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "El email ya está registrado" });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const result = await db.query(
      "INSERT INTO users (email, password_hash, verification_token) VALUES ($1, $2, $3) RETURNING id, email, plan, created_at",
      [email, hash, verificationToken]
    );

    const user = result.rows[0];

    await sendVerificationEmail({ email, token: verificationToken });

    const token = jwt.sign(
      { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      process.env.JWT_SECRET!
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email y contraseña son requeridos" });
    return;
  }

  try {
    const result = await db.query(
      "SELECT id, email, password_hash, plan FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      process.env.JWT_SECRET!
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, plan: user.plan },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /auth/me — ruta protegida
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT id, email, plan, email_verified, created_at FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /auth/verify/:token — verificar email
router.get("/verify/:token", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id",
      [req.params.token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: "Token inválido o ya utilizado" });
      return;
    }

    res.json({ message: "Email verificado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar el email" });
  }
});

export default router;

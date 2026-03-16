import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email";

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

// POST /auth/resend-verification — reenviar email de verificación
router.post("/resend-verification", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email requerido" });
    return;
  }

  try {
    const result = await db.query(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // No revelar si el email existe o no
      res.json({ message: "Si el email está registrado, recibirás un nuevo link." });
      return;
    }

    const user = result.rows[0];

    if (user.email_verified) {
      res.status(400).json({ error: "Este email ya fue verificado. Podés iniciar sesión." });
      return;
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "UPDATE users SET verification_token = $1 WHERE id = $2",
      [newToken, user.id]
    );

    await sendVerificationEmail({ email, token: newToken });

    res.json({ message: "Email de verificación reenviado correctamente." });
  } catch (err) {
    console.error("[auth/resend-verification] Error:", err);
    res.status(500).json({ error: "Error al reenviar el email de verificación" });
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

// POST /auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email requerido" });
    return;
  }

  try {
    const result = await db.query("SELECT id FROM users WHERE email = $1", [email]);

    // Responder siempre igual para no revelar si el email existe
    if (result.rows.length === 0) {
      res.json({ message: "Si el email está registrado, recibirás un link para restablecer tu contraseña." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3",
      [token, expires, result.rows[0].id]
    );

    await sendPasswordResetEmail({ email, token });

    res.json({ message: "Si el email está registrado, recibirás un link para restablecer tu contraseña." });
  } catch (err) {
    console.error("[auth/forgot-password] Error:", err);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: "Token y contraseña son requeridos" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  try {
    const result = await db.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: "El link expiró o ya fue usado. Solicitá uno nuevo." });
      return;
    }

    const hash = await bcrypt.hash(password, 12);

    await db.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2",
      [hash, result.rows[0].id]
    );

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("[auth/reset-password] Error:", err);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
});

export default router;

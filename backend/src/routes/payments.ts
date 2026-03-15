import { Router, Request, Response } from "express";
import { db } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_PLAN_PRO_ID = process.env.MP_PLAN_PRO_ID!;

// GET /payments/checkout — devuelve el link de checkout al frontend
router.get("/checkout", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userResult = await db.query("SELECT email FROM users WHERE id = $1", [req.userId]);
    const email = userResult.rows[0]?.email;

    // Construir URL con email pre-cargado
    const initPoint = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${MP_PLAN_PRO_ID}&payer_email=${encodeURIComponent(email)}`;

    res.json({ checkout_url: initPoint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar el link de pago" });
  }
});

// POST /payments/webhook — Mercado Pago notifica pagos acá
router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, data } = req.body;

    if (type !== "subscription_preapproval") {
      res.sendStatus(200);
      return;
    }

    const subscriptionId = data?.id;
    if (!subscriptionId) { res.sendStatus(200); return; }

    // Consultar la suscripción a la API de MP
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    const subscription = await mpRes.json() as { payer_email: string; status: string };

    if (!subscription.payer_email) { res.sendStatus(200); return; }

    const status = subscription.status; // authorized, paused, cancelled

    if (status === "authorized") {
      // Activar plan pro
      await db.query(
        `UPDATE users
         SET plan = 'pro', mp_subscription_id = $1, plan_expires_at = NOW() + INTERVAL '1 month'
         WHERE email = $2`,
        [subscriptionId, subscription.payer_email]
      );
    } else if (status === "cancelled" || status === "paused") {
      // Volver a free
      await db.query(
        `UPDATE users SET plan = 'free' WHERE email = $1`,
        [subscription.payer_email]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;

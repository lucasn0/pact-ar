import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import templateRoutes from "./routes/templates";
import contractRoutes from "./routes/contracts";
import signatureRoutes from "./routes/signatures";
import paymentRoutes from "./routes/payments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pact-ar.vercel.app",
    "https://pact.ar",
    "https://www.pact.ar",
  ]
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

app.use("/templates", templateRoutes);

app.use("/contracts", contractRoutes);

app.use("/signatures", signatureRoutes);

app.use("/payments", paymentRoutes);
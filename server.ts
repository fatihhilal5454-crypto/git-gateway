import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MERCHANT_ACCOUNT = {
  holder: 'Fatih Akmese',
  iban: 'DE63711600000008828830',
  notificationEmail: 'th-sportwelt@outlook.de'
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || '';
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

interface CheckoutItemInput {
  id: string;
  productId: string;
  productName: string;
  selectedSize: string;
  unitPrice: number;
  customizationFee: number;
  quantity: number;
  selectedColor?: {
    name?: string;
    hex?: string;
    borderHex?: string;
    textColor?: string;
    accentHex?: string;
    id?: string;
  };
  customization?: {
    includeClubLogo?: boolean;
    includeBackClubName?: boolean;
    playerName?: string;
    playerNumber?: string;
    initials?: string;
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function validateAndPriceCart(
  rawItems: unknown,
  deliveryMethod: unknown
): {
  valid: boolean;
  error?: string;
  items: CheckoutItemInput[];
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
} {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      valid: false,
      error: 'Der Warenkorb ist leer.',
      items: [],
      subtotal: 0,
      shippingCost: 0,
      grandTotal: 0
    };
  }

  const normalizedItems: CheckoutItemInput[] = [];
  let subtotal = 0;

  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object') {
      return {
        valid: false,
        error: 'Ungültiger Warenkorbeintrag.',
        items: [],
        subtotal: 0,
        shippingCost: 0,
        grandTotal: 0
      };
    }

    const item = entry as Record<string, unknown>;
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const customizationFee = Number(item.customizationFee || 0);
    const productName = typeof item.productName === 'string' ? item.productName.trim() : '';

    if (
      !productName ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 500 ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0 ||
      !Number.isFinite(customizationFee) ||
      customizationFee < 0
    ) {
      return {
        valid: false,
        error: 'Ungültige Artikeldaten oder Mengen im Warenkorb.',
        items: [],
        subtotal: 0,
        shippingCost: 0,
        grandTotal: 0
      };
    }

    subtotal += (unitPrice + customizationFee) * quantity;
    normalizedItems.push({
      id: typeof item.id === 'string' ? item.id : `item-${Date.now()}`,
      productId: typeof item.productId === 'string' ? item.productId : '',
      productName,
      selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize : 'M',
      unitPrice,
      customizationFee,
      quantity,
      selectedColor:
        item.selectedColor && typeof item.selectedColor === 'object'
          ? (item.selectedColor as CheckoutItemInput['selectedColor'])
          : undefined,
      customization:
        item.customization && typeof item.customization === 'object'
          ? (item.customization as CheckoutItemInput['customization'])
          : undefined
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  if (subtotal <= 0) {
    return {
      valid: false,
      error: 'Der Bestellbetrag muss größer als 0,00 € sein.',
      items: [],
      subtotal: 0,
      shippingCost: 0,
      grandTotal: 0
    };
  }

  const method = deliveryMethod === 'shipping' ? 'shipping' : 'pickup';
  const shippingCost = method === 'pickup' ? 0 : subtotal >= 50 ? 0 : 4.9;
  const grandTotal = Number((subtotal + shippingCost).toFixed(2));

  return {
    valid: true,
    items: normalizedItems,
    subtotal,
    shippingCost,
    grandTotal
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/payment-config', (_req: Request, res: Response) => {
    res.json({
      stripeConfigured: Boolean(stripeClient),
      paymentMethod: 'card',
      merchantHolder: MERCHANT_ACCOUNT.holder,
      ibanEnding: MERCHANT_ACCOUNT.iban.slice(-4)
    });
  });

  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    if (!stripeClient) {
      res.status(503).json({
        error: 'Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY in den Secrets hinterlegen.'
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
    const deliveryMethod = body.deliveryMethod === 'shipping' ? 'shipping' : 'pickup';
    const shippingAddress =
      body.shippingAddress && typeof body.shippingAddress === 'object'
        ? (body.shippingAddress as Record<string, unknown>)
        : null;

    if (customerName.length < 3) {
      res.status(400).json({ error: 'Bitte gib deinen vollständigen Namen ein.' });
      return;
    }
    if (!isValidEmail(customerEmail)) {
      res.status(400).json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
      return;
    }

    if (deliveryMethod === 'shipping') {
      const street = typeof shippingAddress?.street === 'string' ? shippingAddress.street.trim() : '';
      const postalCode = typeof shippingAddress?.postalCode === 'string' ? shippingAddress.postalCode.trim() : '';
      const city = typeof shippingAddress?.city === 'string' ? shippingAddress.city.trim() : '';
      if (street.length < 4 || !/^\d{5}$/.test(postalCode) || city.length < 2) {
        res.status(400).json({ error: 'Bitte gib eine vollständige deutsche Lieferadresse ein.' });
        return;
      }
    }

    const cartCheck = validateAndPriceCart(body.items, deliveryMethod);
    if (!cartCheck.valid) {
      res.status(400).json({ error: cartCheck.error });
      return;
    }

    const orderId = `ASV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const appOrigin =
      process.env.APP_URL?.trim() ||
      `${req.protocol}://${req.get('host') || 'localhost:3000'}`;

    try {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartCheck.items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${item.productName} (Größe ${item.selectedSize})`
          },
          unit_amount: Math.round((item.unitPrice + item.customizationFee) * 100)
        },
        quantity: item.quantity
      }));

      if (cartCheck.shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'DHL Postversand'
            },
            unit_amount: Math.round(cartCheck.shippingCost * 100)
          },
          quantity: 1
        });
      }

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        allowed_payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: lineItems,
        metadata: {
          orderId,
          customerName,
          deliveryMethod,
          settlementIban: MERCHANT_ACCOUNT.iban,
          settlementHolder: MERCHANT_ACCOUNT.holder
        },
        success_url: `${appOrigin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appOrigin}/?checkout=cancel`
      });

      res.json({
        mode: 'stripe',
        checkoutUrl: session.url,
        sessionId: session.id,
        orderId
      });
    } catch (err) {
      console.error('Stripe checkout session error:', err);
      res.status(500).json({ error: 'Zahlungssitzung konnte nicht gestartet werden.' });
    }
  });

  app.get('/api/checkout-session/:sessionId', async (req: Request, res: Response) => {
    if (!stripeClient) {
      res.status(503).json({ error: 'Stripe nicht konfiguriert.' });
      return;
    }

    const sessionId = String(req.params.sessionId || '').trim();
    if (!sessionId || !sessionId.startsWith('cs_')) {
      res.status(400).json({ error: 'Ungültige Session-ID.' });
      return;
    }

    try {
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      res.json({
        paid: session.payment_status === 'paid',
        paymentStatus: session.payment_status,
        orderId: session.metadata?.orderId || `ASV-2026-${sessionId.slice(-6).toUpperCase()}`,
        customerEmail: session.customer_email || '',
        customerName: session.metadata?.customerName || 'Kunde',
        amountTotal: (session.amount_total || 0) / 100,
        settlementIban: MERCHANT_ACCOUNT.iban
      });
    } catch (err) {
      console.error('Stripe session lookup error:', err);
      res.status(404).json({ error: 'Zahlungssitzung nicht gefunden.' });
    }
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    // Reject raw sensitive PAN or CVC if ever sent
    if ('cardNumber' in body || 'cardCvc' in body) {
      res.status(400).json({ error: 'Sensible Kartendaten dürfen nicht im Klartext übertragen werden.' });
      return;
    }

    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
    const cardHolder = typeof body.cardHolder === 'string' ? body.cardHolder.trim() : '';
    const cardLast4 = typeof body.cardLast4 === 'string' ? body.cardLast4.replace(/\D/g, '').slice(-4) : '';
    const cardBrand = typeof body.cardBrand === 'string' ? body.cardBrand.trim() : 'Kreditkarte';
    const deliveryMethod = body.deliveryMethod === 'shipping' ? 'shipping' : 'pickup';
    const shippingAddress =
      body.shippingAddress && typeof body.shippingAddress === 'object'
        ? (body.shippingAddress as Record<string, unknown>)
        : null;

    if (customerName.length < 3) {
      res.status(400).json({ error: 'Bitte gib deinen vollständigen Namen ein.' });
      return;
    }
    if (!isValidEmail(customerEmail)) {
      res.status(400).json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
      return;
    }
    if (cardHolder.length < 3 || cardLast4.length !== 4) {
      res.status(400).json({ error: 'Bitte gib gültige Kredit- oder Debitkartendaten ein.' });
      return;
    }

    let shippingSummary = 'Vereinsabholung';
    if (deliveryMethod === 'shipping') {
      const street = typeof shippingAddress?.street === 'string' ? shippingAddress.street.trim() : '';
      const postalCode = typeof shippingAddress?.postalCode === 'string' ? shippingAddress.postalCode.trim() : '';
      const city = typeof shippingAddress?.city === 'string' ? shippingAddress.city.trim() : '';
      if (street.length < 4 || !/^\d{5}$/.test(postalCode) || city.length < 2) {
        res.status(400).json({ error: 'Bitte gib eine vollständige deutsche Lieferadresse ein.' });
        return;
      }
      shippingSummary = `Lieferadresse: ${street}, ${postalCode} ${city}`;
    }

    const cartCheck = validateAndPriceCart(body.items, deliveryMethod);
    if (!cartCheck.valid) {
      res.status(400).json({ error: cartCheck.error });
      return;
    }

    const orderId = `ASV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const settlementIbanInput =
      typeof body.merchantIban === 'string' && /^DE\d{20}$/.test(body.merchantIban.replace(/\s+/g, '').toUpperCase())
        ? body.merchantIban.replace(/\s+/g, '').toUpperCase()
        : MERCHANT_ACCOUNT.iban;
    const settlementHolderInput =
      typeof body.merchantHolder === 'string' && body.merchantHolder.trim()
        ? body.merchantHolder.trim()
        : MERCHANT_ACCOUNT.holder;
    const settlementEmailInput =
      typeof body.merchantEmail === 'string' && isValidEmail(body.merchantEmail)
        ? body.merchantEmail.trim()
        : MERCHANT_ACCOUNT.notificationEmail;

    const orderRecord = {
      orderId,
      timestamp: new Date().toISOString(),
      items: cartCheck.items,
      grandTotal: cartCheck.grandTotal,
      deliveryMethod,
      paymentMethod: `Kredit-/Debitkarte (${cardBrand})`,
      cardLast4,
      cardHolder,
      customerEmail,
      status: 'neu',
      notes: shippingSummary,
      settlementAccount: {
        accountHolder: settlementHolderInput,
        iban: settlementIbanInput,
        notificationEmail: settlementEmailInput,
        status: stripeClient ? 'AUTHORIZED' : 'AWAITING_PSP_CAPTURE'
      }
    };

    res.status(201).json({ order: orderRecord });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

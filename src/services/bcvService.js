// Neblina Stereo 105.5 FM - Servicio Oficial de Tasas de Cambio BCV (Banco Central de Venezuela)
// Conexión en vivo con el endpoint: https://datos.cromstudio.com.ve/tasa

const BCV_STORAGE_KEY = 'neblina_bcv_rates_v1';
const BCV_API_URL = 'https://datos.cromstudio.com.ve/tasa';

// Tasas de respaldo seguras en caso de desconexión o lentitud de red
export const FALLBACK_BCV_RATES = {
  fuente: 'BCV_DB (Respaldo)',
  fechaValor: 'Jueves, 22 Octubre 2026',
  usd: 884.75,
  eur: 993.21,
  lastUpdated: new Date().toISOString()
};

// Obtener tasas guardadas en caché local
export function getCachedBcvRates() {
  if (typeof window === 'undefined') return FALLBACK_BCV_RATES;
  try {
    const raw = localStorage.getItem(BCV_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.usd && parsed.eur) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo tasas BCV de caché:', e);
  }
  return FALLBACK_BCV_RATES;
}

// Guardar tasas en caché local
export function saveCachedBcvRates(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BCV_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('neblina_bcv_rates_updated', { detail: data }));
  } catch (e) {
    console.error('Error guardando tasas BCV:', e);
  }
}

// Consultar tasas en vivo desde el servidor
export async function fetchLiveBcvRates() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(BCV_API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();

    const usdRate = Number(data?.tasas?.USD) || FALLBACK_BCV_RATES.usd;
    const eurRate = Number(data?.tasas?.EUR) || FALLBACK_BCV_RATES.eur;
    const fechaValor = data?.fecha_valor || FALLBACK_BCV_RATES.fechaValor;

    const formatted = {
      fuente: data?.fuente || 'Banco Central de Venezuela (BCV)',
      fechaValor: fechaValor,
      usd: usdRate,
      eur: eurRate,
      lastUpdated: data?.actualizado_el || new Date().toISOString(),
      raw: data
    };

    saveCachedBcvRates(formatted);
    return formatted;
  } catch (err) {
    console.warn('[BCV Service] Error consultando API en vivo, usando respaldo:', err.message);
    const cached = getCachedBcvRates();
    return { ...cached, isFallback: true };
  }
}

// Convertir monto de divisa a Bolívares (Bs.)
export function convertCurrencyToBs(amount, currency = 'USD', customRate = null) {
  const numericAmount = parseFloat(amount) || 0;
  if (numericAmount <= 0) return { amountBs: 0, formattedBs: '0,00 Bs.', rateUsed: 0 };

  const rates = getCachedBcvRates();
  const rate = customRate || (currency === 'EUR' ? rates.eur : rates.usd);
  const totalBs = numericAmount * rate;

  return {
    amountOriginal: numericAmount,
    currency,
    rateUsed: rate,
    amountBs: totalBs,
    formattedBs: totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.',
    fechaValor: rates.fechaValor
  };
}

// Construir mensaje oficial para recordatorio de cobro por WhatsApp con desglose de tasa BCV
export function generateBillingWhatsAppMessage({
  client,
  reminderType = 'due', // 'upcoming' | 'due' | 'overdue'
  currency = 'USD',
  amount = null,
  recipientType = 'owner', // 'owner' | 'admin'
  bankProfile = null
}) {
  const rates = getCachedBcvRates();
  const targetAmount = amount !== null ? amount : (client?.amountUsd || 0);
  const conversion = convertCurrencyToBs(targetAmount, currency);

  const recipientName = recipientType === 'admin' 
    ? (client?.adminContactName || 'Estimado(a) Administrador(a)')
    : (client?.ownerName || 'Estimado(a) Cliente');

  const businessName = client?.businessName || 'su establecimiento comercial';
  const currencySymbol = currency === 'USD' ? '$ USD' : '€ EUR';
  const rateLabel = currency === 'USD' ? 'Dólar (USD)' : 'Euro (EUR)';
  const rateVal = currency === 'USD' ? rates.usd.toFixed(2) : rates.eur.toFixed(2);

  let greetingHeader = '';
  if (reminderType === 'upcoming') {
    greetingHeader = `¡Hola, ${recipientName}! Te saludamos cordialmente desde *Neblina Stereo 105.5 FM*. Esperamos que todo marche excelente con *${businessName}*. Te escribimos para recordarte que la fecha de corte de tu pauta publicitaria se aproxima el día *${client?.billingDay || 'próximo'}*.`;
  } else if (reminderType === 'overdue') {
    greetingHeader = `Estimado(a) ${recipientName}, reciba un cordial saludo de la Dirección de Administración y Cobranzas de *Neblina Stereo 105.5 FM*. Le contactamos respecto a la pauta comercial activa de *${businessName}*, la cual presenta un saldo pendiente correspondiente a la fecha de cobro estipulada.`;
  } else {
    greetingHeader = `¡Hola, ${recipientName}! Un saludo muy especial del equipo de *Neblina Stereo 105.5 FM*. Te contactamos hoy con motivo de la facturación y cobro de la publicidad radial de *${businessName}*.`;
  }

  const bankDetailsBlock = bankProfile
    ? `• *Perfil de Pago Seleccionado (${bankProfile.label || bankProfile.bankName}):*
  - Banco: ${bankProfile.bankName}
  - N° de Cuenta: ${bankProfile.accountNumber || 'Pago Móvil Directo'} (${bankProfile.accountType || 'Corriente'})
  - Pago Móvil Teléfono: ${bankProfile.phone || '0424-7459774'}
  - Cédula / RIF: ${bankProfile.cedulaRif || 'J-31489201-4'}
  - Titular: ${bankProfile.holderName || 'Neblina Stereo 105.5 FM'}`
    : `• *Pago Móvil / Transferencia:* 
  - Banco: Banco de Venezuela (0102) / Banesco (0134)
  - Cédula / RIF: J-31489201-4
  - Teléfono: 0424-7459774
  - Titular: Neblina Stereo 105.5 FM C.A.`;

  const message = `${greetingHeader}

📋 *DETALLES DE LA PAUTA COMERCIAL:*
• *Comercio:* ${businessName}
• *RIF:* ${client?.businessRif || 'N/A'}
• *Plan / Frecuencia:* ${client?.paymentFrequency === 'quincenal' ? 'Pago Quincenal' : 'Pago Mensual'}
• *Monto Acordado:* ${targetAmount.toFixed(2)} ${currencySymbol}

🏦 *CÁLCULO OFICIAL A TASA BCV:*
• *Tasa Oficial BCV (${rateLabel}):* ${rateVal} Bs.
• *Fecha Valor BCV:* ${rates.fechaValor}
• *TOTAL A CANCELAR EN BOLÍVARES:* *${conversion.formattedBs}*

💳 *DATOS DE PAGO DISPONIBLES:*
${bankDetailsBlock}
• *Divisas en Efectivo o Transferencia USD:* Consultar en cabina o administración.

🚨 *⚠️ ALERTA IMPORTANTE: Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar.*

Agradecemos nos envíe el soporte de pago por esta vía para conciliar su factura y emitir su recibo correspondiente. ¡Muchísimas gracias por confiar en la emisora de mayor sintonía en todo el páramo merideño! 📻🎙️✨`;

  return {
    rawMessage: message,
    encodedUrl: `https://wa.me/${(recipientType === 'admin' ? client?.adminContactPhone : client?.ownerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
    conversion
  };
}

// Convertir números a palabras en español
const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  let result = '';
  const h = Math.floor(n / 100);
  const remainder = n % 100;

  if (h > 0) {
    result += hundreds[h];
  }

  if (remainder > 0) {
    if (h > 0) result += ' ';

    if (remainder < 10) {
      result += units[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const t = Math.floor(remainder / 10);
      const u = remainder % 10;

      if (t === 2 && u > 0) {
        result += 'veinti' + units[u];
      } else {
        result += tens[t];
        if (u > 0) {
          result += ' y ' + units[u];
        }
      }
    }
  }

  return result;
}

function convertThousands(n: number): string {
  if (n === 0) return 'cero';
  if (n === 1000) return 'mil';

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  let result = '';

  if (thousands > 0) {
    if (thousands === 1) {
      result += 'mil';
    } else {
      result += convertHundreds(thousands) + ' mil';
    }
  }

  if (remainder > 0) {
    if (thousands > 0) result += ' ';
    result += convertHundreds(remainder);
  }

  return result.trim();
}

export function numberToWords(n: number): string {
  if (n === 0) return 'cero';
  if (n === 1) return 'un';

  // Manejar millones
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    const remainder = n % 1000000;

    let result = '';
    if (millions === 1) {
      result += 'un millón';
    } else {
      result += convertThousands(millions) + ' millones';
    }

    if (remainder > 0) {
      result += ' ' + convertThousands(remainder);
    }

    return result;
  }

  // Manejar miles
  if (n >= 1000) {
    return convertThousands(n);
  }

  // Menor que mil
  return convertHundreds(n);
}

// Convertir moneda a palabras
export function currencyToWords(amount: number): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let result = numberToWords(integerPart);

  // Manejar singular/plural
  if (integerPart === 1) {
    result += ' peso';
  } else {
    result += ' pesos';
  }

  // Agregar centavos si existen
  if (decimalPart > 0) {
    result += ' con ' + numberToWords(decimalPart);
    result += decimalPart === 1 ? ' centavo' : ' centavos';
  }

  return result;
}

// Formatear respuesta para texto-a-voz
export function formatForSpeech(text: string): string {
  // Reemplazar símbolos de moneda y números con palabras
  return text.replace(/\$[\d,]+(?:\.\d+)?/g, (match) => {
    // Remover $ y comas
    const numStr = match.replace(/[$,]/g, '');
    const num = parseFloat(numStr);

    if (isNaN(num)) return match;

    return currencyToWords(num);
  });
}

// Versión en inglés
export function numberToWordsEN(n: number): string {
  if (n === 0) return 'zero';
  if (n === 1) return 'one';

  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return tens[t] + (u > 0 ? ' ' + units[u] : '');
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    return units[h] + ' hundred' + (remainder > 0 ? ' ' + numberToWordsEN(remainder) : '');
  }
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return numberToWordsEN(thousands) + ' thousand' + (remainder > 0 ? ' ' + numberToWordsEN(remainder) : '');
  }

  const millions = Math.floor(n / 1000000);
  const remainder = n % 1000000;
  return numberToWordsEN(millions) + ' million' + (remainder > 0 ? ' ' + numberToWordsEN(remainder) : '');
}

export function currencyToWordsEN(amount: number): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let result = numberToWordsEN(integerPart);
  result += integerPart === 1 ? ' dollar' : ' dollars';

  if (decimalPart > 0) {
    result += ' and ' + numberToWordsEN(decimalPart);
    result += decimalPart === 1 ? ' cent' : ' cents';
  }

  return result;
}

export function formatForSpeechEN(text: string): string {
  return text.replace(/\$[\d,]+(?:\.\d+)?/g, (match) => {
    const numStr = match.replace(/[$,]/g, '');
    const num = parseFloat(numStr);

    if (isNaN(num)) return match;

    return currencyToWordsEN(num);
  });
}

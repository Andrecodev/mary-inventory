import { Customer, Product, Payment } from '../types';

interface AppState {
  customers: Customer[];
  products: Product[];
  payments: Payment[];
}

interface CommandResult {
  response: string;
  data?: any;
}

// Normalizar texto para comparación
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim();
};

// Helper para pluralización correcta en español
const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

// Formatear cantidad con texto correcto
const formatCount = (count: number, singular: string, plural: string): string => {
  if (count === 1) {
    return `un ${singular}`;
  } else if (count === 0) {
    return `ningún ${singular}`;
  } else {
    return `${count} ${plural}`;
  }
};

// Palabras clave que NO son nombres
const STOP_WORDS = [
  'cuanto', 'cuando', 'donde', 'como', 'que', 'cual', 'quien', 'quienes',
  'debe', 'deben', 'adeuda', 'adeudan', 'paga', 'pagan', 'total', 'todos',
  'cliente', 'clientes', 'producto', 'productos', 'inventario', 'stock',
  'mes', 'año', 'dia', 'semana', 'hoy', 'ayer', 'mañana',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'en', 'con', 'sin', 'para', 'por', 'a', 'al',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'tiene', 'tienen', 'hay', 'esta', 'estan', 'es', 'son',
  'mas', 'menos', 'mayor', 'menor', 'igual', 'diferente'
];

// Detectar tipo de comando
interface CommandIntent {
  type: 'customer_debt' | 'inventory' | 'calculation' | 'payments' | 'stats' | 'unknown';
  confidence: number;
}

const detectIntent = (command: string): CommandIntent => {
  const normalized = normalize(command);

  // Cálculos matemáticos
  if (
    normalized.match(/calcula|cuanto es|suma|resta|multiplica|divide|por|mas|menos|entre/) &&
    normalized.match(/\d+/)
  ) {
    return { type: 'calculation', confidence: 0.9 };
  }

  // Consultas de inventario/productos
  if (
    normalized.match(/producto|inventario|stock|poco stock|bajo stock|cuantos productos|total.*producto/) &&
    !normalized.match(/debe|adeuda|pago|vencido/)
  ) {
    return { type: 'inventory', confidence: 0.85 };
  }

  // Consultas de pagos
  if (normalized.match(/pago|vencido|atrasado|pendiente/)) {
    return { type: 'payments', confidence: 0.85 };
  }

  // Consultas de deudas de clientes
  if (
    normalized.match(/debe|adeuda|deuda/) ||
    normalized.match(/quien.*mas|mayor.*deuda|mas.*endeudado/)
  ) {
    return { type: 'customer_debt', confidence: 0.8 };
  }

  // Estadísticas generales
  if (
    normalized.match(/cuantos.*cliente|total.*cliente|ganancia|utilidad|profit/)
  ) {
    return { type: 'stats', confidence: 0.75 };
  }

  return { type: 'unknown', confidence: 0 };
};

// Extraer nombre de cliente de un comando (mejorado)
const extractCustomerName = (command: string): string | null => {
  // Limpiar el comando de signos de puntuación al final
  const cleanedCommand = command.replace(/[?¿!¡.,;:]+$/g, '').trim();

  // Patrón para caracteres de nombres en español (incluyendo acentos)
  const nameChar = '[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]';

  // Patrones específicos para nombres con contexto
  const patterns = [
    // "cuánto debe Juan Pérez" o "cuánto debe Juan Pérez en enero"
    new RegExp(`(?:debe|adeuda)\\s+(${nameChar}+(?:\\s+${nameChar}+)+?)(?:\\s+en\\s+|\\s*$)`, 'i'),
    // "cliente Juan Pérez"
    new RegExp(`cliente\\s+(${nameChar}+(?:\\s+${nameChar}+)+?)(?:\\s|$)`, 'i'),
    // "de Juan Pérez" o "del cliente Juan Pérez"
    new RegExp(`(?:de|del)\\s+(?:cliente\\s+)?(${nameChar}+(?:\\s+${nameChar}+)+?)(?:\\s|$)`, 'i'),
    // "para Juan Pérez"
    new RegExp(`para\\s+(${nameChar}+(?:\\s+${nameChar}+)+?)(?:\\s|$)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = cleanedCommand.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();

      // Filtrar palabras que claramente no son nombres
      const words = name.split(/\s+/);
      const filteredWords = words.filter(word =>
        !STOP_WORDS.includes(normalize(word))
      );

      // Solo considerar válido si tiene al menos 1 palabra después de filtrar (para nombres simples)
      // o 2 palabras para nombres compuestos
      if (filteredWords.length >= 1) {
        return filteredWords.join(' ');
      }
    }
  }

  // Intento adicional: buscar nombres propios después de palabras clave de deuda
  const debtKeywords = /(?:cuanto|cuánto|que|qué)\s+(?:debe|adeuda)\s+(.+)/i;
  const debtMatch = cleanedCommand.match(debtKeywords);
  if (debtMatch && debtMatch[1]) {
    const potentialName = debtMatch[1].trim();
    const words = potentialName.split(/\s+/);
    const filteredWords = words.filter(word =>
      !STOP_WORDS.includes(normalize(word)) && word.length > 1
    );

    if (filteredWords.length >= 1) {
      return filteredWords.join(' ');
    }
  }

  return null;
};

// Buscar cliente por nombre (fuzzy matching mejorado)
const findCustomer = (name: string, customers: Customer[]): Customer | null => {
  if (!name || name.trim().length < 1) return null;

  const normalizedSearch = normalize(name);

  // Verificar que no sea una palabra clave
  if (STOP_WORDS.includes(normalizedSearch)) return null;

  // Búsqueda exacta primero
  let found = customers.find(c =>
    normalize(c.name) === normalizedSearch
  );

  if (found) return found;

  // Búsqueda parcial - nombre contiene la búsqueda o viceversa
  found = customers.find(c => {
    const customerName = normalize(c.name);
    return customerName.includes(normalizedSearch) || normalizedSearch.includes(customerName);
  });

  if (found) return found;

  // Búsqueda por palabras individuales (todas las palabras deben coincidir)
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 1);
  if (searchWords.length >= 1) {
    found = customers.find(c => {
      const customerName = normalize(c.name);
      return searchWords.every(word => customerName.includes(word));
    });
  }

  if (found) return found;

  // Búsqueda más flexible: al menos una palabra coincide
  if (searchWords.length >= 1) {
    found = customers.find(c => {
      const customerName = normalize(c.name);
      const customerWords = customerName.split(/\s+/);
      // Al menos una palabra del nombre del cliente coincide con la búsqueda
      return searchWords.some(searchWord =>
        customerWords.some(customerWord =>
          customerWord.includes(searchWord) || searchWord.includes(customerWord)
        )
      );
    });
  }

  return found || null;
};

// Extraer mes de un comando
const extractMonth = (command: string): number | null => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const normalized = normalize(command);

  for (let i = 0; i < months.length; i++) {
    if (normalized.includes(months[i])) {
      return i; // 0-11
    }
  }

  // Buscar "este mes" o "mes actual"
  if (normalized.includes('este mes') || normalized.includes('mes actual')) {
    return new Date().getMonth();
  }

  return null;
};

// Detectar período de tiempo
interface TimePeriod {
  type: 'day' | 'week' | 'month' | 'year' | 'all';
  specificMonth?: number;
}

const extractTimePeriod = (command: string): TimePeriod => {
  const normalized = normalize(command);

  // Mes específico
  const month = extractMonth(command);
  if (month !== null && !normalized.match(/este mes|mes actual/)) {
    return { type: 'month', specificMonth: month };
  }

  // Este mes / mes actual
  if (normalized.match(/este mes|mes actual/)) {
    return { type: 'month' };
  }

  // Esta semana
  if (normalized.match(/esta semana|semana actual/)) {
    return { type: 'week' };
  }

  // Hoy / este día
  if (normalized.match(/hoy|este dia|dia actual/)) {
    return { type: 'day' };
  }

  // Este año
  if (normalized.match(/este ano|ano actual|este año|año actual/)) {
    return { type: 'year' };
  }

  // Por defecto, todo
  return { type: 'all' };
};

// Procesar comandos en español
export const processSpanishCommand = (command: string, state: AppState): CommandResult => {
  const normalized = normalize(command);
  const intent = detectIntent(command);

  console.log('🔍 Intent detected:', intent.type, 'confidence:', intent.confidence);

  // CÁLCULOS MATEMÁTICOS
  if (intent.type === 'calculation') {
    const nums = command.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      const a = parseFloat(nums[0]);
      const b = parseFloat(nums[1]);

      if (normalized.includes('suma') || normalized.match(/\bmas\b/) || normalized.includes('+')) {
        return { response: `${a} más ${b} es igual a ${a + b}` };
      } else if (normalized.includes('resta') || normalized.includes('menos') || normalized.includes('-')) {
        return { response: `${a} menos ${b} es igual a ${a - b}` };
      } else if (normalized.includes('multiplica') || normalized.match(/\bpor\b/) || normalized.includes('*')) {
        return { response: `${a} por ${b} es igual a ${a * b}` };
      } else if (normalized.includes('divide') || normalized.includes('entre') || normalized.includes('/')) {
        return { response: `${a} entre ${b} es igual a ${(a / b).toFixed(2)}` };
      }
    }
  }

  // INVENTARIO Y PRODUCTOS
  if (intent.type === 'inventory') {
    // Total de productos
    if (normalized.match(/cuantos productos|total.*producto|productos.*total/)) {
      const total = state.products.length;
      const totalValue = state.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const totalStock = state.products.reduce((sum, p) => sum + p.quantity, 0);

      const productText = formatCount(total, 'producto', 'productos');
      const unitText = pluralize(totalStock, 'unidad', 'unidades');

      return {
        response: `Tienes ${productText} en inventario con un total de ${totalStock} ${unitText}. El valor total es de $${totalValue.toLocaleString()}`,
        data: { total, totalValue, totalStock }
      };
    }

    // Productos con poco stock
    if (normalized.match(/poco stock|bajo stock|inventario bajo|stock bajo/)) {
      const lowStock = state.products.filter(p => p.quantity <= p.lowStockThreshold);

      if (lowStock.length > 0) {
        const list = lowStock
          .slice(0, 3)
          .map(p => {
            const unitText = pluralize(p.quantity, 'unidad', 'unidades');
            return `${p.name} tiene ${p.quantity} ${unitText}`;
          })
          .join(', ');

        const productText = formatCount(lowStock.length, 'producto', 'productos');

        return {
          response: `Hay ${productText} con poco stock: ${list}${lowStock.length > 3 ? ' y más' : ''}`,
          data: { lowStock }
        };
      } else {
        return { response: 'Todos los productos tienen stock suficiente' };
      }
    }

    // Buscar producto específico por nombre
    const productKeywords = command.match(/producto\s+([a-záéíóúñ\s]+?)(?:\s|$)/i);
    if (productKeywords && productKeywords[1]) {
      const searchTerm = productKeywords[1].trim();
      const product = state.products.find(p =>
        normalize(p.name).includes(normalize(searchTerm))
      );

      if (product) {
        return {
          response: `${product.name}: Precio de venta $${product.price.toLocaleString()}, Precio de compra $${product.purchasePrice.toLocaleString()}, Stock ${product.quantity} unidades`,
          data: { product }
        };
      } else {
        return { response: `No encontré el producto ${searchTerm}` };
      }
    }
  }

  // PAGOS VENCIDOS
  if (intent.type === 'payments') {
    const overduePayments = state.payments.filter(p => p.status === 'overdue');
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    if (overduePayments.length > 0) {
      const paymentText = formatCount(overduePayments.length, 'pago vencido', 'pagos vencidos');

      return {
        response: `Hay ${paymentText} por un total de $${overdueAmount.toLocaleString()}`,
        data: { overduePayments, overdueAmount }
      };
    } else {
      return { response: 'No hay pagos vencidos. ¡Todo al día!' };
    }
  }

  // ESTADÍSTICAS GENERALES
  if (intent.type === 'stats') {
    // Total de clientes
    if (normalized.match(/cuantos clientes|total.*cliente/)) {
      const total = state.customers.length;
      const activeCustomers = state.customers.filter(c => c.status === 'active').length;

      const clientText = formatCount(total, 'cliente registrado', 'clientes registrados');
      const activeText = activeCustomers === 1 ? 'está activo' : 'están activos';

      return {
        response: `Tienes ${clientText}, de los cuales ${activeCustomers} ${activeText}`,
        data: { total, activeCustomers }
      };
    }

    // Ganancias estimadas
    if (normalized.match(/ganancia|utilidad|profit/)) {
      const period = extractTimePeriod(command);
      const now = new Date();

      // Filtrar pagos según el período
      let relevantPayments = state.payments.filter(p => p.status === 'paid');

      if (period.type !== 'all') {
        relevantPayments = relevantPayments.filter(p => {
          const paymentDate = new Date(p.dueDate);

          switch (period.type) {
            case 'day':
              return (
                paymentDate.getDate() === now.getDate() &&
                paymentDate.getMonth() === now.getMonth() &&
                paymentDate.getFullYear() === now.getFullYear()
              );

            case 'week':
              const weekAgo = new Date(now);
              weekAgo.setDate(now.getDate() - 7);
              return paymentDate >= weekAgo && paymentDate <= now;

            case 'month':
              if (period.specificMonth !== undefined) {
                return paymentDate.getMonth() === period.specificMonth;
              }
              return (
                paymentDate.getMonth() === now.getMonth() &&
                paymentDate.getFullYear() === now.getFullYear()
              );

            case 'year':
              return paymentDate.getFullYear() === now.getFullYear();

            default:
              return true;
          }
        });
      }

      // Calcular ganancia de pagos
      const profitFromPayments = relevantPayments.reduce((sum, payment) => {
        // Asumiendo que cada pago es ingreso menos costo
        // Aquí podrías tener lógica más compleja si tienes datos de costos por venta
        return sum + payment.amount;
      }, 0);

      // Para inventario actual (sin período específico)
      const inventoryProfit = period.type === 'all'
        ? state.products.reduce((sum, p) => sum + ((p.price - p.purchasePrice) * p.quantity), 0)
        : 0;

      const totalProfit = profitFromPayments + inventoryProfit;

      // Construir respuesta según el período
      let periodText = '';
      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      switch (period.type) {
        case 'day':
          periodText = 'de hoy';
          break;
        case 'week':
          periodText = 'de esta semana';
          break;
        case 'month':
          if (period.specificMonth !== undefined) {
            periodText = `de ${monthNames[period.specificMonth]}`;
          } else {
            periodText = 'de este mes';
          }
          break;
        case 'year':
          periodText = 'de este año';
          break;
        default:
          periodText = 'del inventario actual';
      }

      if (totalProfit > 0) {
        return {
          response: `La ganancia ${periodText} es de $${totalProfit.toLocaleString()}`,
          data: { profit: totalProfit, period, paymentCount: relevantPayments.length }
        };
      } else {
        return {
          response: `No hay ganancias registradas ${periodText}`,
          data: { profit: 0, period }
        };
      }
    }
  }

  // CONSULTAS DE DEUDAS DE CLIENTES
  if (intent.type === 'customer_debt') {
    // Quien debe más
    if (normalized.match(/quien debe mas|mayor deuda|mas endeudado|cliente.*mas.*debe/)) {
      const topDebtors = [...state.customers]
        .filter(c => c.totalDebt > 0)
        .sort((a, b) => b.totalDebt - a.totalDebt)
        .slice(0, 3);

      if (topDebtors.length === 0) {
        return { response: 'No hay clientes con deudas pendientes' };
      }

      const list = topDebtors
        .map((c, i) => `${i + 1}. ${c.name} debe $${c.totalDebt.toLocaleString()}`)
        .join(', ');

      return {
        response: `Los clientes con mayor deuda son: ${list}`,
        data: { topDebtors }
      };
    }

    // Deuda total de todos los clientes
    if (
      normalized.match(/cuanto.*deben.*clientes|total.*deuda|deuda.*total/) &&
      !normalized.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/) // No tiene nombre propio
    ) {
      const totalDebt = state.customers.reduce((sum, c) => sum + c.totalDebt, 0);
      const customersWithDebt = state.customers.filter(c => c.totalDebt > 0).length;

      const clientText = formatCount(customersWithDebt, 'cliente', 'clientes');

      return {
        response: `Hay ${clientText} con deudas. El total adeudado es de $${totalDebt.toLocaleString()}`,
        data: { totalDebt, customersWithDebt }
      };
    }

    // Buscar cliente específico
    const customerName = extractCustomerName(command);
    console.log('👤 Extracted customer name:', customerName);

    if (customerName) {
      const customer = findCustomer(customerName, state.customers);

      if (customer) {
        const month = extractMonth(command);

        if (month !== null) {
          // Calcular deuda del mes específico
          const monthPayments = state.payments.filter(p => {
            const paymentDate = new Date(p.dueDate);
            return p.customerId === customer.id && paymentDate.getMonth() === month;
          });

          const monthDebt = monthPayments.reduce((sum, p) =>
            p.status === 'pending' || p.status === 'overdue' ? sum + p.amount : sum, 0
          );

          const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                             'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

          if (monthDebt > 0) {
            return {
              response: `${customer.name} debe $${monthDebt.toLocaleString()} en ${monthNames[month]}`,
              data: { customer, debt: monthDebt, month }
            };
          } else {
            return {
              response: `${customer.name} no tiene deudas pendientes en ${monthNames[month]}`,
              data: { customer, debt: 0, month }
            };
          }
        }

        // Deuda total del cliente
        if (customer.totalDebt > 0) {
          return {
            response: `${customer.name} debe un total de $${customer.totalDebt.toLocaleString()}`,
            data: { customer, debt: customer.totalDebt }
          };
        } else {
          return {
            response: `${customer.name} no tiene deudas pendientes`,
            data: { customer, debt: 0 }
          };
        }
      } else if (customerName.length > 1) {
        // Solo decir que no encontramos si el nombre tiene más de 1 carácter
        return { response: `Cliente "${customerName}" no existe en la base de datos` };
      }
    }
  }

  // Comando no reconocido - dar sugerencias contextuales
  return {
    response: 'Puedo ayudarte con varias cosas. Intenta preguntar: "¿Cuántos productos tengo?", "¿Quién debe más?", "Calcula 150 por 8", o "¿Cuánto debe Juan Pérez?"'
  };
};

// Helper para pluralización en inglés
const pluralizeEN = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || singular + 's';
};

// Procesar comandos en inglés
export const processEnglishCommand = (command: string, state: AppState): CommandResult => {
  const normalized = normalize(command);

  // Math calculations
  if (normalized.match(/calculate|how much is|add|multiply|times|plus|minus/) && normalized.match(/\d+/)) {
    const nums = command.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      const a = parseFloat(nums[0]);
      const b = parseFloat(nums[1]);

      if (normalized.includes('add') || normalized.includes('plus') || normalized.includes('+')) {
        return { response: `${a} plus ${b} equals ${a + b}` };
      } else if (normalized.includes('subtract') || normalized.includes('minus') || normalized.includes('-')) {
        return { response: `${a} minus ${b} equals ${a - b}` };
      } else if (normalized.includes('multiply') || normalized.includes('times') || normalized.includes('*')) {
        return { response: `${a} times ${b} equals ${a * b}` };
      } else if (normalized.includes('divide') || normalized.includes('divided by') || normalized.includes('/')) {
        return { response: `${a} divided by ${b} equals ${(a / b).toFixed(2)}` };
      }
    }
  }

  // Total products/inventory
  if (normalized.match(/how many products|total products|products.*total/)) {
    const total = state.products.length;
    const totalValue = state.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalStock = state.products.reduce((sum, p) => sum + p.quantity, 0);

    const productText = pluralizeEN(total, 'product');
    const unitText = pluralizeEN(totalStock, 'unit');

    return {
      response: `You have ${total} ${productText} in inventory with a total of ${totalStock} ${unitText} worth $${totalValue.toLocaleString()}`,
      data: { total, totalValue, totalStock }
    };
  }

  // Total debt
  if (normalized.match(/how much.*owe|total.*debt|debt.*total/)) {
    const totalDebt = state.customers.reduce((sum, c) => sum + c.totalDebt, 0);
    const customersWithDebt = state.customers.filter(c => c.totalDebt > 0).length;

    const customerText = pluralizeEN(customersWithDebt, 'customer');

    return {
      response: `${customersWithDebt} ${customerText} owe a total of $${totalDebt.toLocaleString()}`,
      data: { totalDebt, customersWithDebt }
    };
  }

  // Overdue payments
  if (normalized.match(/overdue|late|past due/)) {
    const overduePayments = state.payments.filter(p => p.status === 'overdue');
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    if (overduePayments.length > 0) {
      const paymentText = pluralizeEN(overduePayments.length, 'overdue payment');

      return {
        response: `There ${overduePayments.length === 1 ? 'is' : 'are'} ${overduePayments.length} ${paymentText} totaling $${overdueAmount.toLocaleString()}`,
        data: { overduePayments, overdueAmount }
      };
    } else {
      return { response: 'No overdue payments. Everything is up to date!' };
    }
  }

  // Low stock
  if (normalized.match(/low stock|low inventory/)) {
    const lowStock = state.products.filter(p => p.quantity <= p.lowStockThreshold);

    if (lowStock.length > 0) {
      const list = lowStock
        .slice(0, 3)
        .map(p => {
          const unitText = pluralizeEN(p.quantity, 'unit');
          return `${p.name} has ${p.quantity} ${unitText}`;
        })
        .join(', ');

      const productText = pluralizeEN(lowStock.length, 'product');

      return {
        response: `There ${lowStock.length === 1 ? 'is' : 'are'} ${lowStock.length} ${productText} with low stock: ${list}${lowStock.length > 3 ? ' and more' : ''}`,
        data: { lowStock }
      };
    } else {
      return { response: 'All products have sufficient stock' };
    }
  }

  // Total customers
  if (normalized.match(/how many customers|total customers/)) {
    const total = state.customers.length;
    const activeCustomers = state.customers.filter(c => c.status === 'active').length;

    const customerText = pluralizeEN(total, 'customer');
    const activeVerb = activeCustomers === 1 ? 'is' : 'are';

    return {
      response: `You have ${total} ${customerText}, ${activeCustomers} ${activeVerb} active`,
      data: { total, activeCustomers }
    };
  }

  // Unknown command
  return {
    response: 'I can help you with information about customers, debts, products, and inventory. Try asking "How many products do I have?", "How much do customers owe?", or "Calculate 25 times 8"'
  };
};

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks';
import jsPDF from 'jspdf';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Download,
  Calendar,
  FileText,
} from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

const Reports: React.FC = () => {
  const { state } = useApp();
  const { products, customers, suppliers, accountTransactions } = state;
  const { success } = useToast();

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Inventory value
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const totalInventoryCost = products.reduce(
      (sum, p) => sum + (p.purchase_price || 0) * p.quantity,
      0
    );
    const potentialProfit = totalInventoryValue - totalInventoryCost;

    // Revenue from receivables (paid transactions)
    const receivables = accountTransactions.filter((t) => t.type === 'receivable');
    const totalRevenue = receivables.reduce((sum, t) => sum + t.paid_amount, 0);
    const thisMonthRevenue = receivables
      .filter((t) => {
        const date = new Date(t.created_at);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      })
      .reduce((sum, t) => sum + t.paid_amount, 0);

    // Expenses from payables
    const payables = accountTransactions.filter((t) => t.type === 'payable');
    const totalExpenses = payables.reduce((sum, t) => sum + t.paid_amount, 0);
    const thisMonthExpenses = payables
      .filter((t) => {
        const date = new Date(t.created_at);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      })
      .reduce((sum, t) => sum + t.paid_amount, 0);

    // Profit
    const netProfit = thisMonthRevenue - thisMonthExpenses;

    // Outstanding amounts
    const totalReceivable = receivables.reduce((sum, t) => sum + t.remaining_amount, 0);
    const totalPayable = payables.reduce((sum, t) => sum + t.remaining_amount, 0);

    // Customer insights
    const topCustomers = customers
      .filter((c) => c.total_debt > 0)
      .sort((a, b) => b.total_debt - a.total_debt)
      .slice(0, 5);

    // Low stock products
    const lowStockProducts = products.filter(
      (p) => p.quantity <= p.low_stock_threshold
    );

    // Category distribution
    const categoryDistribution = products.reduce((acc, p) => {
      const category = p.category || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].value += p.price * p.quantity;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const categoryData: ChartData[] = Object.entries(categoryDistribution)
      .map(([label, data]) => ({
        label,
        value: data.value,
        percentage: (data.value / totalInventoryValue) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Monthly revenue trend (last 6 months)
    const monthlyTrend: ChartData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(thisYear, thisMonth - i, 1);
      const monthRevenue = receivables
        .filter((t) => {
          const tDate = new Date(t.created_at);
          return (
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.paid_amount, 0);

      monthlyTrend.push({
        label: date.toLocaleDateString('es-ES', { month: 'short' }),
        value: monthRevenue,
      });
    }

    return {
      totalInventoryValue,
      totalInventoryCost,
      potentialProfit,
      totalRevenue,
      thisMonthRevenue,
      totalExpenses,
      thisMonthExpenses,
      netProfit,
      totalReceivable,
      totalPayable,
      topCustomers,
      lowStockProducts,
      categoryData,
      monthlyTrend,
    };
  }, [products, customers, accountTransactions]);

  const exportToCSV = () => {
    try {
      const csv = [
        ['Métrica', 'Valor'],
        ['Valor Total Inventario', metrics.totalInventoryValue.toFixed(2)],
        ['Costo Total Inventario', metrics.totalInventoryCost.toFixed(2)],
        ['Ganancia Potencial', metrics.potentialProfit.toFixed(2)],
        ['Ingresos Este Mes', metrics.thisMonthRevenue.toFixed(2)],
        ['Gastos Este Mes', metrics.thisMonthExpenses.toFixed(2)],
        ['Ganancia Neta Este Mes', metrics.netProfit.toFixed(2)],
        ['Total Por Cobrar', metrics.totalReceivable.toFixed(2)],
        ['Total Por Pagar', metrics.totalPayable.toFixed(2)],
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `reporte-${new Date().toISOString().split('T')[0]}.csv`;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      success(`Reporte exportado como ${fileName}`);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 20;
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Análisis de Negocio', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generado el ${today}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Metrics Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Métricas Clave', marginLeft, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const metricsData = [
        ['Valor Total Inventario:', `$${metrics.totalInventoryValue.toLocaleString()}`],
        ['Costo Total Inventario:', `$${metrics.totalInventoryCost.toLocaleString()}`],
        ['Ganancia Potencial:', `$${metrics.potentialProfit.toLocaleString()}`],
        ['', ''],
        ['Ingresos Este Mes:', `$${metrics.thisMonthRevenue.toLocaleString()}`],
        ['Gastos Este Mes:', `$${metrics.thisMonthExpenses.toLocaleString()}`],
        ['Ganancia Neta Este Mes:', `$${metrics.netProfit.toLocaleString()}`],
        ['', ''],
        ['Total Por Cobrar:', `$${metrics.totalReceivable.toLocaleString()}`],
        ['Total Por Pagar:', `$${metrics.totalPayable.toLocaleString()}`],
      ];

      metricsData.forEach(([label, value]) => {
        if (label === '') {
          yPos += 4;
        } else {
          doc.text(label, marginLeft, yPos);
          doc.setFont('helvetica', 'bold');
          doc.text(value, marginLeft + 80, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += 6;
        }
      });

      // Monthly Trend Section
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tendencia de Ingresos (6 meses)', marginLeft, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      metrics.monthlyTrend.forEach((month) => {
        doc.text(month.label, marginLeft, yPos);
        doc.text(`$${month.value.toLocaleString()}`, marginLeft + 40, yPos);
        yPos += 6;
      });

      // Top Customers Section
      if (metrics.topCustomers.length > 0) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Principales Clientes con Deuda', marginLeft, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        metrics.topCustomers.slice(0, 5).forEach((customer) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(customer.name, marginLeft, yPos);
          doc.setTextColor(220, 38, 38);
          doc.text(`$${customer.totalDebt.toLocaleString()}`, marginLeft + 80, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        });
      }

      // Low Stock Products Section
      if (metrics.lowStockProducts.length > 0) {
        yPos += 10;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Productos con Stock Bajo', marginLeft, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        metrics.lowStockProducts.slice(0, 10).forEach((product) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${product.name}`, marginLeft, yPos);
          doc.setTextColor(220, 38, 38);
          doc.text(`${product.quantity} unidades`, marginLeft + 100, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        });
      }

      // Save PDF
      const fileName = `reporte-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      success(`Reporte PDF exportado como ${fileName}`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-2 border-blue-100">
        <div className="mb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Reportes y Análisis</h1>
          <p className="text-sm md:text-lg text-gray-600">
            Vista general del desempeño de tu negocio
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={exportToCSV} 
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            title="Descargar reporte en formato CSV"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Exportar CSV</span>
          </button>
          <button 
            onClick={exportToPDF} 
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            title="Descargar reporte en formato PDF"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${metrics.thisMonthRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ganancia Neta</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${metrics.netProfit.toLocaleString()}
              </p>
            </div>
            {metrics.netProfit >= 0 ? (
              <TrendingUp className="w-10 h-10 text-green-600" />
            ) : (
              <TrendingDown className="w-10 h-10 text-red-600" />
            )}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${metrics.totalInventoryValue.toLocaleString()}
              </p>
            </div>
            <Package className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Por Cobrar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${metrics.totalReceivable.toLocaleString()}
              </p>
            </div>
            <Users className="w-10 h-10 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Tendencia de Ingresos (6 meses)
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.monthlyTrend.map((month, index) => {
              const maxValue = Math.max(...metrics.monthlyTrend.map((m) => m.value));
              const percentage = maxValue > 0 ? (month.value / maxValue) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {month.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${month.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Distribución por Categoría
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.categoryData.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    {category.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ${category.value.toLocaleString()} ({category.percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers by Debt */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Principales Clientes con Deuda
          </h2>
          <div className="space-y-3">
            {metrics.topCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay clientes con deuda registrada
              </p>
            ) : (
              metrics.topCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {customer.photo ? (
                      <img
                        src={customer.photo}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">
                        {customer.total_purchases || 0} compras
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ${customer.total_debt.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Productos con Stock Bajo
          </h2>
          <div className="space-y-3">
            {metrics.lowStockProducts.length === 0 ? (
              <p className="text-green-600 text-center py-4 font-semibold">
                ✓ Todos los productos tienen stock suficiente
              </p>
            ) : (
              metrics.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {product.quantity} unidades
                    </p>
                    <p className="text-xs text-gray-500">
                      Mínimo: {product.low_stock_threshold}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Ganancia Potencial (Inventario)
            </p>
            <p className="text-2xl font-bold text-green-600">
              ${metrics.potentialProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Diferencia entre precio venta y costo
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Por Pagar</p>
            <p className="text-2xl font-bold text-red-600">
              ${metrics.totalPayable.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Deuda pendiente con proveedores
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Balance Neto Pendiente
            </p>
            <p
              className={`text-2xl font-bold ${
                metrics.totalReceivable - metrics.totalPayable >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              ${(metrics.totalReceivable - metrics.totalPayable).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Por cobrar - Por pagar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

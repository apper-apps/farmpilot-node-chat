import { format } from "date-fns";

class ExportService {
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  }

  getFarmName(farmId, farms) {
    const farm = farms.find(f => f.Id === farmId);
    return farm?.name || "Unknown Farm";
  }

  async exportToCSV(transactions, farms, options) {
    try {
      const headers = [
        "Date",
        "Farm",
        "Type", 
        "Category",
        "Description",
        "Amount"
      ];

      const csvData = [
        headers.join(","),
        ...transactions.map(transaction => {
          const row = [
            format(new Date(transaction.date), "yyyy-MM-dd"),
            `"${this.getFarmName(transaction.farmId, farms)}"`,
            transaction.type,
            `"${transaction.category}"`,
            `"${transaction.description || ""}"`,
            transaction.amount
          ];
          return row.join(",");
        })
      ];

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netProfit = totalIncome - totalExpenses;

      // Add summary rows
      csvData.push("");
      csvData.push("SUMMARY");
      csvData.push(`Total Income,,,,,"${totalIncome}"`);
      csvData.push(`Total Expenses,,,,,"${totalExpenses}"`);
      csvData.push(`Net Profit,,,,,"${netProfit}"`);
      csvData.push(`Export Date,,,,,"${format(new Date(), "yyyy-MM-dd HH:mm:ss")}"`);
      csvData.push(`Date Range,,,,,"${options.startDate} to ${options.endDate}"`);

      const csvContent = csvData.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `financial-data-${options.startDate}-to-${options.endDate}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      throw new Error("Failed to export CSV: " + error.message);
    }
  }

  async exportToPDF(transactions, farms, options) {
    try {
      // Create PDF content as HTML
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === "expense")  
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netProfit = totalIncome - totalExpenses;

      // Group transactions by month for better organization
      const groupedTransactions = transactions.reduce((groups, transaction) => {
        const monthKey = format(new Date(transaction.date), "yyyy-MM");
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(transaction);
        return groups;
      }, {});

      const sortedMonths = Object.keys(groupedTransactions).sort().reverse();

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Financial Report</title>
          <style>
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #2D5016;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #2D5016; 
              margin: 0; 
              font-size: 28px;
            }
            .header p { 
              color: #666; 
              margin: 5px 0;
            }
            .summary { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .summary-card { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center;
              border: 1px solid #e9ecef;
            }
            .summary-card h3 { 
              margin: 0 0 10px 0; 
              color: #666; 
              font-size: 14px;
              text-transform: uppercase;
            }
            .summary-card .amount { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 0;
            }
            .income { color: #7CB342; }
            .expense { color: #FF6F00; }
            .profit { color: #2D5016; }
            .loss { color: #dc3545; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              background: white;
            }
            th, td { 
              padding: 12px 8px; 
              text-align: left; 
              border-bottom: 1px solid #e9ecef;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: 600;
              color: #2D5016;
            }
            .month-header { 
              background-color: #2D5016; 
              color: white; 
              padding: 15px; 
              margin: 30px 0 15px 0;
              border-radius: 5px;
              font-weight: bold;
            }
            .income-row { background-color: #f0f9e9; }
            .expense-row { background-color: #fff3e0; }
            .amount { font-weight: 600; }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #e9ecef;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .month-header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚜 Farm Financial Report</h1>
            <p>Period: ${format(new Date(options.startDate), "MMM dd, yyyy")} - ${format(new Date(options.endDate), "MMM dd, yyyy")}</p>
            <p>Generated: ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <h3>Total Income</h3>
              <p class="amount income">${this.formatCurrency(totalIncome)}</p>
            </div>
            <div class="summary-card">
              <h3>Total Expenses</h3>
              <p class="amount expense">${this.formatCurrency(totalExpenses)}</p>
            </div>
            <div class="summary-card">
              <h3>Net Profit</h3>
              <p class="amount ${netProfit >= 0 ? 'profit' : 'loss'}">${this.formatCurrency(netProfit)}</p>
            </div>
          </div>
      `;

      sortedMonths.forEach(monthKey => {
        const monthTransactions = groupedTransactions[monthKey];
        const monthDate = new Date(monthKey + "-01");
        
        htmlContent += `
          <div class="month-header">
            ${format(monthDate, "MMMM yyyy")} - ${monthTransactions.length} transactions
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Farm</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
        `;

        monthTransactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .forEach(transaction => {
            htmlContent += `
              <tr class="${transaction.type}-row">
                <td>${format(new Date(transaction.date), "MMM dd")}</td>
                <td>${this.getFarmName(transaction.farmId, farms)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description || '-'}</td>
                <td style="text-transform: capitalize;">${transaction.type}</td>
                <td class="amount" style="text-align: right;">
                  ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
              </tr>
            `;
          });

        htmlContent += `
            </tbody>
          </table>
        `;
      });

      htmlContent += `
          <div class="footer">
            <p>This report contains ${transactions.length} transactions across ${farms.length} farms.</p>
            <p>Generated by FarmPilot Financial Management System</p>
          </div>
        </body>
        </html>
      `;

      // Create PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

    } catch (error) {
      throw new Error("Failed to export PDF: " + error.message);
    }
  }
}

export default new ExportService();
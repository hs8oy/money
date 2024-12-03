
    // الحصول على العناصر
    const form = document.getElementById('budget-form');
    const incomeInput = document.getElementById('income');
    const expenseInput = document.getElementById('expense');
    const budgetDetails = document.getElementById('budget-details');
    const totalElement = document.getElementById('total');
    const resetButton = document.getElementById('reset');
    const saveButton = document.getElementById('save');
    const savedTablesList = document.getElementById('saved-tables-list');
    const errorMessage = document.getElementById('error-message');
  
    let totalIncome = 0;
    let totalBalance = 0;
    let isFirstEntry = true;
  
    // استعادة البيانات المحفوظة عند تحميل الصفحة
    window.onload = function() {
      loadSavedTables();
    };
  
    // وظيفة تنسيق الأرقام عند الإدخال
    function formatNumberInput(input) {
      input.value = input.value.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  
    incomeInput.addEventListener('input', function() {
      formatNumberInput(incomeInput);
    });
  
    expenseInput.addEventListener('input', function() {
      formatNumberInput(expenseInput);
    });
  
    // وظيفة الحصول على التاريخ الحالي
    function getCurrentDate() {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // الشهور تبدأ من 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  
    // إضافة كلمة "دينار" عند فقدان التركيز فقط
    incomeInput.addEventListener('blur', function() {
      if (incomeInput.value && !incomeInput.value.includes("دينار")) {
        incomeInput.value += ' دينار';
      }
    });
  
    expenseInput.addEventListener('blur', function() {
      if (expenseInput.value && !expenseInput.value.includes("دينار")) {
        expenseInput.value += ' دينار';
      }
    });
  
    // وظيفة تحديث الميزانية
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // منع التحديث الافتراضي للصفحة
  
      // الحصول على القيم المدخلة
      const income = parseFloat(incomeInput.value.replace(/,/g, '').replace(' دينار', '')) || 0;
      const expense = parseFloat(expenseInput.value.replace(/,/g, '').replace(' دينار', '')) || 0;
  
      // تحقق من الدخل صفر
      if (income === 0) {
        errorMessage.textContent = "مـاعـنـدك فـلـوس صـدك تـحـجـي ؟؟";
        totalElement.style.display = 'none'; // إخفاء الإجمالي
        return; // التوقف عن تنفيذ أي عمليات
      } else {
        errorMessage.textContent = "";
      }
  
      // تحقق من المصاريف أكبر من الدخل
      if (expense > income) {
        errorMessage.textContent = "المصروف اكثر من الدخل ميصير حبيبي .";
        totalElement.style.display = 'none'; // إخفاء الإجمالي
        return; // التوقف عن تنفيذ أي عمليات
      }
  
      if (isFirstEntry && income >= 0) {
        totalIncome = income;
        isFirstEntry = false;
      } else {
        totalIncome = totalBalance;
      }
  
      // حساب الإجمالي المتبقي
      totalBalance = totalIncome - expense;
  
      // تنسيق الأرقام بنظام الفوارز
      const formattedIncome = totalIncome.toLocaleString() + ' دينار';
      const formattedExpense = expense.toLocaleString() + ' دينار';
      const formattedBalance = totalBalance.toLocaleString() + ' دينار';
      const currentDate = getCurrentDate();
  
      // إضافة صف جديد إلى الجدول
      const row = document.createElement('tr');
      row.innerHTML = `<td>${formattedIncome}</td><td>${formattedExpense}</td><td>${formattedBalance}</td><td>${currentDate}</td>`;
      budgetDetails.appendChild(row);
  
      // تحديث الإجمالي
      totalElement.textContent = `الإجمالي المتبقي: ${formattedBalance}`;
  
      // إعادة تعيين الحقول
      incomeInput.value = formattedBalance;
      expenseInput.value = '';
    });
  
    // وظيفة إعادة تعيين الكل
    resetButton.addEventListener('click', function() {
      budgetDetails.innerHTML = '';
      totalElement.textContent = 'الإجمالي المتبقي: 0';
      totalElement.style.display = 'none'; // إخفاء الإجمالي عند المسح
      totalIncome = 0;
      totalBalance = 0;
      isFirstEntry = true;
      incomeInput.value = '';
      expenseInput.value = '';
      errorMessage.textContent = '';
    });
  
    // حفظ البيانات
    function saveData() {
      const transactions = [];
      const rows = budgetDetails.getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const transaction = {
          income: cells[0].textContent,
          expense: cells[1].textContent,
          remaining: cells[2].textContent,
          date: cells[3].textContent
        };
        transactions.push(transaction);
      }
  
      const data = {
        transactions,
        balance: totalBalance
      };
  
      // إنشاء اسم فريد لكل ملف محفوظ مع التاريخ
      const fromDate = transactions.length > 0 ? transactions[0].date : getCurrentDate();
      const toDate = transactions.length > 0 ? transactions[transactions.length - 1].date : getCurrentDate();
      const fileName = `ميزانية_${fromDate}_إلى_${toDate}_${new Date().getTime()}`;
  
      localStorage.setItem(fileName, JSON.stringify(data));
      loadSavedTables();
    }
  
    // تحميل وحفظ الجداول المخزنة
    function loadSavedTables() {
      savedTablesList.innerHTML = '';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const data = JSON.parse(localStorage.getItem(key));
  
        const button = document.createElement('button');
        button.textContent = `تحميل ${key}`;
        button.addEventListener('click', function() {
          loadTableFromStorage(data);
        });
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'حذف';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', function() {
          localStorage.removeItem(key);
          loadSavedTables();
        });
  
        const tableItem = document.createElement('div');
        tableItem.appendChild(button);
        tableItem.appendChild(deleteButton);
        savedTablesList.appendChild(tableItem);
      }
    }
  
    // تحميل الجدول المحفوظ عند الضغط عليه
    function loadTableFromStorage(data) {
      budgetDetails.innerHTML = '';
      data.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${transaction.income}</td><td>${transaction.expense}</td><td>${transaction.remaining}</td><td>${transaction.date}</td>`;
        budgetDetails.appendChild(row);
      });
  
      totalBalance = data.balance;
      totalElement.textContent = `الإجمالي المتبقي: ${totalBalance.toLocaleString()} دينار`;
      totalElement.style.display = 'block';
    }
  
    // إضافة وظيفة لحفظ البيانات
    saveButton.addEventListener('click', function() {
      saveData();
    });

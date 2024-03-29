/* const Toggle = {
    toggleFunction() {
        if(document.querySelector('.modal-overlay').classList.contains('active') === true) {
            document.querySelector('.modal-overlay').classList.remove('active');
        }
        else {
            document.querySelector('.modal-overlay').classList.add('active');
        }
    }
}; */

const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },

  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
    document.querySelector(".error-strip").classList.remove("active");
  },

  closeError() {
    document.querySelector(".error-strip").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

/* const transactions = [ 
    {
        description: "Luz",
        amount: -50000,
        date: "30/01/2021",
    },
    {
        description: "Website",
        amount: 500000,
        date: "30/01/2021",
    },
    {
        description: "Internet",
        amount: -20000,
        date: "30/01/2021",
    },
    {
        description: "Aluguel",
        amount: -130000,
        date: "30/01/2021",
    },
    {
        description: "App",
        amount: 120000,
        date: "30/01/2021",
    }
] */

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // pegar transações
    // para cada transação, verificar se é maior que 0
    Transaction.all.forEach((transaction) => {
      // se transação > 0
      if (transaction.amount > 0) {
        // somar e retornar variavel
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expense = 0;
    // pegar transações
    // para cada transação, verificar se é maior que 0
    Transaction.all.forEach((transaction) => {
      // se transação > 0
      if (transaction.amount < 0) {
        // somar e retornar variavel
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    //total é a soma da entrada menos a saída
    return Transaction.incomes() + Transaction.expenses();
  },
};

// substituir os dados do HTML pelos dados do JS
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransactions(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransactions(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/remove.png" height="26px" alt="Remover transação">
        </td>   
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },

  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      // verificar se todas as informações foram preenchidas
      Form.validateFields();

      // formatar os dados para salvar
      const transaction = Form.formatValues();

      // salvar
      Form.saveTransaction(transaction);

      // apagar os dados do formulario
      Form.clearFields();

      // fechar o modal
      Modal.close();
    } catch (error) {
      document.querySelector(".error-strip").classList.add("active");
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();

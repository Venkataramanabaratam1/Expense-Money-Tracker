import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import './comp.css';
import CountUp from 'react-countup';
import { Col, Row, Statistic, Input, Select, Button, Switch, message } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Chart from 'chart.js';


const { Option } = Select;

const formatter = (value) => <CountUp end={value} separator="," />;

const Container = styled.div`
  background-color: #f0f2f5;
  color: #333;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
  & > * {
    margin-right: 10px;
  }
`;

// const InputContainer = styled.div`
//   margin-bottom: 20px;
//   display: flex;
//   align-items: center;
// `;

const TransactionsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TransactionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  &.income {
    background-color: #28e00c;
  }
  &.expense {
    background-color: #dc3545;
  }
`;

function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [inputDescription, setInputDescription] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [searchText, setSearchText] = useState('');
  const [chartData, setChartData] = useState({});
  const [budget, setBudget] = useState(0);
  const [budgetEnabled, setBudgetEnabled] = useState(false); // State to manage budget enable/disable

  useEffect(() => {
    const chartLabels = transactions.map(transaction => transaction.description);
    const expenseData = transactions.map(transaction => transaction.type === 'expense' ? transaction.amount : 0);
    const incomeData = transactions.map(transaction => transaction.type === 'income' ? transaction.amount : 0);

    setChartData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#dc3545'
        },
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#28e00c'
        }
      ]
    });
  }, [transactions]);

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {
      const ctx = document.getElementById('transactionChart');
      if (ctx !== null) {
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            scales: {
              x: {
                stacked: true
              },
              y: {
                stacked: true
              }
            }
          }
        });
        return () => myChart.destroy();
      }
    }
  }, [chartData]);
  
  const [budgetInput, setBudgetInput] = useState(budget.toString()); // State to manage the input value for budget
  // Function to handle changes to the input value for budget
  const handleBudgetInputChange = (e) => {
    setBudgetInput(e.target.value); // Update the input value
  };

  // Function to handle the click event for updating the budget
  const handleUpdateBudget = () => {
    setBudget(parseFloat(budgetInput)); // Update the budget value
  };

  const calculateTotal = (type) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === type) {
        return total + transaction.amount;
      }
      return total;
    }, 0);
  };

  const totalExpense = calculateTotal('expense');

  useEffect(() => {
    if (totalExpense > budget) {
      message.warning({
        content: 'Your expenses have exceeded the budget!',
        icon: <ExclamationCircleOutlined />,
        duration: 5,
      });
    }
  }, [totalExpense, budget]);


  const addTransaction = () => {
    if (inputDescription.trim() !== '' && inputAmount !== '') {
      const newTransaction = {
        id: Math.floor(Math.random() * 100000),
        description: inputDescription,
        amount: parseFloat(inputAmount),
        type: transactionType
      };
      setTransactions([...transactions, newTransaction]);
      setInputDescription('');
      setInputAmount('');
      setTransactionType('expense');
    }
  };

  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updatedTransactions);
  };

  const editTransaction = (id, newDescription, newAmount) => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        return {
          ...transaction,
          description: newDescription,
          amount: newAmount
        };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);
  };

  // const calculateTotal = (type) => {
  //   return transactions.reduce((total, transaction) => {
  //     if (transaction.type === type) {
  //       return total + transaction.amount;
  //     }
  //     return total;
  //   }, 0);
  // };

  // const totalExpense = calculateTotal('expense');
  const totalIncome = calculateTotal('income');
  const availableBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="">
      <br />
      <Container>
        <h3>Add your New Transaction</h3>
        <InputContainer>
          <Input
            placeholder="Enter Description"
            value={inputDescription}
            onChange={(e) => setInputDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Enter Amount"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
          />
          <Select value={transactionType} onChange={(value) => setTransactionType(value)}>
            <Option value="income">Income</Option>
            <Option value="expense">Expense</Option>
          </Select>
          <Button type="primary" onClick={addTransaction}>Add Transaction</Button>
        </InputContainer>

        <br/>
        <h3>Your Summary</h3>
        <Row gutter={10} justify="space-between">
          <Col span={8}>
            <Statistic
              title="Available Balance:"
              value={availableBalance}
              precision={2}
              valueStyle={{
                color: availableBalance >= 0 ? '#3f8600' : '#cf1322',
              }}
              suffix={availableBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              prefix="₹"
              formatter={formatter}
            />
          </Col>
          <Col gutter={8}>
            <Statistic
              title="Total Income:"
              value={totalIncome}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix="₹"
              suffix={<ArrowUpOutlined />}
              formatter={formatter}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Expense:"
              value={totalExpense}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix="₹"
              suffix={<ArrowDownOutlined />}
              formatter={formatter}
            />
          </Col>
        </Row>
        
        <br/>
        
        <h3>Budget </h3>
        <h4>Enable/Disable Budget Option : <Switch checked={budgetEnabled} onChange={(checked) => setBudgetEnabled(checked)} /></h4>
        <h4>Enter your Budget here</h4>
        <Input
          type="number"
          placeholder="Set Your Budget"
          value={budgetInput}
          onChange={handleBudgetInputChange}
          disabled={!budgetEnabled} // Disable input if budget is not enabled
        />
        <Button type="primary" onClick={handleUpdateBudget}>Update Budget</Button>
        <br/> <br/>

        <h3>Your Transactions</h3>
        <Input
          placeholder="Search Here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <TransactionsList>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} className={transaction.type}>
              <span>{transaction.description} - ₹{transaction.amount}</span>
              <div className="buttons">
                <Button onClick={() => deleteTransaction(transaction.id)}>Delete</Button>
                <Button onClick={() => {
                  const newDescription = prompt('Enter new description:', transaction.description);
                  const newAmount = parseFloat(prompt('Enter new amount:', transaction.amount));
                  if (newDescription !== null && !isNaN(newAmount)) {
                    editTransaction(transaction.id, newDescription, newAmount);
                  }
                }}>Edit</Button>
              </div>
            </TransactionItem>
          ))}
        </TransactionsList>

        <br/><br/>
        <h3>Visual Representation of your Transactions</h3>
        <canvas id="transactionChart"></canvas>

      </Container>
      <br/>
    </div>
  );
}

export default ExpenseTracker;

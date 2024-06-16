import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import './comp.css';
import CountUp from 'react-countup';
import { Col, Row, Statistic, Input, Select, Button, message } from 'antd';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';

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
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [chartData, setChartData] = useState({});

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
  
  const calculateTotal = (type) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === type) {
        return total + transaction.amount;
      }
      return total;
    }, 0);
  };

  const totalExpense = calculateTotal('expense');

  const addTransaction = () => {
    if (inputDescription.trim() !== '' && inputAmount !== '' && category.trim() !== '') {
      const newTransaction = {
        id: Math.floor(Math.random() * 100000),
        description: inputDescription,
        amount: parseFloat(inputAmount),
        type: transactionType,
        category: category
      };
      setTransactions([...transactions, newTransaction]);
      setInputDescription('');
      setInputAmount('');
      setTransactionType('expense');
      setCategory('');
    } else {
      message.error('Please fill all fields');
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

  const totalIncome = calculateTotal('income');
  const availableBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const tableColumns = [
    { title: 'S.No', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'description' },
    { title: 'Money', dataIndex: 'amount' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Category', dataIndex: 'category' }
  ];

  // Function to download transactions as a PDF file
  const downloadTransactions = () => {
    const doc = new jsPDF();

    // Convert transactions data to rows
    const tableRows = transactions.map((transaction, index) => [
      index + 1,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category
    ]);

    doc.autoTable({
      head: [tableColumns.map(column => column.title)],
      body: tableRows
    });
    doc.save('transactions.pdf');
  };

  // Create data array for CSV export
  const csvData = transactions.map((transaction, index) => ({
    id: index + 1,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category
  }));

  // CSV headers
  const csvHeaders = tableColumns.map(column => ({ label: column.title, key: column.dataIndex }));

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
          <Input
            placeholder="Enter Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
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
              formatter={formatter}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Transactions:"
              value={transactions.length}
              precision={0}
              valueStyle={{ color: '#FF0000' }}
              formatter={formatter}
            />
          </Col>
        </Row>
        
        <br/>
        

        <h3>Your Transactions</h3>
        <Input
          placeholder="Search Here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <TransactionsList>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} className={transaction.type}>
              <span>{transaction.description} - ₹{transaction.amount} ({transaction.category})</span>
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

        <br/>
        <Button type="primary" onClick={downloadTransactions}>Download PDF</Button> &nbsp;
        <CSVLink data={csvData} headers={csvHeaders} filename={"transactions.csv"}>
          <Button type="primary">Download CSV</Button>
        </CSVLink>
      </Container>
    </div>
  );
}

export default ExpenseTracker;

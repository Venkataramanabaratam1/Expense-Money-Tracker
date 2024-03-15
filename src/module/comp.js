import React, { useState } from 'react';
import styled from "styled-components";
import './comp.css';
import CountUp from 'react-countup';
import { Col, Row, Statistic } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const formatter = (value) => <CountUp end={value} separator="," />;
const Container = styled.div`
  background-color: #00000014;
  color: #0d1d2c;
  display: flex;
  flex-direction: column;
  padding: 10px 22px;
  font-size: 18px;
  width: 360px;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  order:-1
`;

function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [inputDescription, setInputDescription] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [searchText, setSearchText] = useState('');

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

  const calculateTotal = (type) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === type) {
        return total + transaction.amount;
      }
      return total;
    }, 0);
  };

  const totalExpense = calculateTotal('expense');
  const totalIncome = calculateTotal('income');
  const availableBalance = totalIncome - totalExpense;

  // Function to filter transactions based on search text
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className='main'>
      <div className="summary">
        <Row gutter={16} justify="center">
        <Col span={12} justify="center">
      <Statistic 
      title="Available Balance:" 
      value={availableBalance}
      precision={2}
      valueStyle={{
        color: availableBalance >= 0 ? '#3f8600' : '#cf1322', // Green for positive, red for negative
      }}
      suffix={availableBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      prefix="₹"
      formatter={formatter} />
    </Col>
        </Row>
      <Row gutter={16}>
    <Col span={12}>
      <Statistic 
      title="Total Income:" 
      value={totalIncome}
      precision={2}
      valueStyle={{
        color: '#3f8600',
      }}
      suffix={<ArrowUpOutlined />}
      prefix="₹"
      formatter={formatter} />
    </Col>
    <Col span={12}>
      <Statistic 
      title="Total Expense:" 
      value={totalExpense} 
      precision={2}
      valueStyle={{
        color: 'red',
      }}
      suffix={<ArrowDownOutlined />}
      prefix="₹"
      formatter={formatter} />
    </Col>
  </Row>
        {/* <h3 align="center">Summary</h3>
        <b><p>Available Balance: ₹{availableBalance}</p></b>
        <p>Total Income: ₹{totalIncome}</p>
        <p>Total Expense: ₹{totalExpense}</p> */}
      </div>
      <br/>

     <Container>
      <h3>Add Your Transaction</h3>
     <div>
       <h3>New Transaction</h3>
       <input
         type="text"
         placeholder="Enter Description"
         value={inputDescription}
         onChange={(e) => setInputDescription(e.target.value)}
       />
       <br/>
       <input
        type="number"
        placeholder="Enter Amount"
        value={inputAmount}
        onChange={(e) => setInputAmount(e.target.value)}
       />
       <br/><br/>
      <div>
        <span>Transaction Type: </span> 
        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
       </select>
      </div>
     <br/>
     <div align="center"><button className="button" onClick={addTransaction}>Add Transaction</button></div>
     <br/>
    </div>
    </Container>

      <div className="transactions">
        <h3>Your Transactions</h3>
        <div className="search">
         <input
           type="text"
           placeholder="Search Here"
           value={searchText}
           onChange={(e) => setSearchText(e.target.value)}
         />
        </div>
        <ul>
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id} className={transaction.type}>
              <span>{transaction.description} - ₹{transaction.amount}</span>
              <div className="buttons">
              <button className="delete-button" onClick={() => deleteTransaction(transaction.id)}>Delete</button>
              <button className="edit-button" onClick={() => {
                const newDescription = prompt('Enter new description:', transaction.description);
                const newAmount = parseFloat(prompt('Enter new amount:', transaction.amount));
                if (newDescription !== null && !isNaN(newAmount)) {
                  editTransaction(transaction.id, newDescription, newAmount);
                }
              }}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExpenseTracker;

import React from "react";
import styled from "styled-components";
import ExpenseTracker from "./module/comp";
import TawkToWidget from "./module/bot";


const Container = styled.div`
  // background-color: lightblue;
  color: #0d1d2c;
  display: flex;
  flex-direction: column;
  margin: 0 10px;
  align-items: center;
  height: 110vh;
  width: 99%;
  padding-top: 30px ;
  font-family: Montserrat;
`;

const Header = styled.div`
  // background-color: white;
  color: #0d1d2c;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 22px;
  font-size: 25px;
  font-weight: bold;
`;
const App = () => {
  return (
    <Container>
      <u><Header>Expense/Money Tracker</Header></u>
      <TawkToWidget/>
      <ExpenseTracker/>
    </Container>
  );
};

export default App;

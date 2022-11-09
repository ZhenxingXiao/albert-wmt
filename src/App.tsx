import { FC } from 'react';
import { Row, Col } from 'antd';
import { LoginCard } from './components/login-card/login-card';
import { Dashboard } from './components/dashboard/dashboard';
import info from '../package.json';

import './App.less';

const App: FC = () => {
  let isLogin = true;
  let content;
  if(isLogin){
    content = (
      <Col className='dashboard-container' span={ 24 }>
       <Dashboard />
      </Col>
    );
  }else{
    content = (
      <Col span={ 12 }>
       <LoginCard />
      </Col>
    );
  }
  return(
    <Row justify='center' align='middle' className='app-container'>
      { content }
      <div className='app-info'>
        <p>🐾 {info['name']} version: <span>{info['version']}</span></p>
      </div>
    </Row>
  );
}

export default App;

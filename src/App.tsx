import { FC } from 'react';
import { Row, Col } from 'antd';
import { LoginCard } from './components/login-card/login-card';
import info from '../package.json';

import './App.less';

const App: FC = () => {
  return(
    <Row justify='center' align='middle' className='app-container'>
      <Col span={ 12 }>
        <LoginCard />
      </Col>
      <div className='app-info'>
        <p>{info['name']}: <span>{info['version']}</span></p>
      </div>
    </Row>
  );
}

export default App;

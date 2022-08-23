import { FC } from 'react';
import { Row, Col } from 'antd';
import { LoginCard } from './components/login-card/login-card';
import info from '../package.json';

import './App.less';

const App: FC = () => {
  return(
    <Row justify='center' align='middle' className='app-container'>
      <Col span={8}>
        <LoginCard />
      </Col>
      <div className='app-info'>
        <p>{info['name']}: <span>{info['version']}</span></p>
        <p>chrome: <span>{process.versions['chrome']}</span></p>
        <p>node: <span>{process.versions['node']}</span></p>
        <p>electron: <span>{process.versions['electron']}</span></p>
      </div>
    </Row>
  );
}

export default App;

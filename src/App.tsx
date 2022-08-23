import { FC } from 'react';
import { Row, Col } from 'antd';
import './App.less';

const App: FC = () => {
  return(
    <Row justify='center' align='middle' className='app-container'>
      <Col span={4}>
        <p>SSH Login</p>
      </Col>
    </Row>
  );
}

export default App;

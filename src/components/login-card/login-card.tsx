import { FC } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { ApiOutlined, DatabaseOutlined, UserOutlined, LockOutlined, CloudUploadOutlined, UndoOutlined } from '@ant-design/icons';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

const formTailLayout = {
    wrapperCol: { offset: 4, span: 18 },
};

const LoginCard: FC = () => {
    return(
        <Card title="Connection To The Remote Server" bordered={false}>
            <Form {...layout}>
                <Form.Item 
                    name='host' 
                    label='Host' 
                    tooltip='Example 127.0.0.1 or localhost'
                    validateFirst
                    initialValue={'127.0.0.1'}
                    rules={[
                        {
                            required: true,
                            message: 'This field is required!'
                        },
                        () => ({
                            validator(_, value) {
                                const IpV4RegExp: RegExp = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/g;
                                const UrlRegExp: RegExp = /^htt(p|ps):\/\/.*/g;
                                if( IpV4RegExp.test(value) || UrlRegExp.test(value)){
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("That is not an effective host!"));
                            },
                        })
                    ]}>
                    <Input placeholder='xxx.xxx.xxx.xxx' prefix={ <ApiOutlined/> } allowClear/>
                </Form.Item>
                <Form.Item 
                    name='port' 
                    label='Port' 
                    tooltip='Example 22'
                    initialValue={22}
                    rules={[
                        {
                            required: true,
                            message: 'This field is required!'
                        }
                    ]}>
                    <Input placeholder='xxxx' prefix={ <DatabaseOutlined/> } type='number' allowClear/>
                </Form.Item>
                <Form.Item 
                    name='user' 
                    label='User' 
                    tooltip="Example 'Administrator'"
                    initialValue={'Administrator'}
                    rules={[
                        {
                            required: true,
                            message: 'This field is required!'
                        }
                    ]}>
                    <Input placeholder='Administrator' prefix={ <UserOutlined/> } allowClear/>
                </Form.Item>
                <Form.Item 
                    name='password' 
                    label='Password' 
                    tooltip="Don't give the password to anyone"
                    rules={[
                        {
                            required: true,
                            message: 'This field is required!'
                        }
                    ]}>
                    <Input type='password' prefix={ <LockOutlined/> } placeholder='your password' allowClear/>
                </Form.Item>
                <Form.Item { ...formTailLayout }>
                    <Button type="primary" icon={ <CloudUploadOutlined/> } htmlType='submit'>
                        Connect
                    </Button>
                    <Button type="default" icon={ <UndoOutlined/> } htmlType='reset' className='to-left-8'>
                        Reset
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export { LoginCard };

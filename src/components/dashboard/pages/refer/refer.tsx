import { FC, useEffect, useState } from "react";
import { Button, Col, Collapse, Layout, Progress, Row, Upload, UploadFile, UploadProps, notification } from 'antd';
import { CaretRightOutlined, ExperimentFilled, UploadOutlined } from '@ant-design/icons';
import appRuntime from "../../../../app-runtime";

const {
    Content
} = Layout;
const {
    Panel
} = Collapse;
const ReferPage: FC = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [ progress, setProgress ] = useState(0);

    useEffect(() => {
        if(appRuntime){
            appRuntime.subscribe('refer-analysis', (str) => {
                const data = JSON.parse(str);
                if(data.isSuccess){
                    setProgress(Number(data.progress));
                    console.log(data.data);
                }else{
                    notification.error({
                        message: 'AST Parser Error',
                        description: `Error occured when parsed '${data.filePath}', error stack is '${data.message}'`,
                        placement: 'bottomRight'
                    });
                }
            });
        }
    });

    const uploadProps: UploadProps = {
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: ( _, newFileList) => {
            setFileList([...fileList, ...newFileList]);
            return false;
        },
        fileList,
        multiple: true
    }

    const executeBabelAnalysis = () => {
        if(appRuntime){
            const list = fileList.map(item => {
                return {
                    uid: item.uid,
                    filePath: (item as any).path
                };
            })
            appRuntime.send('refer-analysis', JSON.stringify(list));
        }
    }
    return(
        <Layout>
            <Content>
                <Collapse
                    bordered={false}
                    defaultActiveKey={[3]}
                    expandIcon={({isActive}) => <CaretRightOutlined rotate={ isActive ? 90 : 0}/>} ghost className="custom-collapse">
                        <Panel key={1} header="文件">
                            <Upload {...uploadProps}>
                                <Button icon={ <UploadOutlined/> }>选择文件</Button>
                            </Upload>
                        </Panel>
                        <Panel key={2} header="操作">
                            <Row align="middle">
                                <Col span={4}>
                                    <Button 
                                        onClick={() => {
                                            executeBabelAnalysis();
                                        }} 
                                        icon={<ExperimentFilled />}
                                    >执行分析</Button>
                                </Col>
                                <Col span={20}>
                                    <Progress
                                        strokeColor={{
                                            from: '#6a00f4',
                                            to: '#e500a4'
                                        }}
                                        strokeWidth={3}
                                        percent={ progress }
                                    />
                                </Col>
                            </Row>
                        </Panel>
                        <Panel key={3} header="交叉引用">
                            <Layout>
                                <Content>
                                    haha
                                </Content>
                            </Layout>
                        </Panel>
                </Collapse>
            </Content>
        </Layout>
    );
}

export { ReferPage }
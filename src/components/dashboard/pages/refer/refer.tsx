import { FC, useEffect, useState } from "react";
import { Button, Col, Collapse, Layout, Progress, Row, Upload, UploadFile, UploadProps, notification, Space, Tooltip, Input, Select, Table, Divider, message } from 'antd';
import { CaretRightOutlined, CopyOutlined, ExperimentFilled, ExportOutlined, FileOutlined, FolderOpenOutlined, ImportOutlined, UploadOutlined } from '@ant-design/icons';
import appRuntime from "../../../../app-runtime";
import ReactECharts from 'echarts-for-react';
import { REFER_ANALYSIS, REFER_ANALYSIS_GRAPH, DIALOG, DialogType } from 'channels';

const {
    Content
} = Layout;
const {
    Panel
} = Collapse;


const ReferPage: FC = () => {
    const [ fileList, setFileList ] = useState<UploadFile[]>([]);
    const [ progress, setProgress ] = useState(0);
    const [ graphOption, setGraphOption ] = useState<any>({
        title: {
            text: 'Module Relation Graph'
        },
        legend: {
            x: 'right',
            data: ['controller', 'service', 'factory', 'directive', 'unknown']
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        tooltip: {},
        series: [
            {
                type: 'graph',
                layout: 'none',
                roam: true,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                symbolSize: 25,
                focusNodeAdjacency: true,
                edgeSymbol: ['none', 'arrow'],
                labelLayout: {
                    hideOverlap: true
                },
                categories:[
                    {
                        name: 'controller',
                        symbolSize: 25,
                    },
                    {
                        name: 'service',
                        symbolSize: 25,
                    },
                    {
                        name: 'factory',
                        symbolSize: 25,
                    },
                    {
                        name: 'directive',
                        symbolSize: 25,
                    },
                    {
                        name: 'unknown',
                        symbolSize: 25,
                    },
                ],
                data: [],
                edges: []
            }
        ]
    });

    const [ exportDir, setExportDir ] = useState<string|undefined>(void 0);
    const [ importFile, setImportFile ] = useState<string|undefined>(void 0);

    const [ cols, setCols ] = useState<any[]>([
        {
            title: '名称',
            dataIndex: 'sourceNode',
            key: 'sourceNode',
            sorter: (a: any, b: any) => a.sourceNode.localeCompare(b.sourceNode),
        },
        {
            title: '成员',
            dataIndex: 'sourceMember',
            key: 'sourceMember',
            sorter: (a: any, b: any) => a.sourceMember.localeCompare(b.sourceMember),
        },
        {
            title: '引用名称',
            dataIndex: 'targetNode',
            key: 'targetNode',
            sorter: (a: any, b: any) => a.targetNode.localeCompare(b.targetNode),
        },
        {
            title: '引用成员',
            dataIndex: 'targetMember',
            key: 'targetMember',
            sorter: (a: any, b: any) => a.targetMember.localeCompare(b.targetMember),
        },
        {
            title: '行号',
            dataIndex: 'line_number',
            key: 'line_number',
            sorter: (a: any, b: any) => a.line_number - b.line_number,
        },
    ]);
    const [ ds, setDs ] = useState<any[]>([]);

    useEffect(() => {
        if(appRuntime){
            appRuntime.subscribe(REFER_ANALYSIS, (str) => {
                const data = JSON.parse(str);
                if(data.isSuccess){
                    setProgress(Number(data.progress));
                }else{
                    notification.error({
                        message: 'AST Parser Error',
                        description: `Error occured when parsed '${data.filePath}', error stack is '${data.message}'`,
                        placement: 'bottomRight'
                    });
                }
            });
            appRuntime.subscribe(REFER_ANALYSIS_GRAPH, (str) => {
                const graph = JSON.parse(str);
                if(graph && graph.nodes && graph.edges && graph.subEdges){
                    const _ds = graph.subEdges.map( (item: any) => {
                        return {
                            ...item,
                            line_number: item.loc?.line,
                            col_number: item.loc?.column
                        };
                    });
                    const _cols = cols.map((item: any) => {
                        if (item.key === 'line_number'){
                            return {
                                ...item,
                                render: (_, record: any) => (
                                    <Space size='middle'>
                                        <a href={`vscode://file/${record.file_path}:${record.line_number}:${record.col_number}`}>{record.line_number}</a>
                                    </Space>
                                )
                            }
                        }else{
                            return {
                                ...item,
                                filters: setFilters(_ds, item.key),
                                onFilter: setOnFilter(item.key),
                            }
                        }
                    });
                    setCols(_cols);
                    setDs(_ds);
                    setGraphOption({
                        ...graphOption, 
                        series: {
                            ...graphOption.series,
                            data: graph.nodes.map((n: any) => {
                                return {
                                    ...n,
                                    symbolSize: 25,
                                    category: n.type
                                }
                            }), 
                            edges: graph.edges
                        }
                    });
                }
            });
            appRuntime.subscribe(DIALOG, str => {
                const resDialog: DialogResult = JSON.parse(str);
                if(resDialog){
                    switch(resDialog.type){
                        case DialogType.DirectoryDialog:
                            setExportDir(resDialog.path);
                            break;
                        case DialogType.FileDialog:
                            setImportFile(resDialog.path);
                            break;
                    }
                }
            });
        }
    });

    const hasFile = (file: UploadFile) => {
        if(fileList.length <= 0){return false;}
        for (const _file of fileList) {
            if (_file.name === file.name){
                return true;
            }
        }
        return false;
    }

    const uploadProps: UploadProps = {
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: ( _, newFileList) => {
            const tempFileList: UploadFile[] = [];
            for (const file of newFileList) {
                if(!hasFile(file)){
                    tempFileList.push(file);
                }
            }
            setFileList([...fileList, ...tempFileList]);
            return false;
        },
        fileList,
        multiple: true
    }

    const setFilters = (_ds: any, fn: string): any[] =>  {
        return _ds.map((item: any) => item[fn]).reduce((p: string[], c: string) => {
            if (p.indexOf(c) < 0){
                p.push(c);
            }
            return p;
        }, []).map((val: string) => {
            return {
                text: val,
                value: val
            };
        });
    }

    const setOnFilter = (fn: string): (value: string, record: any)=> boolean => {
        return (value: string, record: any) => record[fn] === value;
    }

    return(
        <Layout>
            <Content>
                <Collapse
                    bordered={false}
                    defaultActiveKey={[4]}
                    expandIcon={({isActive}) => <CaretRightOutlined rotate={ isActive ? 90 : 0}/>} ghost className="custom-collapse">
                        <Panel key={1} header="文件">
                            <Upload {...uploadProps} className="upload-list-inline">
                                <Button icon={ <UploadOutlined/> }>选择文件</Button>
                            </Upload>
                        </Panel>
                        <Panel key={2} header="操作">
                            <Space direction="vertical" className="w100">
                                <Row align="middle">
                                    <Col span={4}>
                                        <Button 
                                            onClick={ _ => {
                                                executeBabelAnalysis(fileList);
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
                                <Row align="middle">
                                    <Col span={4}>
                                        <Tooltip title="选择目录">
                                            <Button type="text" icon={<FolderOpenOutlined 
                                            onClick={_ => appRuntime && appRuntime.send(DIALOG, DialogType.DirectoryDialog) }/>}></Button>
                                        </Tooltip>
                                        <Tooltip title="导出数据">
                                            <Button type="text" icon={<ExportOutlined />}></Button>
                                        </Tooltip>
                                    </Col>
                                    <Col span={20}>
                                        <Input.Group compact>
                                            <Input disabled style={{width: 'calc(100% - 32px)'}} value={exportDir}/>
                                            <Tooltip title="复制到剪切板">
                                                <Button disabled={!exportDir} icon={<CopyOutlined/>} onClick={_ => copyToClipboard(exportDir)}></Button>
                                            </Tooltip>
                                        </Input.Group>
                                    </Col>
                                </Row>
                                <Row align="middle">
                                    <Col span={4}>
                                        <Tooltip title="选择数据">
                                            <Button type="text" icon={<FileOutlined 
                                            onClick={_ => appRuntime && appRuntime.send(DIALOG, DialogType.FileDialog)}/>}></Button>
                                        </Tooltip>
                                        <Tooltip title="导入数据">
                                            <Button type="text" icon={<ImportOutlined />}></Button>
                                        </Tooltip>
                                    </Col>
                                    <Col span={20}>
                                        <Input.Group compact>
                                            <Input disabled style={{width: 'calc(100% - 32px)'}} value={importFile}/>
                                            <Tooltip title="复制到剪切板">
                                                <Button disabled={!importFile} icon={<CopyOutlined/>} onClick={_ => copyToClipboard(importFile)}></Button>
                                            </Tooltip>
                                        </Input.Group>
                                    </Col>
                                </Row>
                            </Space>
                        </Panel>
                        <Panel key={3} header="交叉引用——关系表">
                            <Space direction="vertical" className="w100">
                                {/* <Divider plain>🍀🍀🍀</Divider>
                                <Row>
                                    <Select 
                                        showSearch
                                        placeholder="Search to Select"
                                        options={[
                                        {
                                            value: '1',
                                            label: 'hahaha'
                                        }
                                    ]}></Select>
                                </Row>
                                <Divider plain>🍀🍀🍀</Divider> */}
                                <Row>
                                    <Table className="w100" columns={cols} dataSource={ ds }/>
                                </Row>
                            </Space>
                        </Panel>
                        <Panel key={4} header="交叉引用——关系图">
                            <Row>
                                <ReactECharts 
                                    option = { graphOption }
                                    style = {{
                                        width: '100%',
                                        height: '800px'
                                    }}
                                />
                            </Row>
                        </Panel>
                </Collapse>
            </Content>
        </Layout>
    );
}

const executeBabelAnalysis = (fileList: UploadFile[]) => {
    if(appRuntime){
        const list = fileList.map(item => {
            return {
                uid: item.uid,
                filePath: (item as any).path
            };
        })
        appRuntime.send(REFER_ANALYSIS, JSON.stringify(list));
    }
}

const copyToClipboard = async (val: string|undefined) => {
    if(!val)return;
    if(!navigator.clipboard){
        notification.warn({
            message: 'Copy to clipboard failed',
            description: "Browser don't have support for native clipboard.",
            placement: 'bottomRight'
        });
    }
    await navigator.clipboard.writeText(val);
    message.info('已复制到剪切板');
}

type DialogResult = {
    type: DialogType,
    path: string,
}

export { ReferPage }
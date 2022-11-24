import React, { FC, useState } from "react";
import { Layout, Menu } from "antd";
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined, InteractionFilled, RocketFilled } from '@ant-design/icons';
import { NgUpgradePage, ReferPage } from './pages';

import './dashboard.less';

const { 
    Sider, 
    // Header, 
    Content 
} = Layout;

const Dashboard: FC = () => {
    const [collapsed, setCollapsed] = useState(true);

    return(
        <div className="dashboard-container">
            <Layout className="h100 bg-parent">
                <Sider className="common-border-right" trigger={ React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick : () => setCollapsed(!collapsed)
                        }) } collapsible collapsed={collapsed} style={{paddingTop: '5rem'}}>
                    <Menu defaultSelectedKeys={['refer']}>
                        <Menu.Item key="refer" icon={ <InteractionFilled/> }>
                            <Link to="/refer" >交叉引用</Link>
                        </Menu.Item>
                        <Menu.Item key="ngupgrade" icon={ <RocketFilled/> }>
                            <Link to="/ngupgrade" >NG升级</Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout className="h100">
                    {/* <Header className="padding0 common-border-bottom">
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick : () => setCollapsed(!collapsed)
                        })}
                    </Header> */}
                    <Content className="dashboard-content h100">
                        <Routes>
                            <Route path="/refer" element={ <ReferPage/> } />
                            <Route path="/ngupgrade" element={ <NgUpgradePage/> } />
                            <Route
                                path="*"
                                element={<Navigate to="/refer" replace />}
                            />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

export { Dashboard }
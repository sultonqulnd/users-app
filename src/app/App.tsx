import React from 'react';
import { Layout, Typography } from 'antd';
import { UsersDashboard } from '@/features/users';

const { Header, Content } = Layout;
const { Title } = Typography;

export function App() {
  return (
    <Layout className="h-screen overflow-hidden">
      <Header className="bg-white border-b border-slate-200 px-6 flex items-center">
        <Title level={4} style={{ margin: 0 }}>
          Users
        </Title>
      </Header>
      <Content className="p-6 overflow-hidden bg-slate-50">
        <div className="h-full bg-white rounded-lg shadow-sm p-4 overflow-hidden">
          <UsersDashboard />
        </div>
      </Content>
    </Layout>
  );
}

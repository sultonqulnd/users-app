import { Layout, Typography } from 'antd';
import { UsersTable } from '../components/users/UsersTable';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export function App() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white border-b border-slate-200 flex items-center px-6">
        <div className="flex flex-col gap-0.5">
          <Title level={4} className="!mb-0">
            High-Volume Users Dashboard
          </Title>
          <Text type="secondary" className="text-xs">
            10,000 users with virtualized rendering, debounced search, and optimistic updates.
          </Text>
        </div>
      </Header>
      <Content className="px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <UsersTable />
        </div>
      </Content>
    </Layout>
  );
}


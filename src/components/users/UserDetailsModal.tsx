import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { User } from '../../types/user.types';
import type { UseMutationResult } from '@tanstack/react-query';

interface Props {
  user: User | null;
  open: boolean;
  onClose: () => void;
  updateUserMutation: UseMutationResult<User, unknown, { id: string; name: string; age: number }>;
}

export function UserDetailsModal({ user, open, onClose, updateUserMutation }: Props) {
  const [form] = Form.useForm<{ name: string; age: number }>();

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        name: user.name,
        age: user.age
      });
    }
  }, [user, open, form]);

  const handleOk = async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      await updateUserMutation.mutateAsync({
        id: user.id,
        name: values.name,
        age: values.age
      });
      onClose();
    } catch {
    }
  };

  return (
    <Modal
      open={open}
      title="Edit User"
      okText="Save"
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={updateUserMutation.isPending}
      destroyOnClose
    >
      {user && (
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Age"
            name="age"
            rules={[{ required: true, message: 'Age is required' }]}
          >
            <InputNumber min={18} max={120} className="w-full" />
          </Form.Item>
          <Form.Item label="Email">
            <Input value={user.email} disabled />
          </Form.Item>
          <Form.Item label="Status">
            <Input value={user.status} disabled />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}


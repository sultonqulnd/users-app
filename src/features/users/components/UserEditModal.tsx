import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { UseMutationResult } from '@tanstack/react-query';
import type { User, UpdateUserPayload } from '@/features/users/types';

interface UserEditModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  mutation: UseMutationResult<User, unknown, UpdateUserPayload, unknown>;
}

export function UserEditModal({ user, open, onClose, mutation }: UserEditModalProps) {
  const [form] = Form.useForm();

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
      await mutation.mutateAsync({
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
      confirmLoading={mutation.isPending}
      destroyOnClose
    >
      {user && (
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Required' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Age" name="age" rules={[{ required: true, message: 'Required' }]}>
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

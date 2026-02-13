import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { patchUser } from '@/features/users/api/users.api';
import { USERS_QUERY_KEYS } from '@/features/users/constants';
import type { User, UpdateUserPayload } from '@/features/users/types';

export function useUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, unknown, UpdateUserPayload, { previousUser?: User }>({
    mutationKey: ['update-user'],
    mutationFn: patchUser,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.all });

      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEYS.all);
      const previousUser = previousUsers?.find((u) => u.id === variables.id);

      queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.all, (old) => {
        if (!old) return [];
        return old.map((user) =>
          user.id === variables.id
            ? { ...user, name: variables.name, age: variables.age }
            : user
        );
      });

      return { previousUser };
    },
    onError: (error, _variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.all, (old) => {
          if (!old) return [];
          return old.map((user) =>
            user.id === context.previousUser?.id ? context.previousUser : user
          );
        });
      }
      message.error(error instanceof Error ? error.message : 'Update failed');
    },
    onSuccess: (data) => {
      queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.all, (old) => {
        if (!old) return [];
        return old.map((user) => (user.id === data.id ? data : user));
      });
      message.success('User updated successfully.');
    }
  });
}

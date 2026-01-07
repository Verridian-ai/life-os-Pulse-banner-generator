import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { UserList } from '../components/users/UserList';
import { UserDetail } from '../components/users/UserDetail';

export function AdminUsers(): React.ReactElement {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    return (
        <AdminGuard>
            <AdminLayout activeSection="users">
                <UserList onSelectUser={setSelectedUserId} />
                {selectedUserId && (
                    <UserDetail
                        userId={selectedUserId}
                        onClose={() => setSelectedUserId(null)}
                    />
                )}
            </AdminLayout>
        </AdminGuard>
    );
}

'use client';

import { useAdminAuthStore } from '@/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';

export default function AdminHeader() {
  const { adminProfile } = useAdminAuthStore();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-responsive py-responsive ml-0 lg:ml-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ml-12 lg:ml-0">
          <h1 className="text-responsive-xl font-semibold text-gray-900 dark:text-white">
            Goodstock-X Admin
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-responsive-sm font-medium">
              {adminProfile?.full_name?.charAt(0) || adminProfile?.email?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <div className="text-responsive-sm font-medium text-gray-700 dark:text-gray-300">
                {adminProfile?.full_name || 'Admin'}
              </div>
              <div className="text-responsive-xs text-gray-500 dark:text-gray-400">
                {adminProfile?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
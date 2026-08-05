import { NextRequest, NextResponse } from 'next/server';
import { getAllMessages, getServiceRequests } from '@/lib/dataStore';
import { checkAdminAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const [messages, serviceRequests] = await Promise.all([
      getAllMessages(),
      getServiceRequests()
    ]);
    const unreadMessages = messages.filter(m => !m.read);
    const pendingRequests = serviceRequests.filter(r => r.status === 'pending' && !r.read);
    const notifications = [];

    if (unreadMessages.length > 0) {
      notifications.push({
        id: 'unread-messages',
        type: 'message',
        title: `${unreadMessages.length} unread message${unreadMessages.length > 1 ? 's' : ''}`,
        description: unreadMessages[0]?.subject || 'New messages',
        time: unreadMessages[0]?.createdAt || new Date().toISOString(),
        link: '/admin/messages',
      });
    }

    if (pendingRequests.length > 0) {
      notifications.push({
        id: 'pending-requests',
        type: 'service-request',
        title: `${pendingRequests.length} pending service request${pendingRequests.length > 1 ? 's' : ''}`,
        description: pendingRequests[0]?.serviceTitle || 'New service requests',
        time: pendingRequests[0]?.createdAt || new Date().toISOString(),
        link: '/admin/service-requests',
      });
    }

    return NextResponse.json({
      unreadCount: unreadMessages.length + pendingRequests.length,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

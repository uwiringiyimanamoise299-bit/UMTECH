import { NextRequest, NextResponse } from 'next/server';
import {
  getServiceRequests,
  getServiceRequestsByUser,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
} from '@/lib/dataStore';
import { checkAdminAuth } from '@/lib/apiAuth';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role === 'admin' || payload.role === 'superadmin') {
      const requests = await getServiceRequests();
      return NextResponse.json({ requests });
    }

    const requests = await getServiceRequestsByUser(payload.uid);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('GET service-requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceType, serviceTitle, description, amount, phone } = await request.json();

    if (!serviceType || !serviceTitle || !description || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const request_ = await createServiceRequest({
      uid: payload.uid,
      name: payload.name || payload.email,
      email: payload.email,
      phone: phone || '',
      serviceType,
      serviceTitle,
      description,
      amount,
    });

    return NextResponse.json({ request: request_ }, { status: 201 });
  } catch (error) {
    console.error('POST service-requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing request id' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (typeof read === 'boolean') {
      updateData.read = read;
    }

    if ('adminResponse' in body) {
      updateData.adminResponse = body.adminResponse;
      if (!('status' in body)) {
        updateData.status = 'reviewing';
      }
    }

    if ('status' in body && typeof body.status === 'string') {
      updateData.status = body.status;
    }

    const updated = await updateServiceRequest(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('PATCH service-requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing request id' }, { status: 400 });
    }

    const deleted = await deleteServiceRequest(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE service-requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

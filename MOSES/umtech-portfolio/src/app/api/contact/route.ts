import { NextRequest, NextResponse } from 'next/server';
import { saveMessage } from '@/lib/dataStore';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`contact:${ip}`, 5, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfter!);
  }

  try {
    const body = await request.json();
    const { name, email, phone, company, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (typeof subject !== 'string' || subject.length > 200) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }
    if (typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const messageId = await saveMessage({ name: name.trim(), email: email.trim(), phone: phone || '', company: company || '', subject: subject.trim(), message: message.trim() });

    // Attempt to send email if configured
    try {
      // Dynamic import to avoid crash if nodemailer isn't installed
      const nodemailer = await import('nodemailer');
      const { getSettings } = await import('@/lib/dataStore');
      const settings = await getSettings();
      
      if (settings && settings.emailHost && settings.emailUser && settings.emailPass) {
        const transporter = nodemailer.createTransport({
          host: settings.emailHost,
          port: Number(settings.emailPort) || 587,
          secure: Number(settings.emailPort) === 465,
          auth: {
            user: settings.emailUser,
            pass: settings.emailPass,
          },
        });

        await transporter.sendMail({
          from: `"${settings.siteName || 'UMTECH'}" <${settings.emailUser}>`,
          to: email.trim(),
          subject: `Re: ${subject.trim()}`,
          html: `<p>Hi ${name.trim()},</p><p>Thank you for contacting us! We have received your message and will get back to you soon.</p><p>Best,<br/>${settings.siteName || 'UMTECH'}</p>`
        });
      }
    } catch (e) {
      console.log('Email sending skipped or failed (nodemailer might not be installed or configured).');
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

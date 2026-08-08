import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'platform-settings.json');

// Default platform settings
const DEFAULT_SETTINGS = {
  platformName: 'RankFlow',
  supportEmail: 'support@rankflow.app',
  publicSignups: true,
  enforceEmailVerification: true,
  fromEmail: 'onboarding@resend.dev',
  resendApiKey: 're_9KnztFK1_5ZHtQu1hMjMpNH4P5iRHRNc5',
  maintenanceMode: false,
};

function readSettingsFromDisk() {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings from disk:', err);
  }
  return DEFAULT_SETTINGS;
}

function writeSettingsToDisk(settings: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings to disk:', err);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = readSettingsFromDisk();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const current = readSettingsFromDisk();
    const updated = {
      ...current,
      ...body,
    };

    writeSettingsToDisk(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

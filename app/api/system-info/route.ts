import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    
    return NextResponse.json({
      success: true,
      data: {
        hostname,
        platform,
        arch,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch system information',
          code: 'SYSTEM_INFO_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

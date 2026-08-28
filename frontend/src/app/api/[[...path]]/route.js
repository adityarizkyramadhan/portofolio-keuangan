import { Readable } from 'stream';
import { EventEmitter } from 'events';
import app from '@/backend/app';
import { connectDB } from '@/backend/config/db';

export const runtime = 'nodejs';

async function handleRequest(request) {
  try {
    await connectDB();
  } catch (err) {
    console.error("[Next.js API Route] MongoDB Connection Error:", err.message);
    return new Response(JSON.stringify({
      success: false,
      message: `Gagal terhubung ke Database MongoDB: ${err.message}`
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Promise(async (resolve) => {
    const url = new URL(request.url);
    const bodyBuffer = Buffer.from(await request.arrayBuffer());

    // Create a real Node.js Readable stream for Express body-parser compatibility
    const req = Readable.from(bodyBuffer);
    req.method = request.method;
    req.url = url.pathname + url.search;
    req.originalUrl = req.url;
    req.headers = {};
    request.headers.forEach((val, key) => {
      req.headers[key] = val;
    });

    // Mock Express Response object
    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (key, val) => {
      res._headers[key.toLowerCase()] = val;
      return res;
    };
    res.getHeader = (key) => res._headers[key.toLowerCase()];
    res.removeHeader = (key) => {
      delete res._headers[key.toLowerCase()];
      return res;
    };
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (jsonBody) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(jsonBody));
    };

    let responseChunks = [];
    res.write = (chunk) => {
      if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = (chunk) => {
      if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const body = Buffer.concat(responseChunks);
      const headers = new Headers();
      Object.keys(res._headers).forEach((k) => {
        if (res._headers[k] !== undefined) {
          headers.set(k, String(res._headers[k]));
        }
      });
      resolve(new Response(body, {
        status: res.statusCode || 200,
        headers
      }));
    };

    // Execute Express App
    app(req, res);
  });
}

export async function GET(req) { return handleRequest(req); }
export async function POST(req) { return handleRequest(req); }
export async function PUT(req) { return handleRequest(req); }
export async function DELETE(req) { return handleRequest(req); }
export async function PATCH(req) { return handleRequest(req); }
export async function OPTIONS(req) { return handleRequest(req); }

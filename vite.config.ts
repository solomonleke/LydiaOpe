import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function weddingMediaServerPlugin(): Plugin {
  return {
    name: 'wedding-media-server-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 0. Stream Video Files with HTTP 206 Partial Content (Range requests)
        if (
          url.startsWith('/uploads/') &&
          (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.m4v')) &&
          req.method === 'GET'
        ) {
          const uploadsDir = path.resolve(__dirname, 'public/uploads');
          const fileName = path.basename(url);
          const filePath = path.join(uploadsDir, fileName);

          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;
            const contentType = url.endsWith('.webm')
              ? 'video/webm'
              : url.endsWith('.mov')
              ? 'video/quicktime'
              : 'video/mp4';

            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

              if (start >= fileSize || end >= fileSize) {
                res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
                res.end();
                return;
              }

              const chunkSize = end - start + 1;
              const fileStream = fs.createReadStream(filePath, { start, end });
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
              });
              fileStream.pipe(res);
              return;
            } else {
              res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
              });
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
        }

        // 1. Upload Media (Images & Short Videos)
        if (url === '/api/upload-media' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          req.on('end', () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf8');
              const body = JSON.parse(rawBody);
              const { fileName, fileType, base64Data, author, relationship, category, caption } = body;

              const uploadsDir = path.resolve(__dirname, 'public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              // Determine extension and safe unique file name
              const parsedExt = path.extname(fileName || '');
              const ext = parsedExt || (fileType && fileType.includes('video') ? '.mp4' : '.jpg');
              const baseName = path.basename(fileName || 'media', parsedExt).replace(/[^a-zA-Z0-9_-]/g, '_');
              const uniqueFileName = `moment_${Date.now()}_${baseName}${ext}`;
              const diskPath = path.join(uploadsDir, uniqueFileName);

              // Strip base64 data prefix
              const pureBase64 = (base64Data || '').replace(/^data:[^;]+;base64,/, '');
              fs.writeFileSync(diskPath, Buffer.from(pureBase64, 'base64'));

              const publicUrl = `/uploads/${uniqueFileName}`;
              const timestampIso = new Date().toISOString();
              const dateFormatted = new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const newMemory = {
                id: `wm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                author: (author || '').trim() || 'Wedding Guest',
                relationship: (relationship || '').trim() || 'Guest',
                caption: (caption || '').trim(),
                category: category || 'all',
                mediaType: (fileType && fileType.includes('video')) ? 'video' : 'image',
                url: publicUrl,
                fileName: uniqueFileName,
                date: dateFormatted,
                timestamp: timestampIso,
                likes: 1
              };

              // Append to public/uploads/memories.json
              const memoriesJsonPath = path.join(uploadsDir, 'memories.json');
              let memoriesList: any[] = [];
              if (fs.existsSync(memoriesJsonPath)) {
                try {
                  memoriesList = JSON.parse(fs.readFileSync(memoriesJsonPath, 'utf8'));
                } catch {}
              }
              memoriesList.unshift(newMemory);
              fs.writeFileSync(memoriesJsonPath, JSON.stringify(memoriesList, null, 2), 'utf8');

              // Append to CSV Excel files
              const sanitizeCsv = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
              const csvRow = [
                sanitizeCsv(newMemory.timestamp),
                sanitizeCsv(newMemory.author),
                sanitizeCsv(newMemory.relationship),
                sanitizeCsv(newMemory.category),
                sanitizeCsv(newMemory.mediaType.toUpperCase()),
                sanitizeCsv(newMemory.fileName),
                sanitizeCsv(newMemory.url),
                sanitizeCsv(newMemory.caption),
                sanitizeCsv(newMemory.likes)
              ].join(',') + '\r\n';

              const csvHeader = 'Upload Timestamp,Guest Name,Relationship,Category,Media Type,File Name,Public URL,Caption,Likes\r\n';

              const publicCsvPath = path.join(uploadsDir, 'wedding_media.csv');
              const rootCsvPath = path.resolve(__dirname, 'wedding_media_urls.csv');

              if (!fs.existsSync(publicCsvPath)) {
                fs.writeFileSync(publicCsvPath, '\uFEFF' + csvHeader + csvRow, 'utf8');
              } else {
                fs.appendFileSync(publicCsvPath, csvRow, 'utf8');
              }

              if (!fs.existsSync(rootCsvPath)) {
                fs.writeFileSync(rootCsvPath, '\uFEFF' + csvHeader + csvRow, 'utf8');
              } else {
                fs.appendFileSync(rootCsvPath, csvRow, 'utf8');
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, item: newMemory, url: publicUrl, fileName: uniqueFileName }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Upload processing failed' }));
            }
          });
          return;
        }

        // 2. Fetch Memories List
        if (url === '/api/memories' && req.method === 'GET') {
          const memoriesJsonPath = path.resolve(__dirname, 'public/uploads/memories.json');
          let memoriesList: any[] = [];
          if (fs.existsSync(memoriesJsonPath)) {
            try {
              memoriesList = JSON.parse(fs.readFileSync(memoriesJsonPath, 'utf8'));
            } catch {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: memoriesList }));
          return;
        }

        // 3. Like a Memory
        if (url === '/api/like-memory' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              const memoriesJsonPath = path.resolve(__dirname, 'public/uploads/memories.json');
              if (fs.existsSync(memoriesJsonPath)) {
                const list = JSON.parse(fs.readFileSync(memoriesJsonPath, 'utf8'));
                const found = list.find((m: any) => m.id === body.id);
                if (found) {
                  found.likes = (found.likes || 0) + 1;
                  fs.writeFileSync(memoriesJsonPath, JSON.stringify(list, null, 2), 'utf8');
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false }));
            }
          });
          return;
        }

        // 4. Download Excel CSV directly
        if (url === '/api/export-excel' && req.method === 'GET') {
          const publicCsvPath = path.resolve(__dirname, 'public/uploads/wedding_media.csv');
          if (fs.existsSync(publicCsvPath)) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="wedding_media_urls.csv"');
            res.end(fs.readFileSync(publicCsvPath));
          } else {
            res.statusCode = 404;
            res.end('No uploads recorded yet');
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), weddingMediaServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    open: true
  }
});

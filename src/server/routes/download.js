const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const { Readable } = require('stream');

router.post('/source', async (req, res) => {
  try {
    const { files, projectName } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Files array is required'
      });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const filename = `${projectName || 'generated-project'}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    archive.pipe(res);

    files.forEach(file => {
      if (file.path && file.content !== undefined) {
        archive.append(file.content, { name: file.path });
      }
    });

    await archive.finalize();

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Download failed'
    });
  }
});

router.post('/single', (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Content and filename are required'
      });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(content);

  } catch (error) {
    console.error('Single file download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed'
    });
  }
});

module.exports = router;